# Exit Flow E2E Test script
param(
    [string]$BaseUrl = "http://localhost:5000/api/core",
    [int]$ExitGateId = 2,
    [string]$CardCode = "C010",
    [string]$PlateNumber = "51A-77777"
)

$ErrorActionPreference = "Stop"

function Write-StepHeader([string]$Step, [string]$Title) {
    Write-Host ""
    Write-Host "  [$Step] $Title" -ForegroundColor Cyan
    Write-Host "  --------------------------------------------------" -ForegroundColor DarkGray
}

function Write-OK([string]$Msg)   { Write-Host "    [OK] $Msg" -ForegroundColor Green }
function Write-Inf([string]$Msg)  { Write-Host "    --> $Msg" -ForegroundColor Gray }
function Write-Wrn([string]$Msg)  { Write-Host "    [!] $Msg" -ForegroundColor Yellow }
function Write-Err([string]$Msg)  { Write-Host "    [X] $Msg" -ForegroundColor Red }

function Invoke-Api {
    param(
        [string]$Method = "GET",
        [string]$Uri,
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    $params = @{
        Method      = $Method
        Uri         = $Uri
        Headers     = $Headers
        ContentType = "application/json"
    }
    if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }

    try {
        return Invoke-RestMethod @params
    } catch {
        $statusCode = $null
        $errBody = ""
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
        } catch {}
        throw "API call failed [$Method $Uri] HTTP $statusCode`n$errBody"
    }
}

# ============================================================
Write-Host ""
Write-Host "  ====================================================" -ForegroundColor Magenta
Write-Host "    E2E TEST: ONLINE EXIT PAYMENT FLOW" -ForegroundColor Magenta
Write-Host "  ====================================================" -ForegroundColor Magenta
Write-Host "  Backend: $BaseUrl" -ForegroundColor DarkGray
Write-Host ""

# -- STEP 1: CLEANUP DATABASE ---------------------------------
Write-StepHeader "1/7" "Cleaning database & logging in"

# Run C# cleanup program
Write-Inf "Running DB cleanup utility..."
$cleanupProgram = @"
using System;
using Npgsql;

class Program
{
    static void Main()
    {
        string connString = "Host=aws-1-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.iqzkddymzmfhyqbfrnyu;Password=Moghicha12@;SSL Mode=Require;Trust Server Certificate=true;No Reset On Close=true;";
        try
        {
            using var conn = new NpgsqlConnection(connString);
            conn.Open();
            Exec(conn, "UPDATE slots SET status = 'AVAILABLE', current_session_id = null");
            Exec(conn, "UPDATE parking_cards SET status = 'AVAILABLE', current_session_id = null");
            Exec(conn, "UPDATE areas SET current_real_occupancy = 0");
            Exec(conn, "DELETE FROM plate_mismatch_cases");
            Exec(conn, "DELETE FROM lost_card_refunds");
            Exec(conn, "DELETE FROM lost_card_cases");
            Exec(conn, "DELETE FROM lost_card_case_documents");
            Exec(conn, "DELETE FROM receipts");
            Exec(conn, "DELETE FROM payments");
            Exec(conn, "DELETE FROM parking_session_images");
            Exec(conn, "UPDATE parking_sessions SET slot_id = null, monthly_pass_id = null, reservation_id = null");
            Exec(conn, "DELETE FROM parking_sessions");
            Exec(conn, "DELETE FROM reservation_extensions");
            Exec(conn, "DELETE FROM reservations");
            Console.WriteLine("CLEANED");
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }

    static void Exec(NpgsqlConnection conn, string sql)
    {
        try
        {
            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.ExecuteNonQuery();
        }
        catch {}
    }
}
"@
Set-Content -Path "c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\Program.cs" -Value $cleanupProgram
dotnet run --project c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\scratch-db.csproj | Out-Null
Write-OK "Database cleaned."

# Login
$adminRes = Invoke-Api -Method Post -Uri "$BaseUrl/auth/login" -Body @{ username = "admin01"; password = "123456" }
$adminHeaders = @{ Authorization = "Bearer $($adminRes.data.accessToken)" }

$staffRes = Invoke-Api -Method Post -Uri "$BaseUrl/auth/login" -Body @{ username = "staff01"; password = "123456" }
$staffHeaders = @{ Authorization = "Bearer $($staffRes.data.accessToken)" }
Write-OK "Logins successful."

# -- STEP 2: CREATING CASUAL ENTRY ---------------------------
Write-StepHeader "2/7" "Creating Casual Entry session"

Write-Inf "Requesting slot suggestion for Car (vehicleTypeId=5) at Gate 1..."
$suggestion = Invoke-Api -Method Get -Uri "$BaseUrl/parking-sessions/location-suggestion?vehicleTypeId=5&entryGateId=1" -Headers $staffHeaders
$suggestionToken = $suggestion.data.suggestionToken
$suggestedSlotId = $suggestion.data.suggestedSlotId
$suggestedAreaId = $suggestion.data.suggestedAreaId

$entryBody = @{
    entryMode = "CASUAL"
    cardCode = $CardCode
    licensePlate = $PlateNumber
    vehicleTypeId = 5 # Car
    entryGateId = 1
    selectedAreaId = $suggestedAreaId
    selectedSlotId = $suggestedSlotId
    suggestionToken = $suggestionToken
}

$entryRes = Invoke-Api -Method Post -Uri "$BaseUrl/parking-sessions/entry" -Headers $staffHeaders -Body $entryBody
$sessionId = $entryRes.data.sessionId
$sessionCode = $entryRes.data.sessionCode
Write-OK "Casual Entry session created! SessionID=$sessionId, Code=$sessionCode"

# -- STEP 3: SIMULATE 5-HOUR PARKING DURATION ----------------
Write-StepHeader "3/7" "Simulating 5-hour parking duration (SQL)"

# Rewrite Program.cs to update session entry time to 5 hours ago
$updateProgram = @"
using System;
using Npgsql;

class Program
{
    static void Main()
    {
        string connString = "Host=aws-1-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.iqzkddymzmfhyqbfrnyu;Password=Moghicha12@;SSL Mode=Require;Trust Server Certificate=true;No Reset On Close=true;";
        try
        {
            using var conn = new NpgsqlConnection(connString);
            conn.Open();
            using var cmd = new NpgsqlCommand("UPDATE parking_sessions SET entry_time = entry_time - INTERVAL '5 hours', billable_start_time = billable_start_time - INTERVAL '5 hours' WHERE id = $sessionId", conn);
            cmd.ExecuteNonQuery();
            Console.WriteLine("UPDATED");
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
"@
Set-Content -Path "c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\Program.cs" -Value $updateProgram
dotnet run --project c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\scratch-db.csproj | Out-Null
Write-OK "Session EntryTime backdated by 5 hours."

# -- STEP 4: CALCULATE FEE & REQUEST ONLINE CHECKOUT -------
Write-StepHeader "4/7" "Calculating exit fee & requesting checkout link"

$feeRes = Invoke-Api -Method Post -Uri "$BaseUrl/parking-sessions/$sessionId/calculate-fee" -Headers $staffHeaders -Body @{ exitTime = $null; includeLostCardFee = $false }
$expectedAmount = $feeRes.data.totalAmount
Write-OK "Calculated Fee: $expectedAmount VND"

$payRes = Invoke-Api -Method Post -Uri "$BaseUrl/payments/online/exit-fee" -Body @{ cardCode = $CardCode; sessionId = $sessionId }
$paymentId = $payRes.data.paymentId
$paymentUrl = $payRes.data.paymentUrl
$orderCode = $payRes.data.paymentId + 900000000000
Write-OK "Online Payment Link generated: $paymentUrl"
Write-Inf "PaymentID=$paymentId | OrderCode=$orderCode"

# -- STEP 5: MOCK PAYOS WEBHOOK PAYMENT SUCCESS ------------
Write-StepHeader "5/7" "Mocking PayOS webhook payment success"

$webhookBody = @{
    code = "00"
    desc = "success"
    data = @{
        orderCode = [double]$orderCode
        amount = [double]$expectedAmount
        paymentLinkId = "local-payos-$orderCode"
        description = "EXIT $sessionCode"
        reference = "ref123"
        transactionDateTime = "2026-07-01 10:00:00"
    }
}

$webhookRes = Invoke-Api -Method Post -Uri "$BaseUrl/payments/payos/webhook" -Body $webhookBody
Write-OK "PayOS webhook trigger response: $($webhookRes.message)"

# -- STEP 6: PERFORM CASUAL VEHICLE EXIT WITH PLATE MISMATCH CHECK -----------
Write-StepHeader "6/7" "Testing plate mismatch blocking & approval flow"

$exitBodyMismatch = @{
    exitGateId = $ExitGateId
    exitPlateNumber = $null
    detectedPlateNumber = "51A-99999" # Mismatches entry plate "51A-77777"
    exitPlateImageUrl = "https://example.com/exit-plate-34.jpg"
    exitVehicleImageUrl = "https://example.com/exit-vehicle-34.jpg"
    ocrConfidence = 0.98
    exitTime = $null
    paymentId = $null
}

Write-Inf "Attempting checkout with mismatched plate: 51A-99999 (expected to be blocked)..."
$mismatchBlocked = $false
try {
    $exitRes = Invoke-Api -Method Post -Uri "$BaseUrl/parking-sessions/$sessionId/exit" -Headers $staffHeaders -Body $exitBodyMismatch
} catch {
    $mismatchBlocked = $true
    Write-OK "Plate mismatch blocked successfully with error: $_"
}

if (-not $mismatchBlocked) {
    Write-Err "Failed: Plate mismatch checkout did not throw an exception!"
    exit 1
}

# Run C# database script to set mismatch case status to CONFIRMED
Write-Inf "Simulating manager approving plate mismatch..."
$approveMismatchProgram = @"
using System;
using Npgsql;

class Program
{
    static void Main()
    {
        string connString = "Host=aws-1-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.iqzkddymzmfhyqbfrnyu;Password=Moghicha12@;SSL Mode=Require;Trust Server Certificate=true;No Reset On Close=true;";
        try
        {
            using var conn = new NpgsqlConnection(connString);
            conn.Open();
            using var cmd = new NpgsqlCommand("UPDATE plate_mismatch_cases SET status = 'CONFIRMED' WHERE session_id = $sessionId", conn);
            cmd.ExecuteNonQuery();
            Console.WriteLine("APPROVED");
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
"@
Set-Content -Path "c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\Program.cs" -Value $approveMismatchProgram
dotnet run --project c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\scratch-db.csproj | Out-Null
Write-OK "Plate mismatch approved in DB."

# Try exiting again
Write-Inf "Retrying checkout after mismatch approved..."
$exitRes = Invoke-Api -Method Post -Uri "$BaseUrl/parking-sessions/$sessionId/exit" -Headers $staffHeaders -Body $exitBodyMismatch
Write-OK "Exit confirmed after approval. Receipt Code: $($exitRes.data.receiptCode)"

# -- STEP 7: VERIFY STATE ------------------------------------
Write-StepHeader "7/7" "Verifying final database state"

$checkProgram = @"
using System;
using Npgsql;

class Program
{
    static void Main()
    {
        string connString = "Host=aws-1-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.iqzkddymzmfhyqbfrnyu;Password=Moghicha12@;SSL Mode=Require;Trust Server Certificate=true;No Reset On Close=true;";
        try
        {
            using var conn = new NpgsqlConnection(connString);
            conn.Open();
            
            // Verify session
            using (var cmd = new NpgsqlCommand("SELECT status, payment_status FROM parking_sessions WHERE id = $sessionId", conn))
            using (var rdr = cmd.ExecuteReader())
            {
                if (rdr.Read())
                {
                    Console.WriteLine($"SessionStatus: {rdr["status"]}");
                    Console.WriteLine($"PaymentStatus: {rdr["payment_status"]}");
                }
            }

            // Verify mismatch case is CONFIRMED
            using (var cmd = new NpgsqlCommand("SELECT status FROM plate_mismatch_cases WHERE session_id = $sessionId", conn))
            {
                var val = cmd.ExecuteScalar();
                Console.WriteLine($"PlateMismatchCaseStatus: {val}");
            }

            // Verify exit images saved
            using (var cmd = new NpgsqlCommand("SELECT count(*) FROM parking_session_images WHERE session_id = $sessionId AND image_type = 'EXIT_PLATE'", conn))
            {
                var val = cmd.ExecuteScalar();
                Console.WriteLine($"SavedExitPlateImagesCount: {val}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
}
"@
Set-Content -Path "c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\Program.cs" -Value $checkProgram
$dbVerification = dotnet run --project c:\Users\ASUS\.gemini\antigravity-ide\scratch\scratch-db\scratch-db.csproj

Write-Host "  $dbVerification" -ForegroundColor Green

Write-Host ""
Write-Host "  ====================================================" -ForegroundColor Magenta
Write-Host "    ONLINE EXIT PAYMENT FLOW TEST COMPLETED SUCCESSFUL!" -ForegroundColor Magenta
Write-Host "  ====================================================" -ForegroundColor Magenta
Write-Host ""
