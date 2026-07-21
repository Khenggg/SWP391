import coreAxiosClient from "../api/coreAxiosClient";

export const staffSessionService = {
  listActiveSessions: async () => {
    const response = await coreAxiosClient.get(`/staff/sessions/active`);
    if (response.success) return response.data || [];
    throw new Error(response.message || "Không thể tải danh sách phiên đang trong bãi.");
  },

  searchActiveSession: async (cardCode) => {
    const response = await coreAxiosClient.get(`/parking-sessions/by-card-code/${cardCode}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Không tìm thấy phiên đỗ xe hoạt động.");
  },

  previewFee: async (sessionId, exitTime) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/calculate-fee`, { exitTime });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tính phí gửi xe.");
  },

  payCash: async ({ sessionId, exitGateId }) => {
    const response = await coreAxiosClient.post(`/payments/cash`, { sessionId, exitGateId });
    if (response.success) return response.data;
    throw new Error(response.message || "Thanh toán tiền mặt thất bại.");
  },

  createOnlinePayment: async ({ sessionId, cardCode }) => {
    const response = await coreAxiosClient.post(`/payments/online/exit-fee`, { sessionId, cardCode });
    if (response.success) return response.data;
    throw new Error(response.message || "Tạo link thanh toán online thất bại.");
  },

  completeExit: async (sessionId, payload) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/exit`, payload);
    if (response.success) return response.data;
    throw new Error(response.message || "Xác nhận xe ra thất bại.");
  },

  completeMonthlyPassExit: async (sessionId, payload) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/monthly-pass-exit`, payload);
    if (response.success) return response.data;
    throw new Error(response.message || "Xác nhận xe vé tháng ra thất bại.");
  },

  createMismatchCase: async ({ sessionId, exitPlateNumber, reason }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/mismatch-case`, { exitPlateNumber, reason });
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tạo hồ sơ lệch biển số.");
  },

  createLostCardCase: async (payload) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${payload.sessionId}/lost-card`, payload);
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tạo hồ sơ mất thẻ.");
  }
};
