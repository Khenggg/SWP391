import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export default function EntrySuggestionPanel({
  suggestion,
  overrideEnabled,
  overrideFloorId,
  overrideAreaId,
  overrideSlotId,
  floors = [],
  areas = [],
  slots = [],
}) {
  const finalFloor = React.useMemo(() => {
    if (overrideEnabled) {
      const f = floors.find((x) => String(x.id) === String(overrideFloorId));
      return f ? f.floorCode : "--";
    }
    return suggestion?.suggestedFloorCode || "--";
  }, [overrideEnabled, overrideFloorId, floors, suggestion]);

  const finalArea = React.useMemo(() => {
    if (overrideEnabled) {
      const a = areas.find((x) => String(x.id) === String(overrideAreaId));
      return a ? a.areaCode : "--";
    }
    return suggestion?.suggestedAreaCode || "--";
  }, [overrideEnabled, overrideAreaId, areas, suggestion]);

  const finalSlot = React.useMemo(() => {
    if (overrideEnabled) {
      const s = slots.find((x) => String(x.id) === String(overrideSlotId));
      return s ? s.slotCode : "--";
    }
    return suggestion?.suggestedSlotCode || "--";
  }, [overrideEnabled, overrideSlotId, slots, suggestion]);

  return (
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm h-full overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-2.5 px-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
              5
            </div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              Vị trí đỗ chỉ định
              <span className="text-[10px] font-normal text-slate-500 hidden xl:inline">
                {overrideEnabled ? "Giao diện vị trí đỗ bị can thiệp bởi nhân viên." : "Gợi ý tự động dựa trên khoảng cách và loại xe."}
              </span>
            </CardTitle>
          </div>
          {overrideEnabled && (
            <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Can thiệp thủ công
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2 flex flex-col justify-center">
        {suggestion || overrideEnabled ? (
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            <div className={`rounded-lg border p-2 flex flex-col gap-0.5 text-center ${overrideEnabled ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 bg-slate-50'}`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Khu vực
              </span>
              <span className={`text-base font-bold ${overrideEnabled ? 'text-amber-700' : 'text-blue-700'}`}>
                {finalArea}
              </span>
            </div>
            <div className={`rounded-lg border p-2 flex flex-col gap-0.5 text-center ${overrideEnabled ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 bg-slate-50'}`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Tầng
              </span>
              <span className={`text-base font-bold ${overrideEnabled ? 'text-amber-700' : 'text-blue-700'}`}>
                {finalFloor}
              </span>
            </div>
            <div className={`rounded-lg border p-2 flex flex-col gap-0.5 text-center ${overrideEnabled ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 bg-slate-50'}`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Vị trí (Slot)
              </span>
              <span className={`text-base font-bold ${overrideEnabled ? 'text-amber-700' : 'text-blue-700'}`}>
                {finalSlot}
              </span>
            </div>
            <div className={`rounded-lg border p-2 flex flex-col gap-0.5 text-center ${overrideEnabled ? 'border-amber-100 bg-amber-50/30' : 'border-slate-100 bg-slate-50'}`}>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Trạng thái
              </span>
              <span className={`text-xs font-bold ${overrideEnabled ? 'text-amber-700' : 'text-slate-800'}`}>
                {overrideEnabled ? "Đã can thiệp" : (suggestion.expiresAt ? `Hết hạn sau 5m` : "Có hiệu lực")}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 py-2">
            <AlertCircle className="h-6 w-6" />
            <span className="text-xs font-medium">
              Chưa có dữ liệu gợi ý vị trí.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
