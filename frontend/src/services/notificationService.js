import axios from "axios";
import { apiRequestTimeout } from "../api/requestTimeout";

// Notification API base URL: Spring Boot support-api
export const notificationBaseURL = import.meta.env.VITE_SUPPORT_API_URL
  ? import.meta.env.VITE_SUPPORT_API_URL.replace("/support", "/notifications")
  : "/api/notifications";

const notificationAxiosClient = axios.create({
  baseURL: notificationBaseURL,
  timeout: apiRequestTimeout,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token
notificationAxiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response — BE trả về array trực tiếp (không có wrapper {success, data})
notificationAxiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("currentUser");
        window.location.href = "/login";
      }
      if (status === 403) window.location.href = "/unauthorized";
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject({ message: "Lỗi kết nối Notification Service." });
  }
);

export const notificationService = {
  /**
   * Lấy toàn bộ thông báo của một user. BE trả về List<NotificationResponse> trực tiếp.
   * Fields: id, title, content, type (MONTHLY_PASS|PAYMENT|RESERVATION|PRICE_CHANGE|SYSTEM),
   *         priority (LOW|NORMAL|HIGH), isRead, readAt, createdAt
   */
  getNotifications: async (userId) => {
    const data = await notificationAxiosClient.get(`/${userId}`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * Lấy danh sách thông báo chưa đọc.
   */
  getUnreadNotifications: async (userId) => {
    const data = await notificationAxiosClient.get(`/${userId}/unread`);
    return Array.isArray(data) ? data : [];
  },

  /**
   * Đếm số thông báo chưa đọc. BE trả về number trực tiếp.
   */
  getUnreadCount: async (userId) => {
    const data = await notificationAxiosClient.get(`/${userId}/count`);
    return typeof data === "number" ? data : 0;
  },

  /**
   * Đánh dấu đã đọc — Backend chưa expose endpoint này trong NotificationController.
   * Gọi gracefully, nếu lỗi 404/405 thì bỏ qua và chỉ cập nhật local state.
   */
  markAsRead: async (id) => {
    try {
      const data = await notificationAxiosClient.patch(`/${id}/read`);
      return data;
    } catch {
      // Endpoint chưa có ở BE → cập nhật local UI thôi
      return null;
    }
  },
};
