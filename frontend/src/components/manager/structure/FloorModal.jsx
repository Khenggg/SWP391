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

export default function FloorModal({ isOpen, onClose, editingItem, form, setField, handleSave }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? "Sửa Tầng" : "Thêm Tầng"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold block">Mã tầng *</label>
            <Input 
              value={form.floorCode || ""} 
              onChange={(e) => setField("floorCode", e.target.value.toUpperCase())} 
              placeholder="VD: B1" 
              disabled={!!editingItem}
              className={editingItem ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
            />
            {editingItem && (
              <span className="text-[10px] text-slate-400">Không thể thay đổi mã tầng sau khi đã tạo</span>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold block">Tên tầng *</label>
            <Input 
              value={form.floorName || ""} 
              onChange={(e) => setField("floorName", e.target.value)} 
              placeholder="VD: Tầng Hầm 1" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold block">Trạng thái *</label>
            <Select 
              value={form.status || "ACTIVE"} 
              onValueChange={(val) => setField("status", val)}
            >
              <SelectTrigger><SelectValue placeholder="Chọn trạng thái..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động (ACTIVE)</SelectItem>
                <SelectItem value="INACTIVE">Khóa (INACTIVE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
