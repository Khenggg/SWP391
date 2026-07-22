import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/format";

export default function EntrySuggestionPanel({ suggestion, cardError }) {
  return (
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm h-full overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-2.5 px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
            5
          </div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            Gợi ý vị trí đỗ
            <span className="text-[10px] font-normal text-slate-500 hidden xl:inline">
              Dựa trên loại xe, vị trí gần cổng và tình trạng chỗ trống.
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2 flex flex-col justify-center">
        {suggestion ? (
          <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 flex flex-col gap-0.5 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Khu vực
              </span>
              <span className="text-base font-bold text-blue-700">
                {suggestion.suggestedAreaCode || "--"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 flex flex-col gap-0.5 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Tầng
              </span>
              <span className="text-base font-bold text-blue-700">
                {suggestion.suggestedFloorCode || "--"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 flex flex-col gap-0.5 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Vị trí (Slot)
              </span>
              <span className="text-base font-bold text-blue-700">
                {suggestion.suggestedSlotCode || "--"}
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2 flex flex-col gap-0.5 text-center">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Hiệu lực tới
              </span>
              <span className="text-xs font-bold text-slate-800">
                {suggestion.expiresAt
                  ? formatDateTime(suggestion.expiresAt)
                  : "--"}
              </span>
            </div>
          </div>
        ) : cardError ? (
          <div className="flex flex-col items-center justify-center gap-1.5 text-rose-500 py-2">
            <AlertCircle className="h-6 w-6" />
            <span className="text-xs font-bold text-center px-4">
              {cardError}
            </span>
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
