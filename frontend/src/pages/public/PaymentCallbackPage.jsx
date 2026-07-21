import React, { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PaymentCallbackPage() {
  useEffect(() => {
    // Automatically close the window after a short delay
    const timer = setTimeout(() => {
      window.close();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Determine if success based on URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const cancel = urlParams.get("cancel");
  
  const isSuccess = code === "00" && cancel !== "true";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-500 mb-6">Giao dịch đã được ghi nhận. Cửa sổ này sẽ tự động đóng.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Thanh toán thất bại!</h2>
            <p className="text-slate-500 mb-6">Bạn đã hủy giao dịch hoặc có lỗi xảy ra. Cửa sổ này sẽ tự động đóng.</p>
          </div>
        )}
        <button 
          onClick={() => window.close()}
          className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Đóng cửa sổ ngay
        </button>
      </div>
    </div>
  );
}
