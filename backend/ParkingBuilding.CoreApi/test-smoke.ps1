# Smoke test script for SWP391 Core API Sprint 1
$baseUrl = "http://localhost:5000"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Running TC2: Health and Database check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "`n[GET] /api/core/health" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$baseUrl/api/core/health" -Method Get
$health | ConvertTo-Json -Depth 5

Write-Host "`n[GET] /api/core/db-check" -ForegroundColor Yellow
$dbCheck = Invoke-RestMethod -Uri "$baseUrl/api/core/db-check" -Method Get
$dbCheck | ConvertTo-Json -Depth 5

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Running TC3: Login success" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$loginBody = @{
    username = "admin01"
    password = "123456"
} | ConvertTo-Json

Write-Host "`n[POST] /api/core/auth/login" -ForegroundColor Yellow
$loginRes = Invoke-RestMethod -Uri "$baseUrl/api/core/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$loginRes | ConvertTo-Json -Depth 5

$token = $loginRes.data.accessToken
Write-Host "`nExtracted Token: $token" -ForegroundColor Green

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Running TC4: Login fail" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$loginFailBody = @{
    username = "admin01"
    password = "wrong_pass"
} | ConvertTo-Json

try {
    Write-Host "`n[POST] /api/core/auth/login (Wrong password)" -ForegroundColor Yellow
    $res = Invoke-RestMethod -Uri "$baseUrl/api/core/auth/login" -Method Post -Body $loginFailBody -ContentType "application/json"
    $res | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Caught error (Expected):" -ForegroundColor Magenta
    $streamReader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
    $errRes = $streamReader.ReadToEnd()
    $errRes
}

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Running TC5: Current user (/me) with valid token" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$headers = @{
    Authorization = "Bearer $token"
}

Write-Host "`n[GET] /api/core/auth/me" -ForegroundColor Yellow
$meRes = Invoke-RestMethod -Uri "$baseUrl/api/core/auth/me" -Method Get -Headers $headers
$meRes | ConvertTo-Json -Depth 5

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Running TC6: Current user (/me) unauthorized (no token)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
try {
    Write-Host "`n[GET] /api/core/auth/me (No Token)" -ForegroundColor Yellow
    $res = Invoke-RestMethod -Uri "$baseUrl/api/core/auth/me" -Method Get
    $res | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Caught error (Expected):" -ForegroundColor Magenta
    $streamReader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
    $errRes = $streamReader.ReadToEnd()
    $errRes
}
