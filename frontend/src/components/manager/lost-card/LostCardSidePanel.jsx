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
  const priorityLabel = priority === "HIGH" ? "Cao" : priority === "LOW" ? "Thấp" : "Trung bình";
  const statusLabel = item.status === "PENDING" ? "Chờ phê duyệt" : item.status === "APPROVED" ? "Đã phê duyệt" : "Đã từ chối";

  return (
    <div className="flex h-full w-[450px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-50/50 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white p-4">
        <h3 className="text-lg font-bold text-slate-800">Chi tiết hồ sơ #{caseCode}</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto p-6 text-sm">
        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Thông tin chung</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Mã yêu cầu</span>
            <span className="font-mono font-medium text-slate-800">{caseCode}</span>

            <span className="text-slate-500">Trạng thái</span>
            <div>
              <Badge variant="outline" className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_BADGE[item.status]}`}>
                {statusLabel}
              </Badge>
            </div>

            <span className="text-slate-500">Thời gian tạo</span>
            <span className="font-medium text-slate-800">{item.createdAt ? formatDateTime(item.createdAt) : "--"}</span>

            <span className="text-slate-500">Người tạo</span>
            <span className="font-medium text-slate-800">{item.reporterName || "--"}</span>

            <span className="text-slate-500">Mức độ ưu tiên</span>
            <div>
              <Badge variant="outline" className={`border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_BADGE[priority]}`}>
                {priorityLabel}
              </Badge>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Thông tin hồ sơ</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Mã phiên</span>
            <span className="font-mono font-medium text-slate-800">{item.parkingSession?.sessionCode || item.sessionCode || "--"}</span>

            <span className="text-slate-500">Mã thẻ</span>
            <span className="font-medium text-slate-800">{item.parkingCard?.cardNumber || item.cardCode || "--"}</span>

            <span className="text-slate-500">Biển số</span>
            <span className="font-mono font-medium text-slate-800">{item.parkingSession?.plateNumber || item.plateNumber || "--"}</span>

            <span className="text-slate-500">Loại xe</span>
            <span className="font-medium text-slate-800">{item.vehicleTypeName || "--"}</span>

            <span className="text-slate-500">Số điện thoại</span>
            <span className="font-medium text-slate-800">{item.phone || "--"}</span>

            <span className="text-slate-500">Phí mất thẻ</span>
            <span className="font-medium text-slate-800">{item.lostCardFee != null ? formatVND(item.lostCardFee) : "--"}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Xác minh và xử lý</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Lý do</span>
            <span className="font-semibold text-slate-800">{item.reason || "--"}</span>

            <span className="text-slate-500">Ghi chú xác minh</span>
            <span className="leading-relaxed text-slate-700">{item.verificationNote || "--"}</span>

            <span className="text-slate-500">Người duyệt</span>
            <span className="font-medium text-slate-800">
              {item.approvedByUser?.fullName
                || item.approvedByUser?.username
                || (item.approvedBy ? `UID-${item.approvedBy}` : "--")}
            </span>

            <span className="text-slate-500">Thời gian duyệt</span>
            <span className="font-medium text-slate-800">{item.approvedAt ? formatDateTime(item.approvedAt) : "--"}</span>

            <span className="text-slate-500">Lý do quyết định</span>
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
              <XCircle className="mr-2 h-5 w-5" /> Từ chối
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              onClick={() => onApprove(item)}
              disabled={isSubmitting}
            >
              <CheckCircle2 className="mr-2 h-5 w-5" /> Phê duyệt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
