import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * LoginPage - Trang đăng nhập của hệ thống (FE-FND-05)
 * Thiết kế tối giản, độ tương phản cao, hỗ trợ tài khoản seed chạy offline
 */
export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Kịch bản đăng nhập tài khoản Seed chạy offline (không cần backend)
    const seedUsers = {
      admin01: { username: "admin01", fullName: "Quản Trị Viên Hệ Thống", role: "ADMIN" },
      manager01: { username: "manager01", fullName: "Quản Lý Bãi Xe", role: "MANAGER" },
      staff01: { username: "staff01", fullName: "Nhân Viên Cổng Vận Hành", role: "STAFF" },
      driver01: { username: "driver01", fullName: "Tài Xế Nguyễn Văn A", role: "DRIVER" },
    };

    setTimeout(() => {
      const userKey = username.trim().toLowerCase();
      if (seedUsers[userKey]) {
        const token = `mock-token-for-${userKey}`;
        onLoginSuccess(token, seedUsers[userKey]);

        // Điều hướng dựa trên vai trò (role) của tài khoản
        if (seedUsers[userKey].role === "ADMIN") {
          navigate("/admin/users");
        } else if (seedUsers[userKey].role === "MANAGER") {
          navigate("/manager/dashboard");
        } else if (seedUsers[userKey].role === "DRIVER") {
          navigate("/driver/profile");
        } else {
          navigate("/staff/entry");
        }
      } else {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      }
      setIsLoading(false);
    }, 500); // Tạo độ trễ nhẹ giả lập gọi API
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-black text-center text-slate-800 mb-2">ĐĂNG NHẬP</h2>
        <p className="text-center text-slate-500 text-xs mb-6">Hệ Thống Vận Hành Bãi Đỗ Xe</p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-2.5 text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên tài khoản</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ví dụ: staff01"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded bg-blue-700 hover:bg-blue-800 text-white py-2 text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600">
          <span className="font-bold block mb-1 text-slate-700">Tài khoản demo chạy thử:</span>
          <ul className="list-disc list-inside">
            <li>Nhân viên: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">staff01</code></li>
            <li>Quản lý: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">manager01</code></li>
            <li>Quản trị: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">admin01</code></li>
            <li>Tài xế: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">driver01</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
