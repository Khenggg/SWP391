import React, { useState, useEffect } from "react";
import { parkingService } from "@/services/parkingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AreaDensityGauge({ area, isCar }) {
  const maxCap = area.maxCapacity || area.totalSlots || 0;
  const current = area.currentCount !== undefined ? area.currentCount : (maxCap - (area.availableSlots || 0));
  const percent = maxCap > 0 ? Math.round((current / maxCap) * 100) : 0;
  const available = maxCap - current;

  let statusLabel = "Thông thoáng";
  let barColor = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
  let textColor = "text-emerald-400";
  let borderColor = "border-emerald-500/30";
  let badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  let boxGlow = "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/50";

  if (percent >= 90) {
    statusLabel = "Đầy chỗ";
    barColor = "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse";
    textColor = "text-rose-400";
    borderColor = "border-rose-500/30";
    badgeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    boxGlow = "hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-500/50";
  } else if (percent >= 75) {
    statusLabel = "Khá đông";
    barColor = "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]";
    textColor = "text-amber-400";
    borderColor = "border-amber-500/30";
    badgeColor = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    boxGlow = "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-500/50";
  }

  return (
    <div className={`p-5 rounded-2xl bg-[#061410]/80 backdrop-blur-md border transition-all duration-300 ${borderColor} ${boxGlow}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="font-mono text-[10px] font-black text-emerald-600/70 uppercase tracking-widest block mb-0.5">
            {area.code}
          </span>
          <h4 className="font-bold text-white text-sm">{area.name}</h4>
        </div>
        <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${badgeColor}`}>
          {statusLabel}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-slate-400">
          <span className="uppercase tracking-wider">Mật độ bao phủ</span>
          <span className={textColor}>{percent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-700 rounded-full ${barColor}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-medium">
          <span>Đang đỗ: <span className="text-slate-300">{current}/{maxCap}</span></span>
          <span>Còn trống: <span className="text-white font-bold">{available}</span></span>
        </div>
      </div>
      
      {/* Decorative car grid map logic inside gauge for B2 (just visual flair) */}
      {isCar && available > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-5 gap-1.5 opacity-60">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-4 rounded border ${i < 2 ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvailableSlotsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [areas, setAreas] = useState([]);
  const [floors, setFloors] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingService.getAvailableSlots();
      setAreas(data.areas || []);
      setFloors(data.floors || []);
      setVehicleTypes(data.vehicleTypes || []);
    } catch (e) {
      setError("Không tải được dữ liệu bãi xe. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const vehicleOptions = ["ALL", ...vehicleTypes.map((v) => v.name)];
  const floorOptions = ["ALL", ...floors.map((f) => f.code)];

  // Motorbike calculations (B1)
  const mbAreas = areas.filter((a) => a.floorCode === "B1");
  const mbTotalCapacity = mbAreas.reduce((sum, a) => sum + a.maxCapacity, 0);
  const mbTotalCurrent = mbAreas.reduce((sum, a) => sum + a.currentCount, 0);
  const mbPercent = mbTotalCapacity > 0 ? Math.round((mbTotalCurrent / mbTotalCapacity) * 100) : 0;

  // Transport calculations (B3)
  const tsAreas = areas.filter((a) => a.floorCode === "B3");
  const tsTotalCapacity = tsAreas.reduce((sum, a) => sum + a.maxCapacity, 0);
  const tsTotalCurrent = tsAreas.reduce((sum, a) => sum + a.currentCount, 0);
  const tsPercent = tsTotalCapacity > 0 ? Math.round((tsTotalCurrent / tsTotalCapacity) * 100) : 0;

  // Car calculations (B2)
  const carAreas = areas.filter((a) => a.floorCode === "B2");
  const carTotalCapacity = carAreas.reduce((sum, a) => sum + (a.maxCapacity || a.totalSlots || 0), 0);
  const carTotalCurrent = carAreas.reduce((sum, a) => sum + (a.currentCount !== undefined ? a.currentCount : ((a.maxCapacity || a.totalSlots) - (a.availableSlots || 0))), 0);
  const carPercent = carTotalCapacity > 0 ? Math.round((carTotalCurrent / carTotalCapacity) * 100) : 0;

  // Mismatch Error logic
  let infoMessage = null;

  if (filterVehicle === "Xe Máy" && (filterFloor === "B2" || filterFloor === "B3")) {
    infoMessage = { title: "Vị trí không phù hợp", desc: "Xe Máy chỉ đỗ tại Tầng B1. Vui lòng chuyển bộ lọc sang Tầng B1." };
  } else if (filterVehicle === "Ô Tô" && (filterFloor === "B1" || filterFloor === "B3")) {
    infoMessage = { title: "Vị trí không phù hợp", desc: "Xe Ô Tô chỉ đỗ tại Tầng B2. Vui lòng chuyển bộ lọc sang Tầng B2." };
  } else if (filterVehicle === "Xe Vận Chuyển" && (filterFloor === "B1" || filterFloor === "B2")) {
    infoMessage = { title: "Vị trí không phù hợp", desc: "Xe Vận Chuyển chỉ đỗ tại Tầng B3. Vui lòng chuyển bộ lọc sang Tầng B3." };
  }

  const showB1 = !infoMessage && (filterFloor === "ALL" || filterFloor === "B1") && (filterVehicle === "ALL" || filterVehicle === "Xe Máy");
  const showB2 = !infoMessage && (filterFloor === "ALL" || filterFloor === "B2") && (filterVehicle === "ALL" || filterVehicle === "Ô Tô");
  const showB3 = !infoMessage && (filterFloor === "ALL" || filterFloor === "B3") && (filterVehicle === "ALL" || filterVehicle === "Xe Vận Chuyển");

  return (
    <div className="flex-grow bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#064e3b] via-slate-950 to-[#020617]">
      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 text-white tracking-tight">
              Số Slot Trống <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">Real-time</span>
            </h1>
            <p className="text-emerald-500/70 text-sm max-w-2xl font-medium">
              Cập nhật tình trạng chỗ đỗ xe theo thời gian thực tại các khu vực và các tầng của bãi đỗ xe.
            </p>
          </div>
          
          {/* Right: Illustration */}
          <div className="relative mt-12 lg:mt-0 w-full flex justify-center">
             {/* Background neon glow */}
            <div className="absolute inset-0 bg-emerald-600/20 blur-[100px] rounded-full pointer-events-none" />
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
        
        {/* Filters and Summaries Container */}
        <div className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-md">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Tầng B1 (Xe máy)", val: mbPercent, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
              { label: "Tầng B2 (Ô tô)", val: carPercent, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" },
              { label: "Tầng B3 (Vận tải)", val: tsPercent, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 text-center ${s.bg} ${s.border}`}>
                <p className={`text-2xl md:text-3xl font-black ${s.color}`}>{s.val}%</p>
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest mr-2">Loại xe:</span>
              {vehicleOptions.map((v) => (
                <Button
                  key={v}
                  onClick={() => setFilterVehicle(v)}
                  variant={filterVehicle === v ? "default" : "outline"}
                  className={`rounded-full px-4 h-8 text-xs font-bold transition-all ${
                    filterVehicle === v
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                      : "bg-transparent text-slate-400 border-white/10 hover:border-emerald-500/50 hover:text-emerald-400"
                  }`}
                >
                  {v === "ALL" ? "Tất cả" : v}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest mr-2">Tầng:</span>
              {floorOptions.map((f) => (
                <Button
                  key={f}
                  onClick={() => setFilterFloor(f)}
                  variant={filterFloor === f ? "default" : "outline"}
                  className={`rounded-full px-4 h-8 text-xs font-bold transition-all ${
                    filterFloor === f
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                      : "bg-transparent text-slate-400 border-white/10 hover:border-emerald-500/50 hover:text-emerald-400"
                  }`}
                >
                  {f === "ALL" ? "Tất cả" : f}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Display Area */}
        <div className="space-y-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
              <p className="text-red-400 text-sm font-semibold mb-4">⚠ {error}</p>
              <Button onClick={load} variant="outline" className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/20">Thử lại</Button>
            </div>
          ) : infoMessage ? (
            <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-10 text-center text-rose-400">
              <span className="text-4xl block mb-4 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">!</span>
              <h3 className="text-base font-black uppercase tracking-wide mb-2 text-rose-300">{infoMessage.title}</h3>
              <p className="text-sm opacity-80 max-w-lg mx-auto">{infoMessage.desc}</p>
            </div>
          ) : (
            <>
              {/* Tầng B1 - Xe Máy */}
              {showB1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-l-2 border-teal-500 pl-4">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">
                      Tầng B1 <span className="text-teal-400 font-medium">/ Xe Máy</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {mbAreas.map((area) => <AreaDensityGauge key={area.id} area={area} isCar={false} />)}
                  </div>
                </div>
              )}

              {/* Tầng B2 - Ô Tô */}
              {showB2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-l-2 border-emerald-500 pl-4">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">
                      Tầng B2 <span className="text-emerald-400 font-medium">/ Ô Tô</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {carAreas.map((area) => <AreaDensityGauge key={area.id} area={area} isCar={true} />)}
                  </div>
                </div>
              )}

              {/* Tầng B3 - Vận Chuyển */}
              {showB3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 border-l-2 border-amber-500 pl-4">
                    <h2 className="text-lg font-black text-white uppercase tracking-wider">
                      Tầng B3 <span className="text-amber-400 font-medium">/ Vận Chuyển</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {tsAreas.map((area) => <AreaDensityGauge key={area.id} area={area} isCar={false} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
