import React from "react";
import { Check, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationSelectionStep({ 
  areas, 
  slots,
  selectedAreaId, 
  onSelectArea, 
  selectedSlotId,
  onSelectSlot,
  vehicleTypeName 
}) {
  const isCar = vehicleTypeName === "Ô Tô";
  const validAreas = areas.filter(a => a.status === "ACTIVE" && (!vehicleTypeName || a.vehicleTypeName === vehicleTypeName));

  // If Car and Area is selected, show slots for that Area
  if (isCar && selectedAreaId) {
    const areaSlots = slots.filter(s => s.areaId === selectedAreaId || s.slotCode?.startsWith(selectedAreaId));
    const availableSlots = areaSlots.filter(s => s.status === "AVAILABLE" || !s.status); // Default to available in mock if no status

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => onSelectArea(null, "")} className="h-8 w-8 rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-0.5">Chọn Slot (Ô Tô)</h3>
            <p className="text-sm text-slate-500">
              Khu vực đã chọn: {validAreas.find(a => a.id === selectedAreaId || a.code === selectedAreaId)?.name}
            </p>
          </div>
        </div>

        {availableSlots.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Không còn slot trống</p>
              <p className="text-xs mt-1">
                Khu vực này hiện đã kín chỗ. Vui lòng quay lại chọn khu vực khác.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {availableSlots.map(slot => {
              const isSelected = selectedSlotId === slot.id || selectedSlotId === slot.slotCode;
              const slotIdToSelect = slot.id || slot.slotCode;
              
              return (
                <div 
                  key={slotIdToSelect}
                  onClick={() => onSelectSlot(slotIdToSelect, slot.slotCode)}
                  className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-bold"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600 font-semibold"
                  }`}
                >
                  {slot.slotCode}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Show Areas
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {isCar ? "Chọn Khu Vực (Bước 1/2)" : "Chọn vị trí khu vực"}
        </h3>
        <p className="text-sm text-slate-500">
          {isCar ? "Vui lòng chọn khu vực để xem các slot trống." : "Hệ thống sẽ gợi ý khu vực đỗ phù hợp với loại phương tiện của bạn."}
        </p>
      </div>

      {validAreas.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Không có khu vực phù hợp</p>
            <p className="text-xs mt-1">
              Hiện tại không có khu vực đỗ nào khả dụng cho loại phương tiện "{vehicleTypeName}". Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validAreas.map(area => {
            const isSelected = selectedAreaId === area.id || selectedAreaId === area.code;
            const areaIdToSelect = area.id || area.code;
            const maxCap = area.maxCapacity || area.totalSlots || 0;
            const current = area.currentCount !== undefined ? area.currentCount : (maxCap - (area.availableSlots || 0));
            const available = Math.max(0, maxCap - current);

            return (
              <div 
                key={areaIdToSelect}
                onClick={() => {
                  onSelectArea(areaIdToSelect, area.name);
                  if (!isCar) onSelectSlot(null, ""); // Reset slot if motorbike
                }}
                className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between min-h-[120px] ${
                  isSelected && !isCar
                    ? "border-indigo-600 bg-indigo-50/50 shadow-sm" 
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {isSelected && !isCar && (
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white p-1 rounded-full">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                
                <div>
                  <span className="text-lg font-black block text-slate-800">{area.name}</span>
                  <span className="text-xs font-semibold text-slate-500 mt-1 block">
                    Khu vực dành cho {area.vehicleTypeName}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-4">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    available > 5 
                      ? "bg-emerald-100 text-emerald-700" 
                      : available > 0 
                      ? "bg-amber-100 text-amber-700" 
                      : "bg-rose-100 text-rose-700"
                  }`}>
                    {available > 0 ? `Còn ${available} chỗ` : "Hết chỗ"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
