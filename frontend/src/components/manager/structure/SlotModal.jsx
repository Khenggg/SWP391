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

export default function SlotModal({ isOpen, onClose, form, setField, handleSave, areas, vehicleTypes, floors = [] }) {
  const [selectedFloorId, setSelectedFloorId] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      setSelectedFloorId("");
    }
  }, [isOpen]);

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
      // If the current value is not one of the allowed types, reset it
      if (form.allowedVehicleTypeId && !allowedVehicleTypesForArea.some(v => v.id === form.allowedVehicleTypeId)) {
        setField("allowedVehicleTypeId", "");
      }
    } else {
      if (form.allowedVehicleTypeId !== "") {
        setField("allowedVehicleTypeId", "");
      }
    }
  }, [form.areaId, allowedVehicleTypesForArea.length, form.allowedVehicleTypeId, setField]);

  const filteredAreas = selectedFloorId
    ? areas.filter(a => Number(a.floorId) === Number(selectedFloorId))
    : areas;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
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
                    {f.floorCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Khu vực *</label>
            <Select 
              value={form.areaId?.toString() || ""} 
              onValueChange={(val) => setField("areaId", Number(val))}
              disabled={!selectedFloorId}
            >
              <SelectTrigger><SelectValue placeholder={selectedFloorId ? "Chọn khu..." : "Vui lòng chọn tầng trước"} /></SelectTrigger>
              <SelectContent>
                {filteredAreas.map(a => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.areaCode}
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
            />
          </div>
          {allowedVehicleTypesForArea.length > 1 ? (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại xe được phép *</label>
              <Select 
                value={form.allowedVehicleTypeId?.toString() || ""} 
                onValueChange={(val) => setField("allowedVehicleTypeId", Number(val))}
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
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Loại xe được phép</label>
              <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700 h-9 flex items-center">
                {form.allowedVehicleTypeId 
                  ? vehicleTypes.find(v => v.id === form.allowedVehicleTypeId)?.name || "Không rõ"
                  : "Vui lòng chọn Khu vực trước"
                }
              </div>
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
