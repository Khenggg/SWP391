import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, AlertCircle, Loader2, CopyCheck, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatVND } from "@/lib/format";

export default function StaffPayOSPaymentModal({ open, onClose, session, fee, payosPaymentUrl, qrCodeData, onPaymentSuccess }) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    if (!open) {
      setQrDataUrl("");
      setQrError("");
      return;
    }

    const generateQR = async () => {
      const payload = qrCodeData || payosPaymentUrl || session?.pendingOnlinePayment?.paymentUrl || session?.pendingOnlinePayment?.checkoutUrl;
      if (payload) {
        try {
          const dataUrl = await QRCode.toDataURL(payload, {
            width: 240,
            margin: 1,
            errorCorrectionLevel: "M",
            color: { dark: "#0f172a", light: "#ffffff" },
          });
          setQrDataUrl(dataUrl);
          setQrError("");
        } catch (err) {
          console.error("Generate QR failed:", err);
          setQrError("Không thể tạo dữ liệu QR.");
        }
      } else {
        setQrError("Đang khởi tạo mã QR thanh toán PayOS...");
      }
    };

    void generateQR();
  }, [open, qrCodeData, payosPaymentUrl, session]);

  const copyToClipboard = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Đã sao chép vào bộ nhớ tạm");
    setTimeout(() => setCopiedField(""), 2000);
  };

  const activeUrl = payosPaymentUrl || session?.pendingOnlinePayment?.paymentUrl || session?.pendingOnlinePayment?.checkoutUrl;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-slate-800">
            Quét mã QR Thanh toán PayOS
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500">
            Khách hàng quét mã QR bằng ứng dụng Ngân hàng (VietQR / PayOS).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3">
          {qrDataUrl ? (
            <div className="relative p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <img
                src={qrDataUrl}
                alt="PayOS VietQR Code"
                className="w-56 h-56 object-contain rounded-lg"
              />
            </div>
          ) : qrError ? (
            <div className="w-56 h-56 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 text-center gap-2">
              <AlertCircle className="size-8 text-amber-500" />
              <p className="text-xs text-slate-600 font-medium">{qrError}</p>
            </div>
          ) : (
            <div className="w-56 h-56 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 gap-2">
              <Loader2 className="size-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold text-slate-500">Đang tạo mã VietQR...</p>
            </div>
          )}

          <div className="text-center w-full space-y-1">
            <p className="text-xs font-semibold text-slate-500">Số tiền cần thanh toán</p>
            <p className="text-2xl font-black text-emerald-600">
              {formatVND(fee?.totalAmount || session?.pendingOnlinePayment?.totalAmount || 0)}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-1 font-mono">
              <span>Biển số: <strong>{session?.plateNumber || "—"}</strong></span>
              <span>•</span>
              <span>Thẻ: <strong>{session?.cardCode || "—"}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {activeUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(activeUrl, "_blank")}
              className="h-10 w-full border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <ExternalLink className="mr-1.5 size-4 text-emerald-600" /> Mở link PayOS (Dự phòng)
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            onClick={onClose}
            className="h-10 w-full bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
