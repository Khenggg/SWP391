import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Nhập các Bố cục (Layouts) và trang lỗi
import PublicLayout from "../components/layout/PublicLayout";
import AppShell from "../components/layout/AppShell";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import LoginPage from "../pages/LoginPage"; // Sẽ tạo ở bước tiếp theo

// =========================================================================
// MOCK COMPONENTS - Khai báo tạm thời các trang nghiệp vụ để định tuyến không lỗi
// Tránh việc tạo hàng chục file trống trên đĩa cứng (Over-engineering)
// =========================================================================
const ParkingInfoPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Thông Tin Bãi Xe</h3><p className="text-slate-500 text-sm mt-1">Thông tin chi tiết về địa chỉ, hotline bãi xe.</p></div>;
const AvailableSlotsPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Số Slot Trống</h3><p className="text-slate-500 text-sm mt-1">Bản đồ và danh sách số ô đỗ còn trống thời gian thực.</p></div>;
const PublicPricingPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Bảng Giá Gửi Xe</h3><p className="text-slate-500 text-sm mt-1">Biểu giá vé lượt, vé đêm và vé tháng dành cho khách hàng.</p></div>;
const RulesPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Nội Quy Bãi Xe</h3><p className="text-slate-500 text-sm mt-1">Quy định ra vào bãi xe và đền bù khi mất thẻ.</p></div>;
const CardLookupPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Tra Cứu Thẻ</h3><p className="text-slate-500 text-sm mt-1">Tra cứu biển số, giờ vào và trạng thái thẻ.</p></div>;

const StaffEntryPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Cho Xe Vào (Entry)</h3><p className="text-slate-500 text-sm mt-1">Nhân viên quét thẻ và nhập biển số đầu vào.</p></div>;
const StaffExitPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Cho Xe Ra (Exit)</h3><p className="text-slate-500 text-sm mt-1">Tính phí gửi và xác thực biển số đầu ra.</p></div>;
const StaffLostCardPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Báo Mất Thẻ</h3><p className="text-slate-500 text-sm mt-1">Tạo hồ sơ báo mất thẻ xe cho khách.</p></div>;
const StaffSessionSearchPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Tìm Kiếm Lượt Gửi</h3><p className="text-slate-500 text-sm mt-1">Tra cứu lịch sử xe vào ra bãi.</p></div>;

const ManagerDashboardPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Dashboard</h3><p className="text-slate-500 text-sm mt-1">Bảng số liệu thống kê vận hành thời gian thực.</p></div>;
const ReportsPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Báo Cáo Thống Kê</h3><p className="text-slate-500 text-sm mt-1">Báo cáo doanh thu tài chính theo ngày/tháng/năm.</p></div>;
const LostCardApprovalPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Duyệt Mất Thẻ</h3><p className="text-slate-500 text-sm mt-1">Phê duyệt miễn giảm hoặc bồi thường mất thẻ.</p></div>;
const MismatchApprovalPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Duyệt Sai Biển Số</h3><p className="text-slate-500 text-sm mt-1">Xử lý sai biển số đầu ra so với đầu vào.</p></div>;
const CardManagementPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Quản Lý Thẻ</h3><p className="text-slate-500 text-sm mt-1">Quản lý danh sách thẻ chip NFC bãi xe.</p></div>;
const StructureManagementPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Quản Lý Sơ Đồ Bãi Xe</h3><p className="text-slate-500 text-sm mt-1">Quản lý sơ đồ tầng và vị trí đỗ.</p></div>;
const PricingManagementPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Quản Lý Bảng Giá</h3><p className="text-slate-500 text-sm mt-1">Cấu hình các khung giờ và biểu phí gửi xe.</p></div>;
const MonthlyPassManagementPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Quản Lý Vé Tháng</h3><p className="text-slate-500 text-sm mt-1">Đăng ký và gia hạn thẻ gửi xe định kỳ.</p></div>;
const AuditLogPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Nhật Ký Kiểm Toán</h3><p className="text-slate-500 text-sm mt-1">Nhật ký hoạt động của nhân viên trên hệ thống.</p></div>;

const UserManagementPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Quản Lý Người Dùng</h3><p className="text-slate-500 text-sm mt-1">Quản lý tài khoản quản lý và nhân viên.</p></div>;
const AdminAuditLogPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Nhật Ký Hệ Thống</h3><p className="text-slate-500 text-sm mt-1">Audit log hệ thống bảo mật cấp Admin.</p></div>;
const SessionAdministrationPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Quản Trị Phiên Gửi</h3><p className="text-slate-500 text-sm mt-1">Cơ chế khẩn cấp chỉnh sửa/đóng lượt gửi xe.</p></div>;

// Các trang nghiệp vụ cho tài xế (DRIVER)
const DriverProfilePage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Thông Tin Cá Nhân (Driver)</h3><p className="text-slate-500 text-sm mt-1">Hồ sơ thông tin tài xế.</p></div>;
const DriverVehiclesPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Xe Của Tôi (Driver)</h3><p className="text-slate-500 text-sm mt-1">Đăng ký và quản lý xe cá nhân.</p></div>;
const DriverHistoryPage = () => <div className="p-6 bg-white border border-slate-200 rounded shadow-sm"><h3>Lịch Sử Gửi Xe (Driver)</h3><p className="text-slate-500 text-sm mt-1">Tra cứu lịch sử và hóa đơn gửi xe.</p></div>;

// =========================================================================
// ROUTE GUARDS - Các bộ bảo vệ định tuyến viết tinh gọn (Inline Guards)
// =========================================================================

// Kiểm tra đăng nhập
const RequireAuth = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Kiểm tra quyền truy cập của vai trò
const RequireRole = ({ userRole, allowedRoles }) => {
  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

/**
 * Component AppRoutes - Cấu hình định tuyến chính của ứng dụng
 */
export default function AppRoutes({ isAuthenticated, userRole, currentUser, onLoginSuccess, onLogout }) {
  return (
    <Routes>
      {/* 1. Nhóm định tuyến Công cộng dành cho tài xế/khách (Public) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ParkingInfoPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/pricing" element={<PublicPricingPage />} />
        <Route path="/available-slots" element={<AvailableSlotsPage />} />
        <Route path="/card/:qrToken" element={<CardLookupPage />} />
      </Route>

      {/* 2. Định tuyến Đăng nhập (LoginPage) */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            // Điều hướng nhanh khi đã có phiên làm việc
            userRole === "ADMIN" ? (
              <Navigate to="/admin/users" replace />
            ) : userRole === "MANAGER" ? (
              <Navigate to="/manager/dashboard" replace />
            ) : userRole === "DRIVER" ? (
              <Navigate to="/driver/profile" replace />
            ) : (
              <Navigate to="/staff/entry" replace />
            )
          ) : (
            <LoginPage onLoginSuccess={onLoginSuccess} />
          )
        } 
      />

      {/* 3. Nhóm định tuyến Bảo vệ (Yêu cầu Đăng nhập và Vai trò cụ thể) */}
      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route element={<AppShell currentUser={currentUser} onLogout={onLogout} />}>
          
          {/* Phân quyền Nhân Viên Vận Hành (STAFF) */}
          <Route element={<RequireRole userRole={userRole} allowedRoles={["STAFF", "MANAGER"]} />}>
            <Route path="/staff/entry" element={<StaffEntryPage />} />
            <Route path="/staff/exit" element={<StaffExitPage />} />
            <Route path="/staff/lost-card" element={<StaffLostCardPage />} />
            <Route path="/staff/sessions" element={<StaffSessionSearchPage />} />
          </Route>

          {/* Phân quyền Quản Lý Bãi Xe (MANAGER) */}
          <Route element={<RequireRole userRole={userRole} allowedRoles={["MANAGER"]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboardPage />} />
            <Route path="/manager/reports" element={<ReportsPage />} />
            <Route path="/manager/lost-card-approvals" element={<LostCardApprovalPage />} />
            <Route path="/manager/mismatch-approvals" element={<MismatchApprovalPage />} />
            <Route path="/manager/cards" element={<CardManagementPage />} />
            <Route path="/manager/structures" element={<StructureManagementPage />} />
            <Route path="/manager/pricing" element={<PricingManagementPage />} />
            <Route path="/manager/monthly-passes" element={<MonthlyPassManagementPage />} />
            <Route path="/manager/audit-logs" element={<AuditLogPage />} />
          </Route>

          {/* Phân quyền Quản Trị Viên Hệ Thống (ADMIN) */}
          <Route element={<RequireRole userRole={userRole} allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogPage />} />
            <Route path="/admin/sessions-administration" element={<SessionAdministrationPage />} />
          </Route>

          {/* Phân quyền Tài Xế Đăng Nhập (DRIVER) */}
          <Route element={<RequireRole userRole={userRole} allowedRoles={["DRIVER"]} />}>
            <Route path="/driver/profile" element={<DriverProfilePage />} />
            <Route path="/driver/vehicles" element={<DriverVehiclesPage />} />
            <Route path="/driver/history" element={<DriverHistoryPage />} />
          </Route>

        </Route>
      </Route>

      {/* 4. Định tuyến lỗi */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
