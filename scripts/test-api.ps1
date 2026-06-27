# .NET Core API Automation Testing Script
# Usage: .\scripts\test-api.ps1 [-BaseUrl "http://localhost:5000"]

param (
    [string]$BaseUrl = "http://localhost:5000"
)

function Invoke-RestMethod {
    param (
        [string]$Uri,
        [string]$Method = "Get",
        $Headers = $null,
        $Body = $null,
        [string]$ContentType = "application/json"
    )
    $params = @{
        Uri = $Uri
        Method = $Method
    }
    if ($Headers) { $params.Headers = $Headers }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
    }
    try {
        return Microsoft.PowerShell.Utility\Invoke-RestMethod @params
    } catch {
        $ex = $_.Exception
        if ($ex.Response) {
            $reader = [System.IO.StreamReader]::new($ex.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            try {
                $errObj = $responseBody | ConvertFrom-Json
                if ($errObj.message) {
                    $msg = $errObj.message
                    if ($errObj.errors) {
                        $msg += " | " + ($errObj.errors -join ", ")
                    }
                    throw [System.Exception]::new($msg)
                }
            } catch {}
            throw [System.Exception]::new("$($ex.Message) - Response: $responseBody")
        }
        throw $ex
    }
}

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " STARTING .NET CORE API COMPREHENSIVE AUTOMATION TESTS" -ForegroundColor Cyan
Write-Host " Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$globalTestsPassed = 0
$globalTestsFailed = 0

function Report-Result {
    param (
        [string]$TestName,
        [bool]$Success,
        [string]$ErrorMessage = ""
    )
    if ($Success) {
        Write-Host "[ PASS ] " -NoNewline -ForegroundColor Green
        Write-Host $TestName
        $script:globalTestsPassed++
    } else {
        Write-Host "[ FAIL ] " -NoNewline -ForegroundColor Red
        Write-Host "$TestName" -NoNewline
        if ($ErrorMessage) {
            Write-Host " (Error: $ErrorMessage)" -ForegroundColor Red
        } else {
            Write-Host ""
        }
        $script:globalTestsFailed++
    }
}

# Generate unique codes to prevent duplicate constraint errors
$rand = Get-Random -Minimum 10000 -Maximum 99999
$floorCode = "F$rand"
$floorName = "Test Floor $rand"
$areaCode = "A$rand"
$areaName = "Test Area $rand"
$slotCode = "S$rand"
$plateNumber = "TEST-$rand"
$confirmedPlateNumber = "CONF-$rand"

$token = ""
$headers = @{
    "Content-Type" = "application/json"
}

# ----------------- TEST 1: Health Check -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health" -Method Get
    if ($res.success -eq $true -and $res.data.status -eq "UP") {
        Report-Result -TestName "GET /api/core/health (API status UP)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/health" -Success $false -ErrorMessage "API status not UP"
    }
} catch {
    Report-Result -TestName "GET /api/core/health" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 2: Login -----------------
try {
    $body = @{
        username = "admin01"
        password = "123456"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.accessToken) {
        $token = $res.data.accessToken
        $headers.Add("Authorization", "Bearer $token")
        Report-Result -TestName "POST /api/core/auth/login (Retrieve JWT Token)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/auth/login" -Success $false -ErrorMessage "Token missing in response"
    }
} catch {
    Report-Result -TestName "POST /api/core/auth/login" -Success $false -ErrorMessage $_.Exception.Message
}

# Skip authenticated tests if login failed
if (-not $token) {
    Write-Host "CRITICAL: Login failed. Skipping authenticated tests." -ForegroundColor Yellow
    Write-Host "===================================================="
    Write-Host "PASSED: $globalTestsPassed, FAILED: $globalTestsFailed" -ForegroundColor Red
    Exit 1
}

# ----------------- TEST 3: Get Me Profile -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/me" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.username -eq "admin01") {
        Report-Result -TestName "GET /api/core/auth/me (User Profile verification)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/auth/me" -Success $false -ErrorMessage "Profile mismatch"
    }
} catch {
    Report-Result -TestName "GET /api/core/auth/me" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 4: Get Floors List -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors" -Method Get -Headers $headers
    if ($res.value -and $res.value.Count -gt 0) {
        Report-Result -TestName "GET /api/core/floors (List count > 0)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/floors" -Success $false -ErrorMessage "Empty floors list"
    }
} catch {
    Report-Result -TestName "GET /api/core/floors" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 5: Create Floor -----------------
$floorId = $null
try {
    $body = @{
        floorCode = $floorCode
        floorName = $floorName
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.id) {
        $floorId = $res.id
        Report-Result -TestName "POST /api/core/floors (Create Floor $floorCode)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/floors" -Success $false -ErrorMessage "Floor ID not returned"
    }
} catch {
    Report-Result -TestName "POST /api/core/floors" -Success $false -ErrorMessage $_.Exception.Message
}

# ----------------- TEST 6: Update Floor -----------------
if ($floorId) {
    try {
        $body = @{
            floorName = "$floorName (Updated)"
            status = "ACTIVE"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/floors/$floorId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.floorName -like "*(Updated)*") {
            Report-Result -TestName "PUT /api/core/floors/{id} (Update Floor Name)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/floors/{id}" -Success $false -ErrorMessage "Floor name not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/floors/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/floors/{id}" -Success $false -ErrorMessage "Skipped (no floorId)"
}

# ----------------- TEST 7: Create Area -----------------
$areaId = $null
if ($floorId) {
    try {
        $body = @{
            floorId = $floorId
            areaCode = $areaCode
            areaName = $areaName
            totalCapacity = 10
            vehicleTypeIds = @(5) # Support Cars
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/areas" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.id) {
            $areaId = $res.id
            Report-Result -TestName "POST /api/core/areas (Create Area $areaCode)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/areas" -Success $false -ErrorMessage "Area ID not returned"
        }
    } catch {
        Report-Result -TestName "POST /api/core/areas" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/areas" -Success $false -ErrorMessage "Skipped (no floorId)"
}

# ----------------- TEST 8: Update Area -----------------
if ($areaId) {
    try {
        $body = @{
            areaName = "$areaName (Updated)"
            priorityOrder = 25
            totalCapacity = 20
            status = "ACTIVE"
            vehicleTypeIds = @(5)
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/areas/$areaId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.areaName -like "*(Updated)*") {
            Report-Result -TestName "PUT /api/core/areas/{id} (Update Area Name)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/areas/{id}" -Success $false -ErrorMessage "Area name not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/areas/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/areas/{id}" -Success $false -ErrorMessage "Skipped (no areaId)"
}

# ----------------- TEST 9: Create Slot -----------------
$slotId = $null
if ($areaId) {
    try {
        $body = @{
            areaId = $areaId
            slotCode = $slotCode
            allowedVehicleTypeId = 5
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/slots" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.id) {
            $slotId = $res.id
            Report-Result -TestName "POST /api/core/slots (Create Slot $slotCode)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/slots" -Success $false -ErrorMessage "Slot ID not returned"
        }
    } catch {
        Report-Result -TestName "POST /api/core/slots" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/slots" -Success $false -ErrorMessage "Skipped (no areaId)"
}

# ----------------- TEST 10: Patch Slot Status -----------------
if ($slotId) {
    try {
        $body = @{
            status = "AVAILABLE"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/slots/$slotId/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.status -eq "AVAILABLE") {
            Report-Result -TestName "PATCH /api/core/slots/{id}/status (Set slot to AVAILABLE)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/slots/{id}/status" -Success $false -ErrorMessage "Status is not AVAILABLE"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/slots/{id}/status" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/slots/{id}/status" -Success $false -ErrorMessage "Skipped (no slotId)"
}

# ----------------- TEST 11: Query Available Locations -----------------
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=5" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.availableSlots) {
        Report-Result -TestName "GET /api/core/reservations/available-locations (RequiresSlot = true)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/reservations/available-locations" -Success $false -ErrorMessage "Response structure incorrect"
    }
} catch {
    Report-Result -TestName "GET /api/core/reservations/available-locations" -Success $false -ErrorMessage $_.Exception.Message
}


# ======================================================================
#                     USERS MANAGEMENT CRUD (TEST 12 - 18)
# ======================================================================
$testUserId = $null
$testUsername = "testuser$rand"

# 12. List Users
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/users (List users)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/users" -Success $false -ErrorMessage "Empty user data"
    }
} catch {
    Report-Result -TestName "GET /api/core/users" -Success $false -ErrorMessage $_.Exception.Message
}

# 12a. List Users with Filters (search, role, status)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.Count -gt 0) {
        Report-Result -TestName "GET /api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Success $false -ErrorMessage "Failed to search/filter users"
    }
} catch {
    Report-Result -TestName "GET /api/core/users?role=ADMIN&status=ACTIVE&search=admin" -Success $false -ErrorMessage $_.Exception.Message
}


# 13. Create User
try {
    $body = @{
        username = $testUsername
        password = "Password123"
        fullName = "Test Integration User"
        email = "$testUsername@example.com"
        phone = ("09" + (Get-Random -Minimum 10000000 -Maximum 99999999))
        role = "STAFF"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testUserId = $res.data.id
        Report-Result -TestName "POST /api/core/users (Create User $testUsername)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/users" -Success $false -ErrorMessage "Failed to create user"
    }
} catch {
    Report-Result -TestName "POST /api/core/users" -Success $false -ErrorMessage $_.Exception.Message
}

# 14. Get User By ID
if ($testUserId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.username -eq $testUsername) {
            Report-Result -TestName "GET /api/core/users/{id} (Verify created user details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/users/{id}" -Success $false -ErrorMessage "User details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/users/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/users/{id}" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 15. Update User
if ($testUserId) {
    try {
        $body = @{
            fullName = "Test User Updated"
            email = "updated-$testUsername@example.com"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.fullName -eq "Test User Updated") {
            Report-Result -TestName "PUT /api/core/users/{id} (Update User Info)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/users/{id}" -Success $false -ErrorMessage "User name not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/users/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/users/{id}" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 16. Patch User Status
if ($testUserId) {
    try {
        $body = @{
            status = "LOCKED"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.status -eq "LOCKED") {
            Report-Result -TestName "PATCH /api/core/users/{id}/status (Set user status to LOCKED)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/users/{id}/status" -Success $false -ErrorMessage "User status not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/users/{id}/status" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/users/{id}/status" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 17. Patch User Role
if ($testUserId) {
    try {
        $body = @{
            role = "MANAGER"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId/role" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.role -eq "MANAGER") {
            Report-Result -TestName "PATCH /api/core/users/{id}/role (Change user role to MANAGER)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/users/{id}/role" -Success $false -ErrorMessage "User role not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/users/{id}/role" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/users/{id}/role" -Success $false -ErrorMessage "Skipped (no testUserId)"
}

# 18. Delete User
if ($testUserId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/users/$testUserId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/users/{id} (Remove test user)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/users/{id}" -Success $false -ErrorMessage "User not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/users/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/users/{id}" -Success $false -ErrorMessage "Skipped (no testUserId)"
}


# ======================================================================
#                     PARKING CARDS CRUD (TEST 19 - 25)
# ======================================================================
$testCardId = $null
$testCardNum = "TC$rand"

# 19. List Cards
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/cards (List cards)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards" -Success $false -ErrorMessage "Empty card data"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards" -Success $false -ErrorMessage $_.Exception.Message
}

# 19a. List Cards with Filters (search)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards?search=C010" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.Count -gt 0) {
        Report-Result -TestName "GET /api/core/cards?search=C010" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards?search=C010" -Success $false -ErrorMessage "Failed to search/filter cards"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards?search=C010" -Success $false -ErrorMessage $_.Exception.Message
}


# 20. List Available Cards
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/available" -Method Get -Headers $headers
    if ($res.success -eq $true) {
        Report-Result -TestName "GET /api/core/cards/available (List available cards)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/cards/available" -Success $false -ErrorMessage "Available cards request failed"
    }
} catch {
    Report-Result -TestName "GET /api/core/cards/available" -Success $false -ErrorMessage $_.Exception.Message
}

# 21. Create Card
try {
    $body = @{
        cardNumber = $testCardNum
        note = "Card for integration testing"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testCardId = $res.data.id
        Report-Result -TestName "POST /api/core/cards (Create Card $testCardNum)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/cards" -Success $false -ErrorMessage "Failed to create card"
    }
} catch {
    Report-Result -TestName "POST /api/core/cards" -Success $false -ErrorMessage $_.Exception.Message
}

# 22. Get Card Details
if ($testCardId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.cardNumber -eq $testCardNum) {
            Report-Result -TestName "GET /api/core/cards/{id} (Verify created card details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/cards/{id}" -Success $false -ErrorMessage "Card details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/cards/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/cards/{id}" -Success $false -ErrorMessage "Skipped (no testCardId)"
}

# 23. Update Card Note
if ($testCardId) {
    try {
        $body = @{
            note = "Updated note"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.note -eq "Updated note") {
            Report-Result -TestName "PUT /api/core/cards/{id} (Update Card Note)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/cards/{id}" -Success $false -ErrorMessage "Card note not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/cards/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/cards/{id}" -Success $false -ErrorMessage "Skipped (no testCardId)"
}

# 24. Patch Card Status
if ($testCardId) {
    try {
        $body = '"INACTIVE"'
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId/status" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.status -eq "INACTIVE") {
            Report-Result -TestName "PATCH /api/core/cards/{id}/status (Set card status to INACTIVE)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/cards/{id}/status" -Success $false -ErrorMessage "Card status not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/cards/{id}/status" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/cards/{id}/status" -Success $false -ErrorMessage "Skipped (no testCardId)"
}

# 25. Delete Card
if ($testCardId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards/$testCardId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/cards/{id} (Remove test card)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/cards/{id}" -Success $false -ErrorMessage "Card not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/cards/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/cards/{id}" -Success $false -ErrorMessage "Skipped (no testCardId)"
}


# ======================================================================
#                     VEHICLE TYPES CRUD (TEST 26 - 31)
# ======================================================================
$testVehicleTypeId = $null
$testVehicleTypeName = "TestVT$rand"

# 26. List Vehicle Types
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/vehicle-types (List vehicle types)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/vehicle-types" -Success $false -ErrorMessage "Empty vehicle type list"
    }
} catch {
    Report-Result -TestName "GET /api/core/vehicle-types" -Success $false -ErrorMessage $_.Exception.Message
}

# 27. Create Vehicle Type
try {
    $body = @{
        name = $testVehicleTypeName
        description = "Type for automated integration tests"
        isActive = $true
        requiresSlot = $true
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testVehicleTypeId = $res.data.id
        Report-Result -TestName "POST /api/core/vehicle-types (Create Vehicle Type $testVehicleTypeName)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/vehicle-types" -Success $false -ErrorMessage "Failed to create vehicle type"
    }
} catch {
    Report-Result -TestName "POST /api/core/vehicle-types" -Success $false -ErrorMessage $_.Exception.Message
}

# 28. Get Vehicle Type Details
if ($testVehicleTypeId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.name -eq $testVehicleTypeName) {
            Report-Result -TestName "GET /api/core/vehicle-types/{id} (Verify created vehicle type details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Vehicle type details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/vehicle-types/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}

# 29. Update Vehicle Type
if ($testVehicleTypeId) {
    try {
        $body = @{
            name = "$testVehicleTypeName (Updated)"
            description = "Updated description"
            isActive = $true
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.name -eq "$testVehicleTypeName (Updated)") {
            Report-Result -TestName "PUT /api/core/vehicle-types/{id} (Update Vehicle Type Info)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Vehicle type info not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/vehicle-types/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}

# 30. Patch Active Status
if ($testVehicleTypeId) {
    try {
        $body = "false"
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId/active" -Method Patch -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.isActive -eq $false) {
            Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active (Set vehicle type to inactive)" -Success $true
        } else {
            Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active" -Success $false -ErrorMessage "Active status not changed"
        }
    } catch {
        Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PATCH /api/core/vehicle-types/{id}/active" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}

# ======================================================================
#                     PRICING RULES CRUD (TEST 32 - 36)
# ======================================================================
$testPricingRuleId = $null

# 32. List Pricing Rules
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data) {
        Report-Result -TestName "GET /api/core/pricing-rules (List pricing rules)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/pricing-rules" -Success $false -ErrorMessage "Empty pricing rule list"
    }
} catch {
    Report-Result -TestName "GET /api/core/pricing-rules" -Success $false -ErrorMessage $_.Exception.Message
}

# 33. Create Pricing Rule (for newly created vehicle type)
try {
    if (-not $testVehicleTypeId) {
        throw "Skipping pricing rule creation - test vehicle type ID is missing."
    }
    $body = @{
        vehicleTypeId = $testVehicleTypeId
        dayPrice = 1500
        nightPrice = 2500
        monthlyPrice = 45000
        reservationHourlyPrice = 800
        lostCardFee = 25000
        effectiveFrom = (Get-Date).ToString("o")
        status = "ACTIVE"
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.id) {
        $testPricingRuleId = $res.data.id
        Report-Result -TestName "POST /api/core/pricing-rules (Create Pricing Rule)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/pricing-rules" -Success $false -ErrorMessage "Failed to create pricing rule"
    }
} catch {
    Report-Result -TestName "POST /api/core/pricing-rules" -Success $false -ErrorMessage $_.Exception.Message
}

# 34. Get Pricing Rule Details
if ($testPricingRuleId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/$testPricingRuleId" -Method Get -Headers $headers
        if ($res.success -eq $true -and $res.data.dayPrice -eq 1500) {
            Report-Result -TestName "GET /api/core/pricing-rules/{id} (Verify created pricing rule details)" -Success $true
        } else {
            Report-Result -TestName "GET /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Pricing rule details mismatch"
        }
    } catch {
        Report-Result -TestName "GET /api/core/pricing-rules/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "GET /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Skipped (no testPricingRuleId)"
}

# 35. Update Pricing Rule
if ($testPricingRuleId) {
    try {
        $body = @{
            dayPrice = 1800
            nightPrice = 2800
            status = "ACTIVE"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/$testPricingRuleId" -Method Put -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.dayPrice -eq 1800) {
            Report-Result -TestName "PUT /api/core/pricing-rules/{id} (Update Pricing Rule details)" -Success $true
        } else {
            Report-Result -TestName "PUT /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Pricing rule not updated"
        }
    } catch {
        Report-Result -TestName "PUT /api/core/pricing-rules/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "PUT /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Skipped (no testPricingRuleId)"
}

# 36. Delete Pricing Rule
if ($testPricingRuleId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/$testPricingRuleId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/pricing-rules/{id} (Remove test pricing rule)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Pricing rule not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/pricing-rules/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/pricing-rules/{id}" -Success $false -ErrorMessage "Skipped (no testPricingRuleId)"
}

# 36a. Delete Vehicle Type
if ($testVehicleTypeId) {
    try {
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/vehicle-types/$testVehicleTypeId" -Method Delete -Headers $headers
        if ($res.success -eq $true) {
            Report-Result -TestName "DELETE /api/core/vehicle-types/{id} (Remove test vehicle type)" -Success $true
        } else {
            Report-Result -TestName "DELETE /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Vehicle type not deleted"
        }
    } catch {
        Report-Result -TestName "DELETE /api/core/vehicle-types/{id}" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "DELETE /api/core/vehicle-types/{id}" -Success $false -ErrorMessage "Skipped (no testVehicleTypeId)"
}



# ======================================================================
#                     DATABASE MAPPING VALIDATION (TEST 37)
# ======================================================================
# 37. Db Check
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/db-check" -Method Get -Headers $headers
    if ($res.success -eq $true -and $res.data.efCoreVerification.success -eq $true) {
        Report-Result -TestName "GET /api/core/db-check (Verify DB mapping & tables)" -Success $true
    } else {
        Report-Result -TestName "GET /api/core/db-check" -Success $false -ErrorMessage "Database mapping check failed"
    }
} catch {
    Report-Result -TestName "GET /api/core/db-check" -Success $false -ErrorMessage $_.Exception.Message
}


# ======================================================================
#         TRANSACTIONAL RESERVATION & SESSION CHECK-IN (TEST 38 - 46)
# ======================================================================

# 38. Clear Reservations & Reset States
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/clear-reservations" -Method Post -Headers $headers
    if ($res.message -like "*cleared*") {
        Report-Result -TestName "POST /api/core/health/clear-reservations (Reset transactional data)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/health/clear-reservations" -Success $false -ErrorMessage "Reset failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/health/clear-reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 38a. Dump Reservations list
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/health/dump-reservations" -Method Get -Headers $headers
    Report-Result -TestName "GET /api/core/health/dump-reservations (Retrieve reservations dump)" -Success $true
} catch {
    Report-Result -TestName "GET /api/core/health/dump-reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 39. Temporarily Update Pricing Rule ID 5 (Car) Hourly Price to 0 to bypass payment (Immediate CONFIRMED)
try {
    $body = @{
        reservationHourlyPrice = 0
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.reservationHourlyPrice -eq 0) {
        Report-Result -TestName "PUT /api/core/pricing-rules/5 (Set Hourly Price to 0 for instant confirmation)" -Success $true
    } else {
        Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage "Failed to update pricing rule to 0"
    }
} catch {
    Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage $_.Exception.Message
}

# 40. Create CONFIRMED Reservation
$confirmedReservationId = $null
try {
    $body = @{
        driverId = 1
        vehicleId = $null
        plateNumber = $confirmedPlateNumber
        vehicleTypeId = 5
        floorId = 2
        areaId = 3
        slotId = 11
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.id -and $res.status -eq "CONFIRMED") {
        $confirmedReservationId = $res.id
        Report-Result -TestName "POST /api/core/reservations (Create CONFIRMED Booking $confirmedPlateNumber)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage "Booking did not auto-confirm (status: $($res.status))"
    }
} catch {
    Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 41. Create Check-in (Parking Session Entry) using the card C010 and matching license plate
try {
    $body = @{
        cardCode = "C010"
        licensePlate = $confirmedPlateNumber
        noPlate = $false
        vehicleTypeId = 5
        entryGateId = 1
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/entry" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true) {
        Report-Result -TestName "POST /api/core/parking-sessions/entry (Simulate Vehicle Check-in with reservation)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/entry" -Success $false -ErrorMessage "Check-in failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/parking-sessions/entry" -Success $false -ErrorMessage $_.Exception.Message
}

# 42. Claim Session (associated with the C010 card QR Token)
try {
    # 1. Login as driver01 to obtain a driver token (since only drivers have driver profiles)
    $driverLoginBody = @{
        username = "driver01"
        password = "123456"
    } | ConvertTo-Json
    $driverRes = Invoke-RestMethod -Uri "$BaseUrl/api/core/auth/login" -Method Post -ContentType "application/json" -Body $driverLoginBody
    $driverToken = $driverRes.data.accessToken
    $driverHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $driverToken"
    }

    # 2. Get the actual qrToken of C010 dynamically from the API
    $resCards = Invoke-RestMethod -Uri "$BaseUrl/api/core/cards?search=C010" -Method Get -Headers $headers
    $qrToken = $resCards.data[0].qrToken

    # 3. Perform the claim call using the driver's credentials
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/parking-sessions/$qrToken/claim" -Method Post -Headers $driverHeaders
    if ($res.success -eq $true) {
        Report-Result -TestName "POST /api/core/parking-sessions/{qrToken}/claim (Link session to driver)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/parking-sessions/{qrToken}/claim" -Success $false -ErrorMessage "Claim session failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/parking-sessions/{qrToken}/claim" -Success $false -ErrorMessage $_.Exception.Message
}

# 43. Restore Pricing Rule ID 5 Hourly Price to 10000
try {
    $body = @{
        reservationHourlyPrice = 10000
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/pricing-rules/5" -Method Put -Headers $headers -ContentType "application/json" -Body $body
    if ($res.success -eq $true -and $res.data.reservationHourlyPrice -eq 10000) {
        Report-Result -TestName "PUT /api/core/pricing-rules/5 (Restore Hourly Price to 10000)" -Success $true
    } else {
        Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage "Failed to restore pricing rule rate"
    }
} catch {
    Report-Result -TestName "PUT /api/core/pricing-rules/5" -Success $false -ErrorMessage $_.Exception.Message
}

# 44. Create PENDING Reservation
$reservationId = $null
try {
    $body = @{
        driverId = 1
        vehicleId = $null
        plateNumber = $plateNumber
        vehicleTypeId = 5
        floorId = 2
        areaId = 3
        slotId = 12
        reservedDurationMinutes = 60
    } | ConvertTo-Json
    $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations" -Method Post -Headers $headers -ContentType "application/json" -Body $body
    if ($res.id -and $res.status -eq "PENDING") {
        $reservationId = $res.id
        Report-Result -TestName "POST /api/core/reservations (Create PENDING Booking $plateNumber)" -Success $true
    } else {
        Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage "Booking failed"
    }
} catch {
    Report-Result -TestName "POST /api/core/reservations" -Success $false -ErrorMessage $_.Exception.Message
}

# 45. Extend Reservation
if ($reservationId) {
    try {
        $body = @{
            addedMinutes = 30
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$reservationId/extend" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.reservedDurationMinutes -eq 90) {
            Report-Result -TestName "POST /api/core/reservations/{id}/extend (Add 30 minutes)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/reservations/{id}/extend" -Success $false -ErrorMessage "Extension failed"
        }
    } catch {
        Report-Result -TestName "POST /api/core/reservations/{id}/extend" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/reservations/{id}/extend" -Success $false -ErrorMessage "Skipped (no reservationId)"
}

# 46. Cancel Reservation
if ($reservationId) {
    try {
        $body = @{
            reason = "Automated test cancellation"
        } | ConvertTo-Json
        $res = Invoke-RestMethod -Uri "$BaseUrl/api/core/reservations/$reservationId/cancel" -Method Post -Headers $headers -ContentType "application/json" -Body $body
        if ($res.success -eq $true -and $res.data.status -eq "CANCELLED") {
            Report-Result -TestName "POST /api/core/reservations/{id}/cancel (Cancel Booking)" -Success $true
        } else {
            Report-Result -TestName "POST /api/core/reservations/{id}/cancel" -Success $false -ErrorMessage "Cancellation failed"
        }
    } catch {
        Report-Result -TestName "POST /api/core/reservations/{id}/cancel" -Success $false -ErrorMessage $_.Exception.Message
    }
} else {
    Report-Result -TestName "POST /api/core/reservations/{id}/cancel" -Success $false -ErrorMessage "Skipped (no reservationId)"
}

# ----------------- TEST SUMMARY -----------------
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " TESTS COMPLETE" -ForegroundColor Cyan
Write-Host " Passed: $globalTestsPassed" -ForegroundColor Green
if ($globalTestsFailed -gt 0) {
    Write-Host " Failed: $globalTestsFailed" -ForegroundColor Red
} else {
    Write-Host " Failed: 0" -ForegroundColor Green
}
Write-Host "====================================================" -ForegroundColor Cyan

if ($globalTestsFailed -gt 0) {
    Exit 1
} else {
    Exit 0
}
