import React from "react";

export default function StaffEntryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Cho Xe Vào (Entry)</h2>
          <p className="text-sm text-slate-500 mt-0.5">Quét thẻ và ghi nhận thông tin xe vào bãi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera / Biển số */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-lg border-4 border-slate-800">
            <p className="text-slate-500 font-mono text-sm tracking-widest">[ CAMERA FEED STREAM ]</p>
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-red-500">REC</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-black text-slate-400 uppercase mb-2">Ảnh Biển Số</p>
              <div className="h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                <span className="text-slate-400 text-sm">Chưa có ảnh</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
              <p className="text-xs font-black text-slate-400 uppercase mb-2">Biển Số Nhận Diện</p>
              <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-3xl font-black text-slate-800 font-mono">-- --</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form nhập liệu */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
          <h3 className="font-black text-slate-800 mb-6 border-b pb-4">Thông Tin Phiên Gửi</h3>
          
          <div className="space-y-5 flex-grow">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mã Thẻ (Quét NFC)</label>
              <input type="text" placeholder="Chờ quét thẻ..." disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono font-bold text-blue-600 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Biển Số Xe</label>
              <input type="text" placeholder="Nhập thủ công nếu AI sai..." className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Loại Xe (Tự động/Chỉnh tay)</label>
              <select className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option>Xe Máy</option>
                <option>Ô Tô</option>
                <option>Xe Đạp</option>
              </select>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs font-black text-emerald-600 uppercase mb-1">Gợi Ý Chỗ Đỗ</p>
              <p className="text-2xl font-black text-emerald-700 font-mono">TẦNG 1 - KHU A</p>
              <p className="text-xs text-emerald-600 mt-1">Còn 25 slot trống</p>
            </div>
          </div>

          <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-colors">
            XÁC NHẬN VÀO BÃI (ENTER)
          </button>
        </div>
      </div>
    </div>
  );
}
