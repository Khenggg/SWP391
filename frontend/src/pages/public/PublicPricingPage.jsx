import React, { useState, useEffect } from "react";
import { pricingService } from "@/services/pricingService";
import { parkingService } from "@/services/parkingService";
import { Button } from "@/components/ui/button";
import { COMMON_STATUS } from "@/constants";

function formatVND(amount) {
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function PublicPricingPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pricingService.getPricingRules();
      setRules(data);
      const types = await parkingService.getVehicleTypes();
      setVehicleTypes(types);
    } catch {
      setError("Không tải được thông tin bảng giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeRules = rules.filter((r) => r.status === COMMON_STATUS.ACTIVE);
  const displayed = filterVehicle === "ALL"
    ? activeRules
    : activeRules.filter((r) => r.vehicleTypeName === filterVehicle);

  const vehicleOptions = ["ALL", ...vehicleTypes.map((v) => v.name)];

  return (
    <div className="flex-grow bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#451a03] via-slate-950 to-[#020617]">
      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl font-black text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                $
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Bảng Giá <span className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">Gửi Xe</span>
              </h1>
            </div>
            <p className="text-amber-500/70 text-sm max-w-2xl font-medium pl-16">
              Áp dụng từ 01/01/2026. Giá đã bao gồm thuế suất hiện hành.
            </p>
          </div>
          
          {/* Right: Illustration */}
          <div className="relative mt-12 lg:mt-0 w-full flex justify-center">
             {/* Background neon glow */}
            <div className="absolute inset-0 bg-amber-600/10 blur-[100px] rounded-full pointer-events-none" />
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

      <div className="max-w-6xl mx-auto px-6 pb-16 space-y-8">
        
        {/* Filter */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-md flex flex-col sm:flex-row items-center gap-4">
          <span className="text-[10px] font-black text-amber-600/80 uppercase tracking-widest">Loại xe:</span>
          <div className="flex flex-wrap items-center gap-2">
            {vehicleOptions.map((v) => (
              <Button
                key={v}
                onClick={() => setFilterVehicle(v)}
                variant={filterVehicle === v ? "default" : "outline"}
                className={`rounded-full px-5 h-9 text-xs font-bold transition-all ${
                  filterVehicle === v
                    ? "bg-amber-600 hover:bg-amber-500 text-white border-transparent shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-transparent text-slate-400 border-white/10 hover:border-amber-500/50 hover:text-amber-400"
                }`}
              >
                {v === "ALL" ? "Tất cả" : v}
              </Button>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-white/5 rounded-3xl" />)}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-400">
            <p className="text-sm font-semibold mb-4">⚠ {error}</p>
            <Button onClick={load} variant="outline" className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20">Thử lại</Button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-16 text-center text-slate-400">
            <span className="text-5xl block mb-4 opacity-50">💰</span>
            <p className="font-bold text-lg text-white">Chưa có bảng giá</p>
            <p className="text-sm mt-1">Không tìm thấy thông tin cho loại xe này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((rule) => (
              <div key={rule.id} className="group relative rounded-3xl p-6 bg-[#170a02]/80 backdrop-blur-md border border-amber-500/20 transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:-translate-y-1">
                {/* Highlight dot */}
                <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] animate-pulse" />
                
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider">{rule.vehicleTypeName}</h3>
                
                <div className="space-y-4">
                  {/* Monthly card highlight */}
                  <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/30 p-4 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 text-5xl opacity-10">🎫</div>
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Vé Tháng</p>
                    <p className="text-3xl font-black text-white drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{formatVND(rule.monthlyPrice)}<span className="text-xs font-normal text-slate-400 ml-1">/ tháng</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center transition-colors group-hover:border-amber-500/20">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Ban Ngày</p>
                      <p className="font-bold text-slate-200">{formatVND(rule.dayPrice)}</p>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center transition-colors group-hover:border-amber-500/20">
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Ban Đêm</p>
                      <p className="font-bold text-slate-200">{formatVND(rule.nightPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Phí mất thẻ</span>
                    <span className="text-sm font-black text-rose-400">{formatVND(rule.lostCardFee)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-500/80 font-medium flex gap-4 items-start">
          <span className="text-xl">⚠️</span>
          <p className="leading-relaxed pt-0.5">
            Giá ban ngày áp dụng <strong className="text-amber-400">06:00 – 22:00</strong> | Giá ban đêm áp dụng <strong className="text-amber-400">22:00 – 06:00</strong>. 
            Phí gửi giờ tính theo từng giờ lẻ làm tròn. Bảng giá có thể thay đổi mà không cần thông báo trước.
          </p>
        </div>
      </div>
    </div>
  );
}
