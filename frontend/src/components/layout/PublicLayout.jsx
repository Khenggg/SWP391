import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

/**
 * PublicLayout - Bố cục cho khách vãng lai và tài xế (Driver/Visitor)
 * Giao diện tối giản, sử dụng Tailwind CSS tương phản tốt
 */
export default function PublicLayout() {
  const location = useLocation();

  // Định nghĩa các nút điều hướng công cộng
  const menuItems = [
    { label: "Thông Tin Bãi Xe", path: "/" },
    { label: "Số Slot Trống", path: "/available-slots" },
    { label: "Bảng Giá", path: "/pricing" },
    { label: "Nội Quy", path: "/rules" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center space-x-2 text-lg font-black tracking-tight text-blue-700">
            <span className="bg-blue-700 px-2 py-0.5 text-white rounded text-sm">PB</span>
            <span>PARKING SYSTEM</span>
          </Link>

          {/* Navigation Menu */}
          <nav className="flex space-x-2 sm:space-x-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded px-3 py-1.5 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Login Action */}
          <div>
            <Link
              to="/login"
              className="rounded bg-blue-700 hover:bg-blue-800 px-4 py-2 text-sm font-bold text-white transition-colors"
            >
              Đăng Nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p className="font-bold text-slate-700">Hệ Thống Quản Lý Bãi Đỗ Xe Thông Minh (Parking Building)</p>
        </div>
      </footer>
    </div>
  );
}
