import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, AlertCircle, Loader2, CopyCheck, Clock, ExternalLink } from "lucide-react";
import { driverService } from "../../../services/driverService";
import { toast } from "sonner";
import LicensePlate from "@/components/ui/license-plate";

export default function PayOSPaymentModal({ open, onClose, application, onPaymentSuccess }) {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(""); // 'amount' | 'content' | 'account'

  // Fetch payment link upon open
  useEffect(() => {
    if (!open || !application) {
      setPaymentData(null);
      setQrDataUrl("");
      setTimeLeft(900);
      setIsSuccess(false);
      return;
    }

    const initPayment = async () => {
      setLoading(true);
      setQrError("");
      try {
        const res = await driverService.createOnlinePayment(application.id);
        setPaymentData(res);

        // Generate QR code image
        if (res.qrCode || res.checkoutUrl) {
          const payload = res.qrCode || res.checkoutUrl;
          const dataUrl = await QRCode.toDataURL(payload, {
            width: 200,
            margin: 1,
            errorCorrectionLevel: "M",
            color: {
              dark: "#1e1b4b", // indigo-950
              light: "#ffffff"
            }
          });
          setQrDataUrl(dataUrl);
        } else {
          setQrError("Không có dữ liệu QR từ PayOS.");
        }

        // Set remaining time
        if (res.expiredAt) {
          const secs = Math.max(0, Math.floor((new Date(res.expiredAt).getTime() - Date.now()) / 1000));
          setTimeLeft(secs);
        }

      } catch (err) {
        console.error("Init online payment failed:", err);
        setQrError(err.message || "Không thể tạo liên kết thanh toán PayOS.");
        toast.error(err.message || "Tạo liên kết thanh toán thất bại.");
      } finally {
        setLoading(false);
      }
    };

    initPayment();
  }, [open, application]);

  // Countdown timer
  useEffect(() => {
    if (!open || timeLeft <= 0 || isSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [open, timeLeft, isSuccess]);

  // Polling check transaction status
  useEffect(() => {
    if (!open || !application || isSuccess || timeLeft <= 0) return;

    const checkInterval = setInterval(async () => {
      try {
        const app = await driverService.getMonthlyPassApplicationById(application.id);
        // Under C# workflow, when paid, application status transitions to PAID
        if (app.status === "PAID" || app.status === "ACTIVE") {
          setIsSuccess(true);
          toast.success("Thanh toán thành công!");
          clearInterval(checkInterval);
          setTimeout(() => {
            onPaymentSuccess();
          }, 2000);
        }
      } catch (err) {
        console.warn("Poll status check failed:", err);
      }
    }, 4000);

    return () => clearInterval(checkInterval);
  }, [open, application, isSuccess, timeLeft, onPaymentSuccess]);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
    toast.success("Đã sao chép vào bộ nhớ tạm!");
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isSuccess && onClose()}>
      <DialogContent className="max-w-md p-6 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-black uppercase text-indigo-400 tracking-wider">
            Thanh Toán Vé Tháng Trực Tuyến
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-xs text-slate-400 font-bold">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            Đang liên kết với cổng PayOS...
          </div>
        ) : qrError ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 animate-bounce" />
            <h3 className="text-sm font-extrabold text-slate-200">Không thể thực hiện thanh toán</h3>
            <p className="text-xs text-slate-400 max-w-xs">{qrError}</p>
            <Button
              onClick={onClose}
              className="mt-4 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              Đóng cửa sổ
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-xl shadow-emerald-500/5 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-wide">
                Giao Dịch Thành Công!
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-semibold">
                Hệ thống đã nhận được tiền thanh toán phí đăng ký vé tháng.
              </p>
            </div>
            <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl space-y-2 w-full text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn đăng ký:</span>
                <span className="text-slate-300 font-bold">#{application.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biển số xe:</span>
                <span className="text-indigo-400 font-black">{application.vehiclePlateNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hình thức thanh toán:</span>
                <span className="text-slate-300 font-black">Cổng PayOS (Thẻ ATM/QR)</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 text-xs font-semibold text-slate-400">
            {/* Countdown / Payment link info */}
            <div className="flex justify-between items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Thời gian thanh toán còn lại:</span>
                  <span className="text-slate-200 font-black text-sm">{formatTimer(timeLeft)}</span>
                </div>
              </div>
              {paymentData?.checkoutUrl && (
                <a
                  href={paymentData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase px-3.5 py-2 rounded-lg shadow transition shrink-0"
                >
                  Mở cổng PayOS <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* QR display */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-indigo-950/20 max-w-[240px] mx-auto shadow-lg shadow-indigo-950/10">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="VietQR PayOS" className="w-[180px] h-[180px] rounded-lg" />
              ) : (
                <div className="w-[180px] h-[180px] bg-slate-50 border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                  QR Loading...
                </div>
              )}
              <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase mt-2 select-none">
                Quét mã qua App Ngân hàng
              </span>
            </div>

            {/* Transfer details */}
            <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wide border-b border-slate-800 pb-1.5">
                Thông tin thanh toán
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã đơn đăng ký:</span>
                  <strong className="text-slate-200">#{application.id}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Biển số xe:</span>
                  <LicensePlate plate={application.vehiclePlateNumber} size="sm" />
                </div>
                <div className="flex justify-between items-center border-t border-slate-900/50 pt-2">
                  <span className="text-slate-500">Số tiền:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-amber-500 text-sm font-black">
                      {Number(paymentData?.totalAmount || application.price).toLocaleString("vi-VN")} ₫
                    </strong>
                    <button
                      onClick={() => handleCopy(String(paymentData?.totalAmount || application.price), "amount")}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedField === "amount" ? <CopyCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-200 font-extrabold select-all">
                      {paymentData?.paymentId ? `PASS ${paymentData.paymentId}` : `PASS ${application.id}`}
                    </strong>
                    <button
                      onClick={() => handleCopy(paymentData?.paymentId ? `PASS ${paymentData.paymentId}` : `PASS ${application.id}`, "content")}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      {copiedField === "content" ? <CopyCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] font-bold">
              <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              Đang chờ xác thực thanh toán tự động...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
