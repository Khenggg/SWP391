param (
    [string]$BaseUrl = "http://localhost:5000",
    [string]$StatePath = ".\.ai\real-booking-entry-state.json",
    [string]$Username = "driver01",
    [string]$Password = "123456",
    [string]$AdminUsername = "admin01",
    [string]$AdminPassword = "123456",
    [string]$StaffUsername = "staff01",
    [string]$StaffPassword = "123456",
    [int]$VehicleTypeId = 5,
    [int]$EntryGateId = 1,
    [int]$ReservationHourlyPrice = 10000,
    [int]$ReservedDurationMinutes = 60,
    [int]$PollSeconds = 600,
    [int]$PollIntervalSeconds = 5,
    [string]$PlateNumber,
    [string]$ImagePath = ".\image\oto.jpg",
    [switch]$CreateOnly,
    [switch]$CompleteOnly,
    [switch]$AllowReset
)

$ErrorActionPreference = "Stop"

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Uri,
        [object]$Headers = @{},
        [string]$Body,
        [string]$ContentType = "application/json"
    )

    $params = @{
        Method = $Method
        Uri = $Uri
        Headers = $Headers
    }
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = $ContentType
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
        throw "API Error status=$statusCode uri=$Uri body=$errBody"
    }
}

function Assert-Success {
    param($Response, [string]$Name)

    if ($null -eq $Response) { throw "$Name returned null." }
    if ($Response.success -ne $true) {
        throw "$Name expected success=true. Body: $($Response | ConvertTo-Json -Depth 20)"
    }
}

function Save-State {
    param($State)

    $dir = Split-Path -Parent $StatePath
    if (-not [string]::IsNullOrWhiteSpace($dir) -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }

    $State | ConvertTo-Json -Depth 20 | Set-Content -Path $StatePath -Encoding UTF8
}

function Get-AuthContext {
    $adminLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = $AdminUsername; password = $AdminPassword } | ConvertTo-Json)
    Assert-Success -Response $adminLogin -Name "admin login"

    $driverLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = $Username; password = $Password } | ConvertTo-Json)
    Assert-Success -Response $driverLogin -Name "driver login"

    $staffLogin = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/auth/login" -Body (@{ username = $StaffUsername; password = $StaffPassword } | ConvertTo-Json)
    Assert-Success -Response $staffLogin -Name "staff login"

    return @{
        AdminHeaders = @{ Authorization = "Bearer $($adminLogin.data.accessToken)" }
        DriverHeaders = @{ Authorization = "Bearer $($driverLogin.data.accessToken)" }
        StaffHeaders = @{ Authorization = "Bearer $($staffLogin.data.accessToken)" }
    }
}

function New-PlateNumber {
    return "51A-BK-" + (Get-Random -Minimum 10000 -Maximum 99999)
}

function Get-ImageUri {
    $resolved = Resolve-Path -Path $ImagePath
    return ([Uri]$resolved.Path).AbsoluteUri
}

function Select-AvailableCard {
    param($AdminHeaders)

    $cards = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/cards" -Headers $AdminHeaders
    Assert-Success -Response $cards -Name "cards"

    $card = @($cards.data) | Where-Object { $_.status -eq "AVAILABLE" } | Select-Object -First 1
    if (-not $card) {
        throw "No AVAILABLE card found for entry."
    }

    return $card.cardNumber
}

function New-Reservation {
    param($Context)

    if ($AllowReset) {
        $reset = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/health/clear-reservations" -Headers $Context.AdminHeaders
        Assert-Success -Response $reset -Name "clear reservations"
    }

    $pricingRules = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/pricing-rules" -Headers $Context.AdminHeaders
    Assert-Success -Response $pricingRules -Name "pricing rules"
    $rule = @($pricingRules.data) | Where-Object { $_.vehicleTypeId -eq $VehicleTypeId -and $_.status -eq "ACTIVE" } | Select-Object -First 1
    if (-not $rule) {
        throw "Active pricing rule for vehicleTypeId=$VehicleTypeId not found."
    }

    $price = Invoke-ApiRequest -Method Patch -Uri "$BaseUrl/api/core/pricing-rules/$($rule.id)/reservation-hourly-price" -Headers $Context.AdminHeaders -Body (@{ reservationHourlyPrice = $ReservationHourlyPrice } | ConvertTo-Json)
    Assert-Success -Response $price -Name "update reservation hourly price"

    $locations = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/available-locations?vehicleTypeId=$VehicleTypeId" -Headers $Context.DriverHeaders
    Assert-Success -Response $locations -Name "available locations"

    $floorId = $null
    $areaId = $null
    $slotId = $null
    if (@($locations.data.availableSlots).Count -gt 0) {
        $slot = $locations.data.availableSlots[0]
        $floorId = $slot.floorId
        $areaId = $slot.areaId
        $slotId = $slot.slotId
    } elseif (@($locations.data.availableAreas).Count -gt 0) {
        $area = $locations.data.availableAreas[0]
        $floorId = $area.floorId
        $areaId = $area.areaId
        $slotId = $null
    } else {
        throw "No available location found for vehicleTypeId=$VehicleTypeId."
    }

    $plate = if ([string]::IsNullOrWhiteSpace($PlateNumber)) { New-PlateNumber } else { $PlateNumber }
    $body = @{
        vehicleId = $null
        plateNumber = $plate
        vehicleTypeId = $VehicleTypeId
        floorId = $floorId
        areaId = $areaId
        slotId = $slotId
        reservedDurationMinutes = $ReservedDurationMinutes
    } | ConvertTo-Json

    $reservation = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/reservations" -Headers $Context.DriverHeaders -Body $body
    Assert-Success -Response $reservation -Name "create reservation"

    $expectedAmount = ($ReservedDurationMinutes / 60) * $ReservationHourlyPrice
    if ([decimal]$reservation.data.reservation.bookingAmount -ne [decimal]$expectedAmount) {
        throw "Expected bookingAmount=$expectedAmount but got $($reservation.data.reservation.bookingAmount)."
    }

    if ($reservation.data.reservation.paymentStatus -ne "PENDING") {
        throw "Expected reservation paymentStatus=PENDING but got $($reservation.data.reservation.paymentStatus)."
    }

    if ($null -eq $reservation.data.payment -or [string]::IsNullOrWhiteSpace($reservation.data.payment.checkoutUrl)) {
        throw "Reservation did not return payment.checkoutUrl."
    }

    $state = [ordered]@{
        baseUrl = $BaseUrl
        vehicleTypeId = $VehicleTypeId
        entryGateId = $EntryGateId
        plateNumber = $plate
        imageUrl = Get-ImageUri
        reservationId = $reservation.data.reservation.id
        reservationCode = $reservation.data.reservation.reservationCode
        reservationExpiresAt = $reservation.data.reservation.expiresAt
        bookingAmount = $reservation.data.reservation.bookingAmount
        paymentId = $reservation.data.payment.paymentId
        orderCode = $reservation.data.payment.orderCode
        paymentLinkId = $reservation.data.payment.paymentLinkId
        checkoutUrl = $reservation.data.payment.checkoutUrl
        floorId = $floorId
        areaId = $areaId
        slotId = $slotId
        createdAt = (Get-Date).ToString("o")
    }
    Save-State -State $state

    Write-Host ""
    Write-Host "[CREATED] ReservationCode: $($state.reservationCode)" -ForegroundColor Green
    Write-Host "[CREATED] ReservationId: $($state.reservationId)" -ForegroundColor Green
    Write-Host "[CREATED] Plate: $($state.plateNumber)" -ForegroundColor Green
    Write-Host "[CREATED] Amount: $($state.bookingAmount) VND" -ForegroundColor Green
    Write-Host "[CREATED] State: $StatePath" -ForegroundColor Green
    Write-Host "[PAY NOW] Checkout URL:" -ForegroundColor Cyan
    Write-Host $state.checkoutUrl -ForegroundColor White
    Write-Host ""
}

function Complete-ReservationEntry {
    param($Context)

    if (-not (Test-Path $StatePath)) {
        throw "State file not found: $StatePath"
    }

    $state = Get-Content -Path $StatePath -Raw | ConvertFrom-Json
    $deadline = (Get-Date).AddSeconds($PollSeconds)
    $latestStatus = $null

    while ((Get-Date) -lt $deadline) {
        $latestStatus = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($state.reservationId)/payment-status" -Headers $Context.DriverHeaders
        Assert-Success -Response $latestStatus -Name "payment status"

        Write-Host "payment=$($latestStatus.data.paymentStatus) reservation=$($latestStatus.data.reservationStatus) remainingSeconds=$($latestStatus.data.remainingSeconds)"

        if ($latestStatus.data.paymentStatus -eq "PAID" -and $latestStatus.data.reservationStatus -eq "CONFIRMED") {
            break
        }

        Start-Sleep -Seconds $PollIntervalSeconds
    }

    if ($latestStatus.data.paymentStatus -ne "PAID" -or $latestStatus.data.reservationStatus -ne "CONFIRMED") {
        throw "Payment was not confirmed within $PollSeconds seconds. Check payOS webhook public URL and dashboard webhook setting."
    }

    $entryCheck = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/reservations/$($state.reservationCode)/entry-check?entryGateId=$($state.entryGateId)" -Headers $Context.StaffHeaders
    Assert-Success -Response $entryCheck -Name "entry check"
    if ($entryCheck.data.status -ne "VALID" -or [string]::IsNullOrWhiteSpace($entryCheck.data.reservationEntryToken)) {
        throw "Expected entry-check VALID with token but got status=$($entryCheck.data.status)."
    }

    $cardCode = Select-AvailableCard -AdminHeaders $Context.AdminHeaders
    $entryBody = @{
        entryMode = "RESERVATION"
        reservationId = $state.reservationId
        reservationEntryToken = $entryCheck.data.reservationEntryToken
        cardCode = $cardCode
        licensePlate = $state.plateNumber
        noPlate = $false
        vehicleTypeId = $state.vehicleTypeId
        entryGateId = $state.entryGateId
        selectedAreaId = $state.areaId
        selectedSlotId = $state.slotId
        entryPlateImageUrl = $state.imageUrl
        entryVehicleImageUrl = $state.imageUrl
        detectedPlateNumber = $state.plateNumber
        detectedNormalizedPlateNumber = ($state.plateNumber -replace '[^A-Za-z0-9]', '').ToUpperInvariant()
        ocrConfidence = 0.95
    } | ConvertTo-Json

    $entry = Invoke-ApiRequest -Method Post -Uri "$BaseUrl/api/core/parking-sessions/entry" -Headers $Context.StaffHeaders -Body $entryBody
    Assert-Success -Response $entry -Name "reservation entry"

    if ($entry.data.customerType -ne "CASUAL" -or $entry.data.paymentRequired -ne $true -or $entry.data.paymentStatus -ne "PENDING") {
        throw "Expected reservation entry session CASUAL/PENDING/paymentRequired=true."
    }

    $billableStartTime = [DateTimeOffset]::Parse($entry.data.billableStartTime).ToUniversalTime()
    $reservationExpiresAt = [DateTimeOffset]::Parse($state.reservationExpiresAt).ToUniversalTime()
    if ([Math]::Abs(($billableStartTime - $reservationExpiresAt).TotalSeconds) -gt 1) {
        throw "Expected billableStartTime to equal reservation expiresAt."
    }

    $dump = Invoke-ApiRequest -Method Get -Uri "$BaseUrl/api/core/health/dump-session/$($entry.data.sessionId)" -Headers $Context.AdminHeaders
    Assert-Success -Response $dump -Name "dump session"

    if ($dump.data.reservationStatus -ne "COMPLETED") {
        throw "Expected reservationStatus=COMPLETED but got $($dump.data.reservationStatus)."
    }

    $images = @($dump.data.images)
    if ($images.Count -ne 2) {
        throw "Expected 2 session images but got $($images.Count)."
    }

    $imageTypes = @($images | ForEach-Object { $_.imageType })
    if (-not ($imageTypes -contains "ENTRY_PLATE") -or -not ($imageTypes -contains "ENTRY_VEHICLE")) {
        throw "Expected ENTRY_PLATE and ENTRY_VEHICLE images."
    }

    $state | Add-Member -MemberType NoteProperty -Name "sessionId" -Value $entry.data.sessionId -Force
    $state | Add-Member -MemberType NoteProperty -Name "sessionCode" -Value $entry.data.sessionCode -Force
    $state | Add-Member -MemberType NoteProperty -Name "cardCode" -Value $cardCode -Force
    $state | Add-Member -MemberType NoteProperty -Name "completedAt" -Value (Get-Date).ToString("o") -Force
    Save-State -State $state

    Write-Host ""
    Write-Host "[DONE] Payment confirmed, reservation checked in, session/images verified." -ForegroundColor Green
    Write-Host "SessionId: $($entry.data.sessionId)" -ForegroundColor Green
    Write-Host "SessionCode: $($entry.data.sessionCode)" -ForegroundColor Green
    Write-Host "CardCode: $cardCode" -ForegroundColor Green
    Write-Host "BillableStartTime: $($entry.data.billableStartTime)" -ForegroundColor Green
    Write-Host "Images: $($images.Count)" -ForegroundColor Green
}

$context = Get-AuthContext

if ($CompleteOnly) {
    Complete-ReservationEntry -Context $context
} else {
    New-Reservation -Context $context
    if (-not $CreateOnly) {
        Complete-ReservationEntry -Context $context
    }
}
