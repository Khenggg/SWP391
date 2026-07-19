import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ScanLine, Copy, Check, Layers, Clock, Tag, Calendar, BadgeAlert, AlertCircle } from "lucide-react";
import { reservationService } from "../../services/reservationService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const getVehicleTypeLabel = (vehicleTypeId) => {
  if (vehicleTypeId === 5) return "Ô TÔ";
  if (vehicleTypeId === 7) return "XE VẬN CHUYỂN";
  return "XE MÁY";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
          ✓ Thành Công
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1">
          ✕ Đã Hủy
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="outline" className="bg-rose-50 text-rose-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-rose-100 flex items-center gap-1">
          ⚠ Hết Hạn
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
          ⏱ Chờ Thanh Toán
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
          ✓ Đã Xác Nhận
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {status || "--"}
        </Badge>
      );
  }
};

export default function DriverBookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await reservationService.getReservationById(id);
        setReservation(res);
      } catch (err) {
        console.error("Lỗi lấy chi tiết đặt chỗ:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleCopyCode = () => {
    if (reservation?.reservationCode) {
      navigator.clipboard.writeText(reservation.reservationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-slate-500 font-semibold text-sm">Đang tải thông tin vé...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-6">
        <div className="bg-red-50 text-red-600 rounded-full h-16 w-16 flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Không tìm thấy vé đặt chỗ</h3>
          <p className="text-slate-500 text-sm font-medium">
            Có thể vé đã hết hạn hoặc không thuộc quyền sở hữu của bạn.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/driver/history")} className="font-bold flex items-center gap-1.5 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </Button>
      </div>
    );
  }

  const checkInQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(reservation.reservationCode)}&size=240`;

  return (
    <div className="max-w-md mx-auto py-6 px-4 space-y-6 animate-fadeIn">
      {/* Header & Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/driver/history")}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lịch sử đặt chỗ</span>
        </button>
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chi Tiết Vé</span>
      </div>

      {/* Ticket Wrapper */}
      <Card className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden relative">
        
        {/* Top Header Section of Ticket */}
        <div className="bg-indigo-600 text-white p-6 text-center space-y-2 relative">
          <p className="text-[10px] font-black tracking-widest text-indigo-200 uppercase">
            PARKING BUILDING PASS
          </p>
          <h2 className="text-xl font-black tracking-tight">VÉ ĐẶT CHỖ BÃI XE</h2>
          <div className="flex justify-center pt-1">
            {getStatusBadge(reservation.status)}
          </div>
        </div>

        {/* Ticket Information Section */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-y-4 gap-x-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Biển số xe</p>
              <p className="font-black text-slate-800 text-sm tracking-wide bg-slate-100 inline-block px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                {reservation.plateNumber}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Loại phương tiện</p>
              <p className="font-extrabold text-slate-700 text-sm pt-1 uppercase">
                {getVehicleTypeLabel(reservation.vehicleTypeId)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Khu vực đỗ</p>
              <p className="font-extrabold text-indigo-600 text-sm flex items-center gap-1 pt-0.5">
                <Layers className="w-3.5 h-3.5" />
                {reservation.areaName || "Khu vực đã chọn"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mã số Slot</p>
              <p className="font-extrabold text-slate-700 text-sm pt-0.5">
                {reservation.slotName ? (
                  <span className="bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded">
                    {reservation.slotName}
                  </span>
                ) : (
                  "--"
                )}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <Calendar className="w-3.5 h-3.5" />
                <span>THỜI GIAN ĐẶT:</span>
              </div>
              <span className="font-extrabold text-slate-700">
                {formatDateTime(reservation.createdAt || reservation.reservationStartTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>THỜI GIAN HẾT HẠN:</span>
              </div>
              <span className="font-extrabold text-rose-600">
                {formatDateTime(reservation.reservationEndTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                <Tag className="w-3.5 h-3.5" />
                <span>PHÍ ĐẶT CHỖ:</span>
              </div>
              <span className="font-black text-amber-600 text-sm">
                {(reservation.bookingAmount || reservation.totalAmount || 0).toLocaleString()} VND
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold">THANH TOÁN:</span>
              <Badge className={`font-black text-[10px] py-0.5 px-2.5 rounded-full ${
                reservation.paymentStatus === "PAID" 
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                  : "bg-amber-100 text-amber-800 border-amber-200"
              }`}>
                {reservation.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Ticket Dotted Divider with Left/Right Circle Cutouts */}
        <div className="relative my-2">
          {/* Left Cutout */}
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200 z-20"></div>
          {/* Right Cutout */}
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200 z-20"></div>
          {/* Dotted Line */}
          <div className="border-t border-dashed border-slate-200 mx-4"></div>
        </div>

        {/* Bottom QR Section of Ticket */}
        <div className="p-6 pt-3 flex flex-col items-center justify-center space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            QUÉT TẠI CỔNG ĐỂ CHECK-IN
          </p>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 transition duration-300 hover:scale-102 flex flex-col items-center">
            <img src={checkInQrUrl} alt="Check-in QR Code" className="w-48 h-48 object-contain" />
            
            {/* Copyable Reservation Code */}
            <div 
              onClick={handleCopyCode} 
              className="flex items-center gap-1.5 mt-3 px-3 py-1 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition active:scale-95"
              title="Copy mã đặt chỗ"
            >
              <span className="font-mono font-black text-slate-700 text-sm">
                {reservation.reservationCode}
              </span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold text-center leading-normal px-4">
            * Vé này chỉ có hiệu lực trước khi hết thời gian giữ chỗ. Vui lòng căn giờ di chuyển hợp lý.
          </p>
        </div>
      </Card>

      {/* Helper Actions for Mobile */}
      <div className="text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Bạn có thể chụp ảnh màn hình trang này để xuất trình nhanh chóng mà không cần kết nối Internet khi đến bãi xe.
        </p>
      </div>
    </div>
  );
}
