import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Grid } from "lucide-react";
import { SLOT_STATUS, SLOT_STATUS_COLORS, STATUS_LABELS } from "@/constants";

// Helper components inside this module or simple empty state
function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">{description}</p>
    </div>
  );
}

export default function SlotGridPanel({
  filterFloor,
  setFilterFloor,
  filterArea,
  setFilterArea,
  filterSlotStatus,
  setFilterSlotStatus,
  floors,
  areas,
  filteredSlots,
  openCreateSlot,
  selectedSlot,
  setSelectedSlot,
  setTargetStatus,
  setStatusReason,
  isCarArea
}) {
  // Group slots by floorCode and areaCode
  const slotsGrouped = React.useMemo(() => {
    const groups = {};
    filteredSlots.forEach(slot => {
      const floorKey = slot.floorCode || "Chưa phân tầng";
      const areaKey = slot.areaCode || "Chưa phân khu";
      const key = `${floorKey}-${areaKey}`;
      if (!groups[key]) {
        groups[key] = {
          floorCode: floorKey,
          areaCode: areaKey,
          slots: []
        };
      }
      groups[key].slots.push(slot);
    });
    // Sort groups by floor code then area code
    return Object.values(groups).sort((a, b) => a.floorCode.localeCompare(b.floorCode) || a.areaCode.localeCompare(b.areaCode));
  }, [filteredSlots]);

  return (
    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800">Quản lý Slot Ô tô</h3>
          <div className="flex gap-2 flex-wrap">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Tầng</span>
              <Select value={filterFloor} onValueChange={setFilterFloor}>
                <SelectTrigger className="w-[110px] h-8 text-xs border-slate-200 bg-white">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {floors.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.floorCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Khu vực</span>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[110px] h-8 text-xs border-slate-200 bg-white">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {areas
                    .filter((a) => isCarArea(a) && (filterFloor === "ALL" || a.floorId?.toString() === filterFloor))
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>
                        {a.areaCode} {filterFloor === "ALL" ? `(${a.floorCode})` : ""}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500">Trạng thái</span>
              <Select value={filterSlotStatus} onValueChange={setFilterSlotStatus}>
                <SelectTrigger className="w-[120px] h-8 text-xs border-slate-200 bg-white">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {Object.values(SLOT_STATUS).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button
          onClick={openCreateSlot}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg self-end mb-1"
        >
          <Plus className="w-4 h-4 mr-1" /> Thêm Slot
        </Button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 p-3 border-b border-slate-100 bg-white items-center justify-center text-[11px] font-bold tracking-wider text-slate-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-emerald-300 rounded-sm bg-emerald-50"></div> AVAILABLE
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-blue-400 rounded-sm bg-blue-50"></div> OCCUPIED
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-red-300 rounded-sm bg-red-50"></div> LOCKED
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 border-2 border-amber-300 rounded-sm bg-amber-50"></div> MAINTENANCE
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 min-h-[400px] space-y-6">
        {slotsGrouped.length === 0 ? (
          <EmptyState
            icon={<Grid />}
            title="Không tìm thấy slot nào"
            description="Thử thay đổi bộ lọc hoặc thêm slot mới."
          />
        ) : (
          slotsGrouped.map((group) => (
            <div key={`${group.floorCode}-${group.areaCode}`} className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                  Tầng {group.floorCode} — Khu vực {group.areaCode}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {group.slots.length} Slots
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {group.slots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setTargetStatus(slot.status);
                      setStatusReason("");
                    }}
                    className={`
                      aspect-square flex items-center justify-center rounded-md border-2 font-bold text-xs cursor-pointer 
                      transition-all hover:scale-105 hover:shadow-md
                      ${selectedSlot?.id === slot.id ? "ring-2 ring-slate-400 ring-offset-2" : ""}
                      ${SLOT_STATUS_COLORS[slot.status] || "border-slate-200 bg-white text-slate-500"}
                    `}
                  >
                    {slot.slotCode?.split("-").pop() || slot.slotCode}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
    </div>
  );
}
