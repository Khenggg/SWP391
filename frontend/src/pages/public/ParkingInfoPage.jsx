import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parkingService } from "@/services/parkingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  OPEN: { label: "ĐANG MỞ CỬA", className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.2)]" },
  CLOSED: { label: "ĐÃ ĐÓNG CỬA", className: "bg-red-500/10 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]" },
  MAINTENANCE: { label: "BẢO TRÌ", className: "bg-amber-500/10 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]" },
};

function formatTime(isoString) {
  return new Date(isoString).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ParkingInfoPage() {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await parkingService.getParkingInfo();
        setInfo(data);
      } catch {
        setError("Không tải được thông tin bãi xe. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const statusCfg = STATUS_CONFIG[info?.status] || STATUS_CONFIG["CLOSED"];

  return (
    <div className="flex-grow bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#0f172a] to-[#020617]">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          {/* Left: Info */}
          <div>
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-white/5 rounded-lg w-3/4" />
                <div className="h-5 bg-white/5 rounded-lg w-1/2" />
                <div className="h-4 bg-white/5 rounded-lg w-1/3" />
              </div>
            ) : error ? (
              <div>
                <p className="text-red-400 text-sm font-semibold mb-3">{error}</p>
                <Button onClick={() => { setIsLoading(true); setError(null); }} variant="outline" className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Thử lại
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
                  <span className="text-white block mb-2 drop-shadow-md">
                    {info.name.includes("Bãi Đỗ Xe Tòa Nhà") ? "Bãi Đỗ Xe Tòa Nhà" : "Bãi Đỗ Xe"}
                  </span>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">
                      {info.name.replace("Bãi Đỗ Xe Tòa Nhà", "").trim() || info.name}
                    </span>
                    <Badge className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusCfg.className} mt-1 md:mt-0`}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                </h1>

                <div className="space-y-4">
                  {[
                    { icon: "📍", text: info.address },
                    { icon: "📞", text: info.hotline },
                    { icon: "⏰", text: `Giờ mở cửa: ${info.openingHours}` },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <span className="text-violet-400 text-lg">{row.icon}</span>
                      <span className="text-sm font-medium tracking-wide">{row.text}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Illustration */}
          <div className="relative mt-12 lg:mt-0 w-full flex justify-center">
             {/* Background neon glow */}
            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
            <img 
              src="/images/isometric-parking.png" 
              alt="Smart Parking Concept" 
              className="relative w-full max-w-[320px] md:max-w-[400px] lg:max-w-[500px] object-cover opacity-90 mix-blend-screen pointer-events-none transform lg:scale-110 lg:translate-x-4"
              style={{
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)"
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        
        {/* Stats Row */}
        {!isLoading && !error && info && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Tổng số tầng", value: info.totalFloors, icon: "🏢" },
              { label: "Tổng số khu", value: info.totalAreas, icon: "🗺️" },
              { label: "Tổng số slot", value: info.totalSlots, icon: "🅿️" },
              { label: "Slot còn trống", value: info.availableSlots, icon: "✅", highlight: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative rounded-2xl p-5 border transition-all duration-300 bg-white/[0.02] backdrop-blur-sm"
                style={{
                  borderColor: stat.highlight ? "rgba(52,211,153,0.3)" : "rgba(139,92,246,0.2)",
                  boxShadow: stat.highlight ? "0 4px 20px rgba(52,211,153,0.05)" : "0 4px 20px rgba(0,0,0,0.2)",
                }}
              >
                <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none ${stat.highlight ? 'bg-emerald-500/5' : 'bg-violet-500/5'}`} />
                <div className="flex flex-col items-center text-center relative z-10">
                  <span className="text-2xl mb-2 drop-shadow-md">{stat.icon}</span>
                  <p className={`text-3xl font-black mb-1 ${stat.highlight ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "text-white"}`}>
                    {stat.value}
                  </p>
                  <p className="text-[11px] uppercase tracking-widest font-bold text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Truy cập nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Xem Slot Trống", desc: "Kiểm tra số chỗ còn trống theo tầng / loại xe", to: "/available-slots", letter: "P" },
              { label: "Bảng Giá Gửi Xe", desc: "Giá gửi xe theo giờ, ngày và vé tháng", to: "/pricing", letter: "$" },
              { label: "Nội Quy Bãi Xe", desc: "Quy định vào ra, mất thẻ, sai biển số", to: "/rules", letter: "!" },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.04] overflow-hidden"
              >
                <div className="absolute -inset-20 bg-violet-600/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl font-black text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.2)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all">
                    {action.letter}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm tracking-wide">{action.label}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{action.desc}</p>
                  </div>
                  <svg className="w-5 h-5 text-violet-500/50 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Support Note */}
        {!isLoading && !error && info && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Hỗ Trợ Khách Hàng</p>
            <p className="text-sm text-slate-300 leading-relaxed">{info.supportNote}</p>
            {info.lastUpdated && (
              <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                Cập nhật: {formatTime(info.lastUpdated)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
