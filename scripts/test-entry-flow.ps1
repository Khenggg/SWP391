# ======================================================================
#            E2E ENTRY FLOW INTEGRATION TESTS (3 ENTRY MODES)
# ======================================================================
$baseUrl = "http://localhost:5000/api/core"

Write-Host "====================================================" -ForegroundColor Green
Write-Host " STARTING E2E ENTRY FLOW INTEGRATION TESTS"
Write-Host " Base URL: $baseUrl"
Write-Host "====================================================" -ForegroundColor Green

# Helper function to report status
function Report-Step {
    param (
        [string]$StepName,
        [bool]$Success,
        [string]$ErrorMessage = ""
    )
    if ($Success) {
        Write-Host "[ PASS ] $StepName" -ForegroundColor Green
    } else {
        Write-Host "[ FAIL ] $StepName" -ForegroundColor Red
        if ($ErrorMessage) {
            Write-Host "         Reason: $ErrorMessage" -ForegroundColor DarkRed
        }
    }
}

# ======================================================================
# TASK 7.1 - Login as staff01 and admin01
# ======================================================================
$adminToken = $null
$staffToken = $null
$headers = @{}
$staffHeaders = @{}

try {
    # Login admin01
    $adminBody = @{ username = "admin01"; password = "123456" } | ConvertTo-Json
    $adminRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $adminBody
    $adminToken = $adminRes.data.accessToken
    $headers = @{ Authorization = "Bearer $adminToken" }

    # Login staff01
    $staffBody = @{ username = "staff01"; password = "123456" } | ConvertTo-Json
    $staffRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $staffBody
    $staffToken = $staffRes.data.accessToken
    $staffHeaders = @{ Authorization = "Bearer $staffToken" }

    Report-Step -StepName "TASK 7.1: Login admin01 and staff01 tokens" -Success ($adminToken -ne $null -and $staffToken -ne $null)
} catch {
    Report-Step -StepName "TASK 7.1: Login admin01 and staff01 tokens" -Success $false -ErrorMessage $_.Exception.Message
    exit 1
}

# Reset transactional data before running test
try {
    Invoke-RestMethod -Uri "$baseUrl/health/clear-reservations" -Method Post -Headers $headers > $null
} catch {}

# ======================================================================
# TASK 7.2 - Test flow vé tháng (MONTHLY flow)
# ======================================================================
try {
    # 0. Create monthly pass dynamically for C001 (xe máy)
    $bodyCreate = @{
        ownerName = "Nguyen Van Monthly"
        plateNumber = "51A-99999"
        cardId = 1 # C001
        vehicleTypeId = 3 # Motorbike
        startDate = (Get-Date).ToString("yyyy-MM-dd")
        endDate = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        floorId = 1
        areaId = 1
        slotId = $null
    } | ConvertTo-Json
    $resCreate = Invoke-RestMethod -Uri "$baseUrl/monthly-passes" -Method Post -Headers $headers -ContentType "application/json" -Body $bodyCreate
    $monthlyPassId = $resCreate.id

    # 1. card entry-check for monthly card C001 (Motorbike monthly pass, floor_id = 1, area_id = 1)
    $resCheck = Invoke-RestMethod -Uri "$baseUrl/cards/C001/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    if ($resCheck.success -eq $true -and $resCheck.data.entryCardType -eq "MONTHLY" -and $resCheck.data.monthlyEntryToken -ne $null) {
        $monthlyPassId = $resCheck.data.monthlyPassId
        $monthlyToken = $resCheck.data.monthlyEntryToken
        $fixedFloorId = $resCheck.data.fixedFloorId
        $fixedAreaId = $resCheck.data.fixedAreaId

        # 2. Call Entry under MONTHLY mode
        $bodyEntry = @{
            entryMode = "MONTHLY"
            monthlyPassId = $monthlyPassId
            monthlyEntryToken = $monthlyToken
            cardCode = "C001"
            licensePlate = "51A-99999"
            noPlate = $false
            vehicleTypeId = 3
            entryGateId = 1
            selectedAreaId = $fixedAreaId
            selectedSlotId = $null
        } | ConvertTo-Json

        $resEntry = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry

        if ($resEntry.success -eq $true -and $resEntry.data.customerType -eq "MONTHLY" -and $resEntry.data.paymentStatus -eq "NOT_REQUIRED" -and $resEntry.data.monthlyPassId -eq $monthlyPassId) {
            Report-Step -StepName "TASK 7.2: MONTHLY flow (entry-check & check-in)" -Success $true
        } else {
            Report-Step -StepName "TASK 7.2: MONTHLY flow (entry-check & check-in)" -Success $false -ErrorMessage "Entry status code/type mismatched"
        }
    } else {
        Report-Step -StepName "TASK 7.2: MONTHLY flow" -Success $false -ErrorMessage "Monthly pass check-in failed to detect card type"
    }
} catch {
    Report-Step -StepName "TASK 7.2: MONTHLY flow" -Success $false -ErrorMessage $_.Exception.Message
}

# ======================================================================
# TASK 7.3 - Test flow vãng lai xe máy (CASUAL flow)
# ======================================================================
try {
    # 1. card entry-check for casual card C002 -> expecting NORMAL
    $resCheck = Invoke-RestMethod -Uri "$baseUrl/cards/C002/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    if ($resCheck.success -eq $true -and $resCheck.data.entryCardType -eq "NORMAL") {
        # 2. Get location suggestion for Motorbike (vehicleTypeId = 3)
        $resSug = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/location-suggestion?vehicleTypeId=3&entryGateId=1" -Method Get -Headers $staffHeaders

        if ($resCheck.success -eq $true -and $resSug.data.suggestionType -eq "AREA") {
            $suggestedAreaId = $resSug.data.suggestedAreaId
            $suggestionToken = $resSug.data.suggestionToken

            # 3. Call Entry under CASUAL mode
            $bodyEntry = @{
                entryMode = "CASUAL"
                cardCode = "C002"
                licensePlate = "59X1-88888"
                noPlate = $false
                vehicleTypeId = 3
                entryGateId = 1
                selectedAreaId = $suggestedAreaId
                selectedSlotId = $null
                suggestionToken = $suggestionToken
            } | ConvertTo-Json

            $resEntry = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry

            if ($resEntry.success -eq $true -and $resEntry.data.customerType -eq "CASUAL" -and $resEntry.data.paymentRequired -eq $true -and $resEntry.data.paymentStatus -eq "PENDING") {
                Report-Step -StepName "TASK 7.3: CASUAL flow (entry-check, suggestion & check-in)" -Success $true
            } else {
                Report-Step -StepName "TASK 7.3: CASUAL flow" -Success $false -ErrorMessage "Casual check-in response mismatch"
            }
        } else {
            Report-Step -StepName "TASK 7.3: CASUAL flow" -Success $false -ErrorMessage "Failed to get location suggestion"
        }
    } else {
        Report-Step -StepName "TASK 7.3: CASUAL flow" -Success $false -ErrorMessage "Card C002 was not detected as NORMAL"
    }
} catch {
    Report-Step -StepName "TASK 7.3: CASUAL flow" -Success $false -ErrorMessage $_.Exception.Message
}

# ======================================================================
# TASK 7.4 - Test flow booking (RESERVATION flow)
# ======================================================================
try {
    # 1. Create a reservation dynamically for Ô tô (requires slot)
    # Set hourly price to 0 first for confirmation
    $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body (@{ reservationHourlyPrice = 0 } | ConvertTo-Json)

    $resPlate = "RES-" + (Get-Random -Minimum 10000 -Maximum 99999)
    $resPost = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
        driverId = 1
        vehicleId = $null
        plateNumber = $resPlate
        vehicleTypeId = 5
        floorId = 2
        areaId = 4
        slotId = 34 # Floor 2, Area 4, Slot 34 is AVAILABLE
        reservedDurationMinutes = 60
    } | ConvertTo-Json)

    $resCode = $resPost.reservationCode
    $resId = $resPost.id

    # Restore hourly price
    $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body (@{ reservationHourlyPrice = 10000 } | ConvertTo-Json)

    # 2. reservation entry-check -> expecting VALID
    $resCheck = Invoke-RestMethod -Uri "$baseUrl/reservations/$resCode/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    if ($resCheck.success -eq $true -and $resCheck.data.status -eq "VALID" -and $resCheck.data.reservationEntryToken -ne $null) {
        $resEntryToken = $resCheck.data.reservationEntryToken
        $reservedAreaId = $resCheck.data.reservedAreaId
        $reservedSlotId = $resCheck.data.reservedSlotId

        # 3. Call Entry under RESERVATION mode (uses C003)
        $bodyEntry = @{
            entryMode = "RESERVATION"
            reservationId = $resId
            reservationEntryToken = $resEntryToken
            cardCode = "C003"
            licensePlate = $resPlate
            noPlate = $false
            vehicleTypeId = 5
            entryGateId = 1
            selectedAreaId = $reservedAreaId
            selectedSlotId = $reservedSlotId
        } | ConvertTo-Json

        $resEntry = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry

        if ($resEntry.success -eq $true -and $resEntry.data.reservationId -eq $resId -and $resEntry.data.customerType -eq "CASUAL" -and $resEntry.data.paymentRequired -eq $true -and $resEntry.data.paymentStatus -eq "PENDING") {

            # Verify reservation status turned to COMPLETED
            $resStatusCheck = Invoke-RestMethod -Uri "$baseUrl/reservations/$resCode/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders
            if ($resStatusCheck.success -eq $true -and $resStatusCheck.data.status -eq "ALREADY_CHECKED_IN") {
                Report-Step -StepName "TASK 7.4: RESERVATION flow (create, entry-check & check-in -> COMPLETED)" -Success $true
            } else {
                Report-Step -StepName "TASK 7.4: RESERVATION flow" -Success $false -ErrorMessage "Status after check-in was not ALREADY_CHECKED_IN"
            }
        } else {
            Report-Step -StepName "TASK 7.4: RESERVATION flow" -Success $false -ErrorMessage "Reservation check-in response mismatched"
        }
    } else {
        Report-Step -StepName "TASK 7.4: RESERVATION flow" -Success $false -ErrorMessage "Reservation check returned status $($resCheck.data.status) instead of VALID"
    }
} catch {
    Report-Step -StepName "TASK 7.4: RESERVATION flow" -Success $false -ErrorMessage $_.Exception.Message
}

# ======================================================================
# TASK 7.5 - Test booking expired chuyển vãng lai (CONVERSION flow)
# ======================================================================
try {
    # 1. Create a reservation dynamically (uses C004, slot 36)
    $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body (@{ reservationHourlyPrice = 0 } | ConvertTo-Json)

    $resPlateExp = "EXP-" + (Get-Random -Minimum 10000 -Maximum 99999)
    $resPostExp = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body (@{
        driverId = 1
        vehicleId = $null
        plateNumber = $resPlateExp
        vehicleTypeId = 5
        floorId = 2
        areaId = 4
        slotId = 36
        reservedDurationMinutes = 60
    } | ConvertTo-Json)

    $resCodeExp = $resPostExp.reservationCode
    $resIdExp = $resPostExp.id

    $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body (@{ reservationHourlyPrice = 10000 } | ConvertTo-Json)

    # 2. Trigger expiration using dev health helper
    $resExpire = Invoke-RestMethod -Uri "$baseUrl/health/expire-reservation?reservationCode=$resCodeExp" -Method Post -Headers $headers

    # 3. reservation entry-check -> expecting EXPIRED, canConvertToCasual = true
    $resCheckExp = Invoke-RestMethod -Uri "$baseUrl/reservations/$resCodeExp/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    if ($resCheckExp.success -eq $true -and $resCheckExp.data.status -eq "EXPIRED" -and $resCheckExp.data.canConvertToCasual -eq $true) {

        # 4. Staff gets casual suggestion since reservation is expired
        $resSugExp = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/location-suggestion?vehicleTypeId=5&entryGateId=1" -Method Get -Headers $staffHeaders
        $suggestedAreaIdExp = $resSugExp.data.suggestedAreaId
        $suggestedSlotIdExp = $resSugExp.data.suggestedSlotId
        $suggestionTokenExp = $resSugExp.data.suggestionToken

        # 5. Call Entry under CASUAL mode, passing convertedFromReservationId
        $bodyEntryExp = @{
            entryMode = "CASUAL"
            convertedFromReservationId = $resIdExp
            cardCode = "C004"
            licensePlate = $resPlateExp
            noPlate = $false
            vehicleTypeId = 5
            entryGateId = 1
            selectedAreaId = $suggestedAreaIdExp
            selectedSlotId = $suggestedSlotIdExp
            suggestionToken = $suggestionTokenExp
        } | ConvertTo-Json

        $resEntryExp = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntryExp

        if ($resEntryExp.success -eq $true -and $resEntryExp.data.customerType -eq "CASUAL" -and $resEntryExp.data.convertedFromReservationId -eq $resIdExp -and $resEntryExp.data.paymentStatus -eq "PENDING") {
            Report-Step -StepName "TASK 7.5: Expired Reservation to CASUAL conversion flow" -Success $true
        } else {
            Report-Step -StepName "TASK 7.5: Expired Reservation to CASUAL conversion flow" -Success $false -ErrorMessage "Conversion check-in response mismatched"
        }
    } else {
        Report-Step -StepName "TASK 7.5: Expired Reservation to CASUAL conversion flow" -Success $false -ErrorMessage "Expired reservation check returned status $($resCheckExp.data.status), canConvertToCasual: $($resCheckExp.data.canConvertToCasual)"
    }
} catch {
    Report-Step -StepName "TASK 7.5: Expired Reservation to CASUAL conversion flow" -Success $false -ErrorMessage $_.Exception.Message
}

Write-Host "====================================================" -ForegroundColor Green
Write-Host " TESTS COMPLETE"
Write-Host "====================================================" -ForegroundColor Green
