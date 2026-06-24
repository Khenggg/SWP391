import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

/**
 * PublicLayout - Bố cục cho khách vãng lai và tài xế (Driver/Visitor)
 * Hỗ trợ giao diện Responsive (Mobile Friendly)
 */
export default function PublicLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define menu items
  const menuItems = [
    { label: "Thông Tin Bãi Xe", path: "/" },
    { label: "Số Slot Trống", path: "/available-slots" },
    { label: "Bảng Giá", path: "/pricing" },
    { label: "Nội Quy", path: "/rules" },
  ];

  // Dynamic theme colors based on route
  const getThemeConfig = (path) => {
    switch (path) {
      case "/available-slots":
        return { accent: "text-emerald-400", bgHover: "hover:bg-emerald-400/10", border: "border-emerald-500", button: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(5,150,105,0.4)]" };
      case "/pricing":
        return { accent: "text-amber-400", bgHover: "hover:bg-amber-400/10", border: "border-amber-500", button: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.4)]" };
      case "/rules":
        return { accent: "text-rose-400", bgHover: "hover:bg-rose-400/10", border: "border-rose-500", button: "bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.4)]" };
      default: // Parking Info (Home)
        return { accent: "text-violet-400", bgHover: "hover:bg-violet-400/10", border: "border-violet-500", button: "bg-violet-600 hover:bg-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.4)]" };
    }
  };

  const theme = getThemeConfig(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className={`flex items-center justify-center w-8 h-8 rounded bg-white/5 border border-white/10 ${theme.accent} group-hover:scale-105 transition-transform`}>
              <span className="font-black text-xs tracking-tight">PB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest text-white">PARKING SYSTEM</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">Quản lý bãi xe thông minh</span>
            </div>
          </Link>

          {/* Navigation Menu (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative rounded-full px-4 py-1.5 text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? `text-white bg-white/5`
                      : `text-slate-400 hover:text-white ${theme.bgHover}`
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className={`absolute -bottom-[17px] left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-t-full ${theme.accent.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Login Action (Desktop) */}
          <div className="hidden md:block">
            <Link
              to="/login"
              className={`rounded-full px-5 py-2 text-xs font-bold text-white transition-all ${theme.button}`}
            >
              Đăng Nhập
            </Link>
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-white/10 bg-slate-900 px-4 py-4 md:hidden space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-bold transition-colors ${
                    isActive
                      ? `bg-white/5 ${theme.accent}`
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-white/5">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-center rounded-lg py-3 text-sm font-bold text-white transition-all ${theme.button}`}
              >
                Đăng Nhập
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
