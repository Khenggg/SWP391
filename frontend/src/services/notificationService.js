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
   * Lấy toàn bộ thông báo của một user.
   * Fields: id, title, content, type (MONTHLY_PASS|PAYMENT|RESERVATION|PRICE_CHANGE|SYSTEM),
   *         priority (LOW|NORMAL|HIGH), isRead, readAt, createdAt
   */
  getNotifications: async (userId) => {
    const res = await notificationAxiosClient.get(`/${userId}`);
    const list = res && typeof res === "object" && "success" in res ? res.data : res;
    return Array.isArray(list) ? list : [];
  },

  /**
   * Lấy danh sách thông báo chưa đọc.
   */
  getUnreadNotifications: async (userId) => {
    const res = await notificationAxiosClient.get(`/${userId}/unread`);
    const list = res && typeof res === "object" && "success" in res ? res.data : res;
    return Array.isArray(list) ? list : [];
  },

  /**
   * Đếm số thông báo chưa đọc.
   */
  getUnreadCount: async (userId) => {
    const res = await notificationAxiosClient.get(`/${userId}/count`);
    const count = res && typeof res === "object" && "success" in res ? res.data : res;
    return typeof count === "number" ? count : 0;
  },

  /**
   * Đánh dấu đã đọc.
   */
  markAsRead: async (id) => {
    try {
      const res = await notificationAxiosClient.patch(`/${id}/read`);
      return res && typeof res === "object" && "success" in res ? res.data : res;
    } catch {
      return null;
    }
  },
};
