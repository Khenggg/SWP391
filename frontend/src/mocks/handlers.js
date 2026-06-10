import { delay, http, HttpResponse } from "msw";
import { API_BASE_URLS, isMockEnabled, MOCK_FLAGS } from "./mockConfig";
import { 
  MOCK_PARKING_INFO, MOCK_FLOORS, MOCK_AREAS, MOCK_SLOTS, 
  MOCK_GATES, MOCK_PRICING_RULES, MOCK_MONTHLY_PASSES, MOCK_CARDS,
  MOCK_VEHICLE_TYPES
} from "../constants/mockData";

// Helper responses
const ok = (data, message = "OK") => HttpResponse.json({ success: true, message, data });
const badRequest = (message) => HttpResponse.json({ success: false, message }, { status: 400 });
const unauthorized = (message) => HttpResponse.json({ success: false, message }, { status: 401 });
const notFound = (message) => HttpResponse.json({ success: false, message }, { status: 404 });

const enabled = (flagName, handler) => (isMockEnabled(flagName) ? [handler] : []);

// Get current simulated time from local storage or fallback to system time
const getSimTime = () => localStorage.getItem("driver_sim_time") || new Date().toISOString();

// In-memory databases
let inMemoryFloors = MOCK_FLOORS.map(f => ({ ...f }));
let inMemoryAreas = MOCK_AREAS.map(a => ({ ...a }));
let inMemorySlots = MOCK_SLOTS.map(s => ({ ...s }));
let inMemoryGates = MOCK_GATES.map(g => ({ ...g }));
let inMemoryPricingRules = MOCK_PRICING_RULES.map(p => ({ ...p }));
let inMemoryPasses = MOCK_MONTHLY_PASSES.map(p => ({ ...p }));
let inMemoryCards = MOCK_CARDS.map(c => ({ ...c }));
let inMemoryParkingInfo = { ...MOCK_PARKING_INFO };

let inMemoryBookings = [
  {
    id: "BK-100001",
    username: "driver02",
    areaCode: "B2-A",
    areaName: "Khu A - Tầng B2",
    floorCode: "B2",
    vehicleTypeName: "Ô Tô",
    hours: 3,
    reservationFee: 60000,
    fee: 60000,
    actualParkingFee: 0,
    actualHours: 0,
    status: "PAID",
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    checkInTime: null,
    checkOutTime: null,
    plate: null,
    internalSlotId: 201,
    internalSlotCode: "B2-A-011",
  }
];

let inMemoryHistory = {
  driver01: [
    {
      id: "BK-090002",
      username: "driver01",
      areaCode: "B2-A",
      areaName: "Khu A - Tầng B2",
      floorCode: "B2",
      vehicleTypeName: "Ô Tô",
      hours: 2,
      reservationFee: 40000,
      fee: 40000,
      actualParkingFee: 60000,
      actualHours: 3,
      status: "COMPLETED",
      createdAt: "2026-06-09T01:00:00.000Z",
      paidAt: "2026-06-09T01:05:00.000Z",
      checkInTime: "2026-06-09T01:30:00.000Z",
      checkOutTime: "2026-06-09T04:10:00.000Z",
      plate: "51A-888.88",
      internalSlotId: 202,
      internalSlotCode: "B2-A-012"
    }
  ],
  driver02: [
    {
      id: "BK-090001",
      username: "driver02",
      areaCode: "B2-B",
      areaName: "Khu B - Tầng B2",
      floorCode: "B2",
      vehicleTypeName: "Ô Tô",
      hours: 2,
      reservationFee: 40000,
      fee: 40000,
      actualParkingFee: 60000,
      actualHours: 3,
      status: "COMPLETED",
      createdAt: "2026-06-09T01:00:00.000Z",
      paidAt: "2026-06-09T01:05:00.000Z",
      checkInTime: "2026-06-09T01:30:00.000Z",
      checkOutTime: "2026-06-09T04:10:00.000Z",
      plate: "29A-999.99",
      internalSlotId: 222,
      internalSlotCode: "B2-B-012",
    }
  ]
};

// Help helper to extract username from token in header
const getUsernameFromHeader = (request) => {
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer mock-token-for-")) {
    return authHeader.replace("Bearer mock-token-for-", "").trim().toLowerCase();
  }
  return "driver01";
};

// Help helpers for density update
const incrementAreaOccupancy = (areaCode) => {
  const index = inMemoryAreas.findIndex(a => a.code === areaCode);
  if (index !== -1) {
    const area = inMemoryAreas[index];
    if (area.currentCount !== undefined && area.maxCapacity) {
      area.currentCount = Math.min(area.maxCapacity, area.currentCount + 1);
    }
    if (area.availableSlots !== undefined) {
      area.availableSlots = Math.max(0, area.availableSlots - 1);
    }
    inMemoryParkingInfo.availableSlots = Math.max(0, inMemoryParkingInfo.availableSlots - 1);
  }
};

const decrementAreaOccupancy = (areaCode) => {
  const index = inMemoryAreas.findIndex(a => a.code === areaCode);
  if (index !== -1) {
    const area = inMemoryAreas[index];
    if (area.currentCount !== undefined && area.currentCount > 0) {
      area.currentCount = area.currentCount - 1;
    }
    if (area.availableSlots !== undefined && area.totalSlots) {
      area.availableSlots = Math.min(area.totalSlots, area.availableSlots + 1);
    }
    inMemoryParkingInfo.availableSlots = Math.min(inMemoryParkingInfo.totalSlots || 40, inMemoryParkingInfo.availableSlots + 1);
  }
};

export const handlers = [
  // =========================================================================
  // AUTHENTICATION
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.AUTH_LOGIN,
    http.post(`${API_BASE_URLS.core}/auth/login`, async ({ request }) => {
      await delay(250);
      const { username, password } = await request.json();
      
      const seedUsers = {
        admin01: { username: "admin01", fullName: "Quản Trị Viên Hệ Thống", role: "ADMIN", email: "admin01@parking.vn", phone: "0901000001" },
        manager01: { username: "manager01", fullName: "Quản Lý Bãi Xe", role: "MANAGER", email: "manager01@parking.vn", phone: "0901000002" },
        staff01: { username: "staff01", fullName: "Nhân Viên Cổng Vận Hành", role: "STAFF", email: "staff01@parking.vn", phone: "0901000003" },
        driver01: { username: "driver01", fullName: "Nguyễn Văn A", role: "DRIVER", phone: "0912345678", email: "driver01@parking.vn" },
        driver02: { username: "driver02", fullName: "Trần Văn B", role: "DRIVER", phone: "0987654321", email: "driver02@booking.vn" },
      };

      const userKey = username.trim().toLowerCase();
      const user = seedUsers[userKey];

      if (user && password === "password123") {
        return ok({
          token: `mock-token-for-${userKey}`,
          user
        });
      }
      return badRequest("Tên đăng nhập hoặc mật khẩu không chính xác.");
    })
  ),

  // =========================================================================
  // PUBLIC INFORMATION
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.PUBLIC_PARKING_INFO,
    http.get(`${API_BASE_URLS.public}/parking-info`, async () => {
      await delay(250);
      return ok(inMemoryParkingInfo);
    })
  ),

  ...enabled(
    MOCK_FLAGS.PUBLIC_PRICING,
    http.get(`${API_BASE_URLS.public}/pricing`, async () => {
      await delay(250);
      return ok(inMemoryPricingRules);
    })
  ),

  ...enabled(
    MOCK_FLAGS.PUBLIC_AVAILABLE_SLOTS,
    http.get(`${API_BASE_URLS.public}/available-slots`, async () => {
      await delay(250);
      return ok({ 
        areas: inMemoryAreas, 
        slots: inMemorySlots, 
        floors: inMemoryFloors,
        vehicleTypes: MOCK_VEHICLE_TYPES 
      });
    })
  ),

  // =========================================================================
  // DRIVER VEHICLES & BOOKINGS
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/driver/vehicles`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      
      let fullName = "Nguyễn Văn A";
      let phone = "0912345678";
      if (username === "driver02") {
        fullName = "Trần Văn B";
        phone = "0987654321";
      }

      const vehicles = inMemoryPasses.filter(
        (pass) => pass.ownerName === fullName || pass.phone === phone
      );
      return ok(vehicles);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/driver/bookings`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const active = inMemoryBookings.find(b => b.username === username);
      return ok(active || null);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { areaCode, durationHours, simTime } = await request.json();

      // Check if already has active booking
      if (inMemoryBookings.some(b => b.username === username)) {
        return badRequest("Bạn đã có một phiên đặt chỗ hoặc phiên đỗ đang hoạt động!");
      }

      const area = inMemoryAreas.find(a => a.code === areaCode);
      if (!area || area.status !== "ACTIVE") {
        return badRequest("Khu vực đỗ xe không khả dụng.");
      }

      // Check capacity
      const maxCap = area.maxCapacity || area.totalSlots || 0;
      const current = area.currentCount !== undefined ? area.currentCount : (maxCap - (area.availableSlots || 0));
      if (current >= maxCap) {
        return badRequest("Khu vực này đã hết chỗ trống!");
      }

      const price = inMemoryPricingRules.find(r => r.vehicleTypeName === area.vehicleTypeName && r.status === "ACTIVE")?.dayPrice || 20000;
      const fee = durationHours * price;

      const allocatedSlotId = Math.floor(100 + Math.random() * 900);
      const allocatedSlotCode = `${area.code}-0${Math.floor(10 + Math.random() * 89)}`;

      const newBooking = {
        id: "BK-" + Math.floor(100000 + Math.random() * 900000),
        username,
        areaCode: area.code,
        areaName: area.name,
        floorCode: area.floorCode,
        vehicleTypeName: area.vehicleTypeName,
        hours: durationHours,
        reservationFee: fee,
        fee,
        actualParkingFee: 0,
        actualHours: 0,
        status: "PENDING_PAYMENT",
        createdAt: simTime || new Date().toISOString(),
        paidAt: null,
        checkInTime: null,
        checkOutTime: null,
        plate: null,
        internalSlotId: allocatedSlotId,
        internalSlotCode: allocatedSlotCode
      };

      inMemoryBookings.push(newBooking);
      return ok(newBooking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/pay`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { simTime } = await request.json();

      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = "PAID";
      booking.paidAt = simTime || new Date().toISOString();

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/cancel`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { simTime } = await request.json();

      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = "CANCELLED";
      booking.checkOutTime = simTime || new Date().toISOString();

      // Move to history
      if (!inMemoryHistory[username]) inMemoryHistory[username] = [];
      inMemoryHistory[username].unshift(booking);

      // Remove from active
      inMemoryBookings = inMemoryBookings.filter(b => b.username !== username);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/check-in`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { plate, simTime } = await request.json();

      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = "CHECKED_IN";
      booking.plate = plate;
      booking.checkInTime = simTime || new Date().toISOString();

      // Occupy slot in bãi
      incrementAreaOccupancy(booking.areaCode);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/check-out`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { simTime } = await request.json();

      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      
      // Calculate actual parking fee
      const getMinutesDiff = (d1, d2) => Math.round((new Date(d2) - new Date(d1)) / 60000);
      const durationMins = getMinutesDiff(booking.checkInTime, simTime || new Date().toISOString());
      const actualHours = Math.max(1, Math.ceil(durationMins / 60));
      const price = inMemoryPricingRules.find(r => r.vehicleTypeName === booking.vehicleTypeName && r.status === "ACTIVE")?.dayPrice || 20000;
      const actualParkingFee = actualHours * price;

      booking.status = "COMPLETED";
      booking.checkOutTime = simTime || new Date().toISOString();
      booking.actualHours = actualHours;
      booking.actualParkingFee = actualParkingFee;

      // Free slot in bãi
      decrementAreaOccupancy(booking.areaCode);

      // Move to history
      if (!inMemoryHistory[username]) inMemoryHistory[username] = [];
      inMemoryHistory[username].unshift(booking);

      // Remove from active
      inMemoryBookings = inMemoryBookings.filter(b => b.username !== username);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/driver/bookings/expire`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      const { status } = await request.json(); // EXPIRED_TIMEOUT or EXPIRED_CHECKIN

      const bookingIndex = inMemoryBookings.findIndex(b => b.username === username);
      if (bookingIndex === -1) return notFound("Không tìm thấy đặt chỗ.");

      const booking = inMemoryBookings[bookingIndex];
      booking.status = status;

      // Move to history
      if (!inMemoryHistory[username]) inMemoryHistory[username] = [];
      inMemoryHistory[username].unshift(booking);

      // Remove from active
      inMemoryBookings = inMemoryBookings.filter(b => b.username !== username);

      return ok(booking);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_HISTORY,
    http.get(`${API_BASE_URLS.core}/driver/bookings/history`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      return ok(inMemoryHistory[username] || []);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_HISTORY,
    http.delete(`${API_BASE_URLS.core}/driver/bookings/history`, async ({ request }) => {
      await delay(250);
      const username = getUsernameFromHeader(request);
      inMemoryHistory[username] = [];
      return ok([], "Lịch sử đã được xóa thành công.");
    })
  ),

  // =========================================================================
  // MANAGER CARD MANAGEMENT
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.get(`${API_BASE_URLS.core}/manager/cards`, async () => {
      await delay(250);
      return ok(inMemoryCards);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.post(`${API_BASE_URLS.core}/manager/cards`, async ({ request }) => {
      await delay(250);
      const { code, note } = await request.json();
      if (inMemoryCards.some(c => c.code.trim().toUpperCase() === code.trim().toUpperCase())) {
        return badRequest("Mã thẻ này đã tồn tại trên hệ thống!");
      }
      const newCard = {
        id: Date.now(),
        code: code.trim(),
        status: "AVAILABLE",
        note: note || "",
        updatedAt: new Date().toISOString(),
        activeSession: null
      };
      inMemoryCards.push(newCard);
      return ok(newCard);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_CARDS,
    http.put(`${API_BASE_URLS.core}/manager/cards/:id/status`, async ({ params, request }) => {
      await delay(250);
      const cardId = Number(params.id);
      const { status } = await request.json();
      
      const index = inMemoryCards.findIndex(c => c.id === cardId);
      if (index === -1) return notFound("Không tìm thấy thẻ xe.");

      if (inMemoryCards[index].status === "IN_USE" && status !== "IN_USE") {
        return badRequest("Không thể cập nhật trạng thái của thẻ đang sử dụng!");
      }

      inMemoryCards[index].status = status;
      inMemoryCards[index].updatedAt = new Date().toISOString();
      return ok(inMemoryCards[index]);
    })
  ),

  // =========================================================================
  // MANAGER MONTHLY PASSES
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.get(`${API_BASE_URLS.core}/manager/monthly-passes`, async () => {
      await delay(250);
      return ok(inMemoryPasses);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.post(`${API_BASE_URLS.core}/manager/monthly-passes`, async ({ request }) => {
      await delay(250);
      const passData = await request.json();
      const newPass = {
        id: Date.now(),
        ...passData,
        createdAt: new Date().toISOString()
      };
      inMemoryPasses.push(newPass);
      return ok(newPass);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.put(`${API_BASE_URLS.core}/manager/monthly-passes/:id/status`, async ({ params, request }) => {
      await delay(250);
      const passId = Number(params.id);
      const { status } = await request.json();
      
      const index = inMemoryPasses.findIndex(p => p.id === passId);
      if (index === -1) return notFound("Không tìm thấy vé tháng.");

      inMemoryPasses[index].status = status;
      return ok(inMemoryPasses[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PASSES,
    http.put(`${API_BASE_URLS.core}/manager/monthly-passes/:id/renew`, async ({ params, request }) => {
      await delay(250);
      const passId = Number(params.id);
      const { endDate } = await request.json();
      
      const index = inMemoryPasses.findIndex(p => p.id === passId);
      if (index === -1) return notFound("Không tìm thấy vé tháng.");

      inMemoryPasses[index].endDate = endDate;
      inMemoryPasses[index].status = "ACTIVE";
      return ok(inMemoryPasses[index]);
    })
  ),

  // =========================================================================
  // MANAGER STRUCTURES
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/floors`, async () => {
      await delay(250);
      return ok(inMemoryFloors);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.post(`${API_BASE_URLS.core}/manager/structures/floors`, async ({ request }) => {
      await delay(250);
      const floorData = await request.json();
      const newFloor = {
        id: Date.now(),
        ...floorData,
        totalAreas: 0,
        totalSlots: 0
      };
      inMemoryFloors.push(newFloor);
      return ok(newFloor);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.put(`${API_BASE_URLS.core}/manager/structures/floors/:id`, async ({ params, request }) => {
      await delay(250);
      const floorId = Number(params.id);
      const floorData = await request.json();
      
      const index = inMemoryFloors.findIndex(f => f.id === floorId);
      if (index === -1) return notFound("Không tìm thấy tầng.");

      inMemoryFloors[index] = { ...inMemoryFloors[index], ...floorData };
      return ok(inMemoryFloors[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/areas`, async () => {
      await delay(250);
      return ok(inMemoryAreas);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/slots`, async () => {
      await delay(250);
      return ok(inMemorySlots);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.put(`${API_BASE_URLS.core}/manager/structures/slots/:id/status`, async ({ params, request }) => {
      await delay(250);
      const slotId = Number(params.id);
      const { status } = await request.json();

      const index = inMemorySlots.findIndex(s => s.id === slotId);
      if (index === -1) return notFound("Không tìm thấy slot.");

      inMemorySlots[index].status = status;
      return ok(inMemorySlots[index]);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_STRUCTURES,
    http.get(`${API_BASE_URLS.core}/manager/structures/gates`, async () => {
      await delay(250);
      return ok(inMemoryGates);
    })
  ),

  // =========================================================================
  // MANAGER PRICING
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.get(`${API_BASE_URLS.core}/manager/pricing`, async () => {
      await delay(250);
      return ok(inMemoryPricingRules);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.post(`${API_BASE_URLS.core}/manager/pricing`, async ({ request }) => {
      await delay(250);
      const ruleData = await request.json();
      const newRule = {
        id: Date.now(),
        ...ruleData,
        updatedAt: new Date().toISOString()
      };
      inMemoryPricingRules.push(newRule);
      return ok(newRule);
    })
  ),

  ...enabled(
    MOCK_FLAGS.MANAGER_PRICING,
    http.put(`${API_BASE_URLS.core}/manager/pricing/:id`, async ({ params, request }) => {
      await delay(250);
      const ruleId = Number(params.id);
      const ruleData = await request.json();

      const index = inMemoryPricingRules.findIndex(r => r.id === ruleId);
      if (index === -1) return notFound("Không tìm thấy bảng giá.");

      inMemoryPricingRules[index] = {
        ...inMemoryPricingRules[index],
        ...ruleData,
        updatedAt: new Date().toISOString()
      };
      return ok(inMemoryPricingRules[index]);
    })
  ),

  // =========================================================================
  // STAFF BOOKING QR CONFIRMATION
  // =========================================================================
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/staff/bookings/paid-list`, async () => {
      await delay(200);
      const paidList = inMemoryBookings.filter(b => b.status === "PAID");
      return ok(paidList);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/staff/bookings/scan-confirm`, async ({ request }) => {
      await delay(200);
      const { bookingId } = await request.json();
      const index = inMemoryBookings.findIndex(b => b.id === bookingId);
      
      if (index === -1) {
        return notFound("Không tìm thấy mã đặt chỗ hoặc đặt chỗ đã được xử lý trước đó.");
      }
      
      const booking = inMemoryBookings[index];
      if (booking.status !== "PAID") {
        return badRequest("Mã đặt chỗ này chưa được thanh toán.");
      }
      
      // Complete the booking
      booking.status = "COMPLETED";
      booking.checkInTime = booking.paidAt || getSimTime();
      booking.checkOutTime = getSimTime();
      booking.actualHours = booking.hours;
      booking.actualParkingFee = booking.reservationFee;
      
      // Move to history of that driver
      const username = booking.username || "driver01";
      if (!inMemoryHistory[username]) {
        inMemoryHistory[username] = [];
      }
      inMemoryHistory[username].unshift({ ...booking });
      
      // Remove from active bookings
      inMemoryBookings = inMemoryBookings.filter(b => b.id !== bookingId);
      
      return ok(booking, "Xác nhận đỗ xe thành công!");
    })
  ),
];
