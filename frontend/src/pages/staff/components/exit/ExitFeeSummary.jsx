import React from "react";
import { ReceiptText, AlertTriangle } from "lucide-react";
import { formatVND } from "@/lib/format";

import { formatDateTime } from "@/lib/format";

export default function ExitFeeSummary({ fee, session }) {
  const lastPaid = session?.lastPaidPayment;
  const isPaid = session?.paymentStatus === "PAID";
  
  const paidAmount = lastPaid ? Number(lastPaid.totalAmount || 0) : 0;
  const totalAmount = fee ? Number(fee.totalAmount || 0) : 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  
  const isBufferExpired = lastPaid?.method === "BANK_TRANSFER" 
    && lastPaid?.paymentValidUntil 
    && new Date() > new Date(lastPaid.paymentValidUntil);

  const remainingToCollect = isPaid 
    ? (isBufferExpired ? remainingAmount : 0)
    : totalAmount;

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
                <div className="flex justify-between items-center text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                  <span className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    Phí phạt mất thẻ
                  </span>
                  <span className="font-bold">{formatVND(fee.lostCardFee)}</span>
                </div>
              )}

              {/* Payment history & Buffer Alert */}
              {isPaid && lastPaid && (
                <div className="mt-4 pt-3 border-t border-dashed space-y-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700 font-medium">Đã thanh toán trước đó (Online)</span>
                    <span className="font-bold text-emerald-700">-{formatVND(paidAmount)}</span>
                  </div>
                  
                  {lastPaid.paymentValidUntil && (
                    <div className={`p-2 rounded-lg border text-xs ${
                      isBufferExpired 
                        ? "bg-rose-50 text-rose-700 border-rose-100" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {isBufferExpired ? "Quá hạn đệm ra xe" : "Còn trong hạn đệm ra xe"}
                      </div>
                      <div className="mt-0.5 opacity-90">
                        Hạn đệm: {formatDateTime(lastPaid.paymentValidUntil)}
                      </div>
                      {isBufferExpired && (
                        <div className="mt-1 font-semibold text-[11px] text-rose-800 bg-rose-100/60 px-1.5 py-0.5 rounded inline-block">
                          Cần thu thêm phần chênh lệch
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t mt-auto">
              <div className={`flex justify-between items-end p-4 rounded-xl border ${
                remainingToCollect > 0 
                  ? "bg-indigo-50 border-indigo-100" 
                  : "bg-emerald-50 border-emerald-100"
              }`}>
                <div>
                  <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${
                    remainingToCollect > 0 ? "text-indigo-600" : "text-emerald-700"
                  }`}>
                    {remainingToCollect > 0 ? "Số tiền cần thu thêm" : "Đủ điều kiện xuất bãi"}
                  </p>
                  <p className={`text-[10px] ${
                    remainingToCollect > 0 ? "text-indigo-400" : "text-emerald-500"
                  }`}>
                    {remainingToCollect > 0 ? "Đã bao gồm VAT" : "Không phát sinh thêm phí"}
                  </p>
                </div>
                <div className={`text-2xl font-black tracking-tight ${
                  remainingToCollect > 0 ? "text-indigo-700" : "text-emerald-700"
                }`}>
                  {formatVND(remainingToCollect)}
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
