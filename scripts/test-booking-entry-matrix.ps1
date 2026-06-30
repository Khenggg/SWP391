param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping booking/entry matrix tests." -ForegroundColor Yellow
    Exit 0
}

if (-not $AllowReset) {
    Write-Host "[Warning] -AllowReset switch was not specified. Skipping booking/entry matrix tests because they reuse fixed demo cards and slots." -ForegroundColor Yellow
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

function Reset-TestState {
    param($AdminHeaders)

    Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $AdminHeaders > $null
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

function Get-AvailableLocation {
    param($Headers, [int]$VehicleTypeId)

    $locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=$VehicleTypeId" -Headers $Headers
    Assert-Success -Response $locations -Name "available locations vehicleTypeId=$VehicleTypeId"

    if ($locations.data.requiresSlot -eq $true) {
        if (@($locations.data.availableSlots).Count -eq 0) {
            throw "No available slot found for vehicleTypeId=$VehicleTypeId."
        }
        $slot = $locations.data.availableSlots[0]
        return [pscustomobject]@{
            RequiresSlot = $true
            FloorId = $slot.floorId
            AreaId = $slot.areaId
            SlotId = $slot.slotId
        }
    }

    if (@($locations.data.availableAreas).Count -eq 0) {
        throw "No available area found for vehicleTypeId=$VehicleTypeId."
    }
    $area = $locations.data.availableAreas[0]
    return [pscustomobject]@{
        RequiresSlot = $false
        FloorId = $area.floorId
        AreaId = $area.areaId
        SlotId = $null
    }
}

function Set-ReservationPrice {
    param($AdminHeaders, [int]$VehicleTypeId, [decimal]$Price)

    $pricingRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $AdminHeaders
    Assert-Success -Response $pricingRules -Name "pricing rules"

    $rule = @($pricingRules.data) | Where-Object { $_.vehicleTypeId -eq $VehicleTypeId -and $_.status -eq "ACTIVE" } | Select-Object -First 1
    if (-not $rule) {
        throw "Active pricing rule for vehicleTypeId=$VehicleTypeId not found."
    }

    $updated = Invoke-ApiRequest `
        -Method Patch `
        -Uri "$BaseUrl/api/core/pricing-rules/$($rule.id)/reservation-hourly-price" `
        -Headers $AdminHeaders `
        -Body (@{ reservationHourlyPrice = $Price } | ConvertTo-Json)
    Assert-Success -Response $updated -Name "update reservation price vehicleTypeId=$VehicleTypeId"

    return [pscustomobject]@{
        RuleId = $rule.id
        OriginalPrice = [decimal]$rule.reservationHourlyPrice
    }
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

function New-ReservationWithFee {
    param($DriverHeaders, [int]$VehicleTypeId, [int]$ReservedDurationMinutes, [decimal]$ExpectedAmount)

    $location = Get-AvailableLocation -Headers $DriverHeaders -VehicleTypeId $VehicleTypeId
    $body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = $VehicleTypeId
        floorId = $location.FloorId
        areaId = $location.AreaId
        slotId = $location.SlotId
        reservedDurationMinutes = $ReservedDurationMinutes
    } | ConvertTo-Json

    $reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $DriverHeaders -Body $body
    Assert-Success -Response $reservation -Name "create reservation vehicleTypeId=$VehicleTypeId"

    if ([decimal]$reservation.data.reservation.bookingAmount -ne $ExpectedAmount) {
        throw "Expected bookingAmount=$ExpectedAmount but got $($reservation.data.reservation.bookingAmount)."
    }
    if ($reservation.data.reservation.paymentStatus -ne "PENDING") {
        throw "Expected reservation paymentStatus=PENDING but got $($reservation.data.reservation.paymentStatus)."
    }
    if ($null -eq $reservation.data.payment -or [string]::IsNullOrWhiteSpace($reservation.data.payment.checkoutUrl)) {
        throw "Expected payment checkoutUrl for vehicleTypeId=$VehicleTypeId."
    }

    return $reservation
}

function Confirm-ReservationPayment {
    param($Reservation)

    $payment = $Reservation.data.payment
    $webhookBody = New-PayOsWebhookBody -Payment $payment -Amount ([Int64]$payment.amount)
    $webhook = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $webhookBody
    Assert-Success -Response $webhook -Name "valid payOS webhook"

    if ($webhook.data.paymentStatus -ne "PAID" -or $webhook.data.reservationStatus -ne "CONFIRMED") {
        throw "Expected PAID/CONFIRMED after webhook but got payment=$($webhook.data.paymentStatus), reservation=$($webhook.data.reservationStatus)."
    }
}

function Invoke-CasualEntry {
    param($StaffHeaders, $Case, [string]$CardCode, [long]$ConvertedFromReservationId = 0)

    $suggestion = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=$($Case.VehicleTypeId)&entryGateId=1" -Headers $StaffHeaders
    Assert-Success -Response $suggestion -Name "casual suggestion vehicleTypeId=$($Case.VehicleTypeId)"

    if ($Case.RequiresSlot -and $suggestion.data.suggestionType -ne "SLOT") {
        throw "Expected SLOT suggestion for vehicleTypeId=$($Case.VehicleTypeId)."
    }
    if (-not $Case.RequiresSlot -and $suggestion.data.suggestionType -ne "AREA") {
        throw "Expected AREA suggestion for vehicleTypeId=$($Case.VehicleTypeId)."
    }

    $body = @{
        entryMode = "CASUAL"
        cardCode = $CardCode
        licensePlate = "$($Case.PlatePrefix)-CAS-$((Get-Random -Minimum 10000 -Maximum 99999))"
        noPlate = $false
        vehicleTypeId = $Case.VehicleTypeId
        entryGateId = 1
        selectedAreaId = $suggestion.data.suggestedAreaId
        selectedSlotId = $suggestion.data.suggestedSlotId
        suggestionToken = $suggestion.data.suggestionToken
    }

    if ($ConvertedFromReservationId -gt 0) {
        $body.convertedFromReservationId = $ConvertedFromReservationId
    }

    $entry = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $StaffHeaders -Body ($body | ConvertTo-Json)
    Assert-Success -Response $entry -Name "casual entry vehicleTypeId=$($Case.VehicleTypeId)"

    if ($entry.data.customerType -ne "CASUAL" -or $entry.data.paymentStatus -ne "PENDING" -or $entry.data.paymentRequired -ne $true) {
        throw "Expected CASUAL/PENDING/paymentRequired=true for vehicleTypeId=$($Case.VehicleTypeId)."
    }

    return $entry
}

function Invoke-MonthlyEntry {
    param($AdminHeaders, $StaffHeaders, $Case)

    $location = Get-AvailableLocation -Headers $AdminHeaders -VehicleTypeId $Case.VehicleTypeId
    $plate = "$($Case.PlatePrefix)-MON-$((Get-Random -Minimum 10000 -Maximum 99999))"
    $monthlyBody = @{
        ownerName = "TEST Monthly $($Case.Name)"
        phone = "0900000000"
        cardId = $Case.MonthlyCardId
        plateNumber = $plate
        vehicleTypeId = $Case.VehicleTypeId
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = $location.FloorId
        areaId = $location.AreaId
        slotId = $location.SlotId
    } | ConvertTo-Json

    $monthly = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/monthly-passes" -Headers $AdminHeaders -Body $monthlyBody
    Assert-Success -Response $monthly -Name "create monthly pass vehicleTypeId=$($Case.VehicleTypeId)"

    $check = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/cards/$($Case.MonthlyCardCode)/entry-check?entryGateId=1" -Headers $StaffHeaders
    Assert-Success -Response $check -Name "monthly card entry-check vehicleTypeId=$($Case.VehicleTypeId)"
    if ($check.data.entryCardType -ne "MONTHLY" -or [string]::IsNullOrWhiteSpace($check.data.monthlyEntryToken)) {
        throw "Expected MONTHLY entry-check token for vehicleTypeId=$($Case.VehicleTypeId)."
    }

    $entryBody = @{
        entryMode = "MONTHLY"
        monthlyPassId = $check.data.monthlyPassId
        monthlyEntryToken = $check.data.monthlyEntryToken
        cardCode = $Case.MonthlyCardCode
        licensePlate = $plate
        noPlate = $false
        vehicleTypeId = $Case.VehicleTypeId
        entryGateId = 1
        selectedAreaId = $check.data.fixedAreaId
        selectedSlotId = $check.data.fixedSlotId
    } | ConvertTo-Json

    $entry = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $StaffHeaders -Body $entryBody
    Assert-Success -Response $entry -Name "monthly entry vehicleTypeId=$($Case.VehicleTypeId)"

    if ($entry.data.customerType -ne "MONTHLY" -or $entry.data.paymentRequired -ne $false -or $entry.data.paymentStatus -ne "NOT_REQUIRED") {
        throw "Expected MONTHLY/NOT_REQUIRED for vehicleTypeId=$($Case.VehicleTypeId)."
    }
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running booking/entry matrix tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$adminLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "admin01"; password = "123456" } | ConvertTo-Json)
$adminHeaders = @{ Authorization = "Bearer $($adminLogin.data.accessToken)" }

$driverLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "driver01"; password = "123456" } | ConvertTo-Json)
$driverHeaders = @{ Authorization = "Bearer $($driverLogin.data.accessToken)" }

$staffLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "staff01"; password = "123456" } | ConvertTo-Json)
$staffHeaders = @{ Authorization = "Bearer $($staffLogin.data.accessToken)" }

$isLocalhost = ($BaseUrl -like "*localhost*" -or $BaseUrl -like "*127.0.0.1*")
if (-not $isLocalhost) {
    throw "Destructive test reset option (-AllowReset) is only allowed on localhost."
}
Reset-TestState -AdminHeaders $adminHeaders
Write-Host "  Reset reservations/sessions/monthly test data." -ForegroundColor Green

$cases = @(
    [pscustomobject]@{ Name = "motorbike"; VehicleTypeId = 3; Price = 2000; RequiresSlot = $false; ReservationCardCode = "C005"; DuplicateCardCode = "C006"; CasualCardCode = "C007"; MonthlyCardId = 8; MonthlyCardCode = "C008"; ExpiredCasualCardCode = "C009"; PlatePrefix = "MB" },
    [pscustomobject]@{ Name = "car"; VehicleTypeId = 5; Price = 10000; RequiresSlot = $true; ReservationCardCode = "C010"; DuplicateCardCode = "C011"; CasualCardCode = "C012"; MonthlyCardId = 13; MonthlyCardCode = "C013"; ExpiredCasualCardCode = "C014"; PlatePrefix = "CAR" },
    [pscustomobject]@{ Name = "transport"; VehicleTypeId = 7; Price = 12000; RequiresSlot = $true; ReservationCardCode = "C015"; DuplicateCardCode = "C016"; CasualCardCode = "C017"; MonthlyCardId = 18; MonthlyCardCode = "C018"; ExpiredCasualCardCode = "C019"; PlatePrefix = "TRK" }
)

$originalPrices = @()
try {
    foreach ($case in $cases) {
        Write-Host "[Matrix] Preparing $($case.Name) pricing..."
        $originalPrices += Set-ReservationPrice -AdminHeaders $adminHeaders -VehicleTypeId $case.VehicleTypeId -Price $case.Price
    }

    Write-Host "[Matrix 1] Whole-hour validation..."
    $invalidLocation = Get-AvailableLocation -Headers $driverHeaders -VehicleTypeId 5
    $invalidBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $invalidLocation.FloorId
        areaId = $invalidLocation.AreaId
        slotId = $invalidLocation.SlotId
        reservedDurationMinutes = 90
    } | ConvertTo-Json
    Invoke-ApiExpectError -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $driverHeaders -Body $invalidBody -ExpectedErrorCode "RESERVATION_DURATION_MUST_BE_WHOLE_HOURS" > $null

    foreach ($case in $cases) {
        Reset-TestState -AdminHeaders $adminHeaders
        Write-Host "[Matrix 2] Paid booking + entry for $($case.Name)..."
        $reservation = New-ReservationWithFee -DriverHeaders $driverHeaders -VehicleTypeId $case.VehicleTypeId -ReservedDurationMinutes 60 -ExpectedAmount $case.Price
        $unpaidCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($reservation.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
        Assert-Success -Response $unpaidCheck -Name "unpaid entry-check $($case.Name)"
        if ($unpaidCheck.data.status -ne "PAYMENT_PENDING") {
            throw "Expected PAYMENT_PENDING for unpaid $($case.Name), got $($unpaidCheck.data.status)."
        }

        Confirm-ReservationPayment -Reservation $reservation

        $paidCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($reservation.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
        Assert-Success -Response $paidCheck -Name "paid entry-check $($case.Name)"
        if ($paidCheck.data.status -ne "VALID" -or [string]::IsNullOrWhiteSpace($paidCheck.data.reservationEntryToken)) {
            throw "Expected VALID booking entry-check for $($case.Name)."
        }

        $entryBody = @{
            entryMode = "RESERVATION"
            reservationId = $reservation.data.reservation.id
            reservationEntryToken = $paidCheck.data.reservationEntryToken
            cardCode = $case.ReservationCardCode
            licensePlate = "$($case.PlatePrefix)-BK-$((Get-Random -Minimum 10000 -Maximum 99999))"
            noPlate = $false
            vehicleTypeId = $case.VehicleTypeId
            entryGateId = 1
            selectedAreaId = $reservation.data.reservation.areaId
            selectedSlotId = $reservation.data.reservation.slotId
        } | ConvertTo-Json

        $entry = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $staffHeaders -Body $entryBody
        Assert-Success -Response $entry -Name "reservation entry $($case.Name)"
        if ($entry.data.customerType -ne "CASUAL" -or $entry.data.paymentRequired -ne $true -or $entry.data.paymentStatus -ne "PENDING") {
            throw "Expected reservation entry to become CASUAL/PENDING for $($case.Name)."
        }

        $billable = [DateTimeOffset]::Parse($entry.data.billableStartTime.ToString())
        $expectedBillable = [DateTimeOffset]::Parse($reservation.data.reservation.expiresAt.ToString())
        if ($billable.ToUnixTimeSeconds() -ne $expectedBillable.ToUnixTimeSeconds()) {
            throw "Expected BillableStartTime to equal reservation ExpiresAt for $($case.Name)."
        }

        $duplicateBody = @{
            entryMode = "RESERVATION"
            reservationId = $reservation.data.reservation.id
            reservationEntryToken = $paidCheck.data.reservationEntryToken
            cardCode = $case.DuplicateCardCode
            licensePlate = "$($case.PlatePrefix)-DUP-$((Get-Random -Minimum 10000 -Maximum 99999))"
            noPlate = $false
            vehicleTypeId = $case.VehicleTypeId
            entryGateId = 1
            selectedAreaId = $reservation.data.reservation.areaId
            selectedSlotId = $reservation.data.reservation.slotId
        } | ConvertTo-Json
        Invoke-ApiExpectError -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $staffHeaders -Body $duplicateBody -ExpectedErrorCode "RESERVATION_ALREADY_CHECKED_IN" > $null
    }

    Reset-TestState -AdminHeaders $adminHeaders
    Write-Host "[Matrix 3] Wrong payOS amount is rejected..."
    $wrongReservation = New-ReservationWithFee -DriverHeaders $driverHeaders -VehicleTypeId 5 -ReservedDurationMinutes 60 -ExpectedAmount 10000
    $wrongPayment = $wrongReservation.data.payment
    $wrongWebhookBody = New-PayOsWebhookBody -Payment $wrongPayment -Amount ([Int64]$wrongPayment.amount + 1)
    Invoke-ApiExpectError -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $wrongWebhookBody -ExpectedErrorCode "PAYOS_AMOUNT_MISMATCH" > $null

    foreach ($case in $cases) {
        Reset-TestState -AdminHeaders $adminHeaders
        Write-Host "[Matrix 4] Casual entry for $($case.Name)..."
        Invoke-CasualEntry -StaffHeaders $staffHeaders -Case $case -CardCode $case.CasualCardCode > $null
    }

    foreach ($case in $cases) {
        Reset-TestState -AdminHeaders $adminHeaders
        Write-Host "[Matrix 5] Monthly entry for $($case.Name)..."
        Invoke-MonthlyEntry -AdminHeaders $adminHeaders -StaffHeaders $staffHeaders -Case $case
    }

    foreach ($case in $cases) {
        Reset-TestState -AdminHeaders $adminHeaders
        Write-Host "[Matrix 6] Expired booking converts at frontend to casual for $($case.Name)..."
        $reservation = New-ReservationWithFee -DriverHeaders $driverHeaders -VehicleTypeId $case.VehicleTypeId -ReservedDurationMinutes 60 -ExpectedAmount $case.Price
        Confirm-ReservationPayment -Reservation $reservation

        Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/expire-reservation?reservationCode=$($reservation.data.reservation.reservationCode)" -Headers $adminHeaders > $null

        $expiredCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($reservation.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
        Assert-Success -Response $expiredCheck -Name "expired entry-check $($case.Name)"
        if ($expiredCheck.data.status -ne "EXPIRED" -or $expiredCheck.data.canConvertToCasual -ne $true) {
            throw "Expected EXPIRED/canConvertToCasual=true for $($case.Name)."
        }

        Invoke-CasualEntry -StaffHeaders $staffHeaders -Case $case -CardCode $case.ExpiredCasualCardCode -ConvertedFromReservationId $reservation.data.reservation.id > $null
    }

    Write-Host "`n[SUCCESS] Booking/entry matrix tests completed successfully." -ForegroundColor Green
} finally {
    foreach ($price in $originalPrices) {
        if ($price.RuleId -and $null -ne $price.OriginalPrice -and $price.OriginalPrice -gt 0) {
            try {
                Invoke-ApiRequest `
                    -Method Patch `
                    -Uri "$BaseUrl/api/core/pricing-rules/$($price.RuleId)/reservation-hourly-price" `
                    -Headers $adminHeaders `
                    -Body (@{ reservationHourlyPrice = $price.OriginalPrice } | ConvertTo-Json) > $null
            } catch {
                Write-Host "[Warning] Failed to restore pricing rule $($price.RuleId): $_" -ForegroundColor Yellow
            }
        }
    }
}
