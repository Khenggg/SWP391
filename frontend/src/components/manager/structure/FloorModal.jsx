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

export default function FloorModal({ isOpen, onClose, editingItem, form, setField, handleSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Sửa Tầng" : "Thêm Tầng"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Mã tầng *</label>
            <Input 
              value={form.floorCode || ""} 
              onChange={(e) => setField("floorCode", e.target.value.toUpperCase())} 
              placeholder="VD: B1" 
              className="rounded-lg border-slate-200 focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tên tầng *</label>
            <Input 
              value={form.floorName || ""} 
              onChange={(e) => setField("floorName", e.target.value)} 
              placeholder="VD: Tầng Hầm 1" 
              className="rounded-lg border-slate-200 focus-visible:ring-blue-500"
            />
          </div>
          {editingItem && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Trạng thái *</label>
              <select
                value={form.status || "ACTIVE"}
                onChange={(e) => setField("status", e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-sm hover:border-slate-300 transition-all"
              >
                <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                <option value="LOCKED">Khóa / Tạm ngưng (LOCKED)</option>
                <option value="MAINTENANCE">Bảo trì (MAINTENANCE)</option>
              </select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
