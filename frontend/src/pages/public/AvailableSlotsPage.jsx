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
      className={`group relative flex items-center gap-2 border rounded-xl px-3 py-2 text-xs font-mono font-bold transition-all duration-200 cursor-pointer shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
        isEV
          ? "bg-amber-50/80 border-amber-200 text-amber-900 hover:bg-amber-100/90"
          : "bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100/90"
      }`}
    >
      {isEV ? (
        <Zap className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 animate-pulse" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
      )}
      <span>{displayCode}</span>
      {isEV && (
        <Badge className="ml-1 px-1 py-0 text-[9px] font-sans font-extrabold bg-amber-500 text-white border-none">
          EV Sạc
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
    <Card className="overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      {/* Area Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-black font-mono text-slate-500 bg-slate-200/70 rounded px-2 py-0.5 uppercase tracking-wider">
            {displayCode}
          </span>
          <span className="text-sm font-bold text-slate-800">{displayName}</span>
          {vehicleTypeName && (
            <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
              {String(vehicleTypeName).includes("Mô tô") || String(vehicleTypeName).includes("Xe máy") || String(vehicleTypeName).includes("Máy") ? (
                <Bike className="mr-1 h-3 w-3 inline text-blue-600" />
              ) : (
                <Car className="mr-1 h-3 w-3 inline text-blue-600" />
              )}
              {vehicleTypeName}
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="font-bold text-emerald-700 bg-emerald-50 border-emerald-200 px-3 py-1">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600 inline" />
          {validSlots.length} chỗ khả dụng
        </Badge>
      </div>

      {/* Slot Grid */}
      <CardContent className="p-5">
        {validSlots.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 italic">Không còn vị trí khả dụng tại khu vực này</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
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
      className={`p-4 text-center cursor-pointer transition-all duration-200 border ${
        isSelected
          ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
          : "bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:shadow-sm"
      }`}
    >
      <div className="flex justify-center mb-1">
        <Layers className={`h-4 w-4 ${isSelected ? "text-blue-200" : "text-blue-600"}`} />
      </div>
      <p className={`text-2xl font-black ${isSelected ? "text-white" : "text-slate-900"}`}>{count}</p>
      <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
        {floorName || `Tầng ${floorCode}`}
      </p>
      <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-blue-200" : "text-slate-400"}`}>khả dụng</span>
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
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-900/40 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Sơ đồ vị trí trực quan thời gian thực
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <CarFront className="h-8 w-8 text-blue-400" />
                Chỗ Trống Hiện Tại
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl">
                Tra cứu vị trí đỗ xe còn trống theo tầng, khu vực và loại xe. Dữ liệu được làm mới tự động mỗi 30 giây.
              </p>

              {/* Vehicle Type Breakdown Strip */}
              {!isLoading && !error && (
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-700/50 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-blue-200">
                    <Car className="h-4 w-4 text-blue-400" />
                    <span>Xe Ô tô:</span>
                    <strong className="text-white font-mono text-sm">{carAvailableCount} chỗ</strong>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-indigo-900/60 border border-indigo-700/50 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-indigo-200">
                    <Bike className="h-4 w-4 text-indigo-400" />
                    <span>Xe Máy:</span>
                    <strong className="text-white font-mono text-sm">{bikeAvailableCount} chỗ</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Overall Capacity Status Card */}
            {!isLoading && !error && (
              <Card className="bg-slate-800/80 border-slate-700/80 text-white p-5 min-w-[280px] shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng chỗ khả dụng</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold">
                    <ShieldCheck className="mr-1 h-3 w-3 inline" />
                    Còn nhiều chỗ
                  </Badge>
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono">{totalAvailable}</span>
                  <span className="text-xs text-slate-400">Tỷ lệ khả dụng: <strong className="text-white">{availabilityPercentage}%</strong></span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
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
              onClick={() => setFilterFloor("ALL")}
              className={`p-4 text-center cursor-pointer transition-all duration-200 border ${
                filterFloor === "ALL"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300"
                  : "bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:shadow-sm"
              }`}
            >
              <div className="flex justify-center mb-1">
                <Layers className={`h-4 w-4 ${filterFloor === "ALL" ? "text-blue-200" : "text-blue-600"}`} />
              </div>
              <p className={`text-2xl font-black ${filterFloor === "ALL" ? "text-white" : "text-slate-900"}`}>{totalAvailable}</p>
              <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${filterFloor === "ALL" ? "text-blue-100" : "text-slate-500"}`}>
                Tất cả tầng
              </p>
              <span className={`text-[10px] block mt-0.5 ${filterFloor === "ALL" ? "text-blue-200" : "text-slate-400"}`}>khả dụng</span>
            </Card>

            {floors.map((f) => (
              <FloorCard
                key={f.code}
                floorCode={f.code}
                floorName={f.name}
                count={floorCounts[f.code] ?? 0}
                isSelected={filterFloor === f.code}
                onClick={() => setFilterFloor(f.code)}
              />
            ))}
          </div>
        )}

        {/* Controls & Filter Bar */}
        <Card className="shadow-sm border border-slate-200/80 p-4 bg-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập mã vị trí (ví dụ: B-ECO1-001 hoặc Khu)..."
                className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-blue-600"
              />
            </div>

            {/* Vehicle Type Filter Segment */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                Loại xe:
              </span>
              <Button
                size="sm"
                variant={filterVehicleType === "ALL" ? "default" : "outline"}
                onClick={() => setFilterVehicleType("ALL")}
                className={`rounded-xl text-xs font-semibold h-8 ${
                  filterVehicleType === "ALL" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-200 text-slate-700"
                }`}
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                variant={filterVehicleType === "Ô tô" ? "default" : "outline"}
                onClick={() => setFilterVehicleType("Ô tô")}
                className={`rounded-xl text-xs font-semibold h-8 ${
                  filterVehicleType === "Ô tô" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-200 text-slate-700"
                }`}
              >
                <Car className="mr-1 h-3.5 w-3.5" />
                Xe Ô tô ({carAvailableCount})
              </Button>
              <Button
                size="sm"
                variant={filterVehicleType === "Máy" ? "default" : "outline"}
                onClick={() => setFilterVehicleType("Máy")}
                className={`rounded-xl text-xs font-semibold h-8 ${
                  filterVehicleType === "Máy" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-200 text-slate-700"
                }`}
              >
                <Bike className="mr-1 h-3.5 w-3.5" />
                Xe Máy ({bikeAvailableCount})
              </Button>

              {/* Refresh Button & Auto-refresh Timer */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 ml-auto lg:ml-0">
                <span className="text-xs text-slate-400 font-mono">Tự làm mới: {countdown}s</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={load}
                  disabled={isLoading}
                  className="h-8 px-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3">
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
            <p className="text-rose-500 text-xs mb-4">Vui lòng kiểm tra lại kết nối mạng hoặc máy chủ.</p>
            <Button variant="destructive" onClick={load} className="rounded-xl px-6 font-semibold">
              <RefreshCw className="mr-2 h-4 w-4" /> Thử lại ngay
            </Button>
          </Card>
        ) : filteredAreas.length === 0 ? (
          <Card className="p-16 text-center shadow-none border-slate-200/80 rounded-2xl bg-white">
            <CarFront className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700 text-base">Không tìm thấy vị trí đỗ phù hợp</p>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
              Không có vị trí trống thỏa mãn bộ lọc hiện tại. Thử đổi tầng hoặc xóa từ khóa tìm kiếm.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterFloor("ALL");
                setFilterVehicleType("ALL");
                setSearchQuery("");
              }}
              className="mt-4 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Đặt lại bộ lọc
            </Button>
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
