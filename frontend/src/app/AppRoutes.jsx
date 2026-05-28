import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Nhập các Bố cục (Layouts) và trang lỗi
import PublicLayout from "../components/layout/PublicLayout";
import AppShell from "../components/layout/AppShell";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import LoginPage from "../pages/LoginPage";

// =========================================================================
// PUBLIC PAGES - Đã xây dựng Phase A + B (Sprint 1 FE)
// =========================================================================
import ParkingInfoPage from "../pages/ParkingInfoPage";
import RulesPage from "../pages/RulesPage";
import PublicPricingPage from "../pages/PublicPricingPage";
import AvailableSlotsPage from "../pages/AvailableSlotsPage";

// =========================================================================
// ADMIN PAGES - Đã xây dựng Phase A + B (Sprint 1 FE)
// =========================================================================
import UserManagementPage from "../pages/admin/UserManagementPage";

// =========================================================================
// MANAGER PAGES - Đã xây dựng Phase A + B (Sprint 1 FE)
// =========================================================================
import CardManagementPage from "../pages/manager/CardManagementPage";
import StructureManagementPage from "../pages/manager/StructureManagementPage";
import PricingManagementPage from "../pages/manager/PricingManagementPage";
import MonthlyPassManagementPage from "../pages/manager/MonthlyPassManagementPage";

// =========================================================================
// ROUTE GUARDS
// =========================================================================

// Kiểm tra đăng nhập — chưa đăng nhập thì redirect về /login
const RequireAuth = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// Kiểm tra quyền vai trò — sai role thì redirect về /unauthorized
const RequireRole = ({ userRole, allowedRoles }) => {
  return allowedRoles.includes(userRole) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

/**
 * AppRoutes - Chỉ khai báo route cho các page ĐÃ được xây dựng.
 * Page chưa build → không có route → rơi vào /404.
 */
export default function AppRoutes({ isAuthenticated, userRole, currentUser, onLoginSuccess, onLogout }) {
  return (
    <Routes>

      {/* ---- PUBLIC ROUTES (không cần đăng nhập) ---- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<ParkingInfoPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/pricing" element={<PublicPricingPage />} />
        <Route path="/available-slots" element={<AvailableSlotsPage />} />
        {/* /card/:qrToken — Sprint 3, chưa build */}
      </Route>

      {/* ---- LOGIN ---- */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            // Đã đăng nhập → redirect đến trang đầu tiên của từng role (chỉ trang đã build)
            userRole === "ADMIN" ? (
              <Navigate to="/admin/users" replace />
            ) : userRole === "MANAGER" ? (
              <Navigate to="/manager/cards" replace />
            ) : (
              // STAFF / DRIVER chưa có trang riêng → về trang chủ public
              <Navigate to="/" replace />
            )
          ) : (
            <LoginPage onLoginSuccess={onLoginSuccess} />
          )
        }
      />

      {/* ---- PROTECTED ROUTES (yêu cầu đăng nhập) ---- */}
      <Route element={<RequireAuth isAuthenticated={isAuthenticated} />}>
        <Route element={<AppShell currentUser={currentUser} onLogout={onLogout} />}>

          {/* MANAGER — các trang đã build */}
          <Route element={<RequireRole userRole={userRole} allowedRoles={["MANAGER"]} />}>
            <Route path="/manager/cards" element={<CardManagementPage />} />
            <Route path="/manager/structures" element={<StructureManagementPage />} />
            <Route path="/manager/pricing" element={<PricingManagementPage />} />
            <Route path="/manager/monthly-passes" element={<MonthlyPassManagementPage />} />
            {/* Chưa build: /manager/dashboard, /manager/reports, /manager/lost-card-approvals,
                /manager/mismatch-approvals, /manager/audit-logs — Sprint 4/5 */}
          </Route>

          {/* ADMIN — các trang đã build */}
          <Route element={<RequireRole userRole={userRole} allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/users" element={<UserManagementPage />} />
            {/* Chưa build: /admin/audit-logs, /admin/sessions-administration — Sprint 4/5 */}
          </Route>

          {/* STAFF — chưa build (Sprint 3/4) */}
          {/* DRIVER — chưa build */}

        </Route>
      </Route>

      {/* ---- ERROR ROUTES ---- */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />

    </Routes>
  );
}
