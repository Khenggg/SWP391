import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { StaffGateScreen } from "./components/StaffGateScreen";
import { DriverMobileScreen } from "./components/DriverMobileScreen";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { CardSlotManagement } from "./components/CardSlotManagement";
import {
  ParkingCircle, DoorOpen, QrCode, BarChart2, CreditCard,
  LogOut, ChevronDown, Users
} from "lucide-react";

type Screen = "login" | "staff" | "driver" | "manager" | "cards";
type Role = "staff" | "manager" | "admin" | "driver";

const navItems: { id: Screen; label: string; icon: any; roles: Role[] }[] = [
  { id: "staff", label: "Cổng Ra/Vào", icon: DoorOpen, roles: ["staff", "admin", "manager"] },
  { id: "driver", label: "Tra cứu QR", icon: QrCode, roles: ["driver", "staff", "admin", "manager"] },
  { id: "manager", label: "Dashboard", icon: BarChart2, roles: ["manager", "admin"] },
  { id: "cards", label: "Thẻ & Ô đỗ", icon: CreditCard, roles: ["admin", "manager"] },
];

const roleLabels: Record<Role, string> = {
  staff: "Nhân viên",
  manager: "Quản lý",
  admin: "Admin",
  driver: "Lái xe",
};

const roleColors: Record<Role, string> = {
  staff: "bg-blue-100 text-blue-700",
  manager: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
  driver: "bg-green-100 text-green-700",
};

const defaultScreenForRole: Record<Role, Screen> = {
  staff: "staff",
  manager: "manager",
  admin: "manager",
  driver: "driver",
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [currentRole, setCurrentRole] = useState<Role>("staff");

  const handleLogin = (role: string) => {
    const r = role as Role;
    setCurrentRole(r);
    setCurrentScreen(defaultScreenForRole[r]);
  };

  const handleLogout = () => {
    setCurrentScreen("login");
  };

  const visibleNav = navItems.filter((n) => n.roles.includes(currentRole));

  if (currentScreen === "login") {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-4 flex items-center h-14 gap-4 sticky top-0 z-40 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ParkingCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm hidden sm:block">ParkSmart Pro</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {visibleNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentScreen === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Screen switcher for demo */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5">
          <span className="text-xs text-blue-600 font-medium hidden md:block">Demo:</span>
          <div className="flex gap-1">
            {(["login", "staff", "driver", "manager", "cards"] as Screen[]).map((s, i) => {
              const labels = ["🔑", "🚗", "📱", "📊", "🃏"];
              const tips = ["Login", "Cổng", "QR", "Dashboard", "Thẻ&Ô"];
              return (
                <button
                  key={s}
                  onClick={() => setCurrentScreen(s)}
                  title={tips[i]}
                  className={`text-xs px-2 py-1 rounded-lg font-medium transition-all ${
                    currentScreen === s ? "bg-blue-600 text-white" : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {labels[i]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Role badge + user */}
        <div className="flex items-center gap-2 ml-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${roleColors[currentRole]}`}>
            {roleLabels[currentRole]}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Đăng xuất</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1">
        {currentScreen === "staff" && <StaffGateScreen />}
        {currentScreen === "driver" && <DriverMobileScreen />}
        {currentScreen === "manager" && <ManagerDashboard />}
        {currentScreen === "cards" && <CardSlotManagement />}
      </main>

      {/* Bottom label for context */}
      <div className="bg-white border-t border-gray-100 px-6 py-2 flex items-center justify-between text-xs text-gray-400">
        <span>ParkSmart Pro · MVP Demo · Đại học XYZ · 2026</span>
        <span>
          Màn hình hiện tại:{" "}
          <span className="font-medium text-gray-600">
            {currentScreen === "staff" ? "Cổng Ra/Vào (Nhân viên)" :
             currentScreen === "driver" ? "Tra cứu QR (Lái xe)" :
             currentScreen === "manager" ? "Dashboard (Quản lý)" :
             "Thẻ & Ô đỗ (Admin)"}
          </span>
        </span>
      </div>
    </div>
  );
}
