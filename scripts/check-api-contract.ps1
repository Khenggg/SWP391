param(
    [string]$ControllersPath = "backend/ParkingBuilding.CoreApi/Controllers",
    [string]$ApplicationPath = "backend/ParkingBuilding.CoreApi/Application"
)

$ErrorActionPreference = "Stop"

$controllerForbiddenPatterns = @(
    'return\s+Ok\s*\(',
    'return\s+BadRequest\s*\(\s*"',
    'return\s+NotFound\s*\(\s*"',
    'return\s+Forbid\s*\(\s*"',
    'StatusCode\s*\(\s*201\s*,\s*result\s*\)',
    'CreatedAtAction\s*\(',
    'ApiResponse\.FailureResult',
    'catch\s*\(\s*Exception\s+ex\s*\)[\s\S]{0,300}BadRequest'
)

$businessExceptionLiteralPattern = 'new\s+BusinessException\s*\(\s*"[A-Z0-9_]+"'
$controllerWhitelist = @('BaseApiController.cs')
$excludedNames = @('ErrorCodes.cs', 'ErrorMessages.cs')
$violations = New-Object System.Collections.Generic.List[object]

function Add-Violation {
    param(
        [System.IO.FileInfo]$File,
        [string]$Content,
        [string]$Pattern,
        [System.Text.RegularExpressions.Match]$Match
    )

    $lineNumber = ($Content.Substring(0, $Match.Index) -split "`n").Count
    $lineContent = (($Content -split "`r?`n")[$lineNumber - 1]).Trim()
    $violations.Add([pscustomobject]@{
        File = $File.FullName
        Pattern = $Pattern
        Line = $lineNumber
        Content = $lineContent
    }) | Out-Null
}

if (Test-Path -LiteralPath $ControllersPath) {
    $controllerFiles = Get-ChildItem -LiteralPath $ControllersPath -Filter '*.cs' -File
    foreach ($file in $controllerFiles) {
        if ($controllerWhitelist -contains $file.Name) {
            continue
        }

        $content = Get-Content -LiteralPath $file.FullName -Raw
        foreach ($pattern in $controllerForbiddenPatterns) {
            $matches = [regex]::Matches(
                $content,
                $pattern,
                [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Singleline)

            foreach ($match in $matches) {
                Add-Violation -File $file -Content $content -Pattern $pattern -Match $match
            }
        }
    }
}

$businessScanRoots = @($ApplicationPath, $ControllersPath)
foreach ($root in $businessScanRoots) {
    if (-not (Test-Path -LiteralPath $root)) {
        continue
    }

    $files = Get-ChildItem -LiteralPath $root -Filter '*.cs' -File -Recurse |
        Where-Object {
            ($_.FullName -notmatch '\\(bin|obj|generated)\\') -and
            ($excludedNames -notcontains $_.Name)
        }

    foreach ($file in $files) {
        $content = Get-Content -LiteralPath $file.FullName -Raw
        $matches = [regex]::Matches($content, $businessExceptionLiteralPattern)
        foreach ($match in $matches) {
            Add-Violation -File $file -Content $content -Pattern $businessExceptionLiteralPattern -Match $match
        }
    }
}

if ($violations.Count -gt 0) {
    foreach ($violation in $violations) {
        Write-Host "[FAIL] File: $($violation.File)" -ForegroundColor Red
        Write-Host "Pattern: $($violation.Pattern)" -ForegroundColor Red
        Write-Host "Line: $($violation.Line)" -ForegroundColor Red
        Write-Host "Content: $($violation.Content)" -ForegroundColor Red
        Write-Host ""
    }
    Exit 1
}

Write-Host "[PASS] API contract static check passed." -ForegroundColor Green
