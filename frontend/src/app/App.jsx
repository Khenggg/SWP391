import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

/**
 * App - Component gốc của ứng dụng (Root Component)
 * Quản lý trạng thái đăng nhập toàn cục bằng useState và useEffect
 * Tuân thủ quy tắc không dùng Context API hay các thư viện quản lý state phức tạp.
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // Đang khôi phục phiên từ sessionStorage

  // Khôi phục trạng thái đăng nhập từ sessionStorage khi tải ứng dụng
  useEffect(() => {
    const savedToken = sessionStorage.getItem("accessToken");
    const savedUserJson = sessionStorage.getItem("currentUser");

    if (savedToken && savedUserJson) {
      try {
        const parsedUser = JSON.parse(savedUserJson);
        setToken(savedToken);
        setCurrentUser(parsedUser);
        setUserRole(parsedUser.role);
        setIsAuthenticated(true);
        console.log("Khôi phục phiên thành công:", parsedUser.username);
      } catch (err) {
        console.error("Lỗi đọc thông tin phiên đăng nhập từ sessionStorage, đang xóa phiên lỗi...");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("currentUser");
      }
    }
    setIsInitializing(false);
  }, []);

  // Xử lý sau khi đăng nhập thành công
  const handleLoginSuccess = (accessToken, user) => {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    setToken(accessToken);
    setCurrentUser(user);
    setUserRole(user.role);
    setIsAuthenticated(true);
    console.log("Đăng nhập thành công cho người dùng:", user.username);
  };

  // Xử lý đăng xuất tài khoản
  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("currentUser");

    setToken(null);
    setCurrentUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    console.log("Đã đăng xuất tài khoản.");
  };

  // Hiển thị vòng xoay chờ trong lúc khôi phục phiên
  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center font-bold text-slate-500 animate-pulse text-sm">
          ĐANG KHỞI ĐỘNG HỆ THỐNG...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </BrowserRouter>
  );
}
