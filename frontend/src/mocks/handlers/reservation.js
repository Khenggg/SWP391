import { http, HttpResponse } from "msw";
import { API_BASE_URLS } from "../mockConfig";

const MOCK_ACTIVE_RESERVATION = null; // Default: no active reservation

const MOCK_HISTORY = [
  {
    id: 1,
    reservationCode: "RES1001",
    plateNumber: "30F-123.45",
    vehicleTypeName: "Ô Tô",
    areaName: "B2-A",
    status: "COMPLETED",
    reservationStartTime: "2024-06-21T09:30:00Z",
    reservationEndTime: "2024-06-21T09:45:00Z",
    bookingAmount: 15000,
    createdAt: "2024-06-21T09:00:00Z"
  },
  {
    id: 2,
    reservationCode: "RES1002",
    plateNumber: "29A-678.90",
    vehicleTypeName: "Xe Máy",
    areaName: "B2-B",
    status: "EXPIRED",
    reservationStartTime: "2024-06-20T18:00:00Z",
    reservationEndTime: "2024-06-20T18:15:00Z",
    bookingAmount: 5000,
    createdAt: "2024-06-20T17:50:00Z"
  },
  {
    id: 3,
    reservationCode: "RES1003",
    plateNumber: "51H-999.99",
    vehicleTypeName: "Ô Tô",
    areaName: "B2-A",
    status: "CANCELLED",
    reservationStartTime: "2024-06-18T07:30:00Z",
    reservationEndTime: "2024-06-18T07:45:00Z",
    bookingAmount: 15000,
    createdAt: "2024-06-18T07:00:00Z"
  }
];

let currentActive = null;
let idCounter = 4;

export const reservationHandlers = [
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    // GET Active Reservation
    http.get(`${API_BASE_URLS.core}/reservations/active`, () => {
      if (currentActive) {
        return HttpResponse.json({ success: true, data: currentActive });
      }
      return HttpResponse.json({ success: false, message: "No active reservation" }, { status: 404 });
    }),

    // GET History
    http.get(`${API_BASE_URLS.core}/reservations`, () => {
      return HttpResponse.json({
        success: true,
        data: MOCK_HISTORY
      });
    }),

    // GET Available Slots
    http.get(`${API_BASE_URLS.core}/reservations/available-slots`, () => {
      // Generate some mock slots like in public mock
      const mockSlots = [
        { id: 101, slotCode: "B2-A-001", areaId: 1, areaName: "B2-A", allowedVehicleTypeId: 1, status: "AVAILABLE" },
        { id: 102, slotCode: "B2-A-002", areaId: 1, areaName: "B2-A", allowedVehicleTypeId: 1, status: "AVAILABLE" },
        { id: 103, slotCode: "B2-B-001", areaId: 2, areaName: "B2-B", allowedVehicleTypeId: 1, status: "AVAILABLE" }
      ];
      return HttpResponse.json({
        success: true,
        data: mockSlots
      });
    }),

    // POST Create Reservation
    http.post(`${API_BASE_URLS.core}/reservations`, async ({ request }) => {
      const data = await request.json();
      
      // Validate
      if (!data.plateNumber || !data.vehicleTypeId || !data.areaId || !data.durationHours || (data.vehicleTypeId === 1 && !data.slotId)) {
        return HttpResponse.json({ success: false, message: "Thiếu thông tin bắt buộc" }, { status: 400 });
      }

      if (currentActive) {
        return HttpResponse.json({ success: false, message: "Bạn đang có 1 lượt đặt chỗ hiệu lực" }, { status: 400 });
      }

      const newRes = {
        id: idCounter++,
        reservationCode: `RES100${idCounter}`,
        plateNumber: data.plateNumber,
        vehicleTypeId: data.vehicleTypeId,
        vehicleTypeName: data.vehicleTypeId === 1 ? "Ô Tô" : "Xe Máy",
        areaId: data.areaId,
        areaName: data.areaId === 1 ? "B2-A" : "B2-B",
        slotId: data.slotId, // Save slotId if provided
        status: "PENDING",
        paymentStatus: "PENDING",
        bookingAmount: 15000,
        createdAt: new Date().toISOString(),
        reservationStartTime: new Date().toISOString(),
        reservationEndTime: new Date(Date.now() + data.durationHours * 3600000).toISOString()
      };

      currentActive = newRes;

      return HttpResponse.json({
        success: true,
        data: currentActive
      });
    }),

    // POST Cancel
    http.post(`${API_BASE_URLS.core}/reservations/:id/cancel`, ({ params }) => {
      if (!currentActive || currentActive.id !== parseInt(params.id)) {
        return HttpResponse.json({ success: false, message: "Không tìm thấy reservation để hủy" }, { status: 404 });
      }
      
      currentActive.status = "CANCELLED";
      MOCK_HISTORY.unshift({ ...currentActive }); // Move to history
      currentActive = null;

      return HttpResponse.json({ success: true, message: "Hủy thành công" });
    }),

    // POST Pay
    http.post(`${API_BASE_URLS.core}/reservations/:id/pay`, ({ params }) => {
      if (!currentActive || currentActive.id !== parseInt(params.id)) {
        return HttpResponse.json({ success: false, message: "Không tìm thấy reservation để thanh toán" }, { status: 404 });
      }
      
      currentActive.status = "CONFIRMED";
      currentActive.paymentStatus = "PAID";

      return HttpResponse.json({ success: true, message: "Thanh toán thành công" });
    })
  )
];
