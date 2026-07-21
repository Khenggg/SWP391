import axios from "axios";
import { apiRequestTimeout } from "./requestTimeout";

// Khởi tạo instance Axios cho Public API Service (Spring Boot)
const publicAxiosClient = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL || "/api/public",
  timeout: apiRequestTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor
publicAxiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data || error.message);
    }
    
    return Promise.reject({
      success: false,
      message: "Lỗi kết nối mạng đến Public Service.",
    });
  }
);

export default publicAxiosClient;
