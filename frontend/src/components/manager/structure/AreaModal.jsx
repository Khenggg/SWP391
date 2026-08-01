import React, { useState, useMemo } from "react";
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
import { Plus, Info } from "lucide-react";
import VehicleTypeManagerModal from "@/components/manager/pricing/VehicleTypeManagerModal";

export default function AreaModal({ 
  isOpen, 
  onClose, 
  editingItem, 
  form, 
  setField, 
  handleSave, 
  floors = [], 
  vehicleTypes = [],
  onVehicleTypeCreated 
}) {
  const [showAddType, setShowAddType] = useState(false);

  const selectedFloor = useMemo(() => {
    return floors.find(f => Number(f.id) === Number(form.floorId));
  }, [floors, form.floorId]);

  const availableVehicleTypes = useMemo(() => {
    if (!selectedFloor || !selectedFloor.vehicleTypeIds || selectedFloor.vehicleTypeIds.length === 0) {
      return vehicleTypes;
    }
    return vehicleTypes.filter(vt => selectedFloor.vehicleTypeIds.includes(vt.id));
  }, [selectedFloor, vehicleTypes]);

  const isCar = form.vehicleTypeIds && form.vehicleTypeIds.length > 0
    ? form.vehicleTypeIds.some(id => {
        const vt = vehicleTypes.find(v => v.id === id);
        return vt?.requiresSlot ?? false;
      })
    : false;

  const handleFloorChange = (val) => {
    const floorId = Number(val);
    setField("floorId", floorId);
    
    // Auto sanitize selected vehicleTypeIds to match newly selected floor's allowed vehicle types
    const targetFloor = floors.find(f => Number(f.id) === floorId);
    if (targetFloor && targetFloor.vehicleTypeIds && targetFloor.vehicleTypeIds.length > 0) {
      const allowedSet = new Set(targetFloor.vehicleTypeIds);
      const filtered = (form.vehicleTypeIds || []).filter(id => allowedSet.has(id));
      setField("vehicleTypeIds", filtered);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Sửa Khu Vực" : "Thêm Khu Vực"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">Tầng *</label>
              <Select 
                value={form.floorId?.toString() || ""} 
                onValueChange={handleFloorChange}
                disabled={!!editingItem}
              >
                <SelectTrigger className={editingItem ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}><SelectValue placeholder="Chọn..." /></SelectTrigger>
                <SelectContent>
                  {floors.map(f => (
                    <SelectItem key={f.id} value={f.id.toString()}>
                      {f.code || f.floorCode} - {f.name || f.floorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Mã khu *</label>
              <Input 
                value={form.areaCode || ""} 
                onChange={(e) => setField("areaCode", e.target.value.toUpperCase())} 
                placeholder="VD: A1" 
                disabled={!!editingItem}
                className={editingItem ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}
              />
              {editingItem && (
                <span className="text-[10px] text-slate-400">Không thể thay đổi mã khu sau khi đã tạo</span>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Tên khu *</label>
              <Input 
                value={form.areaName || ""} 
                onChange={(e) => setField("areaName", e.target.value)} 
                placeholder="VD: Khu A1" 
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-bold">Loại xe áp dụng *</label>
                <button
                  type="button"
                  onClick={() => setShowAddType(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="size-3" /> Thêm loại xe mới
                </button>
              </div>

              {selectedFloor && selectedFloor.vehicleTypeIds && selectedFloor.vehicleTypeIds.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                  <Info className="w-3 h-3 shrink-0" />
                  <span>Chỉ hiển thị các loại xe được phép vào Tầng <strong>{selectedFloor.code || selectedFloor.floorCode}</strong></span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-lg p-3 max-h-[160px] overflow-y-auto bg-white">
                {availableVehicleTypes.length > 0 ? (
                  availableVehicleTypes.map(v => {
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
                  })
                ) : (
                  <div className="col-span-2 text-xs text-slate-400 italic text-center py-2">
                    Tầng được chọn chưa cấu hình loại xe được phép.
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold block">Hình thức quản lý *</label>
              <Select 
                value={form.managementType || "CAPACITY"} 
                onValueChange={(val) => {
                  setField("managementType", val);
                  if (val === "SLOT") {
                    setField("totalCapacity", editingItem ? (form.totalCapacity || 0) : 0);
                  }
                }}
              >
                <SelectTrigger><SelectValue placeholder="Chọn hình thức..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SLOT">Quản lý theo SLOT (Vẽ vị trí đỗ)</SelectItem>
                  <SelectItem value="CAPACITY">Quản lý theo SỨC CHỨA (Không vẽ vị trí đỗ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.managementType === "SLOT" ? (
              <div className="space-y-2">
                <label className="text-sm font-bold">Sức chứa (Tính theo số slot)</label>
                <Input 
                  type="text"
                  value={form.totalCapacity || 0}
                  disabled
                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 block">Sức chứa sẽ tự động cập nhật khi bạn thêm/xóa Slot trong khu vực này</span>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold">Sức chứa *</label>
                <Input 
                  type="number"
                  min={1}
                  value={form.totalCapacity === undefined || form.totalCapacity === null ? "" : form.totalCapacity} 
                  onChange={(e) => setField("totalCapacity", e.target.value === "" ? "" : Number(e.target.value))} 
                  placeholder="VD: 50" 
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold">Độ ưu tiên *</label>
              <Input 
                type="number"
                min={1}
                value={form.priorityOrder === undefined || form.priorityOrder === null ? "" : form.priorityOrder} 
                onChange={(e) => setField("priorityOrder", e.target.value === "" ? "" : Number(e.target.value))} 
                placeholder="VD: 1" 
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

      <VehicleTypeManagerModal
        isOpen={showAddType}
        onClose={setShowAddType}
        vehicleTypes={vehicleTypes}
        onRefresh={onVehicleTypeCreated}
      />
    </>
  );
}
