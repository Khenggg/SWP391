import React from "react";
import { Camera, ShieldAlert, CheckCircle2, Clock3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ExitConfirmation({ 
  plate, 
  setPlate, 
  session, 
  hasMismatch, 
  mismatchCase, 
  handleCreateMismatchCase, 
  isCreatingMismatch, 
  currentTime,
  staffName
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
      <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">4</span>
        <h3 className="font-bold text-slate-800 text-sm">Xác nhận thông tin ra xe</h3>
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Biển số thực tế (nếu khác)</label>
            <div className="relative">
              <Input 
                value={plate} 
                onChange={(e) => setPlate(e.target.value.toUpperCase())} 
                className="font-bold uppercase pr-8" 
                placeholder="Nhập biển số thực tế" 
                disabled={!session}
              />
              <Camera className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Ghi chú (nếu có)</label>
            <Input placeholder="Nhập ghi chú" className="text-sm" disabled={!session} />
          </div>
        </div>
        
        {/* 
        Tạm thời ẩn chức năng xử lý lệch biển số vì Backend chưa có API
        {hasMismatch && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-900">Cảnh báo sai lệch biển số!</p>
                <p className="text-[10px] text-amber-700">Biển số lúc ra ({plate}) khác với lúc vào ({session?.plateNumber}).</p>
              </div>
            </div>
            {mismatchCase ? (
              <Badge variant="outline" className="w-fit bg-white border-amber-300 text-amber-800 text-[10px]">
                Trạng thái xử lý: {mismatchCase.status}
              </Badge>
            ) : (
              <Button size="sm" onClick={handleCreateMismatchCase} disabled={isCreatingMismatch} className="w-fit h-7 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold border-none shadow-none">
                Tạo yêu cầu xử lý
              </Button>
            )}
          </div>
        )}
        */}

        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nhân viên xử lý</label>
            <div className="bg-slate-50 border rounded px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-indigo-600" /></div>
              {staffName}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Thời gian ra (hiện tại)</label>
            <div className="bg-slate-50 border rounded px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
              <Clock3 className="w-3.5 h-3.5 text-slate-400" />
              {currentTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
