import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { db } from "./db";

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
      const { bookingId } = await request.json();
      
      let inMemoryBookings = db.getBookings();
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
      let inMemoryHistory = db.getHistory();
      if (!inMemoryHistory[username]) {
        inMemoryHistory[username] = [];
      }
      inMemoryHistory[username].unshift({ ...booking });
      db.saveHistory(inMemoryHistory);
      
      // Remove from active bookings
      inMemoryBookings = inMemoryBookings.filter(b => b.id !== bookingId);
      db.saveBookings(inMemoryBookings);
      
      return ok(booking, "Xác nhận đỗ xe thành công!");
    })
  ),
];
