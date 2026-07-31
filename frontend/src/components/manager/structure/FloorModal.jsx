import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layers, Type, ShieldAlert, Info } from "lucide-react";

export default function FloorModal({ isOpen, onClose, editingItem, form, setField, handleSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-slate-50">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-white leading-none">
              {editingItem ? "Cập nhật thông tin Tầng" : "Thêm Tầng đỗ xe mới"}
            </DialogTitle>
            <p className="text-xs text-blue-100 mt-1.5">
              {editingItem ? "Thay đổi cấu hình hoặc trạng thái hoạt động của tầng." : "Tạo mã tầng mới để phân chia sơ đồ bãi đỗ xe."}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Mã tầng */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Mã tầng <span className="text-rose-500">*</span>
            </label>
            <Input 
              value={form.floorCode || ""} 
              onChange={(e) => setField("floorCode", e.target.value.toUpperCase())} 
              placeholder="VD: B1, B2..." 
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm font-semibold text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              disabled={!!editingItem}
            />
            {editingItem && (
              <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
                <Info className="w-3.5 h-3.5" /> Không được phép sửa mã tầng đã hoạt động.
              </p>
            )}
          </div>

          {/* Tên tầng */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-slate-400" /> Tên tầng hiển thị <span className="text-rose-500">*</span>
            </label>
            <Input 
              value={form.floorName || ""} 
              onChange={(e) => setField("floorName", e.target.value)} 
              placeholder="VD: Tầng Hầm B1" 
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm text-slate-800"
            />
          </div>

          {/* Trạng thái */}
          {editingItem && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Trạng thái hoạt động <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.status || "ACTIVE"}
                  onChange={(e) => setField("status", e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm transition-all font-medium appearance-none"
                >
                  <option value="ACTIVE">🟢 Hoạt động (ACTIVE)</option>
                  <option value="LOCKED">🔴 Khóa / Tạm ngưng (LOCKED)</option>
                  <option value="MAINTENANCE">🟡 Bảo trì (MAINTENANCE)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-slate-50 p-4 border-t border-slate-100 gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => onClose(false)}
            className="rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold px-5"
          >
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 px-6 transition-all hover:scale-[1.02]"
          >
            Lưu cấu hình
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
