param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping write tests." -ForegroundColor Yellow
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

# Login to get authentication headers
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running CRUD tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "[Crud] Logging in as admin01..."
$loginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$loginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
$token = $loginResult.data.accessToken
$headers = @{
    Authorization = "Bearer $token"
}

# Check localhost safety for reset
$isLocalhost = ($BaseUrl -like "*localhost*" -or $BaseUrl -like "*127.0.0.1*")

if ($AllowReset) {
    if (-not $isLocalhost) {
        throw "Destructive test reset option (-AllowReset) is only allowed on localhost!"
    }
    Write-Host "[Crud] Resetting database reservations/sessions..." -ForegroundColor Cyan
    $resetRes = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $headers
    Write-Host "  Reset Response: $($resetRes.message)" -ForegroundColor Green
}

# Generate unique codes for safe re-runs
$rand = Get-Random -Minimum 1000 -Maximum 9999
$floorCode = "F$rand"
$floorName = "Test Floor $rand"
$areaCode = "A$rand"
$areaName = "Test Area $rand"
$slotCode = "S$rand"

try {
    # 1. Create Floor
    Write-Host "[Crud] Creating new Floor ($floorCode)..."
    $floorBody = @{
        floorCode = $floorCode
        floorName = $floorName
    } | ConvertTo-Json
    $newFloor = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/floors" -Body $floorBody -Headers $headers
    $floorId = $newFloor.data.id
    Write-Host "  Floor created successfully with ID: $floorId" -ForegroundColor Green

    # 2. Update Floor
    Write-Host "[Crud] Updating Floor ($floorId)..."
    $updateFloorBody = @{
        floorName = "$floorName (Updated)"
        status = "ACTIVE"
    } | ConvertTo-Json
    $updatedFloor = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/floors/$floorId" -Body $updateFloorBody -Headers $headers
    Write-Host "  Floor updated: $($updatedFloor.data.floorName)" -ForegroundColor Green

    # 3. Create Area
    Write-Host "[Crud] Creating new Area ($areaCode) on Floor $floorId..."
    $areaBody = @{
        floorId = $floorId
        areaCode = $areaCode
        areaName = $areaName
        priorityOrder = 10
        totalCapacity = 5
        vehicleTypeIds = @(5) # Allow Car (Vehicle Type 5)
    } | ConvertTo-Json
    $newArea = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/areas" -Body $areaBody -Headers $headers
    $areaId = $newArea.data.id
    Write-Host "  Area created successfully with ID: $areaId" -ForegroundColor Green

    # 4. Update Area
    Write-Host "[Crud] Updating Area ($areaId)..."
    $updateAreaBody = @{
        areaName = "$areaName (Updated)"
        priorityOrder = 15
        totalCapacity = 10
        status = "ACTIVE"
        vehicleTypeIds = @(5, 6) # Allow Car and Electric Car
    } | ConvertTo-Json
    $updatedArea = Invoke-ApiRequest -Method Put -Uri "$BaseUrl/api/core/areas/$areaId" -Body $updateAreaBody -Headers $headers
    Write-Host "  Area updated: $($updatedArea.data.areaName)" -ForegroundColor Green

    # 5. Create Slot
    Write-Host "[Crud] Creating new Slot ($slotCode) on Area $areaId..."
    $slotBody = @{
        areaId = $areaId
        slotCode = $slotCode
        allowedVehicleTypeId = 5
    } | ConvertTo-Json
    $newSlot = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/slots" -Body $slotBody -Headers $headers
    $slotId = $newSlot.data.id
    Write-Host "  Slot created successfully with ID: $slotId" -ForegroundColor Green

    # 6. Patch Slot Status (RESERVED)
    Write-Host "[Crud] Updating Slot status to RESERVED..."
    $patchBody = @{
        status = "RESERVED"
    } | ConvertTo-Json
    $patchedSlot = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/slots/$slotId/status" -Body $patchBody -Headers $headers
    if ($patchedSlot.data.status -eq "RESERVED") {
        Write-Host "  Slot status patched to RESERVED successfully" -ForegroundColor Green
    } else {
        throw "Failed to patch slot status to RESERVED. Status is $($patchedSlot.data.status)"
    }

    # 7. Get Slots list and verify ours exists
    Write-Host "[Crud] Verifying slot exists in global slot list..."
    $allSlots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $headers
    $foundSlot = @($allSlots.data) | Where-Object { $_.id -eq $slotId }
    if ($foundSlot) {
        Write-Host "  Verified: Created slot found in GET /api/core/slots list!" -ForegroundColor Green
    } else {
        throw "Created slot with ID $slotId not found in slot list!"
    }

    Write-Host "`n[SUCCESS] CRUD tests completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error occurred during CRUD test: $_" -ForegroundColor Red
    throw $_
}
