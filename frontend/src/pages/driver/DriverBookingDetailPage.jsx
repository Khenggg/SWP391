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

  const [timeLeft, setTimeLeft] = useState(0);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [selectedExtensionMins, setSelectedExtensionMins] = useState(60);
  const [isExtending, setIsExtending] = useState(false);
  const [extensionPayment, setExtensionPayment] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

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

  useEffect(() => {
    if (!reservation || reservation.status !== "CONFIRMED" || !reservation.reservationEndTime) return;

    const calculateTimeLeft = () => {
      const diff = Math.max(0, Math.floor((new Date(reservation.reservationEndTime).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  const handleCopyCode = () => {
    if (reservation?.reservationCode) {
      navigator.clipboard.writeText(reservation.reservationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmExtension = async () => {
    setIsExtending(true);
    try {
      const res = await reservationService.extendReservation(reservation.id, selectedExtensionMins);
      if (res.payment) {
        setExtensionPayment(res.payment);
      } else {
        alert("Gia hạn giữ chỗ thành công!");
        setIsExtendOpen(false);
        const updated = await reservationService.getReservationById(id);
        setReservation(updated);
      }
    } catch (err) {
      alert(err.message || "Gia hạn giữ chỗ thất bại");
    } finally {
      setIsExtending(false);
    }
  };

  const handleCheckExtensionPayment = async () => {
    setCheckingPayment(true);
    try {
      await reservationService.payReservation(reservation.id);
      alert("Gia hạn giữ chỗ thành công!");
      setIsExtendOpen(false);
      setExtensionPayment(null);
      const updated = await reservationService.getReservationById(id);
      setReservation(updated);
    } catch (err) {
      alert(err.message || "Chưa ghi nhận thanh toán. Vui lòng thử lại sau khi chuyển khoản.");
    } finally {
      setCheckingPayment(false);
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
  const isConfirmed = reservation.status === "CONFIRMED";
  const hourlyPrice = reservation.vehicleTypeId === 5 ? 20000 : 5000;

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

      {/* Expiry Warning Banner (Less than 15 minutes) */}
      {isConfirmed && timeLeft > 0 && timeLeft <= 900 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 animate-pulse">
          <BadgeAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-black uppercase tracking-wider">Cảnh báo sắp hết hạn giữ chỗ!</p>
            <p className="font-semibold leading-relaxed">
              Vé đặt chỗ của bạn sẽ hết hiệu lực giữ chỗ sau{" "}
              <span className="font-black text-rose-600 text-sm">
                {Math.floor(timeLeft / 60)} phút {timeLeft % 60} giây
              </span>{" "}
              nữa. Hãy nhanh chóng di chuyển vào bãi hoặc bấm nút gia hạn dưới đây.
            </p>
          </div>
        </div>
      )}

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

      {/* Extend Reservation Action Section */}
      {isConfirmed && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Gia hạn giữ chỗ</span>
          </div>
          <p className="text-slate-500 text-xs font-semibold leading-normal">
            Nếu chưa kịp đỗ xe, bạn có thể gia hạn khi vé còn hiệu lực. Vé đã quá hạn sẽ bị hủy tự động.
          </p>
          <Button
            onClick={() => {
              setSelectedExtensionMins(60);
              setExtensionPayment(null);
              setIsExtendOpen(true);
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
          >
            Gia Hạn Giữ Chỗ
          </Button>
        </div>
      )}

      {/* Helper Actions for Mobile */}
      <div className="text-center">
        <p className="text-[11px] text-slate-400 font-medium">
          Bạn có thể chụp ảnh màn hình trang này để xuất trình nhanh chóng mà không cần kết nối Internet khi đến bãi xe.
        </p>
      </div>

      {/* Extend Dialog Modal */}
      {isExtendOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> Gia hạn giữ chỗ
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Chọn thời gian bạn muốn giữ thêm ô đỗ xe của mình.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedExtensionMins(mins)}
                  className={`py-3 px-2 rounded-xl text-xs font-black transition-all border ${
                    selectedExtensionMins === mins
                      ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {mins < 60 ? `${mins} phút` : `${mins / 60} giờ`}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-500">
                <span>Đơn giá giữ chỗ:</span>
                <span>{hourlyPrice.toLocaleString()} VND/giờ</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-500">
                <span>Thời gian gia hạn:</span>
                <span className="font-bold text-slate-700">+{selectedExtensionMins} phút</span>
              </div>
              <div className="flex justify-between font-black text-slate-800 text-sm border-t border-slate-200 pt-2">
                <span>Phí gia hạn ước tính:</span>
                <span className="text-amber-600">{((hourlyPrice * selectedExtensionMins) / 60).toLocaleString()} VND</span>
              </div>
            </div>

            {extensionPayment ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-800 font-semibold space-y-1">
                  <p className="font-bold uppercase text-amber-900">Yêu cầu thanh toán gia hạn</p>
                  <p>Vui lòng chuyển khoản qua mã QR PayOS bên dưới để hoàn tất giao dịch.</p>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <img
                    src={`https://quickchart.io/qr?text=${encodeURIComponent(extensionPayment.checkoutUrl || "")}&size=180`}
                    alt="Payment QR"
                    className="w-36 h-36 object-contain"
                  />
                  <a
                    href={extensionPayment.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-black underline flex items-center gap-1"
                  >
                    Mở link thanh toán PayOS →
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setExtensionPayment(null)}
                    className="w-full font-bold text-xs py-2 rounded-xl"
                  >
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleCheckExtensionPayment}
                    disabled={checkingPayment}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold text-xs py-2 rounded-xl text-white"
                  >
                    {checkingPayment ? "Đang kiểm tra..." : "Xác nhận đã chuyển ✓"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsExtendOpen(false)}
                  className="w-full font-bold text-xs py-2 rounded-xl"
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleConfirmExtension}
                  disabled={isExtending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold text-xs py-2 rounded-xl text-white"
                >
                  {isExtending ? "Đang xử lý..." : "Xác nhận gia hạn"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
