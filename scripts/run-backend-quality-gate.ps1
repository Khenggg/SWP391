param (
    [string]$BaseUrl = "http://localhost:5000",
    [switch]$AllowWriteTests,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

Write-Host "=== Backend Quality Gate ===" -ForegroundColor Cyan

Write-Host "1. Build project..." -ForegroundColor Cyan
dotnet build backend/ParkingBuilding.CoreApi/ParkingBuilding.CoreApi.csproj
if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

Write-Host "2. Static API contract check..." -ForegroundColor Cyan
& .\scripts\check-api-contract.ps1
if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

Write-Host "3. Smoke tests..." -ForegroundColor Cyan
& .\scripts\test-api-smoke.ps1 -BaseUrl $BaseUrl
if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

Write-Host "4. API contract tests..." -ForegroundColor Cyan
& .\scripts\test-api-contract.ps1 -BaseUrl $BaseUrl
if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

if ($AllowWriteTests) {
    Write-Host "5. CRUD write tests..." -ForegroundColor Cyan
    $crudArgs = @{ BaseUrl = $BaseUrl; AllowWriteTests = $true }
    if ($AllowReset) { $crudArgs.AllowReset = $true }
    & .\scripts\test-api-crud.ps1 @crudArgs
    if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

    Write-Host "6. Flow write tests..." -ForegroundColor Cyan
    $flowArgs = @{ BaseUrl = $BaseUrl; AllowWriteTests = $true }
    if ($AllowReset) { $flowArgs.AllowReset = $true }
    & .\scripts\test-api-flow.ps1 @flowArgs
    if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

    Write-Host "7. payOS reservation flow tests..." -ForegroundColor Cyan
    $payOsArgs = @{ BaseUrl = $BaseUrl; AllowWriteTests = $true }
    if ($AllowReset) { $payOsArgs.AllowReset = $true }
    & .\scripts\test-payos-reservation-flow.ps1 @payOsArgs
    if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }

    if ($AllowReset) {
        Write-Host "8. Booking/entry matrix tests..." -ForegroundColor Cyan
        & .\scripts\test-booking-entry-matrix.ps1 -BaseUrl $BaseUrl -AllowWriteTests -AllowReset
        if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }
    } else {
        Write-Host "8. Skipping booking/entry matrix tests. Use -AllowReset to run fixed-card matrix scenarios." -ForegroundColor Yellow
    }

    Write-Host "9. Lost-card document tests..." -ForegroundColor Cyan
    & .\scripts\test-lost-card-documents.ps1 -BaseUrl $BaseUrl -AllowWriteTests
    if ($LASTEXITCODE -ne 0) { Exit $LASTEXITCODE }
} else {
    Write-Host "5. Skipping write tests. Use -AllowWriteTests to run CRUD, flow, payOS, and lost-card document tests." -ForegroundColor Yellow
}

Write-Host "=== Backend Quality Gate PASSED ===" -ForegroundColor Green
