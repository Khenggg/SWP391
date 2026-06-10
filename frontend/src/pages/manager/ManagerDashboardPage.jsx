import React, { useState, useEffect } from "react";
import { dashboardService } from "../../services/dashboardService";

function formatVND(amount) {
  return Number(amount).toLocaleString("vi-VN") + "đ";
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState({ revenueToday: 0, entriesToday: 0, exitsToday: 0, incidents: 0 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentActivities()
        ]);
        setStats(statsData);
        setRecentActivities(activitiesData);
      } catch (err) {
        console.error("Lỗi tải thông tin Dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statsList = [
    { label: "Doanh Thu Hôm Nay", value: formatVND(stats.revenueToday), icon: "💰", color: "text-blue-600" },
    { label: "Lượt Xe Vào", value: stats.entriesToday.toString(), icon: "📥", color: "text-emerald-600" },
    { label: "Lượt Xe Ra", value: stats.exitsToday.toString(), icon: "📤", color: "text-amber-600" },
    { label: "Sự Cố (Cần Duyệt)", value: stats.incidents.toString(), icon: "⚠️", color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Bảng Vận Hành Bãi Xe</h2>
          <p className="text-sm text-slate-500 mt-0.5">Thống kê hoạt động gửi xe thời gian thực</p>
        </div>
        <div className="text-sm bg-white border border-slate-200 rounded-lg px-4 py-2 font-bold shadow-sm">
          <span className="text-emerald-500 mr-2">●</span> Live Data
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 h-24 shadow-sm" />
          ))}
        </div>
      ) : (
        /* Stats Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsList.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`text-3xl ${stat.color} bg-slate-50 p-3 rounded-lg`}>{stat.icon}</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ giả lập */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-black text-slate-700 mb-4 uppercase tracking-wide text-sm border-b pb-3">Lưu Lượng Xe Theo Giờ</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 60, 30, 80, 100, 70, 50, 90, 60, 40].map((h, i) => (
              <div key={i} className="w-full bg-blue-100 rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm transition-all duration-1000"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs font-bold text-slate-400">
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>22:00</span>
          </div>
        </div>

        {/* Danh sách xe đang đỗ giả lập */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="font-black text-slate-700 uppercase tracking-wide text-sm">Xe Vừa Vào Bãi</h3>
            <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">Xem tất cả</span>
          </div>
          
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg border border-slate-100" />
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">🚗</p>
              <p className="font-semibold">Không có hoạt động gần đây</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((v, i) => (
                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded text-xs font-bold ${v.type === "Ô Tô" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {v.type}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-slate-800">{v.plate}</p>
                      <p className="text-xs text-slate-500">{v.gate}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{v.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
