import coreAxiosClient from "../api/coreAxiosClient";

export const driverService = {
  getDriverProfile: async () => {
    // Calling GET /api/core/driver/me
    const res = await coreAxiosClient.get("/driver/me");
    if (res.success) return res.data;
    throw new Error(res.message || "Không thể tải thông tin cá nhân");
  },

  updateDriverProfile: async (data) => {
    // Calling PUT /api/core/driver/me
    const res = await coreAxiosClient.put("/driver/me", data);
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật thông tin thất bại");
  },

  registerDriver: async (data) => {
    // Calling POST /api/core/driver/register
    const res = await coreAxiosClient.post("/driver/register", data);
    if (res.success) return res.data;
    throw new Error(res.message || "Đăng ký tài khoản thất bại");
  }
};
