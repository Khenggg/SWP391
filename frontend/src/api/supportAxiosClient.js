import axios from "axios";
import { clearAuthStorage, refreshAccessToken } from "../services/sessionService";

// Khởi tạo instance Axios cho Support API Service (Spring Boot)
const supportAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_SUPPORT_API_URL || "/api/support",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
supportAxiosClient.interceptors.request.use(
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
supportAxiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response) {
      const { status } = error.response;
      const requestConfig = error.config || {};
      const requestUrl = requestConfig.url || "";

      if (status === 401 && !requestConfig._retry) {
        requestConfig._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();
          requestConfig.headers = requestConfig.headers || {};
          requestConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          return supportAxiosClient(requestConfig);
        } catch (refreshError) {
          clearAuthStorage();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      if (status === 401) {
        clearAuthStorage();
        window.location.href = "/login";
      }

      if (status === 403) {
        if (requestUrl.includes("/driver") || requestUrl.includes("/auth-check")) {
          clearAuthStorage();
          window.location.href = "/login";
        } else {
          window.location.href = "/unauthorized";
        }
      }

      return Promise.reject(error.response.data || error.message);
    }
    
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Support Service.",
    });
  }
);

export default supportAxiosClient;
