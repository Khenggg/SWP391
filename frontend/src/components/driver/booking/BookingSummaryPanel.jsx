import { Info, Clock, CheckCircle2, XCircle } from "lucide-react";

const formatRecentTime = (value) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const statusBadge = (status) => {
  if (status === "COMPLETED") {
    return <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Đã sử dụng</span>;
  }
  if (status === "EXPIRED") {
    return <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Hết hạn</span>;
  }
  if (status === "CONFIRMED") {
    return <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Đã xác nhận</span>;
  }
  return <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Đang chờ</span>;
};

const RecentHistorySkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-pulse">
    <div className="h-4 w-36 bg-slate-200 rounded mb-5" />
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-2 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
          <div className="h-3 w-40 bg-slate-200 rounded" />
          <div className="h-3 w-52 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default function BookingSummaryPanel({
  selectedVehicle,
  durationHours,
  selectedAreaName,
  selectedSlotName,
  hourlyPrice = 20000,
  recentHistory = [],
  isHistoryLoading = false,
  activeReservation = null,
  vehicleTypes = []
}) {
  const activeVehicleTypeName = activeReservation?.vehicleTypeName
    || vehicleTypes.find((item) => String(item.vehicleTypeId) === String(activeReservation?.vehicleTypeId))?.vehicleTypeName;
  const displayVehicle = activeReservation
    ? { vehicleTypeName: activeVehicleTypeName }
    : selectedVehicle;
    
  const displayAreaName = activeReservation?.areaName || selectedAreaName;
  const displaySlotName = activeReservation?.slotName || selectedSlotName;
  const displayPrice = activeReservation?.bookingAmount ?? (durationHours ? (durationHours * hourlyPrice) : 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
          Tóm tắt đặt chỗ
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Phương tiện</span>
            <span className="font-semibold text-slate-800 text-right">
              {displayVehicle ? (
                <>
                  <span className="block uppercase">{displayVehicle.vehicleTypeName || "Không xác định"}</span>
                  <span className="block text-xs font-medium text-slate-500">Biển số xác nhận tại cổng</span>
                </>
              ) : "Chưa chọn"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thời gian</span>
            <span className="font-semibold text-slate-800">
              {activeReservation ? `${activeReservation.durationHours || 3} giờ` : (durationHours ? `${durationHours} giờ` : "Chưa chọn")}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Vị trí đỗ</span>
            <span className="font-semibold text-slate-800 text-right">
              {displayAreaName || "Chưa chọn"}
              {displaySlotName && (
                <span className="block text-indigo-600 text-xs font-bold mt-0.5">
                  Slot: {displaySlotName}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4">
          <div className="flex justify-between items-center mb-2 gap-4">
            <span className="text-slate-500 font-semibold">Giá dự kiến</span>
            <span className="text-xl font-black text-indigo-600">
              {displayPrice > 0 ? `${displayPrice.toLocaleString()} VND` : "0 VND"}
            </span>
          </div>
          {(!displayVehicle || !displayAreaName) && (
            <div className="bg-blue-50 text-blue-600 text-xs font-semibold p-3 rounded-lg text-center">
              Vui lòng chọn đầy đủ thông tin để xem chi tiết.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Quy định đặt chỗ</h3>
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex gap-2 items-start">
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Áp dụng theo khu vực và loại phương tiện còn chỗ trống trên hệ thống.</span>
          </li>
          <li className="flex gap-2 items-start">
            <Clock className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Giữ chỗ tối đa <strong className="text-rose-500">10 phút</strong> kể từ khi xác nhận.</span>
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Booking đã thanh toán sẽ hiện trong lịch sử và dùng để quét vào bãi.</span>
          </li>
          <li className="flex gap-2 items-start">
            <XCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Booking đã hủy không hiện trong lịch sử của tài xế.</span>
          </li>
        </ul>
      </div>

      {isHistoryLoading ? (
        <RecentHistorySkeleton />
      ) : recentHistory.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Đặt chỗ gần đây</h3>
          </div>

          <div className="space-y-4">
            {recentHistory.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                <div className="space-y-1">
                  <div>
                    {statusBadge(item.status)}
                    <span className="text-slate-500">
                      {formatRecentTime(item.reservationStartTime || item.createdAt)}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    {item.areaName || "--"} - {item.vehicleTypeName || `Loại xe #${item.vehicleTypeId}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
