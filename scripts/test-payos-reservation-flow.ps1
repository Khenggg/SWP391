param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping payOS reservation flow tests." -ForegroundColor Yellow
    Exit 0
}

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

        $customEx = New-Object System.Exception("API Error status=$($statusCode): $errBody")
        $customEx | Add-Member -MemberType NoteProperty -Name "ErrorBody" -Value $errBody -Force
        $customEx | Add-Member -MemberType NoteProperty -Name "StatusCode" -Value $statusCode -Force
        throw $customEx
    }
}

function Invoke-ApiExpectError {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ExpectedErrorCode
    )

    try {
        $response = Invoke-ApiRequest -Method $Method -Uri $Uri -Headers $Headers -Body $Body
        throw "Expected errorCode=$ExpectedErrorCode but request succeeded: $($response | ConvertTo-Json -Depth 20)"
    } catch {
        if (-not ($_.Exception.PSObject.Properties.Name -contains "ErrorBody")) {
            throw
        }

        $errorResponse = $_.Exception.ErrorBody | ConvertFrom-Json
        if ($errorResponse.success -ne $false) {
            throw "Expected success=false in error response."
        }
        if ($errorResponse.errorCode -ne $ExpectedErrorCode) {
            throw "Expected errorCode=$ExpectedErrorCode but got $($errorResponse.errorCode). Body: $($_.Exception.ErrorBody)"
        }

        return $errorResponse
    }
}

function Assert-Success {
    param($Response, [string]$Name)

    if ($null -eq $Response) { throw "$Name returned null." }
    if ($Response.success -ne $true) {
        throw "$Name expected success=true. Body: $($Response | ConvertTo-Json -Depth 20)"
    }
    if (-not ($Response.PSObject.Properties.Name -contains "data")) {
        throw "$Name missing data envelope."
    }
}

function New-ReservationWithFee {
    param($DriverHeaders, [int]$ReservedDurationMinutes = 60)

    $locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $DriverHeaders
    Assert-Success -Response $locations -Name "available locations"

    if (@($locations.data.availableSlots).Count -eq 0) {
        throw "No available car slots found for payOS reservation test."
    }

    $slot = $locations.data.availableSlots[0]
    $reservationBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $slot.floorId
        areaId = $slot.areaId
        slotId = $slot.slotId
        reservedDurationMinutes = $ReservedDurationMinutes
    } | ConvertTo-Json

    $reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $DriverHeaders -Body $reservationBody
    Assert-Success -Response $reservation -Name "create paid reservation"

    if ([decimal]$reservation.data.reservation.bookingAmount -le 0) {
        throw "Expected bookingAmount > 0 but got $($reservation.data.reservation.bookingAmount)."
    }
    if ($reservation.data.reservation.paymentStatus -ne "PENDING") {
        throw "Expected reservation paymentStatus=PENDING but got $($reservation.data.reservation.paymentStatus)."
    }
    if ($null -eq $reservation.data.payment) {
        throw "Expected payment info on paid reservation response."
    }
    if ([string]::IsNullOrWhiteSpace($reservation.data.payment.checkoutUrl)) {
        throw "Expected payment.checkoutUrl."
    }
    if ([string]::IsNullOrWhiteSpace($reservation.data.payment.paymentLinkId)) {
        throw "Expected payment.paymentLinkId."
    }
    if ($null -eq $reservation.data.payment.orderCode) {
        throw "Expected payment.orderCode."
    }

    return $reservation
}

function New-PayOsWebhookBody {
    param($Payment, [long]$Amount)

    return @{
        code = "00"
        description = "success"
        success = $true
        data = @{
            orderCode = [Int64]$Payment.orderCode
            amount = $Amount
            description = "Reservation payment"
            accountNumber = "LOCAL"
            reference = "LOCAL-$($Payment.orderCode)"
            transactionDateTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            currency = "VND"
            paymentLinkId = $Payment.paymentLinkId
            code = "00"
        }
        signature = "local-placeholder"
    } | ConvertTo-Json -Depth 10
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running local payOS reservation flow tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "[payOS] These tests use the local placeholder path. With real PAYOS_* credentials, fake webhook signatures should be rejected." -ForegroundColor Yellow

$adminLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "admin01"; password = "123456" } | ConvertTo-Json)
$adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.accessToken)" }

$driverLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "driver01"; password = "123456" } | ConvertTo-Json)
$driverHeaders = @{ Authorization = "Bearer $($driverLogin.data.accessToken)" }

$staffLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "staff01"; password = "123456" } | ConvertTo-Json)
$staffHeaders = @{ Authorization = "Bearer $($staffLogin.data.accessToken)" }

$isLocalhost = ($BaseUrl -like "*localhost*" -or $BaseUrl -like "*127.0.0.1*")
if ($AllowReset) {
    if (-not $isLocalhost) {
        throw "Destructive test reset option (-AllowReset) is only allowed on localhost."
    }
    $reset = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $adminHeaders
    Write-Host "  Reset reservations/sessions: $($reset.message)" -ForegroundColor Green
}

$pricingRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $adminHeaders
Assert-Success -Response $pricingRules -Name "pricing rules"

$carRule = @($pricingRules.data) | Where-Object { $_.vehicleTypeId -eq 5 -and $_.status -eq "ACTIVE" } | Select-Object -First 1
if (-not $carRule) {
    throw "Active pricing rule for Vehicle Type 5 not found."
}

$ruleId = $carRule.id
$originalReservationHourlyPrice = $carRule.reservationHourlyPrice

try {
    Write-Host "[payOS] Setting car reservation hourly price to 10000 for deterministic paid bookings..."
    $updatedRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Headers $adminHeaders -Body (@{ reservationHourlyPrice = 10000 } | ConvertTo-Json)
    Assert-Success -Response $updatedRule -Name "update pricing rule"

    Write-Host "[payOS 1] Reject non-whole-hour reservation duration..."
    $locationsForInvalid = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    Assert-Success -Response $locationsForInvalid -Name "available locations for invalid duration"
    if (@($locationsForInvalid.data.availableSlots).Count -eq 0) {
        throw "No available car slots found for invalid duration test."
    }
    $invalidSlot = $locationsForInvalid.data.availableSlots[0]
    $invalidDurationBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $invalidSlot.floorId
        areaId = $invalidSlot.areaId
        slotId = $invalidSlot.slotId
        reservedDurationMinutes = 90
    } | ConvertTo-Json
    Invoke-ApiExpectError -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $driverHeaders -Body $invalidDurationBody -ExpectedErrorCode "RESERVATION_DURATION_MUST_BE_WHOLE_HOURS" > $null
    Write-Host "  90-minute booking rejected." -ForegroundColor Green

    Write-Host "[payOS 2] Create 2-hour reservation with fee returns checkoutUrl and deterministic amount..."
    $paidReservation = New-ReservationWithFee -DriverHeaders $driverHeaders -ReservedDurationMinutes 120
    if ([decimal]$paidReservation.data.reservation.bookingAmount -ne 20000) {
        throw "Expected 2-hour bookingAmount=20000 but got $($paidReservation.data.reservation.bookingAmount)."
    }
    $payment = $paidReservation.data.payment
    Write-Host "  Reservation $($paidReservation.data.reservation.reservationCode) payment link: $($payment.checkoutUrl)" -ForegroundColor Green

    Write-Host "[payOS 3] Entry-check rejects unpaid reservation..."
    $unpaidEntryCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($paidReservation.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    Assert-Success -Response $unpaidEntryCheck -Name "unpaid reservation entry-check"
    if ($unpaidEntryCheck.data.status -ne "PAYMENT_PENDING") {
        throw "Expected PAYMENT_PENDING but got $($unpaidEntryCheck.data.status)."
    }
    Write-Host "  Unpaid reservation rejected with PAYMENT_PENDING." -ForegroundColor Green

    Write-Host "[payOS 4] Valid webhook marks payment/reservation paid..."
    $validWebhookBody = New-PayOsWebhookBody -Payment $payment -Amount ([Int64]$payment.amount)
    $webhookResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $validWebhookBody
    Assert-Success -Response $webhookResult -Name "valid payOS webhook"
    if ($webhookResult.data.paymentStatus -ne "PAID" -or $webhookResult.data.reservationStatus -ne "CONFIRMED") {
        throw "Expected PAID/CONFIRMED after webhook but got payment=$($webhookResult.data.paymentStatus), reservation=$($webhookResult.data.reservationStatus)."
    }

    $paymentStatus = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($paidReservation.data.reservation.id)/payment-status" -Headers $driverHeaders
    Assert-Success -Response $paymentStatus -Name "payment status"
    if ($paymentStatus.data.paymentStatus -ne "PAID" -or $paymentStatus.data.reservationStatus -ne "CONFIRMED") {
        throw "Expected payment-status PAID/CONFIRMED but got payment=$($paymentStatus.data.paymentStatus), reservation=$($paymentStatus.data.reservationStatus)."
    }
    Write-Host "  Payment-status endpoint confirms PAID/CONFIRMED." -ForegroundColor Green

    Write-Host "[payOS 5] Duplicate webhook remains idempotent..."
    $duplicateWebhookResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $validWebhookBody
    Assert-Success -Response $duplicateWebhookResult -Name "duplicate payOS webhook"
    if ($duplicateWebhookResult.data.idempotent -ne $true) {
        throw "Expected duplicate webhook idempotent=true."
    }
    Write-Host "  Duplicate webhook returned idempotent=true." -ForegroundColor Green

    Write-Host "[payOS 6] Wrong amount webhook fails..."
    $wrongAmountReservation = New-ReservationWithFee -DriverHeaders $driverHeaders
    $wrongPayment = $wrongAmountReservation.data.payment
    $wrongWebhookBody = New-PayOsWebhookBody -Payment $wrongPayment -Amount ([Int64]$wrongPayment.amount + 1)
    $wrongAmountError = Invoke-ApiExpectError -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $wrongWebhookBody -ExpectedErrorCode "PAYOS_AMOUNT_MISMATCH"
    if ($wrongAmountError.statusCode -ne 400) {
        throw "Expected wrong amount statusCode=400 but got $($wrongAmountError.statusCode)."
    }
    Write-Host "  Wrong amount rejected with PAYOS_AMOUNT_MISMATCH." -ForegroundColor Green

    Write-Host "[payOS 7] Entry-check accepts paid confirmed reservation..."
    $paidEntryCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($paidReservation.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    Assert-Success -Response $paidEntryCheck -Name "paid reservation entry-check"
    if ($paidEntryCheck.data.status -ne "VALID" -or [string]::IsNullOrWhiteSpace($paidEntryCheck.data.reservationEntryToken)) {
        throw "Expected VALID with reservationEntryToken but got status=$($paidEntryCheck.data.status)."
    }

    $entryBody = @{
        entryMode = "RESERVATION"
        reservationId = $paidReservation.data.reservation.id
        reservationEntryToken = $paidEntryCheck.data.reservationEntryToken
        cardCode = "C005"
        licensePlate = "51A-PAYOS-$((Get-Random -Minimum 10000 -Maximum 99999))"
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $paidReservation.data.reservation.areaId
        selectedSlotId = $paidReservation.data.reservation.slotId
    } | ConvertTo-Json

    $entryResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $staffHeaders -Body $entryBody
    Assert-Success -Response $entryResult -Name "paid reservation entry"
    if ($entryResult.data.entryMode -ne "RESERVATION" -or $entryResult.data.reservationId -ne $paidReservation.data.reservation.id -or $entryResult.data.paymentRequired -ne $true -or $entryResult.data.paymentStatus -ne "PENDING") {
        throw "Expected reservation entry accepted as CASUAL/PENDING after booking check-in."
    }
    $billable = [DateTimeOffset]::Parse($entryResult.data.billableStartTime.ToString())
    $expectedBillable = [DateTimeOffset]::Parse($paidReservation.data.reservation.expiresAt.ToString())
    if ($billable.ToUnixTimeSeconds() -ne $expectedBillable.ToUnixTimeSeconds()) {
        throw "Expected reservation entry billableStartTime to equal reservation expiresAt."
    }
    Write-Host "  Paid reservation entry accepted." -ForegroundColor Green

    Write-Host "`n[SUCCESS] Local payOS reservation flow tests completed successfully." -ForegroundColor Green
} finally {
    if ($ruleId -and $null -ne $originalReservationHourlyPrice) {
        if ([decimal]$originalReservationHourlyPrice -gt 0 -and [decimal]$originalReservationHourlyPrice -eq [decimal]::Truncate([decimal]$originalReservationHourlyPrice)) {
            Write-Host "[payOS Cleanup] Restoring car reservation hourly price to $originalReservationHourlyPrice..." -ForegroundColor Cyan
            try {
                $restore = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Headers $adminHeaders -Body (@{ reservationHourlyPrice = $originalReservationHourlyPrice } | ConvertTo-Json)
                Write-Host "  Restored pricing rule. Hourly price = $($restore.data.reservationHourlyPrice)" -ForegroundColor Green
            } catch {
                Write-Host "  [Warning] Failed to restore pricing rule: $_" -ForegroundColor Yellow
            }
        } else {
            Write-Host "[payOS Cleanup] Original reservation hourly price was not a valid positive integer; keeping test price because zero/decimal prices are now rejected." -ForegroundColor Yellow
        }
    }
}
