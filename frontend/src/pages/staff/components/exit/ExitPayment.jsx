import { Check, QrCode, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExitPayment({
  session,
  fee,
  canExit,
  isLoading,
  handlePayCash,
  handlePayOS,
  handleCompleteExitPaid,
  handleCompleteMonthlyExit,
  refreshSession,
}) {
  const isMonthly = session?.customerType === "MONTHLY";
  const isPaid = session?.paymentStatus === "PAID";

  return (
    <section className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-4 mt-auto shrink-0 flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">5</span>
        <h3 className="font-bold text-slate-800 text-sm">Thanh toán & Xác nhận</h3>
      </div>

      {!session ? (
        <div className="flex justify-center items-center py-6 text-slate-400 text-sm font-medium">
          Vui lòng quét thẻ để tiếp tục
        </div>
      ) : (
        <>
          {!isMonthly && !isPaid && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handlePayCash}
                  disabled={!canExit || isLoading || !fee}
                  className="h-12 border-2 border-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Tiền mặt
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePayOS}
                  disabled={!canExit || isLoading || !fee}
                  className="h-12 border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Chuyển khoản (QR)
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={refreshSession}
                disabled={isLoading}
                className="h-8 text-slate-500 hover:text-slate-800 text-xs self-end"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới trạng thái thanh toán
              </Button>
            </div>
          )}

          {!isMonthly && isPaid && (
            <Button
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200"
              onClick={handleCompleteExitPaid}
              disabled={!canExit || isLoading}
            >
              Xác nhận xe ra (Đã thu tiền)
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          {isMonthly && (
            <Button
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-200"
              onClick={handleCompleteMonthlyExit}
              disabled={!canExit || isLoading}
            >
              Xác nhận xe ra (Vé tháng)
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </>
      )}
    </section>
  );
}
