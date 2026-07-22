import { ArrowRight, Camera, Check, ExternalLink, Lock, QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExitPayment({ session, fee, canExit, isZeroCharge, hasPendingOnlinePayment, payosPaymentUrl, isLoading, handleRequestCash, handlePayOS, handleCompleteExitPaid, handleCompleteMonthlyExit, refreshSession, mismatchBlocked, mismatchStatus, hasExitImages }) {
  const isMonthly = session?.customerType === "MONTHLY";
  const isPaid = session?.paymentStatus === "PAID";
  const isWaitingOnline = Boolean(hasPendingOnlinePayment && !isPaid);
  const blockedMessage = mismatchStatus === "REJECTED" ? "Yêu cầu bị từ chối. Nhân viên cần gửi lại yêu cầu." : "Đang chờ Manager xử lý lệch biển số.";

  const handleOpenPaymentUrl = () => {
    const targetUrl = payosPaymentUrl || session?.pendingOnlinePayment?.paymentUrl || session?.pendingOnlinePayment?.checkoutUrl;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    } else {
      void handlePayOS();
    }
  };

  return (
    <section className="mt-auto flex shrink-0 flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">6</span><h3 className="text-sm font-bold text-slate-800">Thanh toán và xác nhận</h3></div>
      {!session ? <div className="flex items-center justify-center py-6 text-sm font-medium text-slate-400">Nhập thẻ hoặc biển số để tiếp tục</div> : mismatchBlocked ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center"><Lock className="size-8 text-slate-400" /><p className="text-sm font-bold text-slate-600">Thanh toán và ra xe bị tạm khóa</p><p className="text-xs text-slate-500">{blockedMessage}</p><Button variant="ghost" onClick={refreshSession} disabled={isLoading} className="mt-1 h-8 text-xs text-slate-500 hover:text-slate-800"><RefreshCw className={`mr-1 size-3.5 ${isLoading ? "animate-spin" : ""}`} />Làm mới trạng thái</Button></div>
      ) : <>
        {!hasExitImages && <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3"><Camera className="mt-0.5 size-4 shrink-0 text-amber-600" /><div><p className="text-xs font-bold text-amber-900">Thiếu ảnh xe ra</p><p className="mt-0.5 text-[10px] text-amber-700">Tải cả ảnh biển số và ảnh toàn xe trước khi xác nhận xe ra.</p></div></div>}
        {!isMonthly && isZeroCharge && <Button className="h-14 w-full bg-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" onClick={handleCompleteExitPaid} disabled={!canExit || isLoading}>Xác nhận xe ra (Không phát sinh phí)<ArrowRight className="ml-2 size-5" /></Button>}
        {!isMonthly && !isPaid && !isZeroCharge && (
          <div className="flex flex-col gap-3">
            {isWaitingOnline ? (
              <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-sm font-bold text-amber-800">Đang chờ PayOS xác minh thanh toán</p>
                <p className="text-xs text-amber-700">Xe chỉ được ra sau khi webhook cập nhật trạng thái PAID.</p>
                <div className="mt-1.5 flex flex-col gap-2">
                  <Button 
                    type="button"
                    onClick={handleOpenPaymentUrl} 
                    className="h-10 w-full bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    <ExternalLink className="mr-1.5 size-4" /> Mở lại trang / QR thanh toán PayOS
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleRequestCash}
                    className="h-9 w-full border-amber-300 bg-white text-xs font-bold text-slate-700 hover:bg-amber-100"
                  >
                    <Check className="mr-1.5 size-3.5 text-indigo-600" /> Chuyển sang thu Tiền mặt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleRequestCash} disabled={isLoading || !fee} className="h-12 border-2 border-indigo-600 bg-indigo-50 font-bold text-indigo-700 hover:bg-indigo-100"><Check className="mr-2 size-5" />Tiền mặt</Button>
                <Button variant="outline" onClick={handlePayOS} disabled={isLoading || !fee} className="h-12 border-2 border-emerald-600 bg-emerald-50 font-bold text-emerald-700 hover:bg-emerald-100"><QrCode className="mr-2 size-5" />Chuyển khoản (QR)</Button>
              </div>
            )}
            <Button variant="ghost" onClick={refreshSession} disabled={isLoading} className="h-8 self-end text-xs text-slate-500 hover:text-slate-800"><RefreshCw className={`mr-1 size-3.5 ${isLoading ? "animate-spin" : ""}`} />Làm mới trạng thái thanh toán</Button>
          </div>
        )}
        {!isMonthly && isPaid && <Button className="h-14 w-full bg-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" onClick={handleCompleteExitPaid} disabled={!canExit || isLoading}>Xác nhận xe ra (Đã thu tiền)<ArrowRight className="ml-2 size-5" /></Button>}
        {isMonthly && <Button className="h-14 w-full bg-emerald-600 text-lg font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" onClick={handleCompleteMonthlyExit} disabled={!canExit || isLoading}>Xác nhận xe ra (Vé tháng)<ArrowRight className="ml-2 size-5" /></Button>}
      </>}
    </section>
  );
}
