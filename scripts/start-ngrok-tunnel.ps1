param (
    [int]$Port = 5000
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Green
Write-Host "         NGROK TUNNEL SETUP FOR PAYOS"
Write-Host "==================================================" -ForegroundColor Green

# 1. Check if ngrok is available on system
try {
    $ngrokVer = ngrok --version
    Write-Host "ngrok is available: $ngrokVer" -ForegroundColor Gray
} catch {
    Write-Error "ngrok is not found on your system PATH. Please install ngrok first."
    exit 1
}

# 2. Check if ngrok is already running, if not start it
$ngrokProcess = Get-Process -Name "ngrok" -ErrorAction SilentlyContinue

if ($null -eq $ngrokProcess) {
    Write-Host "Starting ngrok tunnel on port $Port..." -ForegroundColor Cyan
    # Run ngrok http $Port in the background
    $proc = Start-Process -FilePath "ngrok" -ArgumentList "http $Port" -NoNewWindow -PassThru
    Write-Host "Waiting 3 seconds for ngrok to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
} else {
    Write-Host "ngrok process is already running." -ForegroundColor Yellow
}

# 3. Retrieve public HTTPS URL from local ngrok API (port 4040)
Write-Host "Fetching public URL from local ngrok API (http://127.0.0.1:4040)..." -ForegroundColor Cyan
try {
    $tunnelsResponse = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels"
    $publicUrl = $tunnelsResponse.tunnels | Where-Object { $_.proto -eq 'https' } | Select-Object -ExpandProperty public_url
    
    if (-not $publicUrl) {
        Write-Error "Could not find an active HTTPS tunnel in ngrok. Make sure ngrok is running and exposing an HTTPS endpoint."
        exit 1
    }
    
    $webhookUrl = "$publicUrl/api/core/payments/payos/webhook"
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    Write-Host "Found ngrok public URL : $publicUrl" -ForegroundColor Green
    Write-Host "Target webhook URL      : $webhookUrl" -ForegroundColor Green
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    
    # 4. Update .NET user-secrets
    Write-Host "Updating C# User Secrets in ParkingBuilding.CoreApi..." -ForegroundColor Cyan
    $projectDir = Join-Path $PSScriptRoot "../backend/ParkingBuilding.CoreApi"
    
    if (Test-Path $projectDir) {
        Push-Location $projectDir
        try {
            dotnet user-secrets set "PAYOS_WEBHOOK_URL" $webhookUrl
            Write-Host "Successfully saved PAYOS_WEBHOOK_URL to user-secrets!" -ForegroundColor Green
        } finally {
            Pop-Location
        }
    } else {
        Write-Error "CoreApi project directory not found at: $projectDir"
        exit 1
    }
    
    Write-Host "`n[IMPORTANT]" -ForegroundColor Yellow
    Write-Host "Please copy the following URL and paste it as the Webhook URL on your PayOS Dashboard:" -ForegroundColor Yellow
    Write-Host "👉 $webhookUrl" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    
} catch {
    Write-Error "Failed to retrieve ngrok tunnel configuration. Error: $_"
}
