import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

/**
 * AppShell - Bố cục nội bộ (Layout Portal) cho Staff, Manager, Admin
 * Nhận trạng thái `currentUser` và callback `onLogout` qua props từ App.jsx
 */
export default function AppShell({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="flex min-h-screen bg-slate-100 text-slate-800">
      
      {/* Sidebar cố định */}
      <aside className="w-64 border-r border-slate-200 bg-slate-900 text-white flex flex-col">
        {/* Tiêu đề */}
        <div className="flex h-16 items-center px-6 border-b border-slate-800 font-black tracking-wider text-sm">
          PORTAL QUẢN TRỊ
        </div>

        {/* Menu liên kết */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {activeMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header trên cùng */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h2 className="text-md font-extrabold text-slate-700">
            Hệ Thống Vận Hành Bãi Đỗ Xe Thông Minh
          </h2>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700">
                {currentUser?.fullName || currentUser?.username || "Nhân viên"}
              </span>
              <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
                {role}
              </span>
            </div>

            <span className="h-6 w-[1px] bg-slate-200" aria-hidden="true" />

            <button
              onClick={handleLogout}
              title="Đăng xuất hệ thống"
              className="flex items-center gap-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all cursor-pointer shadow-sm"
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
              Đăng Xuất
            </button>
          </div>
        </header>

        {/* Thân trang chứa subpage */}
        <main className="flex-grow p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
