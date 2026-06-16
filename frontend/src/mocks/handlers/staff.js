import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { db } from "./db";
import { sessionDb } from "./sessionUtils";

const getSimTime = () => localStorage.getItem("driver_sim_time") || new Date().toISOString();

export const staffHandlers = [
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/staff/bookings/paid-list`, async () => {
      await delay(200);
      const inMemoryBookings = db.getBookings();
      const paidList = inMemoryBookings.filter(b => b.status === "PAID");
      return ok(paidList);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/staff/bookings/scan-confirm`, async ({ request }) => {
      await delay(200);
      const { bookingId, cardCode, plate, vehicleTypeName } = await request.json();
      
      if (!cardCode || !cardCode.trim()) {
        return badRequest("Thiếu mã thẻ NFC để gán cho lượt đặt chỗ.");
      }
      if (!plate || !plate.trim()) {
        return badRequest("Thiếu biển số xe thực tế.");
      }

      let inMemoryBookings = db.getBookings();
      const index = inMemoryBookings.findIndex(b => b.id === bookingId);
      
      if (index === -1) {
        return notFound("Không tìm thấy mã đặt chỗ hoặc đặt chỗ đã được xử lý trước đó.");
      }
      
      const booking = inMemoryBookings[index];
      if (booking.status !== "PAID") {
        return badRequest("Mã đặt chỗ này chưa được thanh toán.");
      }

      // Check if cardCode is already in use by another active session
      const sessions = sessionDb.getSessions();
      const isCardActive = sessions.some(s => s.status === "ACTIVE" && s.cardCode.toUpperCase() === cardCode.trim().toUpperCase());
      if (isCardActive) {
        return badRequest(`Thẻ ${cardCode.trim().toUpperCase()} đang được sử dụng ở một phiên đỗ xe khác.`);
      }
      
      // Create a new active session
      const newSession = {
        id: Date.now(),
        sessionCode: `SE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${sessions.length + 1}`,
        plateNumber: plate.trim().toUpperCase(),
        cardCode: cardCode.trim().toUpperCase(),
        qrToken: `booking-${bookingId}`,
        vehicleTypeName: vehicleTypeName || booking.vehicleTypeName || "Ô Tô",
        customerType: "CASUAL",
        entryTime: getSimTime(),
        exitTime: null,
        floorCode: "B2",
        areaCode: booking.areaCode || "B2-A",
        slotCode: booking.internalSlotCode || "B2-A-005",
        paymentStatus: "PAID", // bookings are prepaid
        status: "ACTIVE",
        entryGateCode: "GATE-IN-02",
        exitGateCode: null,
        entryPlateImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f8fafc'/><rect x='40' y='50' width='240' height='80' rx='4' fill='white' stroke='%23cbd5e1' stroke-width='2'/><text x='50%' y='95' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='28' font-weight='bold' fill='%231e293b'>" + plate.trim().toUpperCase() + "</text></svg>",
        entryVehicleImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23e2e8f0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='bold' fill='%23475569'>Ảnh xe booking lúc vào</text></svg>",
        entryDriverImageDataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='180'><rect width='100%' height='100%' fill='%23f1f5f9'/><circle cx='160' cy='80' r='30' fill='%2394a3b8'/><path d='M120 140c0-20 15-30 40-30s40 10 40 30' fill='%2394a3b8'/><text x='50%' y='160' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2364748b'>Tài xế xe booking</text></svg>"
      };

      sessions.push(newSession);
      sessionDb.saveSessions(sessions);
      
      // Update booking status to CHECKED_IN
      booking.status = "CHECKED_IN";
      booking.checkInTime = newSession.entryTime;
      booking.cardCode = newSession.cardCode;
      booking.plate = newSession.plateNumber;
      booking.sessionId = newSession.id;
      
      db.saveBookings(inMemoryBookings);
      
      return ok(booking, "Xác nhận xe vào bãi thành công!");
    })
  ),
];
