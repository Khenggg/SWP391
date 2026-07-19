import React from "react";
import { RefreshCw, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function EntryPageHeader({ staffName, onReset }) {
  return (
    <div className="shrink-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-black text-white shadow-sm">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-blue-700 leading-tight">
              SWP BUILDING
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">
              Smart Parking
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900">
              Entry Processing
            </h1>
            <span className="text-blue-600 font-semibold text-sm">/ Xe vào</span>
          </div>
          <p className="text-xs text-slate-500">
            Quy trình tiếp nhận và tạo phiên đỗ xe
          </p>
        </div>
      </div>


    </div>
  );
}
