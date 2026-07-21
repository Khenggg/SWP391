[CmdletBinding()]
param(
    [switch]$SkipTests
)

$ErrorActionPreference = 'Stop'

function Get-DotEnvValues {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Missing $Path. Copy .env.example to .env and set the local values."
    }

    $values = @{}
    foreach ($rawLine in Get-Content -LiteralPath $Path) {
        $line = $rawLine.Trim()
        if (-not $line -or $line.StartsWith('#')) { continue }

        $separatorIndex = $line.IndexOf('=')
        if ($separatorIndex -le 0) { continue }

        $values[$line.Substring(0, $separatorIndex).Trim()] = $line.Substring($separatorIndex + 1).Trim().Trim('"').Trim("'")
    }

    return $values
}

$values = Get-DotEnvValues -Path (Join-Path $PSScriptRoot '.env')
$required = @('DB_URL', 'DB_USERNAME', 'DB_PASSWORD', 'JWT_SECRET')
$missing = foreach ($key in $required) {
    $effectiveValue = [Environment]::GetEnvironmentVariable($key, 'Process')
    if ([string]::IsNullOrWhiteSpace($effectiveValue)) { $effectiveValue = $values[$key] }

    if ([string]::IsNullOrWhiteSpace($effectiveValue) -or $effectiveValue.StartsWith('__')) {
        $key
    }
}

if ($missing) {
    throw "Set the following values in $PSScriptRoot\.env before running: $($missing -join ', ')."
}

$mavenArguments = @('spring-boot:run')
if ($SkipTests) { $mavenArguments += '-DskipTests' }

Push-Location $PSScriptRoot
try {
    & mvn.cmd @mavenArguments
} finally {
    Pop-Location
}
