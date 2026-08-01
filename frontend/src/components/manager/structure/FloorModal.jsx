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

export default function FloorModal({ isOpen, onClose, editingItem, form, setField, handleSave, vehicleTypes = [] }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
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
            />
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
            <label className="text-sm font-bold block">Loại xe được phép vào tầng</label>
            <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-3 max-h-[160px] overflow-y-auto bg-white">
              {vehicleTypes.map(v => {
                const checked = form.vehicleTypeIds?.includes(v.id) || false;
                return (
                  <label key={v.id} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-all">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        let newIds = form.vehicleTypeIds ? [...form.vehicleTypeIds] : [];
                        if (e.target.checked) {
                          newIds.push(v.id);
                        } else {
                          newIds = newIds.filter(id => id !== v.id);
                        }
                        setField("vehicleTypeIds", newIds);
                      }}
                      className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span>{v.name}</span>
                  </label>
                );
              })}
            </div>
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
                <SelectItem value="INACTIVE">Ngừng hoạt động (INACTIVE)</SelectItem>
                <SelectItem value="LOCKED">Khóa (LOCKED)</SelectItem>
                <SelectItem value="MAINTENANCE">Bảo trì (MAINTENANCE)</SelectItem>
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
