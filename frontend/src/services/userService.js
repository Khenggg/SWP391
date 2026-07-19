import coreAxiosClient from "../api/coreAxiosClient";

export const userService = {
  getUsers: async () => {
    const response = await coreAxiosClient.get("/users");
    if (response.success && response.data) {
      return response.data;
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

  updateUserRole: async (id, role) => {
    const response = await coreAxiosClient.patch(`/users/${id}/role`, { role });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể đổi vai trò người dùng.");
  },

  updateUserStatus: async (id, status) => {
    const response = await coreAxiosClient.patch(`/users/${id}/status`, { status });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể cập nhật trạng thái người dùng.");
  }
};
