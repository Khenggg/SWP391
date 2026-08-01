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
import { AlertCircle, AlertTriangle } from "lucide-react";

export default function SlotModal({ isOpen, onClose, form, setField, handleSave, areas, vehicleTypes, floors = [] }) {
  const [selectedFloorId, setSelectedFloorId] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setSelectedFloorId("");
    }
  }, [isOpen]);

  const selectedFloor = selectedFloorId ? floors.find(f => Number(f.id) === Number(selectedFloorId)) : null;

  // Check if selected floor allows any slot-requiring vehicle types (e.g. Ô tô)
  const isFloorCarAllowed = selectedFloor
    ? (!selectedFloor.vehicleTypeIds || selectedFloor.vehicleTypeIds.length === 0 || vehicleTypes.some(v => v.requiresSlot && selectedFloor.vehicleTypeIds.includes(v.id)))
    : true;

  const selectedArea = form.areaId ? areas.find(a => Number(a.id) === Number(form.areaId)) : null;
  const allowedVehicleTypesForArea = selectedArea
    ? vehicleTypes.filter(v => selectedArea.vehicleTypeIds?.includes(v.id) && v.requiresSlot)
    : [];

  React.useEffect(() => {
    if (allowedVehicleTypesForArea.length === 1) {
      const targetId = allowedVehicleTypesForArea[0].id;
      if (form.allowedVehicleTypeId !== targetId) {
        setField("allowedVehicleTypeId", targetId);
      }
    } else if (allowedVehicleTypesForArea.length > 1) {
      if (form.allowedVehicleTypeId && !allowedVehicleTypesForArea.some(v => v.id === form.allowedVehicleTypeId)) {
        setField("allowedVehicleTypeId", "");
      }
    } else {
      if (form.allowedVehicleTypeId !== "") {
        setField("allowedVehicleTypeId", "");
      }
    }
  }, [form.areaId, allowedVehicleTypesForArea, form.allowedVehicleTypeId, setField]);

  const filteredAreas = selectedFloorId
    ? areas.filter(a => Number(a.floorId) === Number(selectedFloorId))
    : areas;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Thêm Slot</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Tầng *</label>
            <Select 
              value={selectedFloorId?.toString() || ""} 
              onValueChange={(val) => {
                setSelectedFloorId(val);
                setField("areaId", "");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Chọn tầng..." /></SelectTrigger>
              <SelectContent>
                {floors.map(f => (
                  <SelectItem key={f.id} value={f.id.toString()}>
                    {f.floorCode} - {f.floorName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFloor && !isFloorCarAllowed && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Tầng {selectedFloor.floorCode} ({selectedFloor.floorName})</strong> không được cấu hình cho phép Ô tô / loại xe yêu cầu Slot. Bạn không thể thêm Slot cho tầng này. Vui lòng chuyển sang tab <strong>Tầng</strong> để cập nhật loại xe cho tầng hoặc chọn tầng khác.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold">Khu vực *</label>
            <Select 
              value={form.areaId?.toString() || ""} 
              onValueChange={(val) => setField("areaId", Number(val))}
              disabled={!selectedFloorId || !isFloorCarAllowed}
            >
              <SelectTrigger><SelectValue placeholder={!selectedFloorId ? "Vui lòng chọn tầng trước" : (!isFloorCarAllowed ? "Tầng không hỗ trợ Slot" : "Chọn khu...")} /></SelectTrigger>
              <SelectContent>
                {filteredAreas.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.areaCode} - {a.areaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Mã Slot *</label>
            <Input 
              value={form.slotCode || ""} 
              onChange={(e) => setField("slotCode", e.target.value.toUpperCase())} 
              placeholder="VD: B1-A-01" 
              disabled={!isFloorCarAllowed}
            />
          </div>

          {selectedArea && isFloorCarAllowed && allowedVehicleTypesForArea.length === 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Khu vực <strong>{selectedArea.areaCode} ({selectedArea.areaName})</strong> chưa được cấu hình loại xe yêu cầu Slot (ví dụ: Ô tô). Vui lòng chuyển sang tab <strong>Khu vực</strong> để sửa và tích chọn loại xe cho Khu vực này trước.
              </div>
            </div>
          )}

          {allowedVehicleTypesForArea.length > 1 ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại xe được phép *</label>
              <Select 
                value={form.allowedVehicleTypeId?.toString() || ""} 
                onValueChange={(val) => setField("allowedVehicleTypeId", Number(val))}
                disabled={!isFloorCarAllowed}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Chọn loại xe..." /></SelectTrigger>
                <SelectContent>
                  {allowedVehicleTypesForArea.map(v => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : allowedVehicleTypesForArea.length === 1 ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại xe được phép</label>
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700 h-9 flex items-center">
                {allowedVehicleTypesForArea[0].name}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại xe được phép</label>
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-400 h-9 flex items-center">
                Vui lòng chọn Khu vực hợp lệ trước
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Hủy</Button>
          <Button 
            onClick={handleSave} 
            disabled={!isFloorCarAllowed || !form.areaId || !form.allowedVehicleTypeId || !form.slotCode}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
