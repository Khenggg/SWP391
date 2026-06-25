param (
    [string]$BaseUrl = "http://localhost:5000"
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

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running SMOKE tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Health Check
Write-Host "[Smoke] Checking Health endpoint..."
$health = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health"
if ($health.success -eq $true -and $health.data.status -eq "UP") {
    Write-Host "  Health: OK" -ForegroundColor Green
} else {
    throw "Health check failed: $($health | ConvertTo-Json)"
}

# 2. Swagger Schema JSON Check
Write-Host "[Smoke] Fetching swagger.json..."
$swagger = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/swagger/v1/swagger.json"
if ($swagger.openapi) {
    Write-Host "  Swagger JSON: OK (OpenAPI version: $($swagger.openapi))" -ForegroundColor Green
} else {
    throw "Swagger JSON fetch failed or invalid format."
}

# 3. Login as Staff
Write-Host "[Smoke] Logging in as staff01..."
$loginBody = @{
    username = "staff01"
    password = "123456"
} | ConvertTo-Json
$loginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
$token = $loginResult.data.accessToken
if ($token) {
    Write-Host "  Login (Staff): OK (Token received)" -ForegroundColor Green
} else {
    throw "Login (Staff) failed: $($loginResult | ConvertTo-Json)"
}

$headers = @{
    Authorization = "Bearer $token"
}

# 4. Get Me profile (Staff)
Write-Host "[Smoke] Retrieving current profile (me) as staff..."
$meResult = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/auth/me" -Headers $headers
if ($meResult.success -eq $true -and $meResult.data.username -eq "staff01") {
    Write-Host "  Me Profile: OK (role = $($meResult.data.role))" -ForegroundColor Green
} else {
    throw "Profile retrieval failed: $($meResult | ConvertTo-Json)"
}

# 5. GET floors
Write-Host "[Smoke] Fetching floors list..."
$floors = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/floors" -Headers $headers
if (@($floors).Count -gt 0) {
    Write-Host "  Floors list count: $(@($floors).Count) (OK)" -ForegroundColor Green
} else {
    throw "Floors list is empty!"
}

# 6. GET areas
Write-Host "[Smoke] Fetching areas list..."
$areas = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/areas" -Headers $headers
if (@($areas).Count -gt 0) {
    Write-Host "  Areas list count: $(@($areas).Count) (OK)" -ForegroundColor Green
} else {
    throw "Areas list is empty!"
}

# 7. GET slots
Write-Host "[Smoke] Fetching slots list..."
$slots = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/slots" -Headers $headers
if (@($slots).Count -gt 0) {
    Write-Host "  Slots list count: $(@($slots).Count) (OK)" -ForegroundColor Green
} else {
    throw "Slots list is empty!"
}

# 8. Login as Admin
Write-Host "[Smoke] Logging in as admin01..."
$adminLoginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json
$adminLoginResult = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $adminLoginBody
$adminToken = $adminLoginResult.data.accessToken
if ($adminToken) {
    Write-Host "  Login (Admin): OK" -ForegroundColor Green
} else {
    throw "Login (Admin) failed."
}

$adminHeaders = @{
    Authorization = "Bearer $adminToken"
}

# 9. GET db-check (Admin Only)
Write-Host "[Smoke] Running DB check as admin..."
$dbCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/db-check" -Headers $adminHeaders
if ($dbCheck.success -eq $true -and $dbCheck.data.efCoreVerification.success -eq $true) {
    Write-Host "  DB Check: OK" -ForegroundColor Green
} else {
    throw "DB Check failed: $($dbCheck | ConvertTo-Json)"
}

Write-Host "`n[SUCCESS] Smoke tests completed successfully!" -ForegroundColor Green
