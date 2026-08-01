import React, { useState, useEffect, useMemo, useCallback } from "react";
import { parkingService } from "@/services/parkingService";
import {
  CarFront,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Zap,
  Car,
  Bike,
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Interactive Slot Chip ──────────────────────────────────────────────────
function SlotChip({ code, isEV }) {
  const displayCode = code || "N/A";
  return (
    <div
      className={`group relative flex items-center justify-between border rounded-2xl px-4 py-3 text-xs font-mono font-bold transition-all duration-300 cursor-pointer shadow-sm hover:-translate-y-1 ${
        isEV
          ? "bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-200 text-amber-900 hover:shadow-amber-500/10 hover:border-amber-400"
          : "bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-emerald-200 text-emerald-950 hover:shadow-emerald-500/10 hover:border-emerald-400"
      }`}
    >
      <div className="flex items-center gap-2">
        {isEV ? (
          <Zap className="h-4 w-4 text-amber-500 flex-shrink-0 animate-bounce" />
        ) : (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        )}
        <span className="tracking-wider">{displayCode}</span>
      </div>
      {isEV && (
        <Badge className="px-1.5 py-0.5 text-[9px] font-sans font-extrabold bg-amber-500 text-white border-none rounded">
          EV
        </Badge>
      )}
    </div>
  );
}

// ─── Area Section ─────────────────────────────────────────────────────────────
function AreaSection({ areaCode, areaName, vehicleTypeName, slots }) {
  const displayCode = areaCode || "KHU";
  const displayName = areaName || `Khu ${displayCode}`;
  const validSlots = Array.isArray(slots) ? slots : [];

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl">
      {/* Area Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-50 bg-slate-50/40">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black font-mono text-slate-500 bg-slate-200/60 rounded-lg px-2.5 py-1 uppercase tracking-wider">
            {displayCode}
          </span>
          <span className="text-sm font-extrabold text-slate-800">{displayName}</span>
          {vehicleTypeName && (
            <Badge variant="outline" className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200/50 rounded-xl">
              {String(vehicleTypeName).includes("Mô tô") || String(vehicleTypeName).includes("Xe máy") || String(vehicleTypeName).includes("Máy") ? (
                <Bike className="mr-1.5 h-3 w-3 inline text-blue-600" />
              ) : (
                <Car className="mr-1.5 h-3 w-3 inline text-blue-600" />
              )}
              {vehicleTypeName}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="font-bold text-emerald-700 bg-emerald-50 border-emerald-200/50 px-3 py-1 rounded-xl">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 inline" />
          {validSlots.length} vị trí còn trống
        </Badge>
      </div>

      {/* Slot Grid */}
      <CardContent className="p-6">
        {validSlots.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 italic">Không còn vị trí khả dụng tại khu vực này</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {validSlots.map((s, idx) => {
              const code = s?.slotCode || `SLOT-${idx}`;
              const codeStr = String(code).toUpperCase();
              const isEV = codeStr.includes("ECO") || codeStr.includes("EV");
              return <SlotChip key={s?.id || code || idx} code={code} isEV={isEV} />;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Floor Summary Card ───────────────────────────────────────────────────────
function FloorCard({ floorCode, floorName, count, isSelected, onClick }) {
  return (
    <Card
      onClick={onClick}
      className={`p-5 text-center cursor-pointer transition-all duration-300 border rounded-2xl ${
        isSelected
          ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-950/15"
          : "bg-white text-slate-800 border-slate-100 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex justify-center mb-2">
        <Layers className={`h-5 w-5 ${isSelected ? "text-blue-400" : "text-blue-600"}`} />
      </div>
      <p className={`text-3xl font-black ${isSelected ? "text-white" : "text-slate-900"}`}>{count}</p>
      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isSelected ? "text-slate-400" : "text-slate-500"}`}>
        {floorName || `Tầng ${floorCode}`}
      </p>
      <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-emerald-400 font-bold" : "text-slate-400"}`}>Khả dụng</span>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvailableSlotsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slots, setSlots] = useState([]);
  const [areas, setAreas] = useState([]);
  const [floors, setFloors] = useState([]);
  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterVehicleType, setFilterVehicleType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [countdown, setCountdown] = useState(30);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingService.getAvailableSlots();
      setSlots(Array.isArray(data?.slots) ? data.slots : []);
      setAreas(Array.isArray(data?.areas) ? data.areas : []);
      setFloors(Array.isArray(data?.floors) ? data.floors : []);
      setCountdown(30);
    } catch {
      setError("Không thể tải dữ liệu vị trí bãi xe. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto Refresh Interval 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          load();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [load]);

  // Calculate vehicle breakdown counts
  const carAvailableCount = useMemo(() => {
    return (slots || []).filter((s) => {
      const vt = String(s?.vehicleTypeName || "").toLowerCase();
      return vt.includes("ô tô") || vt.includes("car") || (!vt.includes("máy") && !vt.includes("bike"));
    }).length;
  }, [slots]);

  const bikeAvailableCount = useMemo(() => {
    return (slots || []).filter((s) => {
      const vt = String(s?.vehicleTypeName || "").toLowerCase();
      return vt.includes("máy") || vt.includes("bike") || vt.includes("mô tô");
    }).length;
  }, [slots]);

  // Safe Filter areas by floor & vehicle type & search query
  const filteredAreas = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    return (areas || []).filter((a) => {
      if (!a) return false;
      const areaCodeStr = a.code ? String(a.code) : "";
      const areaNameStr = a.name ? String(a.name) : "";
      const vt = a.vehicleTypeName ? String(a.vehicleTypeName).toLowerCase() : "";

      const matchFloor =
        filterFloor === "ALL" ||
        a.floorCode === filterFloor ||
        areaCodeStr.startsWith(filterFloor);

      const matchVehicle =
        filterVehicleType === "ALL" ||
        (filterVehicleType === "Ô tô" && (vt.includes("ô tô") || vt.includes("car") || (!vt.includes("máy") && !vt.includes("bike")))) ||
        (filterVehicleType === "Máy" && (vt.includes("máy") || vt.includes("bike") || vt.includes("mô tô")));

      const matchSearch =
        !q ||
        areaCodeStr.toLowerCase().includes(q) ||
        areaNameStr.toLowerCase().includes(q) ||
        (slots || []).some(
            (s) =>
              s &&
              s.areaCode === a.code &&
              s.slotCode &&
              String(s.slotCode).toLowerCase().includes(q)
        );

      return matchFloor && matchVehicle && matchSearch;
    });
  }, [areas, filterFloor, filterVehicleType, searchQuery, slots]);

  // Count slots per floor for summary
  const floorCounts = useMemo(() => {
    return (floors || []).reduce((acc, f) => {
      if (f && f.code) {
        acc[f.code] = (slots || []).filter((s) => s && (s.floorCode === f.code || String(s.areaCode || s.slotCode || "").startsWith(f.code))).length;
      }
      return acc;
    }, {});
  }, [floors, slots]);

  const totalAvailable = (slots || []).length;
  const estimatedCapacity = 40;
  const availabilityPercentage = Math.min(100, Math.round((totalAvailable / estimatedCapacity) * 100));

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Page Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 z-0" />
        <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Dữ liệu trực quan thời gian thực
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <CarFront className="h-8 w-8 text-blue-500" />
                CHỖ TRỐNG HIỆN TẠI
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Tra cứu vị trí đỗ xe còn trống theo tầng, khu vực và loại xe. Cập nhật và làm mới tự động.
              </p>

              {/* Vehicle Type Breakdown Strip */}
              {!isLoading && !error && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs font-bold text-slate-300">
                    <Car className="h-4 w-4 text-blue-400" />
                    <span>Xe Ô tô:</span>
                    <strong className="text-white font-mono text-sm">{carAvailableCount} chỗ</strong>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-xs font-bold text-slate-300">
                    <Bike className="h-4 w-4 text-indigo-400" />
                    <span>Xe Máy:</span>
                    <strong className="text-white font-mono text-sm">{bikeAvailableCount} chỗ</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Overall Capacity Status Card */}
            {!isLoading && !error && (
              <Card className="bg-slate-800/90 border-slate-700 text-white p-6 min-w-[300px] shadow-xl backdrop-blur-md rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng chỗ khả dụng</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold px-2.5 py-0.5 rounded-lg">
                    Còn nhiều chỗ
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-4xl font-black text-emerald-400 font-mono leading-none">{totalAvailable}</span>
                  <span className="text-xs text-slate-400">Tỷ lệ khả dụng: <strong className="text-white">{availabilityPercentage}%</strong></span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${availabilityPercentage}%` }}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Floor Summary Grid */}
        {!isLoading && !error && (floors || []).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card
              onClick={() => {
                setFilterFloor("ALL");
                setFilterVehicleType("ALL");
              }}
              className={`p-5 text-center cursor-pointer transition-all duration-300 border rounded-2xl ${
                filterFloor === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-950/15"
                  : "bg-white text-slate-800 border-slate-100 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="flex justify-center mb-2">
                <Layers className={`h-5 w-5 ${filterFloor === "ALL" ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <p className={`text-3xl font-black ${filterFloor === "ALL" ? "text-white" : "text-slate-900"}`}>{totalAvailable}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${filterFloor === "ALL" ? "text-slate-400" : "text-slate-500"}`}>
                Tất cả tầng
              </p>
              <span className={`text-[10px] block mt-0.5 ${filterFloor === "ALL" ? "text-emerald-400 font-bold" : "text-slate-400"}`}>Khả dụng</span>
            </Card>

            {floors.map((f) => (
              <FloorCard
                key={f.code}
                floorCode={f.code}
                floorName={f.name}
                count={floorCounts[f.code] ?? 0}
                isSelected={filterFloor === f.code}
                onClick={() => {
                  setFilterFloor(f.code);
                  setFilterVehicleType("ALL");
                }}
              />
            ))}
          </div>
        )}

        {/* Controls & Filter Bar */}
        <Card className="shadow-sm border border-slate-100 p-5 bg-white rounded-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Quick Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập mã vị trí (ví dụ: B-ECO1-001 hoặc Khu)..."
                className="pl-11 h-11 border-slate-200 rounded-xl focus-visible:ring-blue-600 text-sm"
              />
            </div>

            {/* Vehicle Type Filter Segment */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-1.5 uppercase tracking-widest">
                <SlidersHorizontal className="h-4 w-4 text-blue-500" />
                Bộ lọc:
              </span>
              <Button
                size="sm"
                onClick={() => setFilterVehicleType("ALL")}
                className={`rounded-xl text-xs font-bold px-4 py-2 transition-all ${
                  filterVehicleType === "ALL" 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-none"
                }`}
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                onClick={() => setFilterVehicleType("Ô tô")}
                className={`rounded-xl text-xs font-bold px-4 py-2 transition-all ${
                  filterVehicleType === "Ô tô" 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-none"
                }`}
              >
                <Car className="mr-1.5 h-3.5 w-3.5 inline" />
                Ô tô ({carAvailableCount})
              </Button>
              <Button
                size="sm"
                onClick={() => setFilterVehicleType("Máy")}
                className={`rounded-xl text-xs font-bold px-4 py-2 transition-all ${
                  filterVehicleType === "Máy" 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-none"
                }`}
              >
                <Bike className="mr-1.5 h-3.5 w-3.5 inline" />
                Xe Máy ({bikeAvailableCount})
              </Button>

              {/* Refresh Button & Auto-refresh Timer */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 ml-auto lg:ml-0">
                <span className="text-xs text-slate-400 font-mono">Tự động tải lại: {countdown}s</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={load}
                  disabled={isLoading}
                  className="h-8 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-white border border-slate-100 rounded-2xl p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-8 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-rose-50 border-rose-200 p-10 text-center shadow-none rounded-2xl">
            <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-700 font-bold text-base mb-1">{error}</p>
            <Button variant="destructive" onClick={load} className="rounded-xl px-6 font-semibold">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Thử lại ngay
            </Button>
          </Card>
        ) : filteredAreas.length === 0 ? (
          <Card className="p-16 text-center shadow-none border-slate-150 rounded-2xl bg-white">
            <CarFront className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-base">Không tìm thấy vị trí đỗ phù hợp</p>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Không có vị trí trống thỏa mãn bộ lọc hiện tại. Thử đổi tầng hoặc xóa từ khóa tìm kiếm.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAreas.map((area) => {
              const q = (searchQuery || "").trim().toLowerCase();
              const areaSlots = (slots || []).filter((s) => {
                if (!s) return false;
                const slotCodeStr = s.slotCode ? String(s.slotCode) : "";
                const areaCodeStr = area && area.code ? String(area.code) : "";
                const matchArea = s.areaCode === area.code;
                const matchQuery =
                  !q ||
                  slotCodeStr.toLowerCase().includes(q) ||
                  areaCodeStr.toLowerCase().includes(q);
                return matchArea && matchQuery;
              });

              return (
                <AreaSection
                  key={area.code}
                  areaCode={area.code}
                  areaName={area.name}
                  vehicleTypeName={area.vehicleTypeName}
                  slots={areaSlots}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
