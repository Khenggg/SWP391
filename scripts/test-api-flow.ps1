param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping flow tests." -ForegroundColor Yellow
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
        $response = Invoke-RestMethod @params
        return $response
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
        if ($errBody) {
            $customEx = New-Object System.Exception("API Error status=$($statusCode): $errBody")
            $customEx | Add-Member -MemberType NoteProperty -Name "ErrorBody" -Value $errBody -Force
            $customEx | Add-Member -MemberType NoteProperty -Name "StatusCode" -Value $statusCode -Force
            throw $customEx
        } else {
            throw $_
        }
    }
}

function Get-ErrorText {
    param($ErrorObject)
    $text = ""
    if ($ErrorObject) {
        if ($ErrorObject.Exception) {
            $text += $ErrorObject.Exception.Message
        }
        if ($ErrorObject.ErrorDetails -and $ErrorObject.ErrorDetails.Message) {
            $text += " " + $ErrorObject.ErrorDetails.Message
        }
        if ([string]::IsNullOrWhiteSpace($text)) {
            $text = [string]$ErrorObject
        }
    }
    return $text
}

function Assert-ApiSuccessFormat {
    param($Response)

    if ($null -eq $Response) { throw "Response object is null" }
    if ($null -eq $Response.success) { throw "Missing success" }
    if ($Response.success -ne $true) { throw "Expected success=true" }
    if ($null -eq $Response.message) { throw "Missing message" }
    if (-not ($Response.PSObject.Properties.Name -contains "data")) { throw "Missing data" }
    if ($null -eq $Response.timestamp) { throw "Missing timestamp" }
    if ($null -eq $Response.statusCode) { throw "Missing statusCode" }
    if ($null -eq $Response.traceId) { throw "Missing traceId" }
    if ($null -eq $Response.path) { throw "Missing path" }
}

function Assert-ApiErrorFormat {
    param($Response, $ExpectedErrorCode)

    if ($null -eq $Response) { throw "Response object is null" }
    if ($null -eq $Response.success) { throw "Missing success" }
    if ($Response.success -ne $false) { throw "Expected success=false" }
    if ($Response.errorCode -ne $ExpectedErrorCode) {
        throw "Expected errorCode=$ExpectedErrorCode but got $($Response.errorCode)"
    }
    if ($null -eq $Response.message) { throw "Missing message" }
    if ($null -eq $Response.statusCode) { throw "Missing statusCode" }
    if ($null -eq $Response.traceId) { throw "Missing traceId" }
    if ($null -eq $Response.path) { throw "Missing path" }
}

function Confirm-ReservationPayment {
    param($ReservationResponse)

    $reservationId = $ReservationResponse.data.reservation.id
    $reservationCode = $ReservationResponse.data.reservation.reservationCode
    $payment = $ReservationResponse.data.payment

    if ($null -eq $payment) {
        throw "Reservation $reservationCode does not include payment data"
    }

    $webhookBody = @{
        code = "00"
        desc = "success"
        success = $true
        data = @{
            orderCode = $payment.orderCode
            amount = $payment.amount
            paymentLinkId = $payment.paymentLinkId
            reference = "REF-$reservationId"
            transactionDateTime = "2026-06-30T10:00:00Z"
            accountNumber = "123456789"
        }
    } | ConvertTo-Json -Depth 5

    $webhookRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $webhookBody
    if ($webhookRes.success -ne $true) {
        throw "Webhook simulation failed for reservation $reservationCode"
    }

    $paymentStatus = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$reservationId/payment-status" -Headers $driverHeaders
    if ($paymentStatus.data.reservationStatus -ne "CONFIRMED" -or $paymentStatus.data.paymentStatus -ne "PAID") {
        throw "Expected reservation $reservationCode to be CONFIRMED/PAID, got reservationStatus=$($paymentStatus.data.reservationStatus), paymentStatus=$($paymentStatus.data.paymentStatus)"
    }
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running FLOW tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Login as Admin to manage pricing rules
Write-Host "[Flow] Logging in as admin01..."
$adminLoginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$adminLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $adminLoginBody
$adminHeaders = @{
    Authorization = "Bearer $($adminLoginResult.data.accessToken)"
}
Write-Host "  Admin logged in successfully." -ForegroundColor Green

# Check localhost safety for reset
$isLocalhost = ($BaseUrl -like "*localhost*" -or $BaseUrl -like "*127.0.0.1*")

if ($AllowReset) {
    if (-not $isLocalhost) {
        throw "Destructive test reset option (-AllowReset) is only allowed on localhost!"
    }
    Write-Host "[Flow] Resetting database reservations/sessions..." -ForegroundColor Cyan
    $resetRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $adminHeaders
    Write-Host "  Reset Response: $($resetRes.message)" -ForegroundColor Green
}

# Fetch active pricing rules to save original reservation hourly prices
Write-Host "[Flow] Fetching active pricing rules..."
$allRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $adminHeaders

$carRule = @($allRules.data) | Where-Object { $_.vehicleTypeId -eq 5 -and $_.status -eq "ACTIVE" }
if (-not $carRule) {
    throw "Active pricing rule for Vehicle Type 5 not found!"
}
$ruleId = $carRule.id
$origReservationHourlyPrice = $carRule.reservationHourlyPrice
Write-Host "  Car Pricing Rule ID: $ruleId, Original hourly price: $origReservationHourlyPrice" -ForegroundColor Green

$bikeRule = @($allRules.data) | Where-Object { $_.vehicleTypeId -eq 3 -and $_.status -eq "ACTIVE" }
if (-not $bikeRule) {
    throw "Active pricing rule for Vehicle Type 3 not found!"
}
$bikeRuleId = $bikeRule.id
$origBikeReservationHourlyPrice = $bikeRule.reservationHourlyPrice
Write-Host "  Motorbike Pricing Rule ID: $bikeRuleId, Original hourly price: $origBikeReservationHourlyPrice" -ForegroundColor Green

# Generate unique plate numbers to allow repeated runs safely
$rand = Get-Random -Minimum 10000 -Maximum 99999
$plateCasual = "51A-CASUAL-$rand"
$plateBooking = "51A-BOOK-$rand"
$plateCancel = "51A-CANCEL-$rand"
$plateExtend = "51A-EXTEND-$rand"

# Login as Driver01 (Driver role)
Write-Host "[Flow] Logging in as driver01..."
$driverLoginBody = @{
    username = "driver01"
    password = "123456"
} | ConvertTo-Json
$driverLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $driverLoginBody
$driverHeaders = @{
    Authorization = "Bearer $($driverLoginResult.data.accessToken)"
}
Write-Host "  Driver logged in successfully." -ForegroundColor Green

# Login as Staff01 (Staff role)
Write-Host "[Flow] Logging in as staff01..."
$staffLoginBody = @{
    username = "staff01"
    password = "123456"
} | ConvertTo-Json
$staffLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $staffLoginBody
$staffHeaders = @{
    Authorization = "Bearer $($staffLoginResult.data.accessToken)"
}
Write-Host "  Staff logged in successfully." -ForegroundColor Green

# Temporarily update pricing rules so hourly reservation price is 10000 (to test booking fee & payment webhook)
Write-Host "[Flow] Temporarily setting hourly reservation price to 10000..."
$updateBody = @{
    reservationHourlyPrice = 10000.00
} | ConvertTo-Json
$updatedRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $updateBody -Headers $adminHeaders
$updatedBikeRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$bikeRuleId" -Body $updateBody -Headers $adminHeaders
Write-Host "  Pricing rules updated: Car Hourly = $($updatedRule.data.reservationHourlyPrice), Motorbike Hourly = $($updatedBikeRule.data.reservationHourlyPrice)" -ForegroundColor Green

try {
    # ----------------- FLOW 1: CASUAL ENTRY FLOW -----------------
    Write-Host "`n[Flow 1] --- Starting Casual Entry Flow ---" -ForegroundColor Cyan

    # A. Get Slot Suggestion (location-suggestion & suggestionToken)
    Write-Host "[Flow 1] Requesting slot suggestion for Car (vehicleTypeId=5) at Gate 1..."
    $suggestion = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/parking-sessions/location-suggestion?vehicleTypeId=5&entryGateId=1" -Headers $staffHeaders
    $suggestionToken = $suggestion.data.suggestionToken
    $suggestedSlotId = $suggestion.data.suggestedSlotId
    $suggestedSlotCode = $suggestion.data.suggestedSlotCode
    $suggestedAreaId = $suggestion.data.suggestedAreaId
    Write-Host "  Suggested Slot ID: $suggestedSlotId (Code: $suggestedSlotCode) with Token: $suggestionToken" -ForegroundColor Green

    # B. Casual Entry Processing
    Write-Host "[Flow 1] Simulating casual entry for plate $plateCasual with Card C004..."
    $casualBody = @{
        entryMode = "CASUAL"
        cardCode = "C004"
        licensePlate = $plateCasual
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $suggestedAreaId
        selectedSlotId = $suggestedSlotId
        suggestionToken = $suggestionToken
    } | ConvertTo-Json -Depth 5
    $entrySession = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $casualBody -Headers $staffHeaders
    if ($entrySession.success -eq $true -and $entrySession.data.entryMode -eq "CASUAL") {
        Write-Host "  Casual entry successful!" -ForegroundColor Green
    } else {
        throw "Casual entry failed or mode incorrect!"
    }

    # ----------------- FLOW 2: DRIVER CREATE BOOKING (NO PLATE) -----------------
    Write-Host "`n[Flow 2] --- Starting Booking Flow (Driver creates booking without plate) ---" -ForegroundColor Cyan

    # A. Get Available Locations for Booking
    Write-Host "[Flow 2] Fetching available locations for booking Car (vehicleTypeId=5)..."
    $locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    if (@($locations.data.availableSlots).Count -gt 0) {
        $bookingSlotId = $locations.data.availableSlots[0].slotId
        $bookingSlotCode = $locations.data.availableSlots[0].slotCode
        $bookingAreaId = $locations.data.availableSlots[0].areaId
        $bookingFloorId = $locations.data.availableSlots[0].floorId
        Write-Host "  Found available slot: $bookingSlotCode (ID: $bookingSlotId) on Floor: $bookingFloorId" -ForegroundColor Green
    } else {
        throw "No available slots found for booking!"
    }

    # B. Create Reservation
    Write-Host "[Flow 2] Driver creating reservation without driverId, vehicleId, and plateNumber..."
    $reservationBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $bookingFloorId
        areaId = $bookingAreaId
        slotId = $bookingSlotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json -Depth 5

    $reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $reservationBody -Headers $driverHeaders
    $resId = $reservation.data.reservation.id
    $resCode = $reservation.data.reservation.reservationCode

    # Assertions
    if ($resId -ne $null -and $reservation.data.reservation.status -eq "PENDING") {
        Write-Host "  Reservation created: $resCode (ID: $resId) in PENDING status." -ForegroundColor Green
    } else {
        throw "Reservation failed or status is not PENDING!"
    }

    # Simulate webhook payment confirmation
    Write-Host "[Flow 2] Simulating payOS payment webhook to confirm reservation $resCode..."
    $orderCode = $reservation.data.payment.orderCode
    $amount = $reservation.data.payment.amount
    $webhookBody = @{
        code = "00"
        desc = "success"
        success = $true
        data = @{
            orderCode = $orderCode
            amount = $amount
            paymentLinkId = $reservation.data.payment.paymentLinkId
            reference = "REF123"
            transactionDateTime = "2026-06-30T10:00:00Z"
            accountNumber = "123456789"
        }
    } | ConvertTo-Json

    $webhookRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/payments/payos/webhook" -Body $webhookBody
    if ($webhookRes.success -ne $true) {
        throw "Webhook simulation failed!"
    }
    Write-Host "  Webhook simulated successfully." -ForegroundColor Green

    # Retrieve confirmed reservation details to verify
    $confirmedRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$resId/payment-status" -Headers $driverHeaders
    if ($confirmedRes.data.reservationStatus -ne "CONFIRMED") {
        throw "Expected reservationStatus to be CONFIRMED, but got $($confirmedRes.data.reservationStatus)"
    }
    if ($reservation.data.reservation.driverId -eq $null) {
        throw "Expected driverId to be resolved by backend, but got null!"
    }
    if ($reservation.data.reservation.plateNumber -ne $null -or $reservation.data.reservation.normalizedPlateNumber -ne $null) {
        throw "Expected plateNumber to be null, but got $($reservation.data.reservation.plateNumber)"
    }
    Write-Host "  Verified: Reservation status is CONFIRMED, payment is PAID, driverId resolved ($($reservation.data.reservation.driverId)), and plateNumber is null." -ForegroundColor Green

    # C. Verify Slot Status is RESERVED in DB
    Write-Host "[Flow 2] Verifying slot $bookingSlotCode status is RESERVED..."
    $allSlots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $staffHeaders
    $slotCheck = @($allSlots.data) | Where-Object { $_.id -eq $bookingSlotId }
    if ($slotCheck.status -eq "RESERVED") {
        Write-Host "  Verified: Slot $bookingSlotCode status is RESERVED." -ForegroundColor Green
    } else {
        throw "Expected slot status to be RESERVED, but got $($slotCheck.status)"
    }

    # ----------------- FLOW 3: STAFF RESERVATION ENTRY-CHECK -----------------
    Write-Host "`n[Flow 3] --- Starting Reservation Entry Check ---" -ForegroundColor Cyan
    Write-Host "[Flow 3] Staff scans reservation QR $resCode..."
    $entryCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$resCode/entry-check?entryGateId=1" -Headers $staffHeaders

    $reservationEntryToken = $entryCheck.data.reservationEntryToken
    if ($entryCheck.data.status -eq "VALID" -and $reservationEntryToken -ne $null) {
        Write-Host "  Entry check VALID! reservationEntryToken acquired." -ForegroundColor Green
    } else {
        throw "Expected entry-check status VALID and non-null token, got status=$($entryCheck.data.status)"
    }
    if ($entryCheck.data.reservationId -ne $resId -or $entryCheck.data.vehicleTypeId -eq $null) {
        throw "Token properties mismatch!"
    }
    Write-Host "  Verified: reservationId ($($entryCheck.data.reservationId)) matches." -ForegroundColor Green

    # ----------------- FLOW 4: STAFF CHECK-IN BOOKING -----------------
    Write-Host "`n[Flow 4] --- Starting Reservation Check-In ---" -ForegroundColor Cyan
    $plateAtEntry = "51A-TEST-$rand"
    Write-Host "[Flow 4] Staff checking in reservation $resCode with real plate $plateAtEntry on Card C005..."

    $checkinBody = @{
        entryMode = "RESERVATION"
        reservationId = $resId
        reservationEntryToken = $reservationEntryToken
        cardCode = "C005"
        licensePlate = $plateAtEntry
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $bookingAreaId
        selectedSlotId = $bookingSlotId
    } | ConvertTo-Json

    $checkinRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $checkinBody -Headers $staffHeaders

    # Assertions
    if ($checkinRes.success -eq $true -and $checkinRes.data.entryMode -eq "RESERVATION") {
        Write-Host "  Check-In successful!" -ForegroundColor Green
    } else {
        throw "Check-In failed or entryMode incorrect!"
    }
    if ($checkinRes.data.plateNumber -ne $plateAtEntry) {
        throw "Expected plate number $plateAtEntry, but got $($checkinRes.data.plateNumber)"
    }
    if ($checkinRes.data.paymentStatus -ne "PENDING" -or $checkinRes.data.paymentRequired -ne $true) {
        throw "Expected paymentStatus PENDING and paymentRequired true for reservation entry post-booking session!"
    }
    if ([DateTimeOffset]::Parse($checkinRes.data.billableStartTime).ToUniversalTime() -ne [DateTimeOffset]::Parse($reservation.data.reservation.expiresAt).ToUniversalTime()) {
        throw "Expected billableStartTime to equal reservation expiresAt!"
    }
    Write-Host "  Verified: Plate number captured successfully. Post-booking parking payment status: PENDING." -ForegroundColor Green

    # Verify Slot Status is OCCUPIED
    Write-Host "[Flow 4] Verifying slot $bookingSlotCode is now OCCUPIED..."
    $allSlots2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $staffHeaders
    $slotCheck2 = @($allSlots2.data) | Where-Object { $_.id -eq $bookingSlotId }
    if ($slotCheck2.status -eq "OCCUPIED") {
        Write-Host "  Verified: Slot $bookingSlotCode status is OCCUPIED." -ForegroundColor Green
    } else {
        throw "Expected slot status to be OCCUPIED after check-in, but got $($slotCheck2.status)"
    }

    Write-Host "[Flow] Keeping positive reservationHourlyPrice; subsequent booking tests confirm payment through payOS webhook." -ForegroundColor Cyan

    # ----------------- FLOW 5: NEGATIVE BOOKING TESTS -----------------
    Write-Host "`n[Flow 5] --- Starting Negative Booking Tests ---" -ForegroundColor Cyan

    # A. Staff creates booking without driverId (should fail)
    Write-Host "[Flow 5A] Staff creating reservation without driverId (expected: DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING)..."
    $invalidStaffReservationBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $bookingFloorId
        areaId = $bookingAreaId
        slotId = $bookingSlotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    try {
        $dummy = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $invalidStaffReservationBody -Headers $staffHeaders
        throw "Expected failure DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING but reservation succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING*") {
            Write-Host "  [ PASS ] Failed correctly with DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING" -ForegroundColor Green
        } else {
            throw "Expected DRIVER_ID_REQUIRED_FOR_STAFF_BOOKING, but got: $errText"
        }
    }

    # B. Booking slot vehicle without plate but noPlate = true (should fail)
    Write-Host "[Flow 5B] Creating booking and attempting entry for Car with noPlate = true (expected: PLATE_REQUIRED_FOR_SLOT_VEHICLE)..."
    # Find next slot
    $locationsTmp = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $tmpSlot = $locationsTmp.data.availableSlots[0]
    $tmpResBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $tmpSlot.floorId
        areaId = $tmpSlot.areaId
        slotId = $tmpSlot.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $tmpRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $tmpResBody -Headers $driverHeaders
    Confirm-ReservationPayment -ReservationResponse $tmpRes

    # Get entry token
    $tmpCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($tmpRes.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    $tmpToken = $tmpCheck.data.reservationEntryToken

    # Check-in with noPlate = true
    $invalidNoPlateCheckinBody = @{
        entryMode = "RESERVATION"
        reservationId = $tmpRes.data.reservation.id
        reservationEntryToken = $tmpToken
        cardCode = "C006"
        licensePlate = $null
        noPlate = $true
        vehicleDescription = "Xe khong co bien so"
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $tmpSlot.areaId
        selectedSlotId = $tmpSlot.slotId
    } | ConvertTo-Json

    try {
        $dummy = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $invalidNoPlateCheckinBody -Headers $staffHeaders
        throw "Expected failure PLATE_REQUIRED_FOR_SLOT_VEHICLE but check-in succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*PLATE_REQUIRED_FOR_SLOT_VEHICLE*") {
            Write-Host "  [ PASS ] Failed correctly with PLATE_REQUIRED_FOR_SLOT_VEHICLE" -ForegroundColor Green
        } else {
            throw "Expected PLATE_REQUIRED_FOR_SLOT_VEHICLE, but got: $errText"
        }
    }

    # C. Booking already has plate, entry with mismatch plate (should fail)
    Write-Host "[Flow 5C] Creating booking with plate '51A-11111', entry with '51A-99999' (expected: RESERVATION_PLATE_MISMATCH)..."
    # Find next slot
    $locationsTmp2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $tmpSlot2 = $locationsTmp2.data.availableSlots[0]
    $tmpResWithPlateBody = @{
        vehicleId = $null
        plateNumber = "51A-11111"
        vehicleTypeId = 5
        floorId = $tmpSlot2.floorId
        areaId = $tmpSlot2.areaId
        slotId = $tmpSlot2.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $tmpResWithPlate = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $tmpResWithPlateBody -Headers $driverHeaders
    Confirm-ReservationPayment -ReservationResponse $tmpResWithPlate

    # Get entry token
    $tmpCheck2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($tmpResWithPlate.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    $tmpToken2 = $tmpCheck2.data.reservationEntryToken

    # Check-in with wrong plate
    $wrongPlateEntryBody = @{
        entryMode = "RESERVATION"
        reservationId = $tmpResWithPlate.data.reservation.id
        reservationEntryToken = $tmpToken2
        cardCode = "C007"
        licensePlate = "51A-99999"
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $tmpSlot2.areaId
        selectedSlotId = $tmpSlot2.slotId
    } | ConvertTo-Json

    try {
        $dummy = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $wrongPlateEntryBody -Headers $staffHeaders
        throw "Expected failure RESERVATION_PLATE_MISMATCH but check-in succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*RESERVATION_PLATE_MISMATCH*") {
            Write-Host "  [ PASS ] Failed correctly with RESERVATION_PLATE_MISMATCH" -ForegroundColor Green
        } else {
            throw "Expected RESERVATION_PLATE_MISMATCH, but got: $errText"
        }
    }

    # D. Test slot status not RESERVED during reservation entry-check (expected: RESERVED_SLOT_NOT_AVAILABLE)
    Write-Host "[Flow 5D] Creating reservation and changing slot status from RESERVED to AVAILABLE to check validation (expected: RESERVED_SLOT_NOT_AVAILABLE)..."
    $locationsTmp3 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $tmpSlot3 = $locationsTmp3.data.availableSlots[0]
    $tmpRes3Body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = $tmpSlot3.floorId
        areaId = $tmpSlot3.areaId
        slotId = $tmpSlot3.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $tmpRes3 = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $tmpRes3Body -Headers $driverHeaders
    Confirm-ReservationPayment -ReservationResponse $tmpRes3

    # Change slot status to AVAILABLE via Admin PATCH API
    $updateSlotBody = @{
        status = "AVAILABLE"
    } | ConvertTo-Json
    $dummyUpdate = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/slots/$($tmpSlot3.slotId)/status" -Body $updateSlotBody -Headers $adminHeaders

    try {
        $dummy = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($tmpRes3.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
        throw "Expected failure RESERVED_SLOT_NOT_AVAILABLE but entry-check succeeded!"
    } catch {
        $errText = Get-ErrorText $_
        if ($errText -like "*RESERVED_SLOT_NOT_AVAILABLE*") {
            Write-Host "  [ PASS ] Failed correctly with RESERVED_SLOT_NOT_AVAILABLE" -ForegroundColor Green
        } else {
            throw "Expected RESERVED_SLOT_NOT_AVAILABLE, but got: $errText"
        }
    } finally {
        # Restore slot status to RESERVED so cleanup/other tests don't break
        $restoreSlotBody = @{
            status = "RESERVED"
        } | ConvertTo-Json
        $dummyRestore = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/slots/$($tmpSlot3.slotId)/status" -Body $restoreSlotBody -Headers $adminHeaders
    }

    # E. Test noPlate = true check-in for area-managed vehicle (expected: success)
    Write-Host "[Flow 5E] Booking and entry check-in for Motorbike (noPlate = true, expected: success)..."
    $locationsBike = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=3" -Headers $driverHeaders
    $bikeArea = $locationsBike.data.availableAreas[0]

    $bikeResBody = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 3
        floorId = $bikeArea.floorId
        areaId = $bikeArea.areaId
        slotId = $null
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $bikeRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $bikeResBody -Headers $driverHeaders
    Confirm-ReservationPayment -ReservationResponse $bikeRes

    $bikeCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($bikeRes.data.reservation.reservationCode)/entry-check?entryGateId=1" -Headers $staffHeaders
    $bikeToken = $bikeCheck.data.reservationEntryToken

    # Find an AVAILABLE card dynamically for motorbike check-in (using adminHeaders because cards API requires ADMIN/MANAGER role)
    $cardsRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/cards" -Headers $adminHeaders
    $availableCard = $cardsRes.data | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
    $bikeCardCode = if ($availableCard) { $availableCard.cardNumber } else { "C008" }

    $bikeCheckinBody = @{
        entryMode = "RESERVATION"
        reservationId = $bikeRes.data.reservation.id
        reservationEntryToken = $bikeToken
        cardCode = $bikeCardCode
        licensePlate = $null
        noPlate = $true
        vehicleDescription = "Xe may test khong bien so"
        vehicleTypeId = 3
        entryGateId = 1
        selectedAreaId = $bikeArea.areaId
        selectedSlotId = $null
    } | ConvertTo-Json

    $bikeSession = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $bikeCheckinBody -Headers $staffHeaders

    if ($bikeSession.data.sessionId -eq $null) {
        throw "Motorbike check-in failed: sessionId is null"
    }
    if ($bikeSession.data.noPlate -ne $true) {
        throw "Expected noPlate=true"
    }
    if ($null -ne $bikeSession.data.plateNumber) {
        throw "Expected plateNumber null for noPlate session, but got: $($bikeSession.data.plateNumber)"
    }
    if ($null -ne $bikeSession.data.normalizedPlateNumber) {
        throw "Expected normalizedPlateNumber null for noPlate session, but got: $($bikeSession.data.normalizedPlateNumber)"
    }

    $dump = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health/dump-reservations" -Headers $adminHeaders
    $r = @($dump.data) | Where-Object { $_.id -eq $bikeRes.data.reservation.id }
    if ($r -and $r.status -eq "COMPLETED" -and $r.plateNumber -eq $null -and $r.normalizedPlateNumber -eq $null) {
        Write-Host "  [ PASS ] Motorbike check-in succeeded. noPlate is true, plate fields are null." -ForegroundColor Green
    } else {
        throw "Expected reservation to be COMPLETED with null plate fields, but got: plateNumber=$($r.plateNumber), normalized=$($r.normalizedPlateNumber)"
    }

    # ======================================================================
    #   [Flow 6] --- Starting API Response Format Standard Validation Tests ---
    # ======================================================================
    Write-Host "`n[Flow 6] --- API Response Format Standard Validation Tests ---" -ForegroundColor Cyan

    # 1. Success validation: GET /api/core/vehicle-types
    Write-Host "[Flow 6] Checking success format on GET /api/core/vehicle-types..."
    $vtRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/vehicle-types" -Headers $adminHeaders
    Assert-ApiSuccessFormat -Response $vtRes
    Write-Host "  [ PASS ] Success format valid." -ForegroundColor Green

    # 2. Success validation: POST /api/core/reservations (Car)
    Write-Host "[Flow 6] Checking success format on POST /api/core/reservations..."
    $locations6 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
    $slot6 = $locations6.data.availableSlots[0]
    $carResBody = @{
        vehicleTypeId = 5
        floorId = $slot6.floorId
        areaId = $slot6.areaId
        slotId = $slot6.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $resSuccess = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $carResBody -Headers $driverHeaders
    Assert-ApiSuccessFormat -Response $resSuccess
    if ($resSuccess.statusCode -ne 201) { throw "Expected statusCode 201 but got $($resSuccess.statusCode)" }
    Write-Host "  [ PASS ] Created success format valid (statusCode 201)." -ForegroundColor Green

    # 3. Validation error: POST /api/core/reservations (missing vehicleTypeId)
    Write-Host "[Flow 6] Checking validation error format on POST /api/core/reservations..."
    $invalidResBody = @{
        vehicleTypeId = "not-a-number"
        floorId = 1
        areaId = 2
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $valErrorResponse = $null
    try {
        $res = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $invalidResBody -Headers $driverHeaders
    } catch {
        $errText = $_.Exception.Message
        if ($errText -match 'API Error status=\w+:\s*(\{.*\})') {
            $valErrorResponse = $Matches[1] | ConvertFrom-Json
        }
    }
    if ($null -eq $valErrorResponse) { throw "Expected validation error but request succeeded or parse failed" }
    Assert-ApiErrorFormat -Response $valErrorResponse -ExpectedErrorCode "VALIDATION_ERROR"
    if ($valErrorResponse.statusCode -ne 400) { throw "Expected statusCode 400 but got $($valErrorResponse.statusCode)" }
    Write-Host "  [ PASS ] Validation error format valid." -ForegroundColor Green

    # 4. Business error: POST /api/core/parking-sessions/entry (Car with noPlate = true)
    Write-Host "[Flow 6] Checking business error format on POST /api/core/parking-sessions/entry..."
    $noPlateCarBody = @{
        entryMode = "CASUAL"
        cardCode = "C003"
        licensePlate = $null
        noPlate = $true
        vehicleTypeId = 5
        entryGateId = 1
    } | ConvertTo-Json

    $bizErrorResponse = $null
    try {
        $res = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $noPlateCarBody -Headers $staffHeaders
    } catch {
        $errText = $_.Exception.Message
        if ($errText -match 'API Error status=\w+:\s*(\{.*\})') {
            $bizErrorResponse = $Matches[1] | ConvertFrom-Json
        }
    }
    if ($null -eq $bizErrorResponse) { throw "Expected business error but request succeeded" }
    Assert-ApiErrorFormat -Response $bizErrorResponse -ExpectedErrorCode "PLATE_REQUIRED_FOR_SLOT_VEHICLE"
    if ($bizErrorResponse.statusCode -ne 400) { throw "Expected statusCode 400 but got $($bizErrorResponse.statusCode)" }
    Write-Host "  [ PASS ] Business error format valid." -ForegroundColor Green

    # 5. Dev endpoint: GET /api/core/health/dump-reservations
    Write-Host "[Flow 6] Checking success format on dev endpoint GET /api/core/health/dump-reservations..."
    $dumpRes = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health/dump-reservations" -Headers $adminHeaders
    Assert-ApiSuccessFormat -Response $dumpRes
    Write-Host "  [ PASS ] Dev endpoint success format valid." -ForegroundColor Green

    Write-Host "`n[SUCCESS] Flow tests completed successfully!" -ForegroundColor Green

} finally {
    if ($ruleId -and $origReservationHourlyPrice -ne $null) {
        Write-Host "`n[Flow Cleanup] Restoring Car hourly reservation price to $origReservationHourlyPrice..." -ForegroundColor Cyan
        $restoreBody = @{
            reservationHourlyPrice = $origReservationHourlyPrice
        } | ConvertTo-Json
        try {
            $restoredRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $restoreBody -Headers $adminHeaders
            Write-Host "  Restored Car successfully. Hourly price = $($restoredRule.data.reservationHourlyPrice)" -ForegroundColor Green
        } catch {
            Write-Host "  [Warning] Failed to restore Car pricing rule: $_" -ForegroundColor Yellow
        }
    }

    if ($bikeRuleId -and $origBikeReservationHourlyPrice -ne $null) {
        Write-Host "[Flow Cleanup] Restoring Motorbike hourly reservation price to $origBikeReservationHourlyPrice..." -ForegroundColor Cyan
        $restoreBikeBody = @{
            reservationHourlyPrice = $origBikeReservationHourlyPrice
        } | ConvertTo-Json
        try {
            $restoredBikeRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$bikeRuleId" -Body $restoreBikeBody -Headers $adminHeaders
            Write-Host "  Restored Motorbike successfully. Hourly price = $($restoredBikeRule.data.reservationHourlyPrice)" -ForegroundColor Green
        } catch {
            Write-Host "  [Warning] Failed to restore Motorbike pricing rule: $_" -ForegroundColor Yellow
        }
    }
}
