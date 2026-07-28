import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function CapacityDialog({
  isOpen,
  onClose,
  selectedAreaForCapacity,
  capacityForm,
  setCapacityForm,
  handleCapacitySave,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(false); }}>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Cập nhật Sức chứa</DialogTitle>
        </DialogHeader>
        {selectedAreaForCapacity && (
          <div className="space-y-4 py-2 text-sm">
            <p className="text-xs text-slate-500">
              Khu vực:{" "}
              <span className="font-bold text-slate-700">
                {selectedAreaForCapacity.floorCode} - {selectedAreaForCapacity.areaCode}
              </span>{" "}
              ({selectedAreaForCapacity.areaName})
            </p>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 block">Sức chứa tối đa *</label>
              <Input
                type="number"
                min={0}
                value={capacityForm.totalCapacity}
                onChange={(e) =>
                  setCapacityForm({
                    totalCapacity: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                placeholder="Nhập số lượng chỗ đỗ..."
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Hủy
          </Button>
          <Button onClick={handleCapacitySave} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
