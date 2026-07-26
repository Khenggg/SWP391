$ErrorActionPreference = "Stop"

$repoRoot = git rev-parse --show-toplevel
if (-not $repoRoot) {
    Write-Host "Error: This script must be run inside a Git repository." -ForegroundColor Red
    Exit 1
}

Set-Location $repoRoot

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Generating Project Map (docs/project-map.md)..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js is required but not found in PATH." -ForegroundColor Red
    Exit 1
}

# Run the generator script
node scripts/generate-project-map.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to generate project-map.md." -ForegroundColor Red
    Exit 1
}

Write-Host "`nProject map successfully generated at docs/project-map.md!" -ForegroundColor Green

# Ask if they want to upload to ChatGPT
$choice = Read-Host "`nDo you want to automatically upload this map to ChatGPT? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host "`n=============================================" -ForegroundColor Cyan
    Write-Host "Uploading Project Map to ChatGPT..." -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    
    node scripts/upload-project-map.js
} else {
    Write-Host "`nDone! You can find the generated file at: docs/project-map.md" -ForegroundColor Yellow
}
