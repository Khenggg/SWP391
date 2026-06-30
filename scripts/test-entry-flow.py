import requests
import json
import sys

base_url = "http://localhost:5000/api/core"
reservation_code = "RES-20260630-3089FC"
reservation_id = 373
plate_number = "29A-62621"

print("==================================================")
print("          TESTING RESERVATION ENTRY FLOW")
print("==================================================")

try:
    # 1. Login as staff01
    print("1. Logging in as staff01...")
    res = requests.post(f"{base_url}/auth/login", json={"username": "staff01", "password": "123456"})
    if res.status_code != 200:
        print(f"Staff login failed: {res.text}")
        sys.exit(1)
    staff_token = res.json()["data"]["accessToken"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    print("Staff login successful.")

    # 2. Check reservation for entry (Verify Step)
    print(f"\n2. Verifying reservation '{reservation_code}' for entry at Gate 1...")
    res_check = requests.get(
        f"{base_url}/reservations/{reservation_code}/entry-check?entryGateId=1", 
        headers=staff_headers
    )
    
    check_data = res_check.json()
    print("Verification response:", json.dumps(check_data, indent=2))
    
    if not check_data.get("success"):
        print("Verification failed! Cannot proceed to entry.")
        sys.exit(1)
        
    entry_token = check_data["data"]["reservationEntryToken"]
    reserved_slot_id = check_data["data"]["reservedSlotId"]
    reserved_area_id = check_data["data"]["reservedAreaId"]
    
    print(f"Verification successful! One-time entry token acquired.")

    # 3. Confirm entry (Check-in Step)
    # Using cardCode C010 from seeded data
    card_code = "C010"
    print(f"\n3. Performing check-in with Card: {card_code}, Plate: {plate_number}...")
    
    body = {
        "entryMode": "RESERVATION",
        "reservationId": reservation_id,
        "reservationEntryToken": entry_token,
        "cardCode": card_code,
        "licensePlate": plate_number,
        "noPlate": False,
        "vehicleTypeId": 5, # Car
        "entryGateId": 1,
        "selectedAreaId": reserved_area_id,
        "selectedSlotId": reserved_slot_id
    }
    
    res_entry = requests.post(f"{base_url}/parking-sessions/entry", headers=staff_headers, json=body)
    entry_result = res_entry.json()
    print("Check-in response:", json.dumps(entry_result, indent=2))
    
    if not entry_result.get("success"):
        print("Check-in failed!")
        sys.exit(1)
        
    print("\n==================================================")
    print("          ENTRY FLOW COMPLETED SUCCESSFULLY!")
    print("==================================================")
    
    # 4. Verify DB Status
    print("\n4. Verifying DB state updates:")
    
    # Check reservation status
    res_status = requests.get(f"{base_url}/reservations/{reservation_id}/payment-status", headers=staff_headers).json()
    print(f"- Reservation Status: {res_status['data']['reservationStatus']} (Expected: COMPLETED)")
    
    # Check slot status
    # We login as admin to view slot details
    res_admin = requests.post(f"{base_url}/auth/login", json={"username": "admin01", "password": "123456"})
    admin_token = res_admin.json()["data"]["accessToken"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    slots = requests.get(f"{base_url}/slots", headers=admin_headers).json()["data"]
    target_slot = next((s for s in slots if s["id"] == reserved_slot_id), None)
    if target_slot:
        print(f"- Slot {target_slot['slotCode']} Status: {target_slot['status']} (Expected: OCCUPIED)")
    else:
        print(f"- Could not find slot {reserved_slot_id} in slots list.")

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
