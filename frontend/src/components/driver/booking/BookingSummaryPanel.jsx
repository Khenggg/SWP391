import { Info, Clock, CheckCircle2, XCircle } from "lucide-react";

export default function BookingSummaryPanel({ 
  selectedVehicle, 
  durationHours, 
  selectedAreaName,
  selectedSlotName, 
  hourlyPrice = 20000, 
  recentHistory = [] 
}) {
  const totalPrice = durationHours * hourlyPrice;

  return (
    <div className="space-y-6">
      {/* Tóm tắt đặt chỗ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
          Tóm tắt đặt chỗ
        </h3>
        
        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Phương tiện</span>
            <span className="font-semibold text-slate-800">
              {selectedVehicle ? (
                <>
                  <span className="mr-2 uppercase">{selectedVehicle.plateNumber || selectedVehicle.plate}</span>
                  <span className="text-xs text-slate-500">({selectedVehicle.vehicleTypeName})</span>
                </>
              ) : "Chưa chọn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thời gian</span>
            <span className="font-semibold text-slate-800">{durationHours} Giờ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vị trí đỗ</span>
            <span className="font-semibold text-slate-800 text-right">
              {selectedAreaName || "Chưa chọn"}
              {selectedSlotName && (
                <span className="block text-indigo-600 text-xs font-bold mt-0.5">
                  Slot: {selectedSlotName}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 font-semibold">Giá (dự kiến)</span>
            <span className="text-xl font-black text-indigo-600">
              {totalPrice > 0 ? `${totalPrice.toLocaleString()} ₫` : "0 ₫"}
            </span>
          </div>
          {(!selectedVehicle || !selectedAreaName) && (
            <div className="bg-blue-50 text-blue-600 text-xs font-semibold p-3 rounded-lg text-center">
              Vui lòng chọn đầy đủ thông tin để xem chi tiết.
            </div>
          )}
        </div>
      </div>

      {/* Quy định đặt chỗ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Quy định đặt chỗ</h3>
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex gap-2 items-start">
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Chỉ áp dụng cho ô tô tại tầng B2 (hoặc xe máy khu vực quy định).</span>
          </li>
          <li className="flex gap-2 items-start">
            <Clock className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Giữ chỗ tối đa <strong className="text-rose-500">10 phút</strong> kể từ khi xác nhận.</span>
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Hết thời gian giữ chỗ, hệ thống tự động hủy.</span>
          </li>
          <li className="flex gap-2 items-start">
            <XCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Có thể hủy miễn phí trước khi hết thời gian giữ chỗ.</span>
          </li>
        </ul>
      </div>

      {/* Đặt chỗ gần đây */}
      {recentHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Đặt chỗ gần đây</h3>
          </div>
          
          <div className="space-y-4">
            {recentHistory.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                <div className="space-y-1">
                  <div>
                    {item.status === "COMPLETED" && <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Đã sử dụng</span>}
                    {item.status === "CANCELLED" && <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Đã hủy</span>}
                    {item.status === "EXPIRED" && <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Hết hạn</span>}
                    <span className="text-slate-500">
                      {(() => {
                        const d = new Date(item.reservationStartTime);
                        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} • ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                      })()}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    {item.areaName} • Biển số: {item.plateNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
