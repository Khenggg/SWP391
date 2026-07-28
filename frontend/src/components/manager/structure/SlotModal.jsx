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

  React.useEffect(() => {
    if (form.areaId) {
      const selectedArea = areas.find(a => Number(a.id) === Number(form.areaId));
      if (selectedArea && selectedArea.vehicleTypeIds?.length > 0) {
        setField("allowedVehicleTypeId", selectedArea.vehicleTypeIds[0]);
      }
    } else {
      setField("allowedVehicleTypeId", "");
    }
  }, [form.areaId, areas, setField]);

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
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Loại xe được phép</label>
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700 h-9 flex items-center">
              {form.allowedVehicleTypeId 
                ? vehicleTypes.find(v => v.id === form.allowedVehicleTypeId)?.name || "Không rõ"
                : "Vui lòng chọn Khu vực trước"
              }
            </div>
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
