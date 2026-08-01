import React from "react";
import { AlertCircle, Bike, Car } from "lucide-react";

export default function VehicleSelectionStep({ vehicleTypes = [], selectedVehicle, onSelectVehicle }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-4">
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-1">Chọn loại phương tiện</h3>
        <p className="text-sm text-slate-500">
          Booking chỉ giữ chỗ theo loại xe. Biển số thực tế hoặc trạng thái không biển số sẽ được xác nhận tại cổng vào.
        </p>
      </div>

      {vehicleTypes.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vehicleTypes.map((vehicleType) => {
            const isSelected = String(selectedVehicle?.vehicleTypeId) === String(vehicleType.vehicleTypeId);
            const VehicleIcon = vehicleType.requiresSlot ? Car : Bike;

            return (
              <button
                key={vehicleType.vehicleTypeId}
                type="button"
                onClick={() => onSelectVehicle(vehicleType)}
                className={`min-h-28 rounded-xl border-2 p-4 text-left transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <VehicleIcon className="mb-3 size-6" />
                <span className="block font-bold">{vehicleType.vehicleTypeName}</span>
                <span className="mt-1 block text-xs font-medium text-slate-500">
                  {vehicleType.requiresSlot ? "Giữ ô đỗ cụ thể" : "Giữ chỗ theo khu vực"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <AlertCircle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Chưa có loại xe khả dụng</p>
            <p className="mt-1 text-xs">Hệ thống chưa có bảng giá booking đang hoạt động cho loại xe nào.</p>
          </div>
        </div>
      )}
    </div>
  );
}
