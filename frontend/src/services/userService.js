import coreAxiosClient from "../api/coreAxiosClient";

export const userService = {
  getUsers: async ({ keyword = "", role = "", driverType = "", status = "", page = 1, pageSize = 20 } = {}) => {
    const response = await coreAxiosClient.get("/users", {
      params: {
        keyword: keyword || undefined,
        role: role || undefined,
        driverType: driverType || undefined,
        status: status || undefined,
        page,
        pageSize,
      },
    });
    if (response.success && response.data) {
      return {
        items: Array.isArray(response.data) ? response.data : (response.data.items || []),
        page: response.data.page || page,
        pageSize: response.data.pageSize || pageSize,
        totalItems: response.data.totalItems ?? (Array.isArray(response.data) ? response.data.length : 0),
        totalPages: response.data.totalPages || 1,
      };
    }
    throw new Error(response.message || "Không thể lấy danh sách người dùng.");
  },

  addUser: async (user) => {
    const response = await coreAxiosClient.post("/users", user);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể tạo người dùng mới.");
  },

  updateUser: async (id, userData) => {
    const response = await coreAxiosClient.put(`/users/${id}`, userData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể cập nhật thông tin người dùng.");
  },

  updateUserRole: async (id, role, reason) => {
    const response = await coreAxiosClient.patch(`/users/${id}/role`, { role, reason });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể đổi vai trò người dùng.");
  },

  updateUserStatus: async (id, status, reason) => {
    const response = await coreAxiosClient.patch(`/users/${id}/status`, { status, reason });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể cập nhật trạng thái người dùng.");
  }
};
