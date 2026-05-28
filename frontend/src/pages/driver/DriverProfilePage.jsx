import React from "react";

export default function DriverProfilePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute -right-20 -top-20 opacity-10">
          <svg width="300" height="300" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-md border-4 border-blue-400">
            👨‍✈️
          </div>
          <div>
            <h2 className="text-3xl font-black mb-1">Nguyễn Văn Khách</h2>
            <p className="text-blue-200 font-bold mb-3">Tài Khoản Khách Hàng</p>
            <div className="flex gap-4 text-sm font-semibold">
              <span className="bg-blue-800/50 px-3 py-1 rounded-full">📞 0987 654 321</span>
              <span className="bg-blue-800/50 px-3 py-1 rounded-full">✉️ khachhang@demo.vn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Danh sách xe */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 uppercase tracking-wide">Xe Của Tôi</h3>
            <button className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
              + Thêm Xe
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="text-3xl">🚗</div>
                <div>
                  <p className="font-black text-slate-800 font-mono text-lg">51A-999.99</p>
                  <p className="text-xs font-bold text-slate-500">Honda Civic - Màu Đen</p>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-1 rounded-md uppercase">
                Vé Tháng Active
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
              <div className="flex items-center gap-4">
                <div className="text-3xl">🏍️</div>
                <div>
                  <p className="font-black text-slate-800 font-mono text-lg">59B-123.45</p>
                  <p className="text-xs font-bold text-slate-500">Air Blade - Đỏ Đen</p>
                </div>
              </div>
              <span className="bg-slate-200 text-slate-600 text-xs font-black px-2 py-1 rounded-md uppercase">
                Vé Lượt
              </span>
            </div>
          </div>
        </div>

        {/* Lịch sử gửi xe gần đây */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-black text-slate-800 uppercase tracking-wide mb-6">Lịch Sử Gần Đây</h3>
          
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* Item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm">
                🚗
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-black text-slate-800 font-mono">51A-999.99</div>
                  <div className="text-xs font-bold text-emerald-500">Hoàn Tất</div>
                </div>
                <div className="text-xs text-slate-500">Hôm nay, 14:30 - 16:45</div>
                <div className="text-sm font-bold text-slate-700 mt-2 border-t pt-2">
                  Phí: <span className="text-blue-600">Vé Tháng</span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-300 text-slate-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm">
                🏍️
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-black text-slate-800 font-mono">59B-123.45</div>
                  <div className="text-xs font-bold text-slate-500">Hôm qua</div>
                </div>
                <div className="text-xs text-slate-500">08:00 - 17:30</div>
                <div className="text-sm font-bold text-slate-700 mt-2 border-t pt-2">
                  Phí: <span className="text-slate-800">5,000đ</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
             <button className="text-sm font-bold text-blue-600 hover:underline">Xem toàn bộ lịch sử</button>
          </div>
        </div>
      </div>
    </div>
  );
}
