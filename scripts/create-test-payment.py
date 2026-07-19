import requests
import json
import sys

base_url = "http://localhost:5000/api/core"
print("==================================================")
print("     CREATING TEST BOOKING & PAYMENT LINK (PYTHON)")
print("==================================================")

try:
    # 1. Login driver
    res = requests.post(f"{base_url}/auth/login", json={"username": "driver01", "password": "123456"})
    if res.status_code != 200:
        print(f"Driver login failed. Status code: {res.status_code}, Response: {res.text}")
        sys.exit(1)
        
    token = res.json()["data"]["accessToken"]
    driver_headers = {"Authorization": f"Bearer {token}"}
    print("Driver login successful.")

    # 2. Login admin
    res = requests.post(f"{base_url}/auth/login", json={"username": "admin01", "password": "123456"})
    if res.status_code == 200:
        admin_token = res.json()["data"]["accessToken"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}
        print("Admin login successful.")
        
        # 3. Ensure pricing
        try:
            p_res = requests.put(f"{base_url}/pricing-rules/5", headers=admin_headers, json={"reservationHourlyPrice": 10000})
            if p_res.status_code == 200:
                print("Pricing rule updated: Hourly Reservation Price = 10,000 VND.")
            else:
                print(f"Warning: Pricing rule update returned status {p_res.status_code}")
        except Exception as ex:
            print("Warning: Could not update pricing rule:", ex)
    else:
        print("Warning: Admin login failed. Proceeding with driver authorization only.")

    # 4. Find available slot
    res_locs = requests.get(f"{base_url}/reservations/available-locations?vehicleTypeId=5", headers=driver_headers).json()
    slots = res_locs.get("data", {}).get("availableSlots", [])
    if not slots:
        print("Error: No available slots found for Cars in the database.")
        sys.exit(1)

    slot = slots[0]
    print(f"Selected Slot ID: {slot['slotId']} (Code: {slot['slotCode']}, Floor: {slot['floorId']}, Area: {slot['areaId']})")

    # 5. Create reservation
    import random
    random_plate = f"29A-{random.randint(10000, 99999)}"
    print(f"Using random plate number for booking: {random_plate}")
    
    body = {
        "vehicleId": None,
        "plateNumber": random_plate,
        "vehicleTypeId": 5,
        "floorId": slot["floorId"],
        "areaId": slot["areaId"],
        "slotId": slot["slotId"],
        "reservedDurationMinutes": 60
    }

    res_booking = requests.post(f"{base_url}/reservations", headers=driver_headers, json=body)
    booking_data = res_booking.json()
    print("Reservation Response JSON:", json.dumps(booking_data, indent=2))

    if not booking_data.get("success") or not booking_data.get("data"):
        print("Failed to create reservation. Response:", json.dumps(booking_data, indent=2))
        sys.exit(1)

    reservation_info = booking_data["data"]["reservation"]
    payment_info = booking_data["data"]["payment"]
    
    res_code = reservation_info["reservationCode"]
    order_code = payment_info["orderCode"]
    checkout_url = payment_info["checkoutUrl"]
    amount = payment_info["amount"]

    print("--------------------------------------------------")
    print(f"Reservation Code : {res_code}")
    print(f"Order Code       : {order_code}")
    print(f"Amount           : {amount} VND")
    print(f"Checkout URL     : {checkout_url}")
    print("--------------------------------------------------")
    print("\n[ACTION REQUIRED]")
    print("1. Click on the Checkout URL to open the PayOS Checkout page.")
    print("2. Click 'Simulate Success' on the PayOS page to trigger success.")
    print("3. After paying, return to chat and tell me to check the status!")
    print("==================================================")

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
