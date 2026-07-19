import React from "react";
import { ReceiptText, AlertTriangle } from "lucide-react";
import { formatVND } from "@/lib/format";

export default function ExitFeeSummary({ fee }) {
  return (
    <section className="h-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
      <div className="p-3 border-b flex items-center gap-2 bg-white shrink-0">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">3</span>
        <h3 className="font-bold text-slate-800 text-sm">Tóm tắt phí</h3>
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
        {fee ? (
          <>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600 pb-2 border-b">
                <span>Khoản thu</span>
                <span>Thành tiền</span>
              </div>
              
              {fee.breakdown?.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">
                    Phí đỗ xe ({item.timeFrame}) x {item.blocks} block
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Đơn giá: {formatVND(item.unitPrice)}
                    </div>
                  </span>
                  <span className="font-bold text-slate-800">{formatVND(item.amount)}</span>
                </div>
              ))}

              {fee.lostCardFee > 0 && (
                <div className="flex justify-between items-center text-sm text-red-600">
                  <span>Phụ thu mất thẻ</span>
                  <span className="font-bold">{formatVND(fee.lostCardFee)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t mt-auto">
              <div className="flex justify-between items-end bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div>
                  <p className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">Tổng cộng</p>
                  <p className="text-[10px] text-indigo-400">Đã bao gồm VAT</p>
                </div>
                <div className="text-2xl font-black text-indigo-700 tracking-tight">
                  {formatVND(fee.totalAmount)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
            <ReceiptText className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có thông tin phí</p>
          </div>
        )}
      </div>
    </section>
  );
}
