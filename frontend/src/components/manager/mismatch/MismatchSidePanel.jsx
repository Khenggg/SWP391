import React from "react";
import { X, Check, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";

const STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-red-100 text-red-700 border-red-300",
};

const PRIORITY_BADGE = {
  HIGH: "bg-red-100 text-red-600 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-600 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-600 border-emerald-200",
};

function getMismatchType(entryPlate, exitPlate) {
  const normalizedEntry = String(entryPlate || "").replace(/[^A-Z0-9]/gi, "");
  const normalizedExit = String(exitPlate || "").replace(/[^A-Z0-9]/gi, "");

  if (!normalizedEntry || !normalizedExit) return "--";
  if (normalizedEntry === normalizedExit) return "Khop";
  if (normalizedEntry.slice(0, -1) === normalizedExit.slice(0, -1)) return "Khac mot phan";
  return "Khac hoan toan";
}

export default function MismatchSidePanel({
  item,
  onClose,
  onApprove,
  onReject,
  isSubmitting = false,
}) {
  if (!item) return null;

  const caseCode = item.caseCode || `MM-${String(item.id || "").padStart(5, "0")}`;
  const priority = item.priority || "MEDIUM";
  const priorityLabel = priority === "HIGH" ? "Cao" : priority === "LOW" ? "Thap" : "Trung binh";
  const statusLabel = item.status === "PENDING" ? "Cho phe duyet" : item.status === "CONFIRMED" ? "Da phe duyet" : "Da tu choi";

  return (
    <div className="flex h-full w-[500px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-50/50 shadow-xl">
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

            <span className="text-slate-500">Muc do uu tien</span>
            <div>
              <Badge variant="outline" className={`border px-2 py-0.5 text-[10px] font-bold ${PRIORITY_BADGE[priority]}`}>
                {priorityLabel}
              </Badge>
            </div>

            <span className="text-slate-500">Thoi gian tao</span>
            <span className="font-medium text-slate-800">{item.createdAt ? formatDateTime(item.createdAt) : "--"}</span>

            <span className="text-slate-500">Nguoi tao</span>
            <span className="font-medium text-slate-800">{item.reporterName || item.createdBy || "--"}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Thong tin phien</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Ma phien</span>
            <span className="font-mono font-medium text-slate-800">{item.sessionCode || "--"}</span>

            <span className="text-slate-500">Ma the</span>
            <span className="font-medium text-slate-800">{item.cardCode || "--"}</span>

            <span className="text-slate-500">Bien vao</span>
            <span className="font-mono font-medium text-slate-800">{item.entryPlateNumber || "--"}</span>

            <span className="text-slate-500">Bien ra</span>
            <span className="font-mono font-medium text-red-600">{item.exitPlateNumber || "--"}</span>

            <span className="text-slate-500">Thoi gian vao</span>
            <span className="font-medium text-slate-800">{item.entryTime ? formatDateTime(item.entryTime) : "--"}</span>

            <span className="text-slate-500">Thoi gian phat sinh</span>
            <span className="font-medium text-slate-800">{item.createdAt ? formatDateTime(item.createdAt) : "--"}</span>

            <span className="text-slate-500">Loai lech</span>
            <span className="font-medium text-slate-800">{getMismatchType(item.entryPlateNumber, item.exitPlateNumber)}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-800">Xac minh va xu ly</h4>
          <div className="grid grid-cols-[140px_1fr] gap-y-3">
            <span className="text-slate-500">Ly do</span>
            <span className="font-semibold text-slate-800">{item.reason || "--"}</span>

            <span className="text-slate-500">Ghi chu</span>
            <span className="leading-relaxed text-slate-700">{item.note || "--"}</span>

            <span className="text-slate-500">Nguoi duyet</span>
            <span className="font-medium text-slate-800">{item.decidedBy || "--"}</span>

            <span className="text-slate-500">Thoi gian duyet</span>
            <span className="font-medium text-slate-800">{item.decidedAt ? formatDateTime(item.decidedAt) : "--"}</span>

            <span className="text-slate-500">Ly do quyet dinh</span>
            <span className="leading-relaxed text-slate-700">{item.decisionReason || "--"}</span>
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
              className="h-11 flex-1 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
              onClick={() => onApprove(item)}
              disabled={isSubmitting}
            >
              <Check className="mr-2 h-5 w-5" /> Phe duyet
            </Button>
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          Trang nay chi giu cac thao tac co nghiep vu that: phe duyet, tu choi, dong panel.
        </p>
      </div>
    </div>
  );
}
