import axios from "axios";
import { apiRequestTimeout } from "./requestTimeout";
import { clearAuthStorage, refreshAccessToken } from "../services/sessionService";

// Khởi tạo instance Axios cho Core API Service (.NET)
const coreAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL || "/api/core",
  timeout: apiRequestTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tự động đính kèm accessToken vào tiêu đề xác thực
coreAxiosClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Chuẩn hóa phản hồi và xử lý lỗi chung (401, 403, validation, network)
coreAxiosClient.interceptors.response.use(
  (response) => {
    // Trả về phần dữ liệu của phản hồi
    return response.data;
  },
  async (error) => {
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        success: false,
        message: "Core Service dang khoi dong hoac phan hoi qua cham. Vui long thu lai sau vai giay.",
      });
    }

    if (error.response) {
      const { status } = error.response;
      const requestConfig = error.config || {};
      const requestUrl = requestConfig.url || "";
      const isAuthEndpoint = /\/auth\/(login|refresh-token|logout)/.test(requestUrl);

      if (status === 401 && !requestConfig._retry && !isAuthEndpoint) {
        requestConfig._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();
          requestConfig.headers = requestConfig.headers || {};
          requestConfig.headers.Authorization = `Bearer ${newAccessToken}`;
          return coreAxiosClient(requestConfig);
        } catch (refreshError) {
          clearAuthStorage();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      if (status === 401 && isAuthEndpoint) {
        return Promise.reject(error.response.data || error.message);
      }

      // Hết phiên đăng nhập -> tự động xóa token và đá về /login
      if (status === 401) {
        clearAuthStorage();
        window.location.href = "/login";
      }

      if (status === 403 && requestUrl.includes("/auth/me")) {
        clearAuthStorage();
        window.location.href = "/login";
        return Promise.reject(error.response.data || error.message);
      }

      // Không có quyền truy cập -> chuyển sang trang unauthorized
      if (status === 403) {
        window.location.href = "/unauthorized";
      }

      return Promise.reject(error.response.data || error.message);
    }
    
    // Lỗi không có phản hồi từ mạng (Network Error)
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Core Service. Vui lòng liên hệ bộ phận kỹ thuật.",
    });
  }
);

export default coreAxiosClient;
