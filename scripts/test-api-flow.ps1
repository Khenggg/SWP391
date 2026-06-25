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
            throw "API Error status=$($statusCode): $errBody"
        } else {
            throw "Request failed: $($_.Exception.Message)"
        }
    }
}

# Login as Admin to manage pricing rules
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running FLOW tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "[Flow] Logging in as admin01 to manage pricing rules..."
$adminLoginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$adminLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $adminLoginBody
$adminToken = $adminLoginResult.data.accessToken
$adminHeaders = @{
    Authorization = "Bearer $adminToken"
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

# Fetch active pricing rule for Vehicle Type 5 (Car) to save original reservation hourly price
Write-Host "[Flow] Fetching active pricing rule for Vehicle Type 5..."
$allRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $adminHeaders
$carRule = @($allRules.data) | Where-Object { $_.vehicleTypeId -eq 5 -and $_.status -eq "ACTIVE" }
if (-not $carRule) {
    throw "Active pricing rule for Vehicle Type 5 not found!"
}
$ruleId = $carRule.id
$origReservationHourlyPrice = $carRule.reservationHourlyPrice
Write-Host "  Pricing Rule ID: $ruleId, Original hourly price: $origReservationHourlyPrice" -ForegroundColor Green

# Generate unique plate numbers to allow repeated runs safely
$rand = Get-Random -Minimum 10000 -Maximum 99999
$plateCasual = "51A-C$rand"
$plateBooking = "51A-B$rand"
$plateCancel = "51A-X$rand"
$plateExtend = "51A-E$rand"

# Login as Staff for entry operations
Write-Host "[Flow] Logging in as staff01..."
$loginBody = @{
    username = "staff01"
    password = "123456"
} | ConvertTo-Json
$loginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
$token = $loginResult.data.accessToken
$headers = @{
    Authorization = "Bearer $token"
}
Write-Host "  Staff logged in successfully." -ForegroundColor Green

# Temporarily update pricing rule so hourly reservation price is 0 (to make reservations CONFIRMED immediately)
Write-Host "[Flow] Temporarily setting hourly reservation price to 0..."
$updateBody = @{
    reservationHourlyPrice = 0.00
} | ConvertTo-Json
$updatedRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $updateBody -Headers $adminHeaders
Write-Host "  Pricing rule updated: Hourly price = $($updatedRule.data.reservationHourlyPrice)" -ForegroundColor Green

try {
    # ----------------- FLOW 1: CASUAL ENTRY FLOW -----------------
    Write-Host "`n[Flow 1] --- Starting Casual Entry Flow ---" -ForegroundColor Cyan

    # A. Suggest Slot
    Write-Host "[Flow 1] Requesting slot suggestion for Car (vehicleTypeId=5) at Gate 1..."
    $suggestBody = @{
        vehicleTypeId = 5
        entryGateId = 1
    } | ConvertTo-Json
    $suggestion = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/suggest-slot" -Body $suggestBody -Headers $headers
    $slotId = $suggestion.data.slotId
    $slotCode = $suggestion.data.slotCode
    Write-Host "  Suggested Slot ID: $slotId (Code: $slotCode)" -ForegroundColor Green

    # B. Entry Processing
    Write-Host "[Flow 1] Simulating casual entry for plate $plateCasual with Card C004..."
    $entryBody = @{
        cardCode = "C004"
        licensePlate = $plateCasual
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedSlotId = $slotId
    } | ConvertTo-Json
    $entrySession = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $entryBody -Headers $headers
    Write-Host "  Casual entry successful!" -ForegroundColor Green

    # ----------------- FLOW 2: BOOKING & CHECK-IN FLOW -----------------
    Write-Host "`n[Flow 2] --- Starting Booking & Check-In Flow ---" -ForegroundColor Cyan

    # A. Get Available Locations for Booking
    Write-Host "[Flow 2] Fetching available locations for booking Car (vehicleTypeId=5)..."
    $locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $headers
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
    Write-Host "[Flow 2] Creating reservation for plate $plateBooking at Slot $bookingSlotCode..."
    $reservationBody = @{
        plateNumber = $plateBooking
        vehicleTypeId = 5
        floorId = $bookingFloorId
        areaId = $bookingAreaId
        slotId = $bookingSlotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $reservationBody -Headers $headers
    $resId = $reservation.id
    $resCode = $reservation.reservationCode
    Write-Host "  Reservation created successfully: $resCode (ID: $resId) with status: $($reservation.status)" -ForegroundColor Green

    # C. Check Slot Status is RESERVED in DB
    Write-Host "[Flow 2] Verifying slot $bookingSlotCode is RESERVED..."
    $allSlots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $headers
    $slotCheck = @($allSlots) | Where-Object { $_.id -eq $bookingSlotId }
    if ($slotCheck.status -eq "RESERVED") {
        Write-Host "  Verified: Slot $bookingSlotCode status is RESERVED." -ForegroundColor Green
    } else {
        throw "Expected slot status to be RESERVED, but got $($slotCheck.status)"
    }

    # D. Check-In Entry
    Write-Host "[Flow 2] Checking in reservation for plate $plateBooking with Card C005..."
    $checkinBody = @{
        cardCode = "C005"
        licensePlate = $plateBooking
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedSlotId = $bookingSlotId
    } | ConvertTo-Json
    $checkinRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Body $checkinBody -Headers $headers
    Write-Host "  Check-In successful!" -ForegroundColor Green

    # E. Verify Slot Status is OCCUPIED
    Write-Host "[Flow 2] Verifying slot $bookingSlotCode is now OCCUPIED..."
    $allSlots2 = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $headers
    $slotCheck2 = @($allSlots2) | Where-Object { $_.id -eq $bookingSlotId }
    if ($slotCheck2.status -eq "OCCUPIED") {
        Write-Host "  Verified: Slot $bookingSlotCode status is OCCUPIED." -ForegroundColor Green
    } else {
        throw "Expected slot status to be OCCUPIED after check-in, but got $($slotCheck2.status)"
    }

    # ----------------- FLOW 3: RESERVATION EXTEND & CANCEL -----------------
    Write-Host "`n[Flow 3] --- Starting Reservation Extension & Cancellation ---" -ForegroundColor Cyan

    # A. Create and Cancel Reservation
    Write-Host "[Flow 3] Creating temporary reservation for cancellation..."
    $locationsCancel = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $headers
    $cancelSlot = $locationsCancel.data.availableSlots[0]

    if (-not $cancelSlot) {
        throw "No available slot for cancel test!"
    }

    $cancelResBody = @{
        plateNumber = $plateCancel
        vehicleTypeId = 5
        floorId = $cancelSlot.floorId
        areaId = $cancelSlot.areaId
        slotId = $cancelSlot.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $cancelRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $cancelResBody -Headers $headers
    $cancelId = $cancelRes.id
    Write-Host "  Reservation created: ID $cancelId. Cancelling it..."

    $cancelBody = @{
        reason = "Testing cancellation flow"
    } | ConvertTo-Json
    $cancelResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations/$cancelId/cancel" -Body $cancelBody -Headers $headers
    Write-Host "  Cancellation result: $($cancelResult.message)" -ForegroundColor Green

    # B. Create and Extend Reservation
    Write-Host "[Flow 3] Creating temporary reservation for extension..."
    $locationsExtend = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Headers $headers
    $extendSlot = $locationsExtend.data.availableSlots[0]

    if (-not $extendSlot) {
        throw "No available slot for extend test!"
    }

    $extendResBody = @{
        plateNumber = $plateExtend
        vehicleTypeId = 5
        floorId = $extendSlot.floorId
        areaId = $extendSlot.areaId
        slotId = $extendSlot.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $extendRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Body $extendResBody -Headers $headers
    $extendId = $extendRes.id
    Write-Host "  Reservation created: ID $extendId. Extending it..."

    $extendBody = @{
        addedMinutes = 30
    } | ConvertTo-Json
    $extendResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations/$extendId/extend" -Body $extendBody -Headers $headers
    Write-Host "  Extension result: $($extendResult.message)" -ForegroundColor Green

    Write-Host "`n[SUCCESS] Flow tests completed successfully!" -ForegroundColor Green

} finally {
    if ($ruleId -and $origReservationHourlyPrice -ne $null) {
        Write-Host "`n[Flow Cleanup] Restoring hourly reservation price to $origReservationHourlyPrice..." -ForegroundColor Cyan
        $restoreBody = @{
            reservationHourlyPrice = $origReservationHourlyPrice
        } | ConvertTo-Json
        try {
            $restoredRule = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/pricing-rules/$ruleId" -Body $restoreBody -Headers $adminHeaders
            Write-Host "  Restored successfully. Hourly price = $($restoredRule.data.reservationHourlyPrice)" -ForegroundColor Green
        } catch {
            Write-Host "  [Warning] Failed to restore pricing rule: $_" -ForegroundColor Yellow
        }
    }
}
