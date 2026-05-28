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

        {/* Nút đăng xuất */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full rounded bg-red-950 text-red-400 hover:bg-red-900 px-3 py-2 text-sm font-bold transition-colors text-left"
          >
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header trên cùng */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h2 className="text-md font-extrabold text-slate-700">
            Hệ Thống Vận Hành Bãi Đỗ Xe Thông Minh
          </h2>

          {/* User profile */}
          <div className="flex items-center space-x-3 text-sm">
            <span className="font-bold text-slate-700">
              {currentUser?.fullName || currentUser?.username || "Nhân viên"}
            </span>
            <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
              {role}
            </span>
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
