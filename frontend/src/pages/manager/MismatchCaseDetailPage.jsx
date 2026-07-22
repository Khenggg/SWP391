import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ZoomIn,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useMismatchCaseDetail } from "@/hooks/useLicensePlateMismatch";
import { useApproveMismatch, useRejectMismatch } from "@/hooks/useSubmitLicensePlateMismatch";
import { formatDateTime } from "@/lib/format";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING: { cls: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <Clock className="w-3.5 h-3.5" />, label: "Chờ duyệt" },
    APPROVED: { cls: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Đã duyệt" },
    CONFIRMED: { cls: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Đã duyệt" },
    REJECTED: { cls: "bg-red-100 text-red-800 border-red-300", icon: <XCircle className="w-3.5 h-3.5" />, label: "Từ chối" },
  };
  const c = map[status];
  if (!c) return <span className="text-slate-500 text-sm">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── Image card with zoom preview ────────────────────────────────────────────
function ImageCard({ label, url }) {
  const [zoom, setZoom] = useState(false);

  if (!url) {
    return (
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
        <div className="w-full h-36 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
          Không có ảnh
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-slate-500 uppercase">{label}</p>
        <div
          className="relative w-full h-36 rounded-lg border border-slate-200 overflow-hidden cursor-pointer group"
          onClick={() => setZoom(true)}
        >
          <img src={url} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Full-size preview overlay */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <img
            src={url}
            alt={label}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

// ─── Info row ────────────────────────────────────────────────────────────────
function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-lg font-black text-indigo-700" : "text-slate-700"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function MismatchCaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: caseDetail, isLoading, isError, error } = useMismatchCaseDetail(id);
  const { mutate: approveMismatch, isPending: isApproving } = useApproveMismatch();
  const { mutate: rejectMismatch, isPending: isRejecting } = useRejectMismatch();

  const isSubmitting = isApproving || isRejecting;

  const [managerReasonText, setManagerReasonText] = useState("");
  const [reasonError, setReasonError] = useState("");

  const isPending =
    !caseDetail?.status ||
    caseDetail.status === "PENDING";

  const onApprove = () => {
    setReasonError("");
    approveMismatch(
      { requestId: Number(id), managerReason: managerReasonText.trim() || null },
      { onSuccess: () => navigate(-1) }
    );
  };

  const onReject = () => {
    if (!managerReasonText || managerReasonText.trim().length < 5) {
      setReasonError("Vui lòng nhập lý do từ chối (tối thiểu 5 ký tự).");
      return;
    }
    setReasonError("");
    rejectMismatch(
      { requestId: Number(id), managerReason: managerReasonText.trim() },
      { onSuccess: () => navigate(-1) }
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 p-8">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <p className="font-bold text-slate-800">Không thể tải hồ sơ</p>
        <p className="text-sm text-slate-500">{error?.message || "Lỗi không xác định."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const d = caseDetail || {};

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full bg-slate-50 p-4 lg:p-8 overflow-auto">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <header className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Chi tiết Hồ sơ Lệch Biển số
            </h1>
            <p className="text-sm text-slate-500 mt-1">ID: {id}</p>
          </div>
          <StatusBadge status={d.status} />
        </header>

        {/* ── Vehicle Images ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Hình ảnh xe</h2>
          </div>
          
          <div className="p-5 flex flex-col gap-6">
            {/* Entry Images */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Vehicle Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageCard label="Entry Plate Image" url={d.entryPlateImageUrl} />
                <ImageCard label="Entry Vehicle Image" url={d.entryVehicleImageUrl} />
              </div>
            </div>

            {/* Exit Images */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2">Vehicle Exit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageCard label="Exit Plate Image" url={d.exitPlateImageUrl} />
                <ImageCard label="Exit Vehicle Image" url={d.exitVehicleImageUrl} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Vehicle Information ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Thông tin phương tiện</h2>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-6">
            <InfoRow label="Parking Session ID" value={d.sessionId} />
            <InfoRow label="Tên chủ xe" value={d.ownerName} />
            <InfoRow label="Loại xe" value={d.vehicleType} />
            <InfoRow label="Biển số đăng ký" value={d.entryPlateNumber} highlight />
            <InfoRow label="Biển số thực tế" value={d.exitPlateNumber} highlight />
            <InfoRow label="Thời gian vào" value={d.entryTime ? formatDateTime(d.entryTime) : null} />
            <InfoRow label="Thời gian ra" value={d.exitTime ? formatDateTime(d.exitTime) : null} />
            <InfoRow label="Nhân viên báo cáo" value={d.submittedBy || d.createdBy} />
          </div>
        </div>

        {/* ── Staff Report ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Lý do của nhân viên</h2>
          </div>
          <div className="p-5">
            <textarea
              readOnly
              value={d.reason || "Không có lý do."}
              rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 resize-none cursor-default focus:outline-none"
            />
          </div>
        </div>

        {/* ── Manager Review ── (only when PENDING) */}
        {isPending ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-800">Xem xét của Manager</h2>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Lý do / Ghi chú <span className="text-slate-400 font-normal text-xs">(bắt buộc nếu từ chối)</span>
                </label>
                <textarea
                  rows={4}
                  value={managerReasonText}
                  onChange={(e) => {
                    setManagerReasonText(e.target.value);
                    if (reasonError) setReasonError("");
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm ${
                    reasonError ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Nhập lý do phê duyệt hoặc lý do từ chối..."
                  disabled={isSubmitting}
                />
                {reasonError && (
                  <p className="mt-1 text-sm text-rose-500 font-medium">{reasonError}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Phê duyệt
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Show manager's decision (read-only) when already processed
          d.managerReason && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="font-bold text-slate-800">Quyết định của Manager</h2>
              </div>
              <div className="p-5">
                <textarea
                  readOnly
                  value={d.managerReason}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 resize-none cursor-default focus:outline-none"
                />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
