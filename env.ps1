param(
    [switch]$RunApi,
    [switch]$SkipPayOsPrompt,
    [switch]$SkipSupabasePrompt,
    [string]$BackendUrl = "http://localhost:5000",
    [string]$FrontendUrl = "http://localhost:5173",
    [string]$PublicWebhookBaseUrl = ""
)

$ErrorActionPreference = "Stop"

# ============================================================
# LOCAL VALUES TO FILL
# File nay da nam trong .gitignore. Dien secret local o day neu
# ban muon chay nhanh ma khong can nhap prompt moi lan.
# De trong "" thi script se hoi luc chay.
# ============================================================
$LocalPayOsClientId = "c166c566-3e1b-4d2e-8467-6befb1d2b902"
$LocalPayOsApiKey = "e1180476-093a-40b7-81fa-276ea66cad4c"
$LocalPayOsChecksumKey = "01d687c39f1fe9d5eaaf7d3d5d716fe43d048d0cebf2e2518ed10d4861af79c9"

$LocalSupabaseUrl = "https://iqzkddymzmfhyqbfrnyu.supabase.co"
$LocalSupabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxemtkZHltem1maHlxYmZybnl1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTA4NTE2NiwiZXhwIjoyMDk0NjYxMTY2fQ.Zfwq4eDCFFbAAxXaALCuIHOtBW9uyl0pfHqcdGYW2eU"
$LocalSupabaseBucket = "parking-image"

# Neu dung tunnel local, dien vi du:
# $LocalPublicWebhookBaseUrl = "https://abc.ngrok-free.app"
$LocalPublicWebhookBaseUrl = "https://ooze-promotion-smoking.ngrok-free.dev"

# Neu muon override DB bang env var, dien connection string vao day.
# De trong "" thi app dung appsettings.Development.json.
$LocalDefaultConnection = "Host=aws-1-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.iqzkddymzmfhyqbfrnyu;Password=Moghicha12@;SSL Mode=Require;Trust Server Certificate=true;No Reset On Close=true;"

function Set-DefaultEnv {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )

    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name))) {
        Set-Item -Path "Env:$Name" -Value $Value
    }
}

function Read-SecretText {
    param([Parameter(Mandatory = $true)][string]$Prompt)

    $secure = Read-Host $Prompt -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        if ($bstr -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
        }
    }
}

function Ensure-Env {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Prompt,
        [switch]$Secret,
        [switch]$Optional
    )

    if (-not [string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($Name))) {
        return
    }

    if ($Optional) {
        $answer = Read-Host "$Prompt (Enter to skip)"
        if ([string]::IsNullOrWhiteSpace($answer)) {
            return
        }
        Set-Item -Path "Env:$Name" -Value $answer
        return
    }

    if ($Secret) {
        $value = Read-SecretText $Prompt
    }
    else {
        $value = Read-Host $Prompt
    }

    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "$Name is required."
    }

    Set-Item -Path "Env:$Name" -Value $value
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

if ([string]::IsNullOrWhiteSpace($PublicWebhookBaseUrl) -and -not [string]::IsNullOrWhiteSpace($LocalPublicWebhookBaseUrl)) {
    $PublicWebhookBaseUrl = $LocalPublicWebhookBaseUrl
}

# ASP.NET Core runtime
Set-DefaultEnv "ASPNETCORE_ENVIRONMENT" "Development"
Set-DefaultEnv "ASPNETCORE_URLS" $BackendUrl

if (-not [string]::IsNullOrWhiteSpace($LocalDefaultConnection)) {
    Set-Item -Path "Env:ConnectionStrings__DefaultConnection" -Value $LocalDefaultConnection
}

# Local JWT/token defaults. Replace for production.
Set-DefaultEnv "JWT_SECRET" "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391"
Set-DefaultEnv "RESERVATION_ENTRY_TOKEN_SECRET" "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_RESERVATION"
Set-DefaultEnv "SUGGESTION_TOKEN_SECRET" "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_SUGGESTION"
Set-DefaultEnv "MONTHLY_ENTRY_TOKEN_SECRET" "DEVELOPMENT_SECRET_KEY_FOR_LOCAL_TESTING_ONLY_2026_SWP391_MONTHLY_ENTRY"

# Reservation/payment behavior
Set-DefaultEnv "RESERVATION_ALLOW_ZERO_BOOKING_FEE" "false"
Set-DefaultEnv "RESERVATION_MAX_HOURS" "3"
Set-DefaultEnv "RESERVATION_PAYMENT_DEADLINE_MINUTES" "10"

# The Development appsettings currently contains the local DB connection.
# To override it, uncomment and fill this line:
# $env:ConnectionStrings__DefaultConnection = "Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true;"

# payOS. These are process env vars only, not persisted to disk.
Set-DefaultEnv "PAYOS_RETURN_URL" "$FrontendUrl/payment/return"
Set-DefaultEnv "PAYOS_CANCEL_URL" "$FrontendUrl/payment/cancel"
if (-not [string]::IsNullOrWhiteSpace($PublicWebhookBaseUrl)) {
    Set-Item -Path "Env:PAYOS_WEBHOOK_URL" -Value "$PublicWebhookBaseUrl/api/core/payments/payos/webhook"
}
else {
    Set-DefaultEnv "PAYOS_WEBHOOK_URL" "https://<public-host>/api/core/payments/payos/webhook"
}

if (-not [string]::IsNullOrWhiteSpace($LocalPayOsClientId)) {
    Set-Item -Path "Env:PAYOS_CLIENT_ID" -Value $LocalPayOsClientId
}
if (-not [string]::IsNullOrWhiteSpace($LocalPayOsApiKey)) {
    Set-Item -Path "Env:PAYOS_API_KEY" -Value $LocalPayOsApiKey
}
if (-not [string]::IsNullOrWhiteSpace($LocalPayOsChecksumKey)) {
    Set-Item -Path "Env:PAYOS_CHECKSUM_KEY" -Value $LocalPayOsChecksumKey
}

if (-not $SkipPayOsPrompt) {
    Ensure-Env "PAYOS_CLIENT_ID" "PAYOS_CLIENT_ID"
    Ensure-Env "PAYOS_API_KEY" "PAYOS_API_KEY" -Secret
    Ensure-Env "PAYOS_CHECKSUM_KEY" "PAYOS_CHECKSUM_KEY" -Secret
}

# Supabase Storage. URL/bucket are harmless; service role key is prompted.
Set-DefaultEnv "SUPABASE_STORAGE_BUCKET" $LocalSupabaseBucket
Set-DefaultEnv "SUPABASE_SIGNED_URL_EXPIRES_SECONDS" "3600"
Set-DefaultEnv "SUPABASE_MAX_UPLOAD_BYTES" "10485760"
if (-not [string]::IsNullOrWhiteSpace($LocalSupabaseUrl)) {
    Set-Item -Path "Env:SUPABASE_URL" -Value $LocalSupabaseUrl
}
if (-not [string]::IsNullOrWhiteSpace($LocalSupabaseServiceRoleKey)) {
    Set-Item -Path "Env:SUPABASE_SERVICE_ROLE_KEY" -Value $LocalSupabaseServiceRoleKey
}
if (-not $SkipSupabasePrompt) {
    Ensure-Env "SUPABASE_URL" "SUPABASE_URL, for example https://xxxx.supabase.co" -Optional
    Ensure-Env "SUPABASE_SERVICE_ROLE_KEY" "SUPABASE_SERVICE_ROLE_KEY" -Secret -Optional
}

Write-Host "Environment prepared for ParkingBuilding.CoreApi." -ForegroundColor Green
Write-Host "Backend URL: $env:ASPNETCORE_URLS"
Write-Host "payOS webhook: $env:PAYOS_WEBHOOK_URL"
Write-Host "Supabase bucket: $env:SUPABASE_STORAGE_BUCKET"
Write-Host "Secrets were loaded into this PowerShell process only." -ForegroundColor Yellow

if ($RunApi) {
    dotnet run --project backend/ParkingBuilding.CoreApi/ParkingBuilding.CoreApi.csproj
}
