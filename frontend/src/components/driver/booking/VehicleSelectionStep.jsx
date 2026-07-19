import React, { useState, useEffect } from "react";
import { Car, Bike, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function VehicleSelectionStep({ selectedVehicle, onSelectVehicle }) {
  // Initialize state from selectedVehicle if exists
  const [plate, setPlate] = useState(selectedVehicle?.plateNumber || "");
  const [typeId, setTypeId] = useState(selectedVehicle?.vehicleTypeId || 5); // Default to Car (5)

  // Sync selection back to parent state whenever inputs change
  useEffect(() => {
    if (plate.trim()) {
      onSelectVehicle({
        plateNumber: plate.trim().toUpperCase(),
        vehicleTypeId: typeId,
        vehicleTypeName: typeId === 5 ? "Ô Tô" : "Xe Máy"
      });
    } else {
      onSelectVehicle(null);
    }
  }, [plate, typeId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto py-4">
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-1">Nhập thông tin phương tiện</h3>
        <p className="text-sm text-slate-500">
          Vui lòng chọn loại xe và nhập chính xác biển số xe để hệ thống nhận diện tự động tại bốt cổng.
        </p>
      </div>

      <div className="space-y-4">
        {/* Chọn loại xe */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Loại phương tiện</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTypeId(5)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition-all ${
                typeId === 5
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
              }`}
            >
              <Car className="w-6 h-6" />
              <span>Ô Tô</span>
            </button>
            <button
              type="button"
              onClick={() => setTypeId(3)}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition-all ${
                typeId === 3
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
              }`}
            >
              <Bike className="w-6 h-6" />
              <span>Xe Máy</span>
            </button>
          </div>
        </div>

        {/* Nhập biển số */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Biển số xe</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Ví dụ: 29A-123.45"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="h-14 text-lg font-black text-center uppercase tracking-widest border-2 border-slate-200 focus-visible:border-indigo-600 rounded-xl"
            />
          </div>
          <p className="text-xs text-slate-400 text-center">
            * Nhập viết liền hoặc có dấu gạch ngang đều được (Hệ thống tự động chuẩn hóa).
          </p>
        </div>
      </div>

      {plate.trim().length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-center">
          <div className="bg-white border-2 border-slate-800 rounded-md px-4 py-2 font-mono text-xl font-bold tracking-widest text-slate-800 shadow-sm uppercase">
            {plate}
          </div>
        </div>
      )}
    </div>
  );
}
