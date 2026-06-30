import coreAxiosClient from "../api/coreAxiosClient";

export const reservationService = {
  // Lấy lượt đặt chỗ đang có hiệu lực
  getActiveReservation: async () => {
    const res = await coreAxiosClient.get("/reservations/active");
    return res.success ? res.data : null;
  },

  // Lấy danh sách slot khả dụng cho đặt chỗ
  getAvailableSlots: async () => {
    const res = await coreAxiosClient.get("/reservations/available-slots");
    // Giữ nguyên logic parse mock giống parkingService để tương thích giao diện
    if (!res.success) return { areas: [], slots: [], floors: [], vehicleTypes: [] };
    const slots = Array.isArray(res.data) ? res.data : [];
    return { slots }; 
  },

  // Lịch sử đặt chỗ
  getHistory: async (page = 0, size = 10) => {
    const res = await coreAxiosClient.get("/reservations", { params: { page, size } });
    return res.success ? res.data : [];
  },

  // Đặt chỗ mới
  createReservation: async (plateNumber, vehicleTypeId, areaId, durationHours, slotId) => {
    const res = await coreAxiosClient.post("/reservations", {
      plateNumber,
      vehicleTypeId,
      areaId,
      durationHours,
      slotId
    });
    if (res.success) return res.data;
    throw new Error(res.message || "Đặt chỗ thất bại");
  },

  // Hủy đặt chỗ
  cancelReservation: async (id) => {
    const res = await coreAxiosClient.post(`/reservations/${id}/cancel`);
    if (res.success) return res.data;
    throw new Error(res.message || "Hủy đặt chỗ thất bại");
  },

  // Thanh toán
  payReservation: async (id) => {
    const res = await coreAxiosClient.post(`/reservations/${id}/pay`);
    if (res.success) return res.data;
    throw new Error(res.message || "Thanh toán thất bại");
  }
};
