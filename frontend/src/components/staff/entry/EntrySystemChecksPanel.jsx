import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed } from "lucide-react";

export default function EntrySystemChecksPanel({ workflowChecks, canSubmit }) {
  return (
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm flex-1 min-h-0 overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-2 px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-[10px]">
            4
          </div>
          <CardTitle className="text-sm font-bold truncate">
            Kiểm tra hệ thống & điều kiện tạo phiên
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 overflow-hidden p-2">
        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          {workflowChecks.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-1"
            >
              <div className="flex items-center gap-2">
                {item.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <CircleDashed className="h-4 w-4 text-slate-300" />
                )}
                <span className="text-xs font-medium text-slate-700">
                  {item.label}
                </span>
              </div>
              <span
                className={`text-xs font-bold ${
                  item.passed ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {item.passed ? "OK" : "--"}
              </span>
            </div>
          ))}
        </div>

        <div
          className={`shrink-0 rounded-lg px-2 py-2 text-xs font-semibold flex items-center gap-2 mt-1 ${
            canSubmit
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-slate-50 text-slate-500 border border-slate-100"
          }`}
        >
          {canSubmit ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <CircleDashed className="h-4 w-4 text-slate-400 shrink-0" />
          )}
          <span className="flex-1 leading-tight">
            {canSubmit
              ? "Tất cả điều kiện hợp lệ. Có thể tạo phiên."
              : "Chưa đủ điều kiện tạo phiên."}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
