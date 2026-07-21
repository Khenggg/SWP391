import React from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatVND } from "@/lib/format";

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_BADGE = {
  HIGH: "bg-red-100 text-red-600 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-600 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

export default function LostCardSidePanel({
  item,
  onClose,
  onApprove,
  onReject,
  isSubmitting = false,
}) {
  if (!item) return null;

  const caseCode = item.caseCode || `LC-${String(item.id || "").padStart(5, "0")}`;
  const priority = item.priority || "MEDIUM";
  const priorityLabel = priority === "HIGH" ? "Cao" : priority === "LOW" ? "Thap" : "Trung binh";
  const statusLabel = item.status === "PENDING" ? "Cho phe duyet" : item.status === "APPROVED" ? "Da phe duyet" : "Da tu choi";

  return (
    <div className="flex h-full w-[450px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-50/50 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <h3 className="text-lg font-bold text-slate-800">Chi tiet ho so #{caseCode}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto p-6 text-sm">
        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Thong tin chung</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Ma yeu cau</span>
            <span className="font-mono font-medium text-slate-800">{caseCode}</span>

            <span className="text-slate-500">Trang thai</span>
            <div>
              <Badge variant="outline" className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[item.status]}`}>
                {statusLabel}
              </Badge>
            </div>

            <span className="text-slate-500">Thoi gian tao</span>
            <span className="font-medium text-slate-800">{item.createdAt ? formatDateTime(item.createdAt) : "--"}</span>

            <span className="text-slate-500">Nguoi tao</span>
            <span className="font-medium text-slate-800">{item.reporterName || "--"}</span>

            <span className="text-slate-500">Muc do uu tien</span>
            <div>
              <Badge variant="outline" className={`border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_BADGE[priority]}`}>
                {priorityLabel}
              </Badge>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Thong tin ho so</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Ma phien</span>
            <span className="font-mono font-medium text-slate-800">{item.parkingSession?.sessionCode || item.sessionCode || "--"}</span>

            <span className="text-slate-500">Ma the</span>
            <span className="font-medium text-slate-800">{item.parkingCard?.cardNumber || item.cardCode || "--"}</span>

            <span className="text-slate-500">Bien so</span>
            <span className="font-mono font-medium text-slate-800">{item.parkingSession?.plateNumber || item.plateNumber || "--"}</span>

            <span className="text-slate-500">Loai xe</span>
            <span className="font-medium text-slate-800">{item.vehicleTypeName || (item.parkingSession?.vehicleTypeId === 1 ? 'Xe máy' : item.parkingSession?.vehicleTypeId === 2 ? 'Ô tô' : 'Xe vận chuyển') || "--"}</span>

            <span className="text-slate-500">So dien thoai</span>
            <span className="font-medium text-slate-800">{item.phone || "--"}</span>

            <span className="text-slate-500">Phi mat the</span>
            <span className="font-medium text-slate-800">{item.lostCardFee != null ? formatVND(item.lostCardFee) : "--"}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Xac minh va xu ly</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Ly do</span>
            <span className="font-semibold text-slate-800">{item.reason || "--"}</span>

            <span className="text-slate-500">Ghi chu xac minh</span>
            <span className="leading-relaxed text-slate-700">{item.verificationNote || "--"}</span>

            <span className="text-slate-500">Nguoi duyet</span>
            <span className="font-medium text-slate-800">
              {item.approvedByUser?.fullName
                || item.approvedByUser?.username
                || (item.approvedBy ? `UID-${item.approvedBy}` : "--")}
            </span>

            <span className="text-slate-500">Thoi gian duyet</span>
            <span className="font-medium text-slate-800">{item.approvedAt ? formatDateTime(item.approvedAt) : "--"}</span>

            <span className="text-slate-500">Ly do quyet dinh</span>
            <span className="leading-relaxed text-slate-700">
              {item.rejectionReason || item.reason || "--"}
            </span>
          </div>
        </section>
      </div>

      <div className="space-y-3 border-t border-slate-200 bg-white p-4">
        {item.status === "PENDING" && (
          <div className="flex w-full items-center gap-3">
            <Button
              variant="outline"
              className="h-11 flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onReject(item)}
              disabled={isSubmitting}
            >
              <XCircle className="mr-2 h-5 w-5" /> Tu choi
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => onApprove(item)}
              disabled={isSubmitting}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> Phe duyet
            </Button>
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          Khi phe duyet, frontend goi dung API approve cua lost-card case theo spec/backend.
        </p>
      </div>
    </div>
  );
}
