import { Info, Clock, CheckCircle2, XCircle } from "lucide-react";

const formatRecentTime = (value) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const statusBadge = (status) => {
  if (status === "COMPLETED") {
    return <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Da su dung</span>;
  }
  if (status === "EXPIRED") {
    return <span className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Het han</span>;
  }
  if (status === "CONFIRMED") {
    return <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Da xac nhan</span>;
  }
  return <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded mr-2 text-[10px]">Dang cho</span>;
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
  isHistoryLoading = false
}) {
  const totalPrice = durationHours * hourlyPrice;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">
          Tom tat dat cho
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Phuong tien</span>
            <span className="font-semibold text-slate-800 text-right">
              {selectedVehicle ? (
                <>
                  <span className="mr-2 uppercase">{selectedVehicle.plateNumber || selectedVehicle.plate}</span>
                  <span className="text-xs text-slate-500">({selectedVehicle.vehicleTypeName})</span>
                </>
              ) : "Chua chon"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thoi gian</span>
            <span className="font-semibold text-slate-800">{durationHours} gio</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Vi tri do</span>
            <span className="font-semibold text-slate-800 text-right">
              {selectedAreaName || "Chua chon"}
              {selectedSlotName && (
                <span className="block text-indigo-600 text-xs font-bold mt-0.5">
                  Slot: {selectedSlotName}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-4 pt-4">
          <div className="flex justify-between items-center mb-2 gap-4">
            <span className="text-slate-500 font-semibold">Gia du kien</span>
            <span className="text-xl font-black text-indigo-600">
              {totalPrice > 0 ? `${totalPrice.toLocaleString()} VND` : "0 VND"}
            </span>
          </div>
          {(!selectedVehicle || !selectedAreaName) && (
            <div className="bg-blue-50 text-blue-600 text-xs font-semibold p-3 rounded-lg text-center">
              Vui long chon day du thong tin de xem chi tiet.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4">Quy dinh dat cho</h3>
        <ul className="space-y-3 text-xs text-slate-600">
          <li className="flex gap-2 items-start">
            <Info className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Ap dung theo khu vuc va loai phuong tien con cho trong he thong.</span>
          </li>
          <li className="flex gap-2 items-start">
            <Clock className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Giu cho toi da <strong className="text-rose-500">10 phut</strong> ke tu khi xac nhan.</span>
          </li>
          <li className="flex gap-2 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Booking da thanh toan se hien trong lich su va dung de quet vao bai.</span>
          </li>
          <li className="flex gap-2 items-start">
            <XCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>Booking da huy khong hien trong lich su cua tai xe.</span>
          </li>
        </ul>
      </div>

      {isHistoryLoading ? (
        <RecentHistorySkeleton />
      ) : recentHistory.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Dat cho gan day</h3>
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
                    {item.areaName || "--"} - Bien so: {item.plateNumber || "--"}
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
