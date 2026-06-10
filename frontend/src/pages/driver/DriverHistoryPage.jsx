import React, { useState, useEffect } from "react";
import { History, Calendar, CreditCard, Layers, Tag, CheckCircle2, XCircle, AlertCircle, Clock } from "lucide-react";
import { bookingService } from "../../services/bookingService";

// Helper for rendering date format
const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function DriverHistoryPage() {
  const [historyList, setHistoryList] = useState([]);

  const [username, setUsername] = useState("driver01");

  useEffect(() => {
    // 1. Get logged in driver details
    const savedUser = sessionStorage.getItem("currentUser");
    let currentUsername = "driver01";
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        currentUsername = parsed.username || "driver01";
        setUsername(currentUsername);
      } catch (e) {
        console.error("Lỗi đọc user", e);
      }
    }

    setHistoryList(bookingService.getHistory(currentUsername));
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử gửi xe trên trình duyệt?")) {
      bookingService.clearHistory(username);
      setHistoryList([]);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Thành Công
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-slate-200">
            <XCircle className="w-3.5 h-3.5" /> Đã Hủy (Không hoàn phí)
          </span>
        );
      case "EXPIRED_CHECKIN":
        return (
          <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5" /> Quá hạn Check-in
          </span>
        );
      case "EXPIRED_TIMEOUT":
        return (
          <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-100">
            <Clock className="w-3.5 h-3.5" /> Hết Hạn Thanh Toán
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Lịch Sử Gửi Xe
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Xem lịch sử chi tiết các phiên đỗ xe và đặt chỗ trước đó của bạn
          </p>
        </div>
        {historyList.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-4.5 py-2 rounded-xl transition-all border border-rose-200 shrink-0 cursor-pointer"
          >
            Xóa Lịch Sử
          </button>
        )}
      </div>

      {/* History List */}
      {historyList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm animate-fadeIn">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⏱️
          </div>
          <p className="text-slate-800 font-bold">Chưa ghi nhận lịch sử gửi xe nào</p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Thực hiện đặt chỗ và hoàn tất phiên gửi xe để hiển thị lịch sử đỗ xe ở đây.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-4.5 px-6">Mã Đặt Chỗ / Loại Xe</th>
                  <th className="py-4.5 px-6">Biển Số Xe</th>
                  <th className="py-4.5 px-6">Khu Vực Gửi Xe</th>
                  <th className="py-4.5 px-6">Thời Gian Gửi Xe (Check-in/out)</th>
                  <th className="py-4.5 px-6 text-right">Phí Đặt Chỗ (Hạn giữ)</th>
                  <th className="py-4.5 px-6 text-right">Phí Gửi Xe (Thời gian đỗ)</th>
                  <th className="py-4.5 px-6 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {historyList.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50/50 transition">
                    {/* ID & Vehicle Type */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-800">{session.id}</span>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">
                          {session.vehicleTypeName}
                        </span>
                      </div>
                    </td>

                    {/* License Plate */}
                    <td className="py-4 px-6">
                      {session.plate ? (
                        <span className="font-mono font-black text-slate-800 border border-slate-800 bg-white px-2 py-0.5 rounded shadow-sm inline-block tracking-wide">
                          {session.plate}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">N/A</span>
                      )}
                    </td>

                    {/* Area Name / Slot Code */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800">
                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="font-extrabold">{session.areaName || `Khu ${session.areaCode}`}</span>
                        </div>
                        {session.slotCode && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            (Nội bộ: {session.slotCode})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date Time Check-in/out */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-[10px] font-bold text-slate-400 uppercase w-7">Vào:</span>
                        <span className="text-slate-700 font-bold">{formatDateTime(session.checkInTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="text-[10px] font-bold text-slate-400 uppercase w-7">Ra:</span>
                        <span className="text-slate-700 font-bold">{formatDateTime(session.checkOutTime)}</span>
                      </div>
                    </td>

                    {/* Reservation Fee (Hạn giữ) */}
                    <td className="py-4 px-6 text-right">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 block">{session.hours} giờ giữ</span>
                        <span className="font-black text-amber-600">
                          {((session.reservationFee !== undefined ? session.reservationFee : session.fee) || 0).toLocaleString()} VND
                        </span>
                      </div>
                    </td>

                    {/* Actual Parking Fee (Thời gian đỗ) */}
                    <td className="py-4 px-6 text-right">
                      {session.status === "COMPLETED" ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-700 block">{(session.actualHours || 0)} giờ đỗ</span>
                          <span className="font-black text-indigo-600">
                            {((session.actualParkingFee || 0)).toLocaleString()} VND
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Không đỗ xe</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(session.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4.5 text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>Biển số xe được ghi nhận trực tiếp thông qua hệ thống cảm biến check-in/out của từng phiên gửi xe của tài xế.</span>
          </div>
        </div>
      )}
    </div>
  );
}
