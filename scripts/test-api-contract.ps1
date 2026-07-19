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
        return Invoke-RestMethod @params
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        if (-not $stream) { throw }
        $reader = [System.IO.StreamReader]::new($stream)
        $bodyText = $reader.ReadToEnd()
        $reader.Close()
        return $bodyText | ConvertFrom-Json
    }
}

function Assert-CommonFields {
    param($Response)

    foreach ($field in @("success", "message", "statusCode", "traceId", "path", "timestamp")) {
        if (-not ($Response.PSObject.Properties.Name -contains $field)) {
            throw "Missing field: $field"
        }
    }
    foreach ($field in @("traceId", "path", "timestamp")) {
        if ([string]::IsNullOrWhiteSpace([string]$Response.$field)) {
            throw "Field must not be empty: $field"
        }
    }
}

function Assert-SuccessFormat {
    param($Response, [int]$ExpectedStatusCode)

    Assert-CommonFields -Response $Response
    if ($Response.success -ne $true) { throw "Expected success=true" }
    if (-not ($Response.PSObject.Properties.Name -contains "data")) { throw "Missing data" }
    if ($Response.statusCode -ne $ExpectedStatusCode) {
        throw "Expected statusCode=$ExpectedStatusCode but got $($Response.statusCode)"
    }
}

function Assert-ErrorCodeFormat {
    param([string]$ErrorCode)

    if ([string]::IsNullOrWhiteSpace($ErrorCode)) {
        throw "Missing errorCode"
    }

    if ($ErrorCode -notmatch '^[A-Z0-9_]+$') {
        throw "Invalid errorCode format: $ErrorCode"
    }
}

function Assert-ErrorFormat {
    param($Response, [int]$ExpectedStatusCode, [string]$ExpectedErrorCode)

    Assert-CommonFields -Response $Response
    if ($Response.success -ne $false) { throw "Expected success=false" }
    Assert-ErrorCodeFormat -ErrorCode $Response.errorCode
    if (-not ($Response.PSObject.Properties.Name -contains "errors")) { throw "Missing errors" }
    if ($Response.statusCode -ne $ExpectedStatusCode) {
        throw "Expected statusCode=$ExpectedStatusCode but got $($Response.statusCode)"
    }
    if ($ExpectedErrorCode -and $Response.errorCode -ne $ExpectedErrorCode) {
        throw "Expected errorCode=$ExpectedErrorCode but got $($Response.errorCode)"
    }
}

Write-Host "Running API contract tests on $BaseUrl" -ForegroundColor Cyan

$health = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health"
Assert-SuccessFormat -Response $health -ExpectedStatusCode 200

$loginBody = @{ username = "admin01"; password = "123456" } | ConvertTo-Json
$login = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $loginBody
Assert-SuccessFormat -Response $login -ExpectedStatusCode 200
$headers = @{ Authorization = "Bearer $($login.data.accessToken)" }

$createBody = @{
    floorCode = "CT-$(Get-Random -Minimum 10000 -Maximum 99999)"
    floorName = "Contract Test Floor"
} | ConvertTo-Json
$created = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/floors" -Headers $headers -Body $createBody
Assert-SuccessFormat -Response $created -ExpectedStatusCode 201

$validationBody = @{ vehicleTypeId = "not-a-number"; floorId = 1; areaId = 1; reservedDurationMinutes = 60 } | ConvertTo-Json
$validationError = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $headers -Body $validationBody
Assert-ErrorFormat -Response $validationError -ExpectedStatusCode 400 -ExpectedErrorCode "VALIDATION_ERROR"

$businessBody = @{
    entryMode = "CASUAL"
    cardCode = "C003"
    licensePlate = $null
    noPlate = $true
    vehicleTypeId = 5
    entryGateId = 1
} | ConvertTo-Json
$businessError = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $headers -Body $businessBody
Assert-ErrorFormat -Response $businessError -ExpectedStatusCode 400 -ExpectedErrorCode ""

$unauthorized = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/auth/me"
Assert-ErrorFormat -Response $unauthorized -ExpectedStatusCode 401 -ExpectedErrorCode "UNAUTHORIZED"

$driverLoginBody = @{ username = "driver01"; password = "123456" } | ConvertTo-Json
$driverLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body $driverLoginBody
$driverHeaders = @{ Authorization = "Bearer $($driverLogin.data.accessToken)" }
$forbidden = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/users" -Headers $driverHeaders
Assert-ErrorFormat -Response $forbidden -ExpectedStatusCode 403 -ExpectedErrorCode "FORBIDDEN"

$notFound = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/cards/999999999" -Headers $headers
Assert-ErrorFormat -Response $notFound -ExpectedStatusCode 404 -ExpectedErrorCode ""

Write-Host "API contract tests passed." -ForegroundColor Green
