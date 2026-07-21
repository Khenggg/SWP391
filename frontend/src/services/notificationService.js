import axios from "axios";
import { apiRequestTimeout } from "../api/requestTimeout";

// Khởi tạo instance Axios cho Notification API (Spring Boot)
// Cắt '/support' thay bằng '/notifications' để trúng endpoint của Java Backend
export const notificationBaseURL = import.meta.env.VITE_SUPPORT_API_URL 
  ? import.meta.env.VITE_SUPPORT_API_URL.replace('/support', '/notifications')
  : "/api/notifications";

const notificationAxiosClient = axios.create({
  baseURL: notificationBaseURL,
  timeout: apiRequestTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
notificationAxiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
notificationAxiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("currentUser");
        window.location.href = "/login";
      }

      if (status === 403) {
        window.location.href = "/unauthorized";
      }

      return Promise.reject(error.response.data || error.message);
    }
    
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Notification Service.",
    });
  }
);

export const notificationService = {
  getNotifications: async (userId) => {
    const response = await notificationAxiosClient.get(`/${userId}`);
    return response.success ? response.data : [];
  },

  getUnreadNotifications: async (userId) => {
    const response = await notificationAxiosClient.get(`/${userId}/unread`);
    return response.success ? response.data : [];
  },

  markAsRead: async (id) => {
    const response = await notificationAxiosClient.patch(`/${id}/read`);
    return response.success ? response.data : null;
  },
};
