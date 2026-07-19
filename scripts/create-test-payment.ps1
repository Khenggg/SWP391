$baseUrl = "http://localhost:5000/api/core"

Write-Host "==================================================" -ForegroundColor Green
Write-Host "     CREATING TEST BOOKING & PAYMENT LINK"
Write-Host "==================================================" -ForegroundColor Green

# 1. Log in as driver01
Write-Host "Logging in as driver01..." -ForegroundColor Cyan
$driverHeaders = @{}
try {
    $driverBody = @{ username = "driver01"; password = "123456" } | ConvertTo-Json
    $driverRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $driverBody
    $driverHeaders = @{ Authorization = "Bearer $($driverRes.data.accessToken)" }
    Write-Host "Login successful. Token acquired." -ForegroundColor Gray
} catch {
    Write-Error "Failed to login. Ensure backend is running on port 5000. Error: $_"
    exit 1
}

# 2. Log in as admin01 to manage settings and fetch slots
Write-Host "Logging in as admin01..." -ForegroundColor Cyan
$adminHeaders = @{}
try {
    $adminBody = @{ username = "admin01"; password = "123456" } | ConvertTo-Json
    $adminRes = Invoke-RestMethod -Method Post -Uri "$baseUrl/auth/login" -ContentType "application/json" -Body $adminBody
    $adminHeaders = @{ Authorization = "Bearer $($adminRes.data.accessToken)" }
    Write-Host "Login successful. Token acquired." -ForegroundColor Gray
} catch {
    Write-Error "Failed to login as admin01. Error: $_"
    exit 1
}

# 3. Make sure pricing rule has hourly price > 0 so that it generates a payment
Write-Host "Ensuring pricing hourly price is active (> 0)..." -ForegroundColor Cyan
try {
    # Update Car (type 5) reservation hourly price to 10000 VND
    $pricingRes = Invoke-RestMethod -Uri "$baseUrl/pricing-rules/5" -Method Put -Headers $adminHeaders -ContentType "application/json" -Body (@{ reservationHourlyPrice = 10000 } | ConvertTo-Json)
    Write-Host "Pricing rule updated: Hourly Reservation Price = 10,000 VND." -ForegroundColor Gray
} catch {
    Write-Host "Warning: Could not set pricing rule. Proceeding with existing pricing settings. Error: $_" -ForegroundColor Yellow
}

# 4. Find an available slot for Car using the available-locations endpoint
Write-Host "Finding an available slot for Car..." -ForegroundColor Cyan
$availableSlot = $null
try {
    # Retrieve available locations for Car (vehicleTypeId = 5)
    $locsResponse = Invoke-RestMethod -Uri "$baseUrl/reservations/available-locations?vehicleTypeId=5" -Method Get -Headers $driverHeaders
    $availableSlots = $locsResponse.data.availableSlots
    
    if (-not $availableSlots) {
        Write-Error "No AVAILABLE slots found for Car (VehicleTypeId = 5) in the database."
        exit 1
    }
    
    # Select the first available slot
    $availableSlot = $availableSlots[0]
    Write-Host "Selected Slot ID: $($availableSlot.slotId) (Code: $($availableSlot.slotCode), Floor: $($availableSlot.floorId), Area: $($availableSlot.areaId))" -ForegroundColor Green
} catch {
    Write-Error "Failed to fetch available locations. Error: $_"
    exit 1
}

# 5. Create a reservation for the selected slot
Write-Host "Creating reservation for Car..." -ForegroundColor Cyan
try {
    $body = @{
        vehicleId = $null
        plateNumber = "29A-12345"
        vehicleTypeId = 5 # Car
        floorId = $availableSlot.floorId
        areaId = $availableSlot.areaId
        slotId = $availableSlot.slotId
        reservedDurationMinutes = 60
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Uri "$baseUrl/reservations" -Method Post -Headers $driverHeaders -ContentType "application/json" -Body $body
    
    # The response will contain the payment link
    $resId = $res.data.id
    $resCode = $res.data.reservationCode
    
    # Get status and checkout url
    $statusRes = Invoke-RestMethod -Uri "$baseUrl/reservations/$resId/payment-status" -Method Get -Headers $driverHeaders
    
    $checkoutUrl = $statusRes.data.checkoutUrl
    $orderCode = $statusRes.data.paymentId + 900000000000
    
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    Write-Host "Reservation Code : $resCode" -ForegroundColor Green
    Write-Host "Order Code       : $orderCode" -ForegroundColor Green
    Write-Host "Amount           : $($statusRes.data.bookingAmount) VND" -ForegroundColor Green
    Write-Host "Checkout URL     : $checkoutUrl" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------" -ForegroundColor Gray
    
    Write-Host "`n[ACTION REQUIRED]" -ForegroundColor Yellow
    Write-Host "1. Click on the Checkout URL to open the PayOS Checkout page." -ForegroundColor Yellow
    Write-Host "2. Click 'Simulate Success' (Giả lập thanh toán thành công) on the PayOS page." -ForegroundColor Yellow
    Write-Host "3. After paying, return here and tell me to check the database status!" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Green

} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errText = $reader.ReadToEnd()
    Write-Error "Failed to create reservation. Error details: $errText"
}
