import { http, HttpResponse } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { enabled } from "./helpers";

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
  // GET Active Reservation
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.support}/reservations/me/active`, () => {
      if (currentActive) {
        return HttpResponse.json({ success: true, data: currentActive });
      }
      return HttpResponse.json({ success: false, message: "No active reservation" }, { status: 404 });
    })
  ),

  // GET History
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.support}/reservations/me/history`, () => {
      return HttpResponse.json({
        success: true,
        data: {
          items: MOCK_HISTORY,
          total: MOCK_HISTORY.length
        }
      });
    })
  ),

  // GET Available Slots
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/reservations/available-locations`, () => {
      const mockSlots = [
        { id: 101, slotCode: "B2-A-001", areaId: 1, areaName: "B2-A", allowedVehicleTypeId: 1, status: "AVAILABLE" },
        { id: 102, slotCode: "B2-A-002", areaId: 1, areaName: "B2-A", allowedVehicleTypeId: 1, status: "AVAILABLE" },
        { id: 103, slotCode: "B2-B-001", areaId: 2, areaName: "B2-B", allowedVehicleTypeId: 1, status: "AVAILABLE" }
      ];
      return HttpResponse.json({
        success: true,
        data: {
          availableSlots: mockSlots.map(s => ({ ...s, slotId: s.id })),
          availableAreas: [
            { areaId: 1, areaCode: "B2-A", areaName: "Khu A Tầng B2", floorId: 1, floorCode: "B2", floorName: "Tầng B2", availableCapacity: 2, totalCapacity: 20 },
            { areaId: 2, areaCode: "B2-B", areaName: "Khu B Tầng B2", floorId: 1, floorCode: "B2", floorName: "Tầng B2", availableCapacity: 1, totalCapacity: 20 }
          ]
        }
      });
    })
  ),

  // POST Create Reservation
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/reservations`, async ({ request }) => {
      const data = await request.json();
      
      // Validate
      if (!data.plateNumber || !data.vehicleTypeId || !data.areaId || !data.reservedDurationMinutes || (data.vehicleTypeId === 5 && !data.slotId)) {
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
        reservationEndTime: new Date(Date.now() + data.reservedDurationMinutes * 60000).toISOString()
      };
      currentActive = {
        ...newRes,
        checkoutUrl: "https://payos.vn/mock-checkout",
        qrCode: "MOCK_QR_CODE_DATA",
        expiredAt: new Date(Date.now() + 10 * 60000).toISOString()
      };

      return HttpResponse.json({
        success: true,
        data: {
          reservation: currentActive,
          payment: {
            paymentId: idCounter + 1000,
            checkoutUrl: "https://payos.vn/mock-checkout",
            qrCode: "MOCK_QR_CODE_DATA",
            expiredAt: new Date(Date.now() + 10 * 60000).toISOString()
          }
        }
      });
    })
  ),

  // POST Cancel
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.post(`${API_BASE_URLS.core}/reservations/:id/cancel`, ({ params }) => {
      if (currentActive && currentActive.id === parseInt(params.id)) {
        currentActive.status = "CANCELLED";
        MOCK_HISTORY.unshift({ ...currentActive }); // Move to history
        currentActive = null;
      }

      return HttpResponse.json({ success: true, message: "Hủy thành công" });
    })
  ),

  // GET Payment Status
  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/reservations/:id/payment-status`, ({ params }) => {
      if (currentActive && currentActive.id === parseInt(params.id)) {
        currentActive.status = "CONFIRMED";
        currentActive.paymentStatus = "PAID";
      }
      
      return HttpResponse.json({
        success: true,
        data: {
          paymentStatus: "PAID",
          reservationStatus: "CONFIRMED",
          expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
          remainingSeconds: 600
        }
      });
    })
  )
];
