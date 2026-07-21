import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LicensePlate from "@/components/ui/license-plate";

export default function ApplicationDetailDialog({ open, onClose, application, getStatusBadge }) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-800 flex items-center justify-between pr-6">
            <span>Chi Tiết Đơn Đăng Ký #{application.id}</span>
            {getStatusBadge && getStatusBadge(application.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px] text-slate-500">Thông tin xe</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Biển số xe:</span>
                <LicensePlate plate={application.vehiclePlateNumber} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Loại xe:</span>
                <span className="text-slate-800 font-bold">{application.vehicleTypeName === "Ô Tô" ? "🚗 Ô tô" : "🏍️ Xe máy"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Hãng xe:</span>
                <span className="text-slate-800 font-extrabold">{application.brand || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Màu xe:</span>
                <span className="text-slate-800 font-extrabold">{application.color || "—"}</span>
              </div>
            </div>
          </div>

          {(application.note || application.rejectionReason) && (
            <div className="space-y-2">
              {application.note && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Ghi chú của bạn:</span>
                  <p className="text-slate-700 italic bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">{application.note}</p>
                </div>
              )}
              {application.rejectionReason && (
                <div>
                  <span className="text-rose-500 block mb-0.5">Phản hồi từ Manager:</span>
                  <p className="text-rose-700 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-100">{application.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
