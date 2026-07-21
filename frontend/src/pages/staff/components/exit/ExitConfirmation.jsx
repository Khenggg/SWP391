import React from "react";
import { Camera, CheckCircle2, Clock3, Clock, XCircle, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function MismatchBadge({ status }) {
  if (!status || status === "NONE") return null;
  const cfg = {
    PENDING:  { cls: "bg-yellow-100 text-yellow-800 border border-yellow-300", label: "🟡 PENDING"  },
    APPROVED: { cls: "bg-green-100  text-green-800  border border-green-300",  label: "🟢 APPROVED" },
    REJECTED: { cls: "bg-red-100    text-red-800    border border-red-300",    label: "🔴 REJECTED" },
  };
  const c = cfg[status];
  if (!c) return null;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ─── Mismatch Status Block ────────────────────────────────────────────────────
function MismatchStatusBlock({ status, managerReason, session, plate, vehicleTypes }) {
  const navigate = useNavigate();

  const buildSessionState = () => ({
    parkingSessionId: session?.sessionId ?? session?.id,
    sessionData: {
      parkingSessionId: session?.sessionId ?? session?.id,
      vehiclePlate: session?.plateNumber,
      vehicleType: (() => {
        if (!vehicleTypes || !session?.vehicleTypeId) return "";
        const vt = vehicleTypes.find((v) => Number(v.id) === Number(session.vehicleTypeId));
        return vt ? vt.name : "";
      })(),
      ownerName: null,
      parkingCard: session?.cardCode,
      entryTime: session?.entryTime,
      floor: session?.floorId,
      area: session?.areaId,
      slot: session?.slotId,
    },
  });

  // ── NONE: show report button only when plates differ ──────────────────────
  if (!status || status === "NONE") {
    const platesDiffer =
      session &&
      plate &&
      plate.replace(/[^A-Z0-9]/gi, "").toUpperCase() !==
        (session.plateNumber || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();

    if (!platesDiffer || !session) return null;

    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-900">Cảnh báo lệch biển số!</p>
            <p className="text-[10px] text-amber-700">
              Biển số lúc ra ({plate}) khác với lúc vào ({session?.plateNumber}).
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/staff/license-plate-mismatch", { state: buildSessionState() })}
          className="w-fit h-7 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold"
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Báo cáo lệch biển số
        </Button>
      </div>
    );
  }

  // ── PENDING ───────────────────────────────────────────────────────────────
  if (status === "PENDING") {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-yellow-900">Chờ Manager Duyệt</p>
            <p className="text-[10px] text-yellow-700">
              Thanh toán và ra xe bị tạm khoá cho đến khi được duyệt.
            </p>
          </div>
          <MismatchBadge status="PENDING" />
        </div>
        {/* Manager Reason card — shows "Waiting..." when PENDING */}
        <div className="bg-white rounded border border-yellow-200 p-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Lý do Manager</p>
          <p className="text-xs text-slate-400 italic">Đang chờ Manager xét duyệt...</p>
        </div>
      </div>
    );
  }

  // ── APPROVED ──────────────────────────────────────────────────────────────
  if (status === "APPROVED") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-green-900">Đã được phê duyệt</p>
            <p className="text-[10px] text-green-700">
              Lệch biển số đã được Manager xác nhận. Có thể tiếp tục thanh toán và ra xe.
            </p>
          </div>
          <MismatchBadge status="APPROVED" />
        </div>
        {/* Manager Reason — read-only card */}
        <div className="bg-white rounded border border-green-200 p-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Lý do Manager</p>
          <p className="text-xs text-slate-700">
            {managerReason || <span className="text-slate-400 italic">Không có ghi chú thêm.</span>}
          </p>
        </div>
      </div>
    );
  }

  // ── REJECTED ──────────────────────────────────────────────────────────────
  if (status === "REJECTED") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-red-900">Yêu cầu bị từ chối</p>
            <p className="text-[10px] text-red-700">
              Thanh toán và ra xe bị vô hiệu hoá. Nhân viên có thể gửi lại yêu cầu.
            </p>
          </div>
          <MismatchBadge status="REJECTED" />
        </div>
        {/* Manager Reason — read-only card */}
        <div className="bg-white rounded border border-red-200 p-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Lý do Manager</p>
          <p className="text-xs text-slate-700">
            {managerReason || <span className="text-slate-400 italic">Không có lý do cụ thể.</span>}
          </p>
        </div>
        {/* Submit Again button */}
        {session && (
          <Button
            size="sm"
            onClick={() =>
              navigate("/staff/license-plate-mismatch", {
                state: {
                  ...buildSessionState(),
                  // Prefill: let mismatch page know this is a "submit again"
                  prefillPlate: plate || "",
                  prefillReason: "",
                  isResubmit: true,
                },
              })
            }
            className="w-fit h-7 text-[10px] bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Gửi Lại Yêu Cầu
          </Button>
        )}
      </div>
    );
  }

  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ExitConfirmation({
  plate,
  setPlate,
  session,
  hasMismatch,
  mismatchCase,
  handleCreateMismatchCase,
  isCreatingMismatch,
  currentTime,
  staffName,
  mismatchStatus,
  managerReason,
  vehicleTypes,
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
      <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">4</span>
        <h3 className="font-bold text-slate-800 text-sm">Xác nhận thông tin ra xe</h3>
        {/* Show current mismatch badge in header for quick reference */}
        {mismatchStatus && mismatchStatus !== "NONE" && (
          <MismatchBadge status={mismatchStatus} />
        )}
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Biển số thực tế (nếu khác)</label>
            <div className="relative">
              <Input
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="font-bold uppercase pr-8"
                placeholder="Nhập biển số thực tế"
                disabled={!session}
              />
              <Camera className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600">Ghi chú (nếu có)</label>
            <Input placeholder="Nhập ghi chú" className="text-sm" disabled={!session} />
          </div>
        </div>

        {/* Mismatch status block */}
        <MismatchStatusBlock
          status={mismatchStatus}
          managerReason={managerReason}
          session={session}
          plate={plate}
          vehicleTypes={vehicleTypes}
        />

        <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nhân viên xử lý</label>
            <div className="bg-slate-50 border rounded px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-indigo-600" />
              </div>
              {staffName}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Thời gian ra (hiện tại)</label>
            <div className="bg-slate-50 border rounded px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-2">
              <Clock3 className="w-3.5 h-3.5 text-slate-400" />
              {currentTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
