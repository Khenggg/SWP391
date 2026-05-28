import React, { useState, useEffect } from "react";
import { MOCK_SLOTS, MOCK_FLOORS, MOCK_VEHICLE_TYPES } from "../constants/mockData";

const SLOT_STATUS_BADGE = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  OCCUPIED: "bg-red-100 text-red-700 border border-red-300",
  MAINTENANCE: "bg-amber-100 text-amber-700 border border-amber-300",
  LOCKED: "bg-slate-100 text-slate-500 border border-slate-300",
};

const SLOT_STATUS_LABEL = {
  AVAILABLE: "Trống",
  OCCUPIED: "Đã Đỗ",
  MAINTENANCE: "Bảo Trì",
  LOCKED: "Khóa",
};

export default function AvailableSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterFloor, setFilterFloor] = useState("ALL");

  const load = () => {
    setIsLoading(true);
    setError(null);
    // Phase C: Thay bằng publicApi.getAvailableSlots(params)
    setTimeout(() => {
      setSlots(MOCK_SLOTS);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => { load(); }, []);

  // Filter
  const filteredSlots = slots.filter((s) => {
    const matchVehicle = filterVehicle === "ALL" || s.vehicleTypeName === filterVehicle;
    const matchFloor = filterFloor === "ALL" || s.floorCode === filterFloor;
    return matchVehicle && matchFloor;
  });

  const availableCount = filteredSlots.filter((s) => s.status === "AVAILABLE").length;
  const totalCount = filteredSlots.length;

  // Summary by vehicle type (for all slots, not filtered)
  const summaryByType = MOCK_VEHICLE_TYPES.map((vt) => ({
    name: vt.name,
    available: slots.filter((s) => s.vehicleTypeName === vt.name && s.status === "AVAILABLE").length,
    total: slots.filter((s) => s.vehicleTypeName === vt.name).length,
  }));

  const vehicleOptions = ["ALL", ...MOCK_VEHICLE_TYPES.map((v) => v.name)];
  const floorOptions = ["ALL", ...MOCK_FLOORS.map((f) => f.code)];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-black mb-2">Slot Đỗ Xe Còn Trống</h1>
          <p className="text-indigo-200 text-sm">
            Thông tin slot trống cập nhật thời gian thực. Lọc theo loại xe và tầng để tìm nhanh.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
            <p className="text-3xl font-black text-emerald-700">{slots.filter((s) => s.status === "AVAILABLE").length}</p>
            <p className="text-xs text-emerald-600 font-bold mt-1">Tổng Slot Trống</p>
          </div>
          {summaryByType.map((sum) => (
            <div key={sum.name} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-2xl font-black text-slate-800">{sum.available}<span className="text-sm font-normal text-slate-400">/{sum.total}</span></p>
              <p className="text-xs text-slate-500 font-bold mt-1">{sum.name} Trống</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-500 uppercase">Loại xe:</span>
            {vehicleOptions.map((v) => (
              <button
                key={v}
                onClick={() => setFilterVehicle(v)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  filterVehicle === v
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                }`}
              >
                {v === "ALL" ? "Tất cả" : v}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-500 uppercase">Tầng:</span>
            {floorOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFilterFloor(f)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  filterFloor === f
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
                }`}
              >
                {f === "ALL" ? "Tất cả" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!isLoading && !error && (
          <p className="text-xs text-slate-500 font-semibold">
            Hiển thị <strong className="text-indigo-600">{availableCount}</strong> slot trống / {totalCount} slot phù hợp
          </p>
        )}

        {/* Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500 text-sm font-semibold mb-3">⚠ {error}</p>
              <button onClick={load} className="text-sm font-bold text-indigo-600 underline">Thử lại</button>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-4xl mb-3">🅿️</p>
              <p className="font-semibold">Không có slot phù hợp với bộ lọc</p>
              <p className="text-sm mt-1">Thử thay đổi loại xe hoặc tầng</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Mã Slot</th>
                  <th className="px-5 py-3 text-left">Tầng</th>
                  <th className="px-5 py-3 text-left">Khu Vực</th>
                  <th className="px-5 py-3 text-left">Loại Xe</th>
                  <th className="px-5 py-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className={`transition-colors ${slot.status === "AVAILABLE" ? "hover:bg-emerald-50" : "opacity-60"}`}>
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">{slot.code}</td>
                    <td className="px-5 py-3 text-slate-600">{slot.floorCode}</td>
                    <td className="px-5 py-3 text-slate-600">{slot.areaCode}</td>
                    <td className="px-5 py-3 text-slate-600">{slot.vehicleTypeName}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${SLOT_STATUS_BADGE[slot.status]}`}>
                        {SLOT_STATUS_LABEL[slot.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
