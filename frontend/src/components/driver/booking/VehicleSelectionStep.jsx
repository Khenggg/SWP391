import React, { useState } from "react";
import { Plus, Check, Car, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { vehicleService } from "../../../services/vehicleService";
import LicensePlate from "@/components/ui/license-plate";

export default function VehicleSelectionStep({ vehicles, selectedVehicle, onSelectVehicle, onVehicleAdded }) {
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newVehicleType, setNewVehicleType] = useState("1"); // 1: Ô Tô, 2: Xe Máy
  const [adding, setAdding] = useState(false);

  const handleAddVehicle = async () => {
    if (!newPlate.trim()) return;
    setAdding(true);
    try {
      const newVehicle = await vehicleService.createVehicle({
        plateNumber: newPlate,
        vehicleTypeId: parseInt(newVehicleType)
      });
      // Call callback to update parent state
      onVehicleAdded(newVehicle);
      setIsAddVehicleOpen(false);
      setNewPlate("");
    } catch (error) {
      alert(error.message || "Không thể thêm phương tiện");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Chọn phương tiện</h3>
        <p className="text-sm text-slate-500">
          Hệ thống chỉ phân biệt loại xe để tính tiền. Việc chọn xe giúp hệ thống nhận diện biển số lúc bạn vào cổng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((v) => (
          <div
            key={v.id || v.plateNumber || v.plate}
            onClick={() => onSelectVehicle(v)}
            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center gap-3 ${
              (selectedVehicle?.plateNumber || selectedVehicle?.plate) === (v.plateNumber || v.plate)
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {(selectedVehicle?.plateNumber || selectedVehicle?.plate) === (v.plateNumber || v.plate) && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full">
                <Check className="w-3 h-3" />
              </div>
            )}
            
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mt-2">
              <Car className="w-6 h-6" />
            </div>
            
            <div className="text-center">
              <LicensePlate plate={v.plateNumber || v.plate} size="sm" className="mb-1" />
              <div className="text-xs font-semibold text-slate-500">
                {v.vehicleTypeName || "Không xác định"}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Vehicle Button */}
        <div
          onClick={() => setIsAddVehicleOpen(true)}
          className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] text-slate-500 hover:text-indigo-600"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-sm font-semibold">Thêm phương tiện</span>
        </div>
      </div>

      {vehicles.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Chưa có phương tiện nào</p>
            <p className="text-xs mt-1">
              Vui lòng thêm phương tiện trước khi đặt chỗ để hệ thống có thể nhận diện biển số của bạn lúc vào cổng.
            </p>
          </div>
        </div>
      )}

      {/* Add Vehicle Dialog */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm phương tiện đặt chỗ</DialogTitle>
            <DialogDescription>
              Nhập thông tin biển số xe bạn dự định sử dụng để đặt chỗ.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Loại xe</label>
              <Select value={newVehicleType} onValueChange={setNewVehicleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ô Tô</SelectItem>
                  <SelectItem value="2">Xe Máy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Biển số xe</label>
              <Input 
                placeholder="VD: 30F-123.45" 
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
                className="uppercase font-semibold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddVehicleOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddVehicle} disabled={!newPlate.trim() || adding} className="bg-indigo-600 hover:bg-indigo-700">
              {adding ? "Đang xử lý..." : "Thêm xe"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
