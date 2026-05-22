import { useState } from "react";
import { Car, ShieldCheck, Users, Truck, Eye, EyeOff, ParkingCircle } from "lucide-react";

const roles = [
  { id: "staff", label: "Nhân viên", sublabel: "Điều hành cổng ra/vào", icon: Users, color: "bg-blue-50 border-blue-200 text-blue-700" },
  { id: "manager", label: "Quản lý", sublabel: "Theo dõi & báo cáo", icon: ShieldCheck, color: "bg-purple-50 border-purple-200 text-purple-700" },
  { id: "admin", label: "Admin", sublabel: "Quản trị hệ thống", icon: ShieldCheck, color: "bg-red-50 border-red-200 text-red-700" },
  { id: "driver", label: "Lái xe", sublabel: "Tra cứu QR thẻ gửi", icon: Truck, color: "bg-green-50 border-green-200 text-green-700" },
];

interface LoginScreenProps {
  onLogin: (role: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("nhanvien01");
  const [password, setPassword] = useState("••••••••");
  const [showPass, setShowPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState("staff");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(selectedRole);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
      />

      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left panel */}
        <div className="bg-blue-700/80 backdrop-blur-sm p-10 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <ParkingCircle className="w-7 h-7 text-blue-700" />
              </div>
              <div>
                <div className="text-xs text-blue-200 uppercase tracking-widest">Hệ thống</div>
                <div className="font-semibold text-lg leading-tight">ParkSmart Pro</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">Quản lý bãi đỗ xe thông minh</h1>
            <p className="text-blue-200 text-sm leading-relaxed">
              Hệ thống quản lý bãi đỗ xe 3 tầng với thẻ QR tĩnh, theo dõi thời gian thực và thanh toán tự động.
            </p>
          </div>

          {/* Building visualization */}
          <div className="mt-8 space-y-2">
            <div className="text-xs text-blue-200 uppercase tracking-widest mb-3">Sơ đồ tòa nhà</div>
            {[
              { floor: "Tầng B3", label: "Xe vận chuyển hàng hóa", icon: "🚚", slots: 20, occupied: 8 },
              { floor: "Tầng B2", label: "Ô tô & Ô tô điện", icon: "🚗", slots: 60, occupied: 42 },
              { floor: "Tầng B1", label: "Xe đạp, xe điện, xe máy", icon: "🛵", slots: 120, occupied: 95 },
            ].map((f) => (
              <div key={f.floor} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <span className="text-xl">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">{f.floor}</span>
                    <span className="text-xs text-blue-200">{f.occupied}/{f.slots}</span>
                  </div>
                  <div className="text-xs text-blue-200 truncate">{f.label}</div>
                  <div className="mt-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-400"
                      style={{ width: `${(f.occupied / f.slots) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel – login form */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</h2>
          <p className="text-gray-500 text-sm mb-6">Chọn vai trò và nhập thông tin đăng nhập</p>

          {/* Role selector */}
          <div className="mb-5">
            <label className="text-sm text-gray-600 mb-2 block">Vai trò</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedRole === r.id ? r.color + " border-current" : "border-gray-100 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <r.icon className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold leading-tight">{r.label}</div>
                    <div className="text-xs opacity-70 leading-tight">{r.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Demo: chọn vai trò và nhấn đăng nhập để xem giao diện
          </p>
        </div>
      </div>
    </div>
  );
}
