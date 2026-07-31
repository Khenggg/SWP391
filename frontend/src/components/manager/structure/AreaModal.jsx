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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, Layers, Type, Bike, ShieldAlert } from "lucide-react";

export default function AreaModal({ 
  isOpen, 
  onClose, 
  editingItem, 
  form, 
  setField, 
  handleSave, 
  floors, 
  vehicleTypes 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-slate-50">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
            <LayoutGrid className="w-6 h-6 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-white leading-none">
              {editingItem ? "Cập nhật Khu vực" : "Thêm Khu vực đỗ xe"}
            </DialogTitle>
            <p className="text-xs text-blue-100 mt-1.5">
              {editingItem ? "Thay đổi cấu hình hoặc trạng thái hoạt động của khu vực." : "Tạo khu vực đỗ xe mới phân chia theo loại xe."}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Tầng */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Thuộc Tầng <span className="text-rose-500">*</span>
            </label>
            <Select 
              value={form.floorId?.toString() || ""} 
              onValueChange={(val) => setField("floorId", Number(val))}
              disabled={!!editingItem}
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 text-slate-800 font-medium">
                <SelectValue placeholder="Chọn tầng đỗ xe..." />
              </SelectTrigger>
              <SelectContent>
                {floors.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    Tầng {f.code || f.floorCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Mã khu */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                Mã khu <span className="text-rose-500">*</span>
              </label>
              <Input 
                value={form.areaCode || ""} 
                onChange={(e) => setField("areaCode", e.target.value.toUpperCase())} 
                placeholder="VD: A, B, C..." 
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm font-semibold text-slate-800"
                disabled={!!editingItem}
              />
            </div>

            {/* Tên khu */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                Tên khu hiển thị <span className="text-rose-500">*</span>
              </label>
              <Input 
                value={form.areaName || ""} 
                onChange={(e) => setField("areaName", e.target.value)} 
                placeholder="VD: Khu A1..." 
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm text-slate-800"
              />
            </div>
          </div>

          {/* Loại xe */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-slate-400" /> Loại xe áp dụng <span className="text-rose-500">*</span>
            </label>
            <Select 
              value={form.vehicleTypeIds?.[0]?.toString() || ""} 
              onValueChange={(val) => setField("vehicleTypeIds", [Number(val)])}
              disabled={!!editingItem}
            >
              <SelectTrigger className="h-11 rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50 hover:bg-slate-50 text-slate-800 font-medium">
                <SelectValue placeholder="Chọn loại xe..." />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(v => (
                  <SelectItem key={v.id} value={v.id.toString()}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
