import React from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TimeSelectionStep({ durationHours, setDurationHours }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Thời gian đỗ</h3>
        <p className="text-sm text-slate-500">
          Chọn khoảng thời gian dự kiến bạn sẽ đỗ xe tại bãi.
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Thời gian giữ chỗ
            </label>
            <Select 
              value={String(durationHours)} 
              onValueChange={(val) => setDurationHours(parseInt(val))}
            >
              <SelectTrigger className="w-full bg-white border-slate-200 font-semibold h-11">
                <SelectValue placeholder="Chọn số giờ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Giờ</SelectItem>
                <SelectItem value="2">2 Giờ</SelectItem>
                <SelectItem value="3">3 Giờ</SelectItem>
                <SelectItem value="4">4 Giờ</SelectItem>
                <SelectItem value="6">6 Giờ</SelectItem>
                <SelectItem value="8">8 Giờ</SelectItem>
                <SelectItem value="12">12 Giờ</SelectItem>
                <SelectItem value="24">24 Giờ</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400 mt-2">
              Bạn có 15 phút gia hạn tính từ thời điểm đặt chỗ để quét check-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
