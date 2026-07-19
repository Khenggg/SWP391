<#
.SYNOPSIS
    End-to-end test: Booking > Payment (manual) > Entry Flow (auto)

.DESCRIPTION
    This script automates the full parking flow:
      Step 1: Login as driver, admin, staff
      Step 2: Set pricing, find available slot, create reservation
      Step 3: Show checkout URL > YOU pay via PayOS Sandbox
      Step 4: Auto-poll until payment is confirmed (PAID)
      Step 5: Auto-run entry flow (staff login, verify, check-in)
      Step 6: Verify final DB state

.EXAMPLE
    .\e2e-booking-to-entry.ps1
    .\e2e-booking-to-entry.ps1 -PollIntervalSec 3 -PollTimeoutSec 120
#>
param(
    [string]$BaseUrl = "http://localhost:5000/api/core",
    [int]$PollIntervalSec = 5,
    [int]$PollTimeoutSec = 300,
    [int]$EntryGateId = 1,
    [string]$CardCode = "C010"
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
Write-Host "    E2E TEST: BOOKING -> PAYMENT -> ENTRY FLOW" -ForegroundColor Magenta
Write-Host "  ====================================================" -ForegroundColor Magenta
Write-Host "  Backend: $BaseUrl" -ForegroundColor DarkGray
Write-Host ""

# -- STEP 1: LOGIN --------------------------------------------
Write-StepHeader "1/6" "Logging in (driver01, admin01, staff01)"

$driverRes = Invoke-Api -Method Post -Uri "$BaseUrl/auth/login" -Body @{ username = "driver01"; password = "123456" }
$driverHeaders = @{ Authorization = "Bearer $($driverRes.data.accessToken)" }
Write-OK "driver01 logged in"

$adminRes = Invoke-Api -Method Post -Uri "$BaseUrl/auth/login" -Body @{ username = "admin01"; password = "123456" }
$adminHeaders = @{ Authorization = "Bearer $($adminRes.data.accessToken)" }
Write-OK "admin01 logged in"

$staffRes = Invoke-Api -Method Post -Uri "$BaseUrl/auth/login" -Body @{ username = "staff01"; password = "123456" }
$staffHeaders = @{ Authorization = "Bearer $($staffRes.data.accessToken)" }
Write-OK "staff01 logged in"

# -- STEP 2: SETUP & CREATE RESERVATION -----------------------
Write-StepHeader "2/6" "Setting pricing & creating reservation"

try {
    Invoke-Api -Method Put -Uri "$BaseUrl/pricing-rules/5" -Headers $adminHeaders -Body @{ reservationHourlyPrice = 10000 } | Out-Null
    Write-OK "Pricing rule: Car = 10,000 VND/hour"
} catch {
    Write-Wrn "Could not update pricing (may already be set). Continuing..."
}

$locsRes = Invoke-Api -Uri "$BaseUrl/reservations/available-locations?vehicleTypeId=5" -Headers $driverHeaders
$availableSlots = $locsRes.data.availableSlots

if (-not $availableSlots -or $availableSlots.Count -eq 0) {
    Write-Err "No available slots for Car. Aborting."
    exit 1
}

$slot = $availableSlots[0]
Write-Inf "Slot: $($slot.slotCode) (Floor: $($slot.floorId), Area: $($slot.areaId))"

$randomPlate = "29A-$(Get-Random -Minimum 10000 -Maximum 99999)"
Write-Inf "Plate: $randomPlate"

$bookingBody = @{
    vehicleId              = $null
    plateNumber            = $randomPlate
    vehicleTypeId          = 5
    floorId                = $slot.floorId
    areaId                 = $slot.areaId
    slotId                 = $slot.slotId
    reservedDurationMinutes = 60
}

$bookingRes = Invoke-Api -Method Post -Uri "$BaseUrl/reservations" -Headers $driverHeaders -Body $bookingBody

$reservation = $bookingRes.data.reservation
$paymentData = $bookingRes.data.payment

$resId       = $reservation.id
$resCode     = $reservation.reservationCode
$orderCode   = $paymentData.orderCode
$checkoutUrl = $paymentData.checkoutUrl
$amount      = $paymentData.amount
$slotId      = $slot.slotId

Write-OK "Reservation created!"
Write-Host ""
Write-Host "    +-------------------------------------------+" -ForegroundColor DarkGray
Write-Host "    |  Reservation : $resCode" -ForegroundColor White
Write-Host "    |  Order Code  : $orderCode" -ForegroundColor White
Write-Host "    |  Amount      : $amount VND" -ForegroundColor White
Write-Host "    |  Slot        : $($slot.slotCode)" -ForegroundColor White
Write-Host "    |  Plate       : $randomPlate" -ForegroundColor White
Write-Host "    +-------------------------------------------+" -ForegroundColor DarkGray

# -- STEP 3: MANUAL PAYMENT -----------------------------------
Write-StepHeader "3/6" "THANH TOAN THU CONG (Manual Payment)"

Write-Host ""
Write-Host "    ================================================" -ForegroundColor Yellow
Write-Host "    MO LINK BEN DUOI VA THANH TOAN TREN PAYOS" -ForegroundColor Yellow
Write-Host "    ================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "    >> $checkoutUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Nhan 'Gia lap thanh toan thanh cong' tren trang PayOS Sandbox." -ForegroundColor Yellow
Write-Host "    Script se tu dong kiem tra trang thai thanh toan..." -ForegroundColor Gray
Write-Host ""

# Open checkout URL in default browser
try { Start-Process $checkoutUrl } catch {}

# -- STEP 4: POLL PAYMENT STATUS ------------------------------
Write-StepHeader "4/6" "Cho xac nhan thanh toan (polling every ${PollIntervalSec}s, timeout ${PollTimeoutSec}s)"

$elapsed = 0
$confirmed = $false

while ($elapsed -lt $PollTimeoutSec) {
    Start-Sleep -Seconds $PollIntervalSec
    $elapsed += $PollIntervalSec

    try {
        $statusRes = Invoke-Api -Uri "$BaseUrl/reservations/$resId/payment-status" -Headers $driverHeaders
        $paymentStatus     = $statusRes.data.paymentStatus
        $reservationStatus = $statusRes.data.reservationStatus

        $mins = [int][math]::Floor($elapsed / 60)
        $secs = [int]($elapsed % 60)
        $timeStr = "$($mins.ToString('00')):$($secs.ToString('00'))"

        if ($paymentStatus -eq "PAID" -and $reservationStatus -eq "CONFIRMED") {
            Write-Host ""
            Write-OK "Thanh toan da xac nhan! (sau $timeStr)"
            Write-Inf "Payment: $paymentStatus | Reservation: $reservationStatus"
            $confirmed = $true
            break
        } else {
            Write-Host "    ... [$timeStr] Payment=$paymentStatus, Reservation=$reservationStatus" -ForegroundColor DarkGray
        }
    } catch {
        Write-Wrn "Poll error (will retry): $_"
    }
}

if (-not $confirmed) {
    Write-Err "Timeout! Thanh toan chua duoc xac nhan sau ${PollTimeoutSec}s."
    Write-Err "Kiem tra lai: da thanh toan tren PayOS? Webhook da cau hinh dung?"
    exit 1
}

# -- STEP 5: ENTRY FLOW ---------------------------------------
Write-StepHeader "5/6" "Tu dong check-in xe vao bai (Entry Flow)"

# 5a. Verify reservation for entry
Write-Inf "Verifying reservation '$resCode' at Gate $EntryGateId..."
$checkRes = Invoke-Api -Uri "$BaseUrl/reservations/$resCode/entry-check?entryGateId=$EntryGateId" -Headers $staffHeaders

if (-not $checkRes.success) {
    Write-Err "Entry verification failed!"
    Write-Host ($checkRes | ConvertTo-Json -Depth 5)
    exit 1
}

$entryToken     = $checkRes.data.reservationEntryToken
$reservedSlotId = $checkRes.data.reservedSlotId
$reservedAreaId = $checkRes.data.reservedAreaId
Write-OK "Verification passed. Entry token acquired."

# 5b. Auto-find an available card
Write-Inf "Finding an available parking card..."
$availCards = Invoke-Api -Uri "$BaseUrl/cards/available" -Headers $adminHeaders
$foundCard = $null

foreach ($c in $availCards.data) {
    $code = $c.cardNumber
    try {
        $cardCheck = Invoke-Api -Uri "$BaseUrl/cards/$code/entry-check?entryGateId=$EntryGateId" -Headers $staffHeaders
        if ($cardCheck.success -and $cardCheck.data.entryCardType -eq "NORMAL") {
            $foundCard = $code
            Write-OK "Found available card: $foundCard"
            break
        }
    } catch {
        # Card not usable (monthly-bound, etc.), try next
    }
}

if (-not $foundCard) {
    Write-Err "No usable parking card found! All cards are IN_USE or monthly-bound."
    exit 1
}

# 5c. Perform check-in
Write-Inf "Checking in with Card=$foundCard, Plate=$randomPlate..."
$entryBody = @{
    entryMode              = "RESERVATION"
    reservationId          = $resId
    reservationEntryToken  = $entryToken
    cardCode               = $foundCard
    licensePlate           = $randomPlate
    noPlate                = $false
    vehicleTypeId          = 5
    entryGateId            = $EntryGateId
    selectedAreaId         = $reservedAreaId
    selectedSlotId         = $reservedSlotId
}

$entryRes = Invoke-Api -Method Post -Uri "$BaseUrl/parking-sessions/entry" -Headers $staffHeaders -Body $entryBody

if (-not $entryRes.success) {
    Write-Err "Check-in failed!"
    Write-Host ($entryRes | ConvertTo-Json -Depth 5)
    exit 1
}

Write-OK "Xe da vao bai thanh cong!"

# -- STEP 6: VERIFY FINAL STATE -------------------------------
Write-StepHeader "6/6" "Kiem tra trang thai cuoi cung"

$finalStatus = Invoke-Api -Uri "$BaseUrl/reservations/$resId/payment-status" -Headers $driverHeaders
$finalResStatus = $finalStatus.data.reservationStatus
$finalPayStatus = $finalStatus.data.paymentStatus

# Check slot status
$slotsRes = Invoke-Api -Uri "$BaseUrl/slots" -Headers $adminHeaders
$targetSlot = $slotsRes.data | Where-Object { $_.id -eq $slotId }

Write-Host ""
Write-Host "    +------------- KET QUA -------------------+" -ForegroundColor DarkGray

$resColor = if ($finalResStatus -in @("COMPLETED", "CHECKED_IN", "IN_USE")) { "Green" } else { "Yellow" }
Write-Host "    |  Reservation : $finalResStatus" -ForegroundColor $resColor

$payColor = if ($finalPayStatus -eq "PAID") { "Green" } else { "Yellow" }
Write-Host "    |  Payment     : $finalPayStatus" -ForegroundColor $payColor

if ($targetSlot) {
    $slotColor = if ($targetSlot.status -eq "OCCUPIED") { "Green" } else { "Yellow" }
    Write-Host "    |  Slot $($targetSlot.slotCode)   : $($targetSlot.status)" -ForegroundColor $slotColor
} else {
    Write-Host "    |  Slot        : (could not retrieve)" -ForegroundColor Yellow
}

Write-Host "    +------------------------------------------+" -ForegroundColor DarkGray

Write-Host ""
Write-Host "  ====================================================" -ForegroundColor Green
Write-Host "    E2E TEST HOAN TAT!" -ForegroundColor Green
Write-Host "  ====================================================" -ForegroundColor Green
Write-Host ""
