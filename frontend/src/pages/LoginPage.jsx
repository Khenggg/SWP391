import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, ShieldAlert, CheckCircle2, ChevronRight } from "lucide-react";
import bgImage from "../assets/parking_bg.png";
import { authService } from "../services/authService";

/**
 * LoginPage - Trang đăng nhập của hệ thống (FE-FND-05)
 * Thiết kế kính mờ (glassmorphism) hiện đại, trực quan, hỗ trợ tài khoản demo
 */
export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      try {
        const { token, user } = authService.login(username, password);
        onLoginSuccess(token, user);

        // Điều hướng dựa trên vai trò (role) của tài khoản
        if (user.role === "ADMIN") {
          navigate("/admin/users");
        } else if (user.role === "MANAGER") {
          navigate("/manager/dashboard");
        } else if (user.role === "DRIVER") {
          navigate("/driver/profile");
        } else {
          navigate("/staff/entry");
        }
      } catch (err) {
        setError(err.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
      } finally {
        setIsLoading(false);
      }
    }, 600); // Tạo độ trễ nhẹ giả lập gọi API
  };

  const handleQuickLogin = (demoUsername) => {
    setUsername(demoUsername);
    setPassword("password123");
    setError("");
  };

  const demoAccounts = [
    { label: "Nhân viên", username: "staff01", color: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30" },
    { label: "Quản lý", username: "manager01", color: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30" },
    { label: "Quản trị", username: "admin01", color: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30" },
    { label: "Tài xế Cư dân", username: "driver01", color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30" },
    { label: "Tài xế Đặt trước", username: "driver02", color: "from-blue-500/20 to-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  ];

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 overflow-hidden font-sans"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Lớp phủ gradient tạo chiều sâu và bảo đảm độ tương phản */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/85 to-slate-900/40 z-0"></div>

      {/* Trang trí vòng tròn neon mờ ảo phía sau card */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10 transition-all duration-300 hover:border-white/15">
        
        {/* Header/Logo */}
        <div 
          onClick={() => navigate("/")}
          className="flex flex-col items-center mb-8 cursor-pointer group"
          title="Về trang chính cổng thông tin"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-4 transition-transform group-hover:scale-105">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-center tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            PARKING SMART
          </h2>
          <p className="text-center text-slate-400 text-xs mt-1.5 uppercase tracking-wider font-semibold group-hover:text-slate-300">
            Hệ Thống Vận Hành Bãi Đỗ Xe
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-200 animate-shake">
            <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <span className="font-bold">Đăng nhập thất bại:</span> {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
              Tên tài khoản
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-offset-slate-900 transition-all focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Ví dụ: staff01"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
              Mật khẩu
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-cyan-400 transition-colors">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none ring-offset-slate-900 transition-all focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white py-3 text-sm font-bold shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>ĐANG ĐĂNG NHẬP...</span>
                </>
              ) : (
                <>
                  <span>ĐĂNG NHẬP</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo credentials Quick Login */}
        <div className="mt-8 border-t border-white/5 pt-6">
          <div className="flex items-center gap-1.5 mb-3">
            <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Chọn tài khoản demo để đăng nhập nhanh:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                type="button"
                onClick={() => handleQuickLogin(account.username)}
                className={`flex flex-col items-start p-2 rounded-lg bg-gradient-to-br border transition-all text-left duration-200 hover:scale-[1.02] hover:bg-white/5 active:scale-[0.98] cursor-pointer ${account.color}`}
              >
                <span className="text-[10px] opacity-75 font-semibold">{account.label}</span>
                <span className="text-xs font-mono font-bold mt-0.5">{account.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
