import React from "react";
import { Check, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExitPayment({
  session,
  fee,
  canExit,
  isLoading,
  handlePayCash,
  handlePayOS,
  handleCompleteMonthlyExit,
}) {
  const isMonthly = session?.customerType === "MONTHLY";

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
          {!isMonthly && (
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
