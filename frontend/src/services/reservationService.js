import coreAxiosClient from "../api/coreAxiosClient";

export const reservationService = {
  // Lấy lượt đặt chỗ đang có hiệu lực từ sessionStorage và làm mới từ Backend
  getActiveReservation: async () => {
    const cached = sessionStorage.getItem("activeReservation");
    if (!cached) return null;
    try {
      const reservation = JSON.parse(cached);
      const res = await coreAxiosClient.get(`/reservations/${reservation.id}/payment-status`);
      if (res.success && res.data) {
        const latest = res.data;
        // Nếu đã hoàn thành, hủy, hoặc hết hạn trên backend -> xóa cache local
        if (
          latest.reservationStatus === "CANCELLED" || 
          latest.reservationStatus === "EXPIRED" || 
          latest.reservationStatus === "COMPLETED"
        ) {
          sessionStorage.removeItem("activeReservation");
          return null;
        }

        // Cập nhật thông tin mới nhất
        const updated = {
          ...reservation,
          status: latest.reservationStatus,
          paymentStatus: latest.paymentStatus,
          checkoutUrl: latest.checkoutUrl
        };
        sessionStorage.setItem("activeReservation", JSON.stringify(updated));
        return updated;
      }
      return reservation;
    } catch (e) {
      return null;
    }
  },

  // Lấy danh sách slot khả dụng cho đặt chỗ (mặc định lấy cho Ô tô - vehicleTypeId = 5)
  getAvailableSlots: async () => {
    const res = await coreAxiosClient.get("/reservations/available-locations?vehicleTypeId=5");
    if (!res.success || !res.data) return { slots: [] };
    const slots = (res.data.availableSlots || []).map(s => ({
      id: s.slotId,
      slotCode: s.slotCode,
      areaId: s.areaId,
      floorId: s.floorId,
      status: "AVAILABLE"
    }));
    return { slots }; 
  },

  // Lịch sử đặt chỗ (mock tạm thời vì backend chưa hỗ trợ GET /reservations cho driver)
  getHistory: async (page = 0, size = 10) => {
    return [];
  },

  // Đặt chỗ mới
  createReservation: async (plateNumber, vehicleTypeId, floorId, areaId, durationHours, slotId) => {
    const res = await coreAxiosClient.post("/reservations", {
      plateNumber,
      vehicleTypeId,
      floorId,
      areaId,
      reservedDurationMinutes: durationHours * 60,
      slotId
    });
    if (res.success && res.data) {
      const reservation = res.data.reservation;
      const payment = res.data.payment;
      
      // Sanitize và san phẳng dữ liệu để tương thích với giao diện
      const flatReservation = {
        id: reservation.id,
        reservationCode: reservation.reservationCode,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        bookingAmount: reservation.bookingAmount,
        plateNumber: reservation.plateNumber,
        areaId: reservation.areaId,
        slotId: reservation.slotId,
        checkoutUrl: payment?.checkoutUrl,
        orderCode: payment?.orderCode,
        paymentId: payment?.paymentId
      };
      
      // Lưu vào cache local để hỗ trợ getActiveReservation
      sessionStorage.setItem("activeReservation", JSON.stringify(flatReservation));
      return flatReservation;
    }
    throw new Error(res.message || "Đặt chỗ thất bại");
  },

  // Hủy đặt chỗ
  cancelReservation: async (id) => {
    const res = await coreAxiosClient.post(`/reservations/${id}/cancel`, { reason: "User cancelled from web UI" });
    if (res.success) {
      sessionStorage.removeItem("activeReservation");
      return res.data;
    }
    throw new Error(res.message || "Hủy đặt chỗ thất bại");
  },

  // Kiểm tra thanh toán thành công thông qua webhook
  payReservation: async (id) => {
    const res = await coreAxiosClient.get(`/reservations/${id}/payment-status`);
    if (res.success && res.data && res.data.paymentStatus === "PAID") {
      // Xóa cache khi thanh toán xong
      sessionStorage.removeItem("activeReservation");
      return res.data;
    }
    throw new Error("Giao dịch chưa được thanh toán trên PayOS. Vui lòng thanh toán trước.");
  }
};
