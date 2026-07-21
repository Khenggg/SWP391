# ======================================================================
#            E2E BOOKING FLOW INTEGRATION TESTS (7 SCENARIOS)
# ======================================================================
$baseUrl = "http://localhost:5000/api/core"

Write-Host "====================================================" -ForegroundColor Green
Write-Host " STARTING E2E BOOKING FLOW INTEGRATION TESTS"
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

# Helper to read error stream from WebException
function Get-ErrorDetails {
    param ($exception)
    if ($exception.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($exception.Response.GetResponseStream())
            $errText = $reader.ReadToEnd()
            $reader.Close()
            return $errText
        } catch {
            return $exception.Message
        }
    }
    return $exception.Message
}

# ======================================================================
# Prep: Login & Migrate DB
# ======================================================================
$adminHeaders = @{}
$driverHeaders = @{}
$staffHeaders = @{}
$driverId = 1 # From seed (driver_profiles.id = 1 is linked to user_id = 4)

try {
    # 1. Login admin01
    $adminBody = @{ username = "admin01"; password = "123456" } | ConvertTo-Json
    $adminRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $adminBody
    $adminHeaders = @{ Authorization = "Bearer $($adminRes.data.accessToken)" }

    # 2. Login driver01
    $driverBody = @{ username = "driver01"; password = "123456" } | ConvertTo-Json
    $driverRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $driverBody
    $driverHeaders = @{ Authorization = "Bearer $($driverRes.data.accessToken)" }

    # 3. Login staff01
    $staffBody = @{ username = "staff01"; password = "123456" } | ConvertTo-Json
    $staffRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $staffBody
    $staffHeaders = @{ Authorization = "Bearer $($staffRes.data.accessToken)" }

    Report-Step -StepName "Setup: Authenticated tokens acquired" -Success $true
} catch {
    Report-Step -StepName "Setup: Authenticated tokens acquired" -Success $false -ErrorMessage $_.Exception.Message
    exit 1
}

# Clear reservations first to avoid foreign key conflicts during seed migration
try {
    Invoke-RestMethod -Uri "$baseUrl/health/clear-reservations" -Method Post -Headers $adminHeaders > $null
} catch {}

# Migrate database to ensure schema and test seed are updated
try {
    Invoke-RestMethod -Uri "$baseUrl/health/migrate-db" -Method Post -Headers $adminHeaders > $null
} catch {
    Write-Host "Migration failed: $_"
}

# Seeded vehicles from 02_seed.sql
$ownedVehicleId = 3  # Seeded vehicle belonging to driver_profiles.id = 1 (driver01), plate: 29A-11111, type: 5
$otherVehicleId = 2  # Seeded vehicle belonging to driver_profiles.id = 2 (Other Driver), plate: 29A-88888, type: 5

# Reset pricing rule reservation price to 0 for instant confirmation during tests
$originalMotoPrice = 2000
$originalCarPrice = 10000
$motoRule = $null
$carRule = $null

try {
    $allRules = Invoke-RestMethod -Uri "$baseUrl/pricing-rules" -Method Get -Headers $adminHeaders
    $motoRule = $allRules.data | Where-Object { $_.vehicleTypeId -eq 3 -and $_.status -eq "ACTIVE" } | Select-Object -First 1
    $carRule = $allRules.data | Where-Object { $_.vehicleTypeId -eq 5 -and $_.status -eq "ACTIVE" } | Select-Object -First 1

    if ($motoRule) {
        $originalMotoPrice = $motoRule.reservationHourlyPrice
        $pricingRes3 = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/$($motoRule.id)" -Method Put -Headers $adminHeaders -ContentType "application/json" -Body (@{ reservationHourlyPrice = 0 } | ConvertTo-Json)
        Write-Host "Updated active rule $($motoRule.id) (vehicleType=3) price to: $($pricingRes3.data.reservationHourlyPrice)" -ForegroundColor Cyan
    }
    if ($carRule) {
        $originalCarPrice = $carRule.reservationHourlyPrice
        $pricingRes5 = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/$($carRule.id)" -Method Put -Headers $adminHeaders -ContentType "application/json" -Body (@{ reservationHourlyPrice = 0 } | ConvertTo-Json)
        Write-Host "Updated active rule $($carRule.id) (vehicleType=5) price to: $($pricingRes5.data.reservationHourlyPrice)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Failed to update active pricing rules: $_" -ForegroundColor Red
}

# ======================================================================
# TC-BOOK-01: Driver tạo booking xe máy không biển số
# ======================================================================
try {
    $body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 3 # Motorbike (RequiresSlot = false)
        floorId = 1
        areaId = 1
        slotId = $null
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    $reservationData = $res.data.reservation

    if ($reservationData.driverId -eq $driverId -and $reservationData.plateNumber -eq $null -and $reservationData.slotId -eq $null -and $reservationData.status -eq "CONFIRMED") {
        Report-Step -StepName "TC-BOOK-01: Driver tạo booking xe máy không biển số (success)" -Success $true
    } else {
        Report-Step -StepName "TC-BOOK-01: Driver tạo booking xe máy không biển số" -Success $false -ErrorMessage "Driver ID or Plate or Status mismatch. DriverId: $($reservationData.driverId), Status: $($reservationData.status). Full reservation: $($reservationData | ConvertTo-Json -Depth 20)"
    }
} catch {
    Report-Step -StepName "TC-BOOK-01: Driver tạo booking xe máy không biển số" -Success $false -ErrorMessage (Get-ErrorDetails $_.Exception)
}

# ======================================================================
# TC-BOOK-02: Driver tạo booking ô tô không biển số
# ======================================================================
$carResCode = $null
$carResId = $null
try {
    $body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5 # Car (RequiresSlot = true)
        floorId = 1
        areaId = 2
        slotId = 13 # Slot 13 is AVAILABLE
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    $reservationData = $res.data.reservation
    $carResCode = $reservationData.reservationCode
    $carResId = $reservationData.id

    if ($reservationData.driverId -eq $driverId -and $reservationData.plateNumber -eq $null -and $reservationData.slotId -eq 13 -and $reservationData.status -eq "CONFIRMED") {
        $slotState = Invoke-RestMethod -Uri "$baseUrl/slots" -Method Get -Headers $adminHeaders
        # Find slot 13
        $slot13 = $slotState.data | Where-Object { $_.id -eq 13 }
        if ($slot13.status -eq "RESERVED") {
            Report-Step -StepName "TC-BOOK-02: Driver tạo booking ô tô không biển số (success, slot RESERVED)" -Success $true
        } else {
            Report-Step -StepName "TC-BOOK-02: Driver tạo booking ô tô không biển số" -Success $false -ErrorMessage "Slot status not RESERVED: $($slot13.status)"
        }
    } else {
        Report-Step -StepName "TC-BOOK-02: Driver tạo booking ô tô không biển số" -Success $false -ErrorMessage "Response mismatch. Full reservation: $($reservationData | ConvertTo-Json -Depth 20)"
    }
} catch {
    Report-Step -StepName "TC-BOOK-02: Driver tạo booking ô tô không biển số" -Success $false -ErrorMessage (Get-ErrorDetails $_.Exception)
}

# ======================================================================
# TC-BOOK-03: Driver tạo booking với vehicleId thuộc mình
# ======================================================================
try {
    $body = @{
        vehicleId = $ownedVehicleId
        plateNumber = $null
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 14 # Slot 14
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    $reservationData = $res.data.reservation

    if ($reservationData.vehicleId -eq $ownedVehicleId -and $reservationData.plateNumber -eq "29A-11111") {
        Report-Step -StepName "TC-BOOK-03: Driver tạo booking với vehicleId thuộc mình (success, auto-resolve plate)" -Success $true
    } else {
        Report-Step -StepName "TC-BOOK-03: Driver tạo booking với vehicleId thuộc mình" -Success $false -ErrorMessage "VehicleId or Plate mismatch. VehicleId: $($reservationData.vehicleId), Plate: $($reservationData.plateNumber)"
    }
} catch {
    Report-Step -StepName "TC-BOOK-03: Driver tạo booking với vehicleId thuộc mình" -Success $false -ErrorMessage (Get-ErrorDetails $_.Exception)
}

# ======================================================================
# TC-BOOK-04: Driver tạo booking với vehicleId của người khác
# ======================================================================
try {
    $body = @{
        vehicleId = $otherVehicleId
        plateNumber = $null
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 15
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    Report-Step -StepName "TC-BOOK-04: Driver tạo booking với vehicleId của người khác -> Expect Failure" -Success $false -ErrorMessage "Succeeded instead of failing"
} catch {
    $errText = Get-ErrorDetails $_.Exception
    if ($errText -like "*VEHICLE_NOT_BELONG_TO_DRIVER*") {
        Report-Step -StepName "TC-BOOK-04: Driver tạo booking với vehicleId của người khác (VEHICLE_NOT_BELONG_TO_DRIVER)" -Success $true
    } else {
        Report-Step -StepName "TC-BOOK-04: Driver tạo booking với vehicleId của người khác" -Success $false -ErrorMessage $errText
    }
}

# ======================================================================
# TC-BOOK-05: Booking không biển số entry bằng biển số thật
# ======================================================================
try {
    # Check entry-check for the no-plate car reservation created in TC-BOOK-02
    $check = Invoke-RestMethod -Uri "$baseUrl/reservations/$carResCode/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    if ($check.success -eq $true -and $check.data.plateNumber -eq $null -and $check.data.plateRequiredAtEntry -eq $true) {

        # entry under RESERVATION mode (C010) with real plate
        $bodyEntry = @{
            entryMode = "RESERVATION"
            reservationId = $carResId
            reservationEntryToken = $check.data.reservationEntryToken
            cardCode = "C010"
            licensePlate = "30A-12345"
            noPlate = $false
            vehicleTypeId = 5
            entryGateId = 1
            selectedAreaId = $check.data.reservedAreaId
            selectedSlotId = $check.data.reservedSlotId
        } | ConvertTo-Json

        $resEntry = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry

        # Check DB reservation plate updated
        $updatedRes = Invoke-RestMethod -Uri "$baseUrl/reservations/$carResCode/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

        if ($resEntry.success -eq $true -and $updatedRes.data.plateNumber -eq "30A-12345") {
            Report-Step -StepName "TC-BOOK-05: Booking không biển số entry bằng biển số thật (success, plate captured)" -Success $true
        } else {
            Report-Step -StepName "TC-BOOK-05: Booking không biển số entry bằng biển số thật" -Success $false -ErrorMessage "Check-in failed or plate was not captured. Plate: $($updatedRes.data.plateNumber)"
        }
    } else {
        Report-Step -StepName "TC-BOOK-05: Booking không biển số entry bằng biển số thật" -Success $false -ErrorMessage "Entry check was invalid or PlateRequiredAtEntry was false"
    }
} catch {
    Report-Step -StepName "TC-BOOK-05: Booking không biển số entry bằng biển số thật" -Success $false -ErrorMessage (Get-ErrorDetails $_.Exception)
}

# ======================================================================
# TC-BOOK-06: Booking ô tô không biển số entry noPlate = true -> Expect Failure
# ======================================================================
try {
    # 1. Create another car reservation without plate
    $body = @{
        vehicleId = $null
        plateNumber = $null
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 16
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $resCar2 = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    $code2 = $resCar2.data.reservation.reservationCode
    $id2 = $resCar2.data.reservation.id

    # 2. Get entry check
    $check2 = Invoke-RestMethod -Uri "$baseUrl/reservations/$code2/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    # 3. Call Entry with noPlate = true
    $bodyEntry = @{
        entryMode = "RESERVATION"
        reservationId = $id2
        reservationEntryToken = $check2.data.reservationEntryToken
        cardCode = "C011"
        licensePlate = $null
        noPlate = $true
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $check2.data.reservedAreaId
        selectedSlotId = $check2.data.reservedSlotId
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry
    Report-Step -StepName "TC-BOOK-06: Booking ô tô không biển số entry noPlate = true -> Expect Failure" -Success $false -ErrorMessage "Succeeded instead of failing"
} catch {
    $errText = Get-ErrorDetails $_.Exception
    if ($errText -like "*PLATE_REQUIRED_FOR_SLOT_VEHICLE*") {
        Report-Step -StepName "TC-BOOK-06: Booking ô tô không biển số entry noPlate = true (PLATE_REQUIRED_FOR_SLOT_VEHICLE)" -Success $true
    } else {
        Report-Step -StepName "TC-BOOK-06: Booking ô tô không biển số entry noPlate = true" -Success $false -ErrorMessage $errText
    }
}

# ======================================================================
# TC-BOOK-07: Booking đã có biển số, entry sai biển số -> Expect Failure
# ======================================================================
try {
    # 1. Create a car reservation with pre-registered plate
    $body = @{
        vehicleId = $null
        plateNumber = "29A-77777"
        vehicleTypeId = 5
        floorId = 1
        areaId = 2
        slotId = 17
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $resCar3 = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    $code3 = $resCar3.data.reservation.reservationCode
    $id3 = $resCar3.data.reservation.id

    # 2. Get entry check
    $check3 = Invoke-RestMethod -Uri "$baseUrl/reservations/$code3/entry-check?entryGateId=1" -Method Get -Headers $staffHeaders

    # 3. Call Entry with mismatched plate (e.g. 29A-22222)
    $bodyEntry = @{
        entryMode = "RESERVATION"
        reservationId = $id3
        reservationEntryToken = $check3.data.reservationEntryToken
        cardCode = "C012"
        licensePlate = "29A-22222"
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
        selectedAreaId = $check3.data.reservedAreaId
        selectedSlotId = $check3.data.reservedSlotId
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/parking-sessions/entry" -Method Post -Headers $staffHeaders -ContentType "application/json" -Body $bodyEntry
    Report-Step -StepName "TC-BOOK-07: Booking đã có biển số, entry sai biển số -> Expect Failure" -Success $false -ErrorMessage "Succeeded instead of failing"
} catch {
    $errText = Get-ErrorDetails $_.Exception
    if ($errText -like "*RESERVATION_PLATE_MISMATCH*") {
        Report-Step -StepName "TC-BOOK-07: Booking đã có biển số, entry sai biển số (RESERVATION_PLATE_MISMATCH)" -Success $true
    } else {
        Report-Step -StepName "TC-BOOK-07: Booking đã có biển số, entry sai biển số" -Success $false -ErrorMessage $errText
    }
}

# Restore pricing rules reservation price to standard values
try {
    if ($motoRule) {
        $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/$($motoRule.id)" -Method Put -Headers $adminHeaders -ContentType "application/json" -Body (@{ reservationHourlyPrice = $originalMotoPrice } | ConvertTo-Json)
        Write-Host "Restored active rule $($motoRule.id) (vehicleType=3) price to: $originalMotoPrice" -ForegroundColor Cyan
    }
    if ($carRule) {
        $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/$($carRule.id)" -Method Put -Headers $adminHeaders -ContentType "application/json" -Body (@{ reservationHourlyPrice = $originalCarPrice } | ConvertTo-Json)
        Write-Host "Restored active rule $($carRule.id) (vehicleType=5) price to: $originalCarPrice" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Failed to restore active pricing rules: $_" -ForegroundColor Red
}

Write-Host "====================================================" -ForegroundColor Green
Write-Host " TESTS COMPLETE"
Write-Host "====================================================" -ForegroundColor Green
