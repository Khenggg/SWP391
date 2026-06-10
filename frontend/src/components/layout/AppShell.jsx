import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

/**
 * AppShell - Bố cục nội bộ (Layout Portal) cho Staff, Manager, Admin, Driver
 * Hỗ trợ giao diện Responsive (Mobile Friendly)
 */
export default function AppShell({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = currentUser?.role || "STAFF";

  const handleLogout = () => {
    if (window.confirm("Xác nhận đăng xuất khỏi hệ thống?")) {
      onLogout();
      navigate("/login");
    }
  };

  // Cấu hình menu động theo vai trò của người dùng
  const menus = {
    STAFF: [
      { label: "Cho Xe Vào (Entry)", path: "/staff/entry" },
      { label: "Cho Xe Ra (Exit)", path: "/staff/exit" },
      { label: "Báo Mất Thẻ", path: "/staff/lost-card" },
      { label: "Tìm Kiếm Phiên Gửi", path: "/staff/sessions" },
    ],
    MANAGER: [
      { label: "Bảng Vận Hành (Dashboard)", path: "/manager/dashboard" },
      { label: "Báo Cáo Thống Kê", path: "/manager/reports" },
      { label: "Duyệt Mất Thẻ", path: "/manager/lost-card-approvals" },
      { label: "Duyệt Sai Biển Số", path: "/manager/mismatch-approvals" },
      { label: "Quản Lý Thẻ", path: "/manager/cards" },
      { label: "Sơ Đồ Bãi Xe", path: "/manager/structures" },
      { label: "Cấu Hình Giá", path: "/manager/pricing" },
      { label: "Quản Lý Vé Tháng", path: "/manager/monthly-passes" },
      { label: "Nhật Ký Kiểm Toán (Audit)", path: "/manager/audit-logs" },
    ],
    ADMIN: [
      { label: "Quản Lý Người Dùng", path: "/admin/users" },
      { label: "Nhật Ký Hệ Thống", path: "/admin/audit-logs" },
      { label: "Quản Trị Phiên Gửi", path: "/admin/sessions-administration" },
    ],
    DRIVER: [
      { label: "Thông Tin Cá Nhân", path: "/driver/profile" },
      { label: "Đặt Chỗ Trước (Booking)", path: "/driver/booking" },
      { label: "Xe Của Tôi", path: "/driver/vehicles" },
      { label: "Lịch Sử Gửi Xe", path: "/driver/history" },
    ],
  };

  const activeMenu = menus[role] || [];

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 relative">
      
      {/* Mobile Drawer Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar (Responsive off-canvas) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex md:w-64 md:shrink-0 md:border-r md:border-slate-800 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Tiêu đề & Nút đóng trên Mobile */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 font-black tracking-wider text-sm">
          <span>PORTAL QUẢN TRỊ</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu liên kết */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {activeMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`block rounded px-3 py-2 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header trên cùng */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h2 className="text-xs sm:text-sm md:text-md font-extrabold text-slate-700 truncate max-w-[140px] sm:max-w-none">
              Hệ Thống Vận Hành Bãi Đỗ Xe Thông Minh
            </h2>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-bold text-slate-700 max-w-[70px] sm:max-w-none truncate">
                {currentUser?.fullName || currentUser?.username || "Nhân viên"}
              </span>
              <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0">
                {role}
              </span>
            </div>

            <span className="h-5 w-[1px] bg-slate-200 shrink-0" aria-hidden="true" />

            <button
              onClick={handleLogout}
              title="Đăng xuất hệ thống"
              className="flex items-center gap-1 rounded-lg bg-red-50 text-red-600 border border-red-200 px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer shadow-sm shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                />
              </svg>
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>
        </header>

        {/* Thân trang chứa subpage */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
