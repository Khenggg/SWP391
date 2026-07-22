import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  RefreshCw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useSubmitLicensePlateMismatch } from "../../hooks/useSubmitLicensePlateMismatch";
import { useMismatchStatus } from "../../hooks/useLicensePlateMismatch";
import { useState, useRef } from "react";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (!status || status === "NONE") return null;

  const config = {
    PENDING: {
      color: "bg-yellow-100 border-yellow-300 text-yellow-800",
      icon: <Clock className="w-4 h-4" />,
      label: "🟡 PENDING",
    },
    APPROVED: {
      color: "bg-green-100 border-green-300 text-green-800",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "🟢 APPROVED",
    },
    REJECTED: {
      color: "bg-red-100 border-red-300 text-red-800",
      icon: <XCircle className="w-4 h-4" />,
      label: "🔴 REJECTED",
    },
  };

  const c = config[status];
  if (!c) return null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-bold ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ─── Manager Reason Card (read-only) ──────────────────────────────────────────
function ManagerReasonCard({ status, managerReason }) {
  const borderMap = {
    APPROVED: "border-green-200 bg-green-50",
    REJECTED: "border-red-200   bg-red-50",
    PENDING:  "border-yellow-200 bg-yellow-50",
  };
  const textMap = {
    APPROVED: "text-green-900",
    REJECTED: "text-red-900",
    PENDING:  "text-yellow-900",
  };

  const borderCls = borderMap[status] ?? "border-slate-200 bg-slate-50";
  const textCls   = textMap[status]   ?? "text-slate-900";

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-2 ${borderCls}`}>
      {/* Status row */}
      <div className="flex items-center gap-2">
        {status === "APPROVED" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
        {status === "REJECTED" && <XCircle className="w-5 h-5 text-red-600" />}
        {status === "PENDING"  && <Clock className="w-5 h-5 text-yellow-600" />}
        <div>
          <p className={`font-bold text-sm ${textCls}`}>
            {status === "APPROVED"
              ? "Manager đã phê duyệt yêu cầu"
              : status === "REJECTED"
              ? "Manager đã từ chối yêu cầu"
              : "Yêu cầu đang chờ Manager xét duyệt"}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Manager Reason — always shown, read-only */}
      <div className="bg-white rounded-lg border p-3">
        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Lý do Manager</p>
        {status === "PENDING" ? (
          <p className="text-sm text-slate-400 italic">Đang chờ Manager xét duyệt...</p>
        ) : managerReason ? (
          <p className="text-sm text-slate-700">{managerReason}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">Không có ghi chú thêm.</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LicensePlateMismatchPage() {
  const location  = useLocation();
  const navigate  = useNavigate();

  const parkingSessionId = location.state?.parkingSessionId;
  const sessionData      = location.state?.sessionData;
  const isResubmit       = location.state?.isResubmit ?? false;
  const prefillPlate     = location.state?.prefillPlate ?? "";
  const prefillReason    = location.state?.prefillReason ?? "";

  // Always fetch fresh — staleTime: 0, no cache
  const {
    data: statusData,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useMismatchStatus(parkingSessionId);

  const { mutate: submitMismatch, isPending: isSubmitting } = useSubmitLicensePlateMismatch();

  const currentStatus  = statusData?.status   ?? "NONE";
  const managerReason  = statusData?.managerReason ?? null;

  // Show the form when:
  // (a) no request has been submitted yet (NONE), OR
  // (b) the latest request was REJECTED and staff clicked "Submit Again"
  const canSubmit = currentStatus === "NONE" || (isResubmit && currentStatus === "REJECTED");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { actualPlate: prefillPlate, reason: prefillReason },
  });

  // Prefill values when navigated with prefill data
  useEffect(() => {
    reset({ actualPlate: prefillPlate, reason: prefillReason });
  }, [prefillPlate, prefillReason, reset]);

  // Image Upload State
  const [exitPlateImage, setExitPlateImage] = useState(null);
  const [exitVehicleImage, setExitVehicleImage] = useState(null);
  
  const handleImageChange = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận định dạng JPG, JPEG, PNG");
      return;
    }
    
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 10MB");
      return;
    }
    
    setter(file);
  };

  if (!parkingSessionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50">
        <AlertTriangle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa chọn phiên đỗ xe</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">
          Vui lòng chọn phiên đỗ xe từ trang Xe Ra trước khi báo cáo lệch biển số.
        </p>
        <button
          onClick={() => navigate("/staff/exit")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang Xe Ra
        </button>
      </div>
    );
  }

  const onSubmit = (data) => {
    if (!exitPlateImage || !exitVehicleImage) {
      toast.error("Vui lòng tải lên đủ 2 ảnh (Ảnh biển số ra và Ảnh toàn xe ra)");
      return;
    }

    const formData = new FormData();
    formData.append("parkingSessionId", Number(parkingSessionId));
    formData.append("actualPlate", data.actualPlate);
    formData.append("reason", data.reason);
    formData.append("exitPlateImage", exitPlateImage);
    formData.append("exitVehicleImage", exitVehicleImage);

    // Also pass existing context info if backend still needs it (optional since we send images)
    if (location.state?.ocrConfidence) {
      formData.append("ocrConfidence", location.state.ocrConfidence);
    }

    submitMismatch(
      formData,
      {
        onSuccess: () => {
          navigate("/staff/exit");
        },
      }
    );
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
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
              {isResubmit ? "Gửi Lại Báo Cáo Lệch Biển Số" : "Báo Cáo Lệch Biển Số"}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              {isResubmit
                ? "Yêu cầu trước đã bị từ chối. Chỉnh sửa thông tin và gửi lại."
                : "Báo cáo xe có biển số thực tế khác với biển số đã đăng ký."}
            </p>
          </div>
          {isLoadingStatus ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <div className="flex items-center gap-2">
              <StatusBadge status={currentStatus} />
              <button
                onClick={() => refetchStatus()}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
                title="Làm mới trạng thái"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        {/* Session Info */}
        {sessionData && <LicensePlateInfo data={sessionData} />}

        {/* Status card: show when there is an existing request */}
        {currentStatus !== "NONE" && !canSubmit && (
          <ManagerReasonCard status={currentStatus} managerReason={managerReason} />
        )}

        {/* When REJECTED and NOT in resubmit mode: show Submit Again button */}
        {currentStatus === "REJECTED" && !isResubmit && (
          <div className="flex justify-end">
            <button
              onClick={() =>
                navigate("/staff/license-plate-mismatch", {
                  state: {
                    parkingSessionId,
                    sessionData,
                    prefillPlate:  statusData?.exitPlateNumber ?? "",
                    prefillReason: "",
                    isResubmit:    true,
                  },
                })
              }
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Gửi Lại Yêu Cầu
            </button>
          </div>
        )}

        {/* Form — show when NONE or resubmit after REJECTED */}
        {canSubmit && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 bg-amber-50/50 flex items-center gap-2 text-amber-800 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <h3>{isResubmit ? "Cập nhật thông tin báo cáo" : "Báo cáo lệch biển số"}</h3>
            </div>

            <div className="p-5 flex flex-col gap-6">
              {/* Actual Plate */}
              <div>
                <label htmlFor="actualPlate" className="block text-sm font-bold text-slate-700 mb-1">
                  Biển số thực tế <span className="text-rose-500">*</span>
                </label>
                <input
                  id="actualPlate"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 uppercase ${
                    errors.actualPlate ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="VD: 30A12345"
                  {...register("actualPlate", { required: "Vui lòng nhập biển số thực tế." })}
                />
                {errors.actualPlate && (
                  <p className="mt-1 text-sm text-rose-500 font-medium">{errors.actualPlate.message}</p>
                )}
              </div>

              {/* Staff Reason */}
              <div>
                <label htmlFor="reason" className="block text-sm font-bold text-slate-700 mb-1">
                  Lý do <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none ${
                    errors.reason ? "border-rose-500" : "border-slate-300"
                  }`}
                  placeholder="Mô tả chi tiết lý do lệch biển số..."
                  {...register("reason", {
                    required: "Vui lòng nhập lý do.",
                    minLength: { value: 10, message: "Lý do phải có ít nhất 10 ký tự." },
                    maxLength: { value: 500, message: "Lý do không được vượt quá 500 ký tự." },
                  })}
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-rose-500 font-medium">{errors.reason.message}</p>
                )}
              </div>

              {/* Exit Vehicle Images */}
              <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
                <h4 className="font-bold text-slate-800 text-sm">Hình ảnh xe ra</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Exit Plate Image */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">
                      Ảnh biển số xe ra <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-1">Ảnh chụp rõ nét biển số xe ra</p>
                    <div className="relative border border-dashed border-slate-300 rounded-lg h-40 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {exitPlateImage ? (
                        <>
                          <img src={URL.createObjectURL(exitPlateImage)} alt="Exit Plate" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setExitPlateImage(null)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100 transition-colors">
                          <span className="text-sm font-medium text-indigo-600">Chọn ảnh tải lên</span>
                          <span className="text-xs text-slate-400 mt-1">JPG, PNG (Tối đa 10MB)</span>
                          <input type="file" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleImageChange(e, setExitPlateImage)} />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Exit Vehicle Image */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">
                      Ảnh toàn xe ra <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mb-1">Ảnh chụp toàn bộ phương tiện</p>
                    <div className="relative border border-dashed border-slate-300 rounded-lg h-40 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {exitVehicleImage ? (
                        <>
                          <img src={URL.createObjectURL(exitVehicleImage)} alt="Exit Vehicle" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setExitVehicleImage(null)}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100 transition-colors">
                          <span className="text-sm font-medium text-indigo-600">Chọn ảnh tải lên</span>
                          <span className="text-xs text-slate-400 mt-1">JPG, PNG (Tối đa 10MB)</span>
                          <input type="file" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleImageChange(e, setExitVehicleImage)} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info note for resubmit */}
              {isResubmit && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700 font-medium">
                  ℹ️ Yêu cầu mới sẽ được tạo. Yêu cầu bị từ chối trước vẫn được lưu trong lịch sử.
                  Manager sẽ xét duyệt lại yêu cầu mới.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isResubmit ? "Gửi Lại Báo Cáo" : "Gửi Báo Cáo"}
              </button>
            </div>
          </form>
        )}


      </div>
    </div>
  );
}
