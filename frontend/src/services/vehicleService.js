import coreAxiosClient from "../api/coreAxiosClient";

export const vehicleService = {
  /**
   * Lấy danh sách xe đã đăng ký (có filter và phân trang).
   * - Driver: chỉ thấy xe của mình
   * - Staff/Manager/Admin: thấy tất cả
   */
  getVehicles: async ({
    keyword = "",
    vehicleType = "",
    approvalStatus = "",
    page = 1,
    pageSize = 20,
  } = {}) => {
    const response = await coreAxiosClient.get("/driver/vehicles", {
      params: {
        keyword: keyword || undefined,
        vehicleType: vehicleType || undefined,
        approvalStatus: approvalStatus || undefined,
        page,
        pageSize,
      },
    });
    if (response.success && response.data) {
      const data = response.data;
      return {
        items: data.items || [],
        page: data.page || page,
        pageSize: data.pageSize || pageSize,
        totalItems: data.totalItems ?? 0,
        totalPages: data.totalPages || 1,
      };
    }
    throw new Error(response.message || "Không thể lấy danh sách xe.");
  },

  /**
   * Lấy chi tiết một xe theo id.
   * - Driver: chỉ được xem xe của mình (backend enforce)
   */
  getVehicleById: async (id) => {
    const response = await coreAxiosClient.get(`/driver/vehicles/${id}`);
    if (response.success && response.data) return response.data;
    throw new Error(response.message || "Không thể lấy thông tin xe.");
  },

  /**
   * Driver đăng ký xe mới — status tự động là PENDING.
   */
  createVehicle: async (vehicleData) => {
    const response = await coreAxiosClient.post("/driver/vehicles", vehicleData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm phương tiện thất bại.");
  },

  /**
   * Cập nhật thông tin xe.
   * - Driver: chỉ xe của mình; Staff/Manager/Admin: bất kỳ xe.
   */
  updateVehicle: async (id, vehicleData) => {
    const response = await coreAxiosClient.put(`/driver/vehicles/${id}`, vehicleData);
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật xe thất bại.");
  },

  /**
   * Xóa mềm một xe.
   * - Driver: chỉ xe của mình; Staff/Manager/Admin: bất kỳ xe.
   */
  deleteVehicle: async (id) => {
    const response = await coreAxiosClient.delete(`/driver/vehicles/${id}`);
    if (response.success) return true;
    throw new Error(response.message || "Xóa xe thất bại.");
  },

  /**
   * Thay đổi approval status (PENDING/APPROVED/REJECTED).
   * - Chỉ Staff/Manager/Admin mới được gọi endpoint này.
   */
  changeApprovalStatus: async (id, approvalStatus) => {
    const response = await coreAxiosClient.patch(
      `/driver/vehicles/${id}/approval-status`,
      { approvalStatus }
    );
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật trạng thái phê duyệt thất bại.");
  },

  // ── Legacy helpers for Monthly Pass module ────────────────────────────────

  getMonthlyPasses: async () => {
    const response = await coreAxiosClient.get("/monthly-passes");
    return response.success ? response.data : [];
  },

  addMonthlyPass: async (passData) => {
    const response = await coreAxiosClient.post("/monthly-passes", passData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm vé tháng thất bại");
  },

  updateMonthlyPassStatus: async (passId, newStatus) => {
    const response = await coreAxiosClient.patch(
      `/monthly-passes/${passId}/status`,
      { status: newStatus }
    );
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật trạng thái vé tháng thất bại");
  },

  renewMonthlyPass: async (passId, newEndDate) => {
    const response = await coreAxiosClient.post(
      `/monthly-passes/${passId}/renew`,
      { endDate: newEndDate }
    );
    if (response.success) return response.data;
    throw new Error(response.message || "Gia hạn vé tháng thất bại");
  },
};
