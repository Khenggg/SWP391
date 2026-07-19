param (
    [string]$BaseUrl = "http://localhost:5000",
    [string]$Username = "driver01",
    [string]$Password = "123456",
    [string]$AdminUsername = "admin01",
    [string]$AdminPassword = "123456",
    [string]$StaffUsername = "staff01",
    [string]$StaffPassword = "123456",
    [int]$VehicleTypeId = 5,
    [int]$EntryGateId = 1,
    [int]$ReservationHourlyPrice = 10000,
    [int]$ReservedDurationMinutes = 60,
    [int]$PollSeconds = 300,
    [int]$PollIntervalSeconds = 5,
    [string]$PublicWebhookBaseUrl
)

$ErrorActionPreference = "Stop"

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ContentType = "application/json"
    )

    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }

    try {
        return Invoke-RestMethod @params
    } catch {
        $statusCode = ""
        $errBody = ""
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                if ($stream) {
                    $reader = New-Object System.IO.StreamReader($stream)
                    $errBody = $reader.ReadToEnd()
                    $reader.Close()
                }
            } catch {}
        }
        throw "API Error status=$statusCode uri=$Uri body=$errBody"
    }
}

function Assert-Success {
    param($Response, [string]$Name)

    if ($null -eq $Response) { throw "$Name returned null." }
    if ($Response.success -ne $true) {
        throw "$Name expected success=true. Body: $($Response | ConvertTo-Json -Depth 20)"
    }
}

$requiredEnv = @(
    "PAYOS_CLIENT_ID",
    "PAYOS_API_KEY",
    "PAYOS_CHECKSUM_KEY",
    "PAYOS_RETURN_URL",
    "PAYOS_CANCEL_URL",
    "PAYOS_WEBHOOK_URL"
)

$missingEnv = @($requiredEnv | Where-Object { [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($_)) })
if ($missingEnv.Count -gt 0) {
    throw "Missing required payOS environment variables: $($missingEnv -join ', ')"
}

if (-not [string]::IsNullOrWhiteSpace($PublicWebhookBaseUrl)) {
    $configuredWebhook = [Environment]::GetEnvironmentVariable("PAYOS_WEBHOOK_URL")
    if (-not $configuredWebhook.StartsWith($PublicWebhookBaseUrl, [StringComparison]::OrdinalIgnoreCase)) {
        Write-Host "[Warning] PAYOS_WEBHOOK_URL does not start with PublicWebhookBaseUrl. Configured webhook must be public and reachable by payOS." -ForegroundColor Yellow
    }
}

if ($ReservedDurationMinutes -le 0 -or $ReservedDurationMinutes % 60 -ne 0) {
    throw "ReservedDurationMinutes must be a positive whole-hour value."
}

if ($ReservationHourlyPrice -le 0) {
    throw "ReservationHourlyPrice must be greater than zero."
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Real payOS reservation payment test on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "This script does not print or store payOS secrets." -ForegroundColor Yellow

$adminLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = $AdminUsername; password = $AdminPassword } | ConvertTo-Json)
Assert-Success -Response $adminLogin -Name "admin login"
$adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.accessToken)" }

$driverLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = $Username; password = $Password } | ConvertTo-Json)
Assert-Success -Response $driverLogin -Name "driver login"
$driverHeaders = @{ Authorization = "Bearer $($driverLogin.data.accessToken)" }

$staffLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = $StaffUsername; password = $StaffPassword } | ConvertTo-Json)
Assert-Success -Response $staffLogin -Name "staff login"
$staffHeaders = @{ Authorization = "Bearer $($staffLogin.data.accessToken)" }

$pricingRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $adminHeaders
Assert-Success -Response $pricingRules -Name "pricing rules"
$rule = @($pricingRules.data) | Where-Object { $_.vehicleTypeId -eq $VehicleTypeId -and $_.status -eq "ACTIVE" } | Select-Object -First 1
if (-not $rule) {
    throw "Active pricing rule for vehicleTypeId=$VehicleTypeId not found."
}

$ruleId = $rule.id
$updatePrice = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/pricing-rules/$ruleId/reservation-hourly-price" -Headers $adminHeaders -Body (@{ reservationHourlyPrice = $ReservationHourlyPrice } | ConvertTo-Json)
Assert-Success -Response $updatePrice -Name "update reservation hourly price"

$locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=$VehicleTypeId" -Headers $driverHeaders
Assert-Success -Response $locations -Name "available locations"
if (@($locations.data.availableSlots).Count -eq 0) {
    throw "No available slot found for vehicleTypeId=$VehicleTypeId."
}

$slot = $locations.data.availableSlots[0]
$reservationBody = @{
    vehicleId = $null
    plateNumber = $null
    vehicleTypeId = $VehicleTypeId
    floorId = $slot.floorId
    areaId = $slot.areaId
    slotId = $slot.slotId
    reservedDurationMinutes = $ReservedDurationMinutes
} | ConvertTo-Json

$reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $driverHeaders -Body $reservationBody
Assert-Success -Response $reservation -Name "create reservation"

$expectedAmount = ($ReservedDurationMinutes / 60) * $ReservationHourlyPrice
$actualAmount = [decimal]$reservation.data.reservation.bookingAmount
if ($actualAmount -ne $expectedAmount) {
    throw "Expected bookingAmount=$expectedAmount but got $actualAmount."
}

$reservationId = $reservation.data.reservation.id
$reservationCode = $reservation.data.reservation.reservationCode
$payment = $reservation.data.payment
if ($null -eq $payment -or [string]::IsNullOrWhiteSpace($payment.checkoutUrl)) {
    throw "Reservation did not return payment.checkoutUrl."
}

Write-Host ""
Write-Host "ReservationCode: $reservationCode" -ForegroundColor Green
Write-Host "ReservationId: $reservationId" -ForegroundColor Green
Write-Host "Amount: $actualAmount VND" -ForegroundColor Green
Write-Host "Checkout URL:" -ForegroundColor Cyan
Write-Host $payment.checkoutUrl -ForegroundColor White
Write-Host ""
Read-Host "Open the checkout URL, pay with a real payOS test/bank flow, then press Enter to start polling"

$deadline = (Get-Date).AddSeconds($PollSeconds)
$latestStatus = $null
while ((Get-Date) -lt $deadline) {
    $latestStatus = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$reservationId/payment-status" -Headers $driverHeaders
    Assert-Success -Response $latestStatus -Name "payment status"

    $paymentStatus = $latestStatus.data.paymentStatus
    $reservationStatus = $latestStatus.data.reservationStatus
    Write-Host "  payment=$paymentStatus reservation=$reservationStatus remainingSeconds=$($latestStatus.data.remainingSeconds)"

    if ($paymentStatus -eq "PAID" -and $reservationStatus -eq "CONFIRMED") {
        break
    }

    Start-Sleep -Seconds $PollIntervalSeconds
}

if ($latestStatus.data.paymentStatus -ne "PAID" -or $latestStatus.data.reservationStatus -ne "CONFIRMED") {
    throw "Payment was not confirmed within $PollSeconds seconds. Verify PAYOS_WEBHOOK_URL is public and configured in payOS dashboard."
}

$entryCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$reservationCode/entry-check?entryGateId=$EntryGateId" -Headers $staffHeaders
Assert-Success -Response $entryCheck -Name "entry check"
if ($entryCheck.data.status -ne "VALID" -or [string]::IsNullOrWhiteSpace($entryCheck.data.reservationEntryToken)) {
    throw "Expected entry-check VALID with reservationEntryToken but got status=$($entryCheck.data.status)."
}

Write-Host ""
Write-Host "[SUCCESS] Real payOS payment confirmed and reservation entry-check is VALID." -ForegroundColor Green
