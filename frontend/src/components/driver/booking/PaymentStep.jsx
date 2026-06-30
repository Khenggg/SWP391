import React, { useState, useEffect } from "react";
import { CheckCircle2, Copy, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservationService } from "../../../services/reservationService";

export default function PaymentStep({ activeReservation, onPaymentComplete, onCancel }) {
  const [isPaid, setIsPaid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const amount = activeReservation?.bookingAmount || 10000;
  
  // Tạo mã QR trỏ thẳng tới link thanh toán của PayOS
  // Khi quét mã bằng điện thoại, điện thoại sẽ tự mở trang thanh toán PayOS để tài xế chuyển khoản.
  const payOsQrUrl = activeReservation?.checkoutUrl 
    ? `https://quickchart.io/qr?text=${encodeURIComponent(activeReservation.checkoutUrl)}&size=220` 
    : "";

  // 1. Tự động kiểm tra trạng thái thanh toán (Poll) mỗi 3 giây
  useEffect(() => {
    if (!activeReservation || isPaid) return;

    const intervalId = setInterval(async () => {
      try {
        const latest = await reservationService.getActiveReservation().catch(() => null);
        if (latest && (latest.status === "CONFIRMED" || latest.paymentStatus === "PAID")) {
          clearInterval(intervalId);
          setIsPaid(true);
          setTimeout(() => {
            onPaymentComplete();
          }, 1500);
        }
      } catch (e) {
        console.error("Lỗi tự động kiểm tra thanh toán:", e);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [activeReservation, isPaid, onPaymentComplete]);

  // 2. Nút bấm kiểm tra thủ công
  const handleCheckPaymentStatus = async () => {
    setErrorMessage("");
    try {
      if (activeReservation) {
        await reservationService.payReservation(activeReservation.id);
        setIsPaid(true);
        setTimeout(() => {
          onPaymentComplete();
        }, 1500);
      }
    } catch (e) {
      setErrorMessage(e.message || "Giao dịch chưa được thanh toán trên PayOS. Vui lòng thanh toán trước.");
    }
  };

  if (isPaid) {
    return (
      <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 animate-bounce" />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-2">Thanh toán thành công!</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Hệ thống đã nhận được tiền đặt chỗ. Đang tạo mã QR check-in...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto py-2">
      <div className="text-center">
        <h3 className="text-xl font-black text-slate-800 mb-1">Thanh toán giữ chỗ</h3>
        <p className="text-sm text-slate-500">
          Hãy quét mã QR bằng máy ảnh điện thoại hoặc nhấn vào nút bên dưới để thực hiện thanh toán trên cổng PayOS.
        </p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-200 text-center relative overflow-hidden group">
        {payOsQrUrl ? (
          <div className="space-y-4">
            <div className="bg-white p-3 rounded-xl shadow-sm inline-block border border-slate-100 relative z-10">
              <img 
                src={payOsQrUrl} 
                alt="PayOS QR" 
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>
            <div>
              <a 
                href={activeReservation.checkoutUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all text-xs animate-pulse"
              >
                Mở link thanh toán PayOS <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-8">Đang tải link thanh toán...</p>
        )}
        
        <div className="space-y-3 relative z-10 border-t border-slate-200/60 mt-4 pt-4">
          <div className="flex justify-between items-center text-xs px-4">
            <span className="text-slate-500">Số tiền đặt cọc:</span>
            <span className="font-black text-indigo-600 text-base">{amount.toLocaleString("vi-VN")}đ</span>
          </div>
          <div className="flex justify-between items-center text-xs px-4">
            <span className="text-slate-500">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-2 font-semibold text-slate-700">
              {activeReservation?.reservationCode || "SWP391"}
              <Copy className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => {
                navigator.clipboard.writeText(activeReservation?.reservationCode || "");
                alert("Đã sao chép mã đặt chỗ");
              }} />
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in duration-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Thông báo tự động kiểm tra */}
      <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-semibold py-1">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Hệ thống đang tự động kiểm tra giao dịch của bạn...</span>
      </div>

      <div className="flex flex-col gap-2">
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-11 text-sm shadow-md"
          onClick={handleCheckPaymentStatus}
        >
          Tôi đã chuyển tiền (Kiểm tra thủ công)
        </Button>
        <Button 
          variant="outline" 
          className="w-full text-slate-500 hover:text-rose-600 border-slate-200 h-11 text-sm"
          onClick={onCancel}
        >
          Hủy lượt đặt chỗ
        </Button>
      </div>
    </div>
  );
}
