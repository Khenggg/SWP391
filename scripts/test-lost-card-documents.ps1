param (
    [string]$BaseUrl = "http://localhost:5000",
    [long]$CaseId = 0,
    [switch]$AllowWriteTests
)

$ErrorActionPreference = "Stop"

if (-not $AllowWriteTests) {
    Write-Host "[Warning] -AllowWriteTests switch was not specified. Skipping lost card document tests." -ForegroundColor Yellow
    Exit 0
}

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [object]$Body = $null,
        [string]$ContentType = "application/json"
    )

    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }

    if ($null -ne $Body) {
        $params.Body = $Body
        if ($ContentType) {
            $params.ContentType = $ContentType
        }
    }

    try {
        return Invoke-RestMethod @params
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

        $customEx = New-Object System.Exception("API Error status=$($statusCode): $errBody")
        $customEx | Add-Member -MemberType NoteProperty -Name "ErrorBody" -Value $errBody -Force
        $customEx | Add-Member -MemberType NoteProperty -Name "StatusCode" -Value $statusCode -Force
        throw $customEx
    }
}

function Invoke-ApiExpectError {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [object]$Body = $null,
        [string]$ContentType = "application/json",
        [string]$ExpectedErrorCode
    )

    try {
        $response = Invoke-ApiRequest -Method $Method -Uri $Uri -Headers $Headers -Body $Body -ContentType $ContentType
        throw "Expected errorCode=$ExpectedErrorCode but request succeeded: $($response | ConvertTo-Json -Depth 20)"
    } catch {
        if (-not ($_.Exception.PSObject.Properties.Name -contains "ErrorBody")) {
            throw
        }

        $errorResponse = $_.Exception.ErrorBody | ConvertFrom-Json
        if ($errorResponse.errorCode -ne $ExpectedErrorCode) {
            throw "Expected errorCode=$ExpectedErrorCode but got $($errorResponse.errorCode). Body: $($_.Exception.ErrorBody)"
        }

        return $errorResponse
    }
}

function Assert-Success {
    param($Response, [string]$Name)

    if ($null -eq $Response) { throw "$Name returned null." }
    if ($Response.success -ne $true) {
        throw "$Name expected success=true. Body: $($Response | ConvertTo-Json -Depth 20)"
    }
    if (-not ($Response.PSObject.Properties.Name -contains "data")) {
        throw "$Name missing ApiResponse.data."
    }
}

function Invoke-CurlMultipart {
    param (
        [string]$Uri,
        [string]$Token,
        [string[]]$FormParts
    )

    $curlArgs = @(
        "-sS",
        "-X", "POST",
        "-H", "Authorization: Bearer $Token"
    )
    foreach ($part in $FormParts) {
        $curlArgs += @("-F", $part)
    }
    $curlArgs += @("-w", "`n%{http_code}", $Uri)

    $raw = & curl.exe @curlArgs
    if ($LASTEXITCODE -ne 0) {
        throw "curl.exe multipart request failed."
    }

    $lines = @($raw)
    $statusCode = [int]$lines[-1]
    $body = ($lines[0..($lines.Count - 2)] -join "`n")
    $json = $body | ConvertFrom-Json

    if ($statusCode -lt 200 -or $statusCode -ge 300) {
        $customEx = New-Object System.Exception("API Error status=$($statusCode): $body")
        $customEx | Add-Member -MemberType NoteProperty -Name "ErrorBody" -Value $body -Force
        $customEx | Add-Member -MemberType NoteProperty -Name "StatusCode" -Value $statusCode -Force
        throw $customEx
    }

    return $json
}

function Invoke-CurlMultipartExpectError {
    param (
        [string]$Uri,
        [string]$Token,
        [string[]]$FormParts,
        [string]$ExpectedErrorCode
    )

    try {
        $response = Invoke-CurlMultipart -Uri $Uri -Token $Token -FormParts $FormParts
        throw "Expected errorCode=$ExpectedErrorCode but request succeeded: $($response | ConvertTo-Json -Depth 20)"
    } catch {
        if (-not ($_.Exception.PSObject.Properties.Name -contains "ErrorBody")) {
            throw
        }

        $errorResponse = $_.Exception.ErrorBody | ConvertFrom-Json
        if ($errorResponse.errorCode -ne $ExpectedErrorCode) {
            throw "Expected errorCode=$ExpectedErrorCode but got $($errorResponse.errorCode). Body: $($_.Exception.ErrorBody)"
        }

        return $errorResponse
    }
}

function Get-ConnectionString {
    if (-not [string]::IsNullOrWhiteSpace($env:ConnectionStrings__DefaultConnection)) {
        return $env:ConnectionStrings__DefaultConnection
    }
    if (-not [string]::IsNullOrWhiteSpace($env:DATABASE_URL)) {
        return $env:DATABASE_URL
    }
    return $null
}

function Find-LostCardCaseId {
    if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
        return 0
    }

    $connectionString = Get-ConnectionString
    if ([string]::IsNullOrWhiteSpace($connectionString)) {
        return 0
    }

    $query = "SELECT id FROM lost_card_cases ORDER BY id DESC LIMIT 1;"
    $result = & psql $connectionString -t -A -c $query 2>$null
    if ($LASTEXITCODE -ne 0) {
        return 0
    }

    $value = ($result | Select-Object -First 1).Trim()
    if ([long]::TryParse($value, [ref]$script:parsedCaseId)) {
        return $script:parsedCaseId
    }

    return 0
}

function New-SampleFile {
    param([string]$Path, [string]$Kind)

    if ($Kind -eq "pdf") {
        [System.IO.File]::WriteAllText($Path, "%PDF-1.4`n1 0 obj<</Type/Catalog>>endobj`n%%EOF")
        return
    }

    $pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/l1Y7qQAAAABJRU5ErkJggg=="
    [System.IO.File]::WriteAllBytes($Path, [Convert]::FromBase64String($pngBase64))
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Running lost card document tests on $BaseUrl" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

if ([string]::IsNullOrWhiteSpace($env:SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($env:SUPABASE_SERVICE_ROLE_KEY)) {
    Write-Host "[Warning] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Upload tests require real Supabase Storage config." -ForegroundColor Yellow
    Exit 0
}

if ($CaseId -le 0) {
    $CaseId = Find-LostCardCaseId
}

if ($CaseId -le 0) {
    Write-Host "[Warning] No lost_card_cases row found. Pass -CaseId <id> after creating a lost card case." -ForegroundColor Yellow
    Exit 0
}

$staffLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "staff01"; password = "123456" } | ConvertTo-Json)
$staffToken = $staffLogin.data.accessToken
$staffHeaders = @{ Authorization = "Bearer $staffToken" }

$managerLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = "manager01"; password = "123456" } | ConvertTo-Json)
$managerToken = $managerLogin.data.accessToken
$managerHeaders = @{ Authorization = "Bearer $managerToken" }

$tempDir = Join-Path $env:TEMP "lost-card-doc-test-$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    $frontPath = Join-Path $tempDir "cccd-front.png"
    $backPath = Join-Path $tempDir "cccd-back.png"
    $vehiclePath = Join-Path $tempDir "vehicle-photo.png"
    $formPath = Join-Path $tempDir "signed-form.pdf"
    $invalidPath = Join-Path $tempDir "invalid.txt"
    $largePath = Join-Path $tempDir "too-large.png"

    New-SampleFile -Path $frontPath -Kind "png"
    New-SampleFile -Path $backPath -Kind "png"
    New-SampleFile -Path $vehiclePath -Kind "png"
    New-SampleFile -Path $formPath -Kind "pdf"
    [System.IO.File]::WriteAllText($invalidPath, "not an allowed upload type")
    [System.IO.File]::WriteAllBytes($largePath, (New-Object byte[] 5242881))

    Write-Host "[LostCardDoc 1] Upload CCCD_FRONT..."
    $frontUpload = Invoke-CurlMultipart -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Token $staffToken -FormParts @(
        "documentType=CCCD_FRONT",
        "note=Mock CCCD front for automated test",
        "file=@$frontPath;type=image/png"
    )
    Assert-Success -Response $frontUpload -Name "Upload CCCD_FRONT"
    if ([string]::IsNullOrWhiteSpace($frontUpload.data.signedUrl)) { throw "Expected signedUrl for CCCD_FRONT." }

    Write-Host "[LostCardDoc 2] Upload CCCD_BACK..."
    $backUpload = Invoke-CurlMultipart -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Token $staffToken -FormParts @(
        "documentType=CCCD_BACK",
        "note=Mock CCCD back for automated test",
        "file=@$backPath;type=image/png"
    )
    Assert-Success -Response $backUpload -Name "Upload CCCD_BACK"

    Write-Host "[LostCardDoc 3] Upload VEHICLE_PHOTO + SIGNED_FORM batch..."
    $batchUpload = Invoke-CurlMultipart -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents/batch" -Token $staffToken -FormParts @(
        "files=@$vehiclePath;type=image/png",
        "files=@$formPath;type=application/pdf",
        "documentTypes=VEHICLE_PHOTO",
        "documentTypes=SIGNED_FORM",
        "notes=Mock vehicle photo",
        "notes=Mock signed form"
    )
    Assert-Success -Response $batchUpload -Name "Upload batch"
    if (@($batchUpload.data).Count -ne 2) { throw "Expected 2 batch upload results." }

    Write-Host "[LostCardDoc 4] Get documents and verify signed URLs..."
    $documents = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Headers $staffHeaders
    Assert-Success -Response $documents -Name "Get documents"
    $activeDocs = @($documents.data)
    if ($activeDocs.Count -lt 4) { throw "Expected at least 4 active documents, got $($activeDocs.Count)." }
    if (@($activeDocs | Where-Object { [string]::IsNullOrWhiteSpace($_.signedUrl) }).Count -gt 0) {
        throw "Expected signedUrl on all active documents."
    }

    Write-Host "[LostCardDoc 5] Invalid type fails..."
    Invoke-CurlMultipartExpectError -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Token $staffToken -FormParts @(
        "documentType=OTHER",
        "note=Invalid text file",
        "file=@$invalidPath;type=text/plain"
    ) -ExpectedErrorCode "FILE_TYPE_NOT_ALLOWED" | Out-Null

    Write-Host "[LostCardDoc 6] Too large file fails..."
    Invoke-CurlMultipartExpectError -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Token $staffToken -FormParts @(
        "documentType=OTHER",
        "note=Too large file",
        "file=@$largePath;type=image/png"
    ) -ExpectedErrorCode "FILE_TOO_LARGE" | Out-Null

    Write-Host "[LostCardDoc 7] Duplicate CCCD_FRONT fails..."
    Invoke-CurlMultipartExpectError -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Token $staffToken -FormParts @(
        "documentType=CCCD_FRONT",
        "note=Duplicate front",
        "file=@$frontPath;type=image/png"
    ) -ExpectedErrorCode "LOST_CARD_DOCUMENT_TYPE_ALREADY_EXISTS" | Out-Null

    Write-Host "[LostCardDoc 8] Delete document as manager/admin..."
    $deleteResult = Invoke-ApiRequest -Method Delete -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents/$($frontUpload.data.id)" -Headers $managerHeaders
    Assert-Success -Response $deleteResult -Name "Delete document"

    Write-Host "[LostCardDoc 9] Deleted document no longer appears..."
    $afterDelete = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/lost-cards/$CaseId/documents" -Headers $staffHeaders
    Assert-Success -Response $afterDelete -Name "Get after delete"
    if (@($afterDelete.data | Where-Object { $_.id -eq $frontUpload.data.id }).Count -ne 0) {
        throw "Deleted document still appears in active list."
    }

    Write-Host "`n[SUCCESS] Lost card document tests completed successfully." -ForegroundColor Green
} finally {
    if (Test-Path -LiteralPath $tempDir) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
}
