import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { SLOT_STATUS, SLOT_STATUS_COLORS, STATUS_LABELS } from "@/constants";

export default function SlotDetailDialog({
  selectedSlot,
  setSelectedSlot,
  targetStatus,
  setTargetStatus,
  statusReason,
  setStatusReason,
  handleUpdateSlotStatus,
}) {
  return (
    <Dialog open={!!selectedSlot} onOpenChange={(open) => { if (!open) setSelectedSlot(null); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Chi tiết Slot {selectedSlot?.slotCode}</DialogTitle>
        </DialogHeader>
        {selectedSlot && (
          <div className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-y-2.5 border-b border-slate-100 pb-3">
              <span className="text-slate-500 font-semibold">Tầng</span>
              <span className="font-bold text-slate-800 text-right">{selectedSlot.floorCode}</span>
              <span className="text-slate-500 font-semibold">Khu vực</span>
              <span className="font-bold text-slate-800 text-right">{selectedSlot.areaCode}</span>
              <span className="text-slate-500 font-semibold">Loại xe</span>
              <span className="font-bold text-slate-800 text-right">
                {selectedSlot.vehicleTypeNames?.join(", ") || "Không rõ"}
              </span>
              <span className="text-slate-500 font-semibold">Trạng thái</span>
              <span className="font-bold text-slate-800 text-right flex items-center justify-end gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    SLOT_STATUS_COLORS[selectedSlot.status]?.includes("bg-emerald")
                      ? "bg-emerald-500"
                      : SLOT_STATUS_COLORS[selectedSlot.status]?.includes("bg-blue")
                      ? "bg-blue-600"
                      : SLOT_STATUS_COLORS[selectedSlot.status]?.includes("bg-red")
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                />
                {selectedSlot.status}
              </span>
            </div>

            {selectedSlot.status === SLOT_STATUS.OCCUPIED && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>Slot đang đỗ xe. Không thể đổi sang AVAILABLE thủ công.</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">Đổi trạng thái thành</label>
              <div className="flex flex-col gap-2">
                {[SLOT_STATUS.AVAILABLE, SLOT_STATUS.LOCKED, SLOT_STATUS.MAINTENANCE].map((status) => {
                  const disabled = selectedSlot.status === SLOT_STATUS.OCCUPIED && status === SLOT_STATUS.AVAILABLE;
                  return (
                    <label
                      key={status}
                      className={`flex items-center gap-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        name="targetStatus"
                        value={status}
                        checked={targetStatus === status}
                        onChange={() => setTargetStatus(status)}
                        disabled={disabled}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-xs font-semibold">{STATUS_LABELS[status] || status}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Lý do / Ghi chú (bắt buộc nếu khóa/bảo trì)</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs h-16 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                placeholder="Nhập lý do..."
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedSlot(null)}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={handleUpdateSlotStatus}
            disabled={
              !selectedSlot ||
              targetStatus === selectedSlot.status ||
              (selectedSlot.status === SLOT_STATUS.OCCUPIED && targetStatus === SLOT_STATUS.AVAILABLE)
            }
          >
            Cập nhật
          </Button>
        </DialogFooter>
      </Dialog>
  );
}
