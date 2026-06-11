import React, { useState, useEffect } from "react";
import { bookingService } from "../../services/bookingService";
import { CheckCircle2, QrCode, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StaffEntryPage() {
  const [activeTab, setActiveTab] = useState("nfc"); // "nfc" | "qr"
  const [paidBookings, setPaidBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load paid bookings for QR mock scan
  const loadPaidBookings = async () => {
    try {
      const data = await bookingService.getPaidBookingsForStaff();
      setPaidBookings(data);
      if (data.length > 0) {
        setSelectedBookingId(data[0].id);
        setSelectedBooking(data[0]);
      } else {
        setSelectedBookingId("");
        setSelectedBooking(null);
      }
    } catch (e) {
      console.error("Lỗi lấy danh sách đặt giữ chỗ:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "qr") {
      loadPaidBookings();
    }
  }, [activeTab]);

  const handleBookingChange = (id) => {
    setSelectedBookingId(id);
    setSelectedBooking(paidBookings.find(b => b.id === id) || null);
  };

  const handleConfirmScan = async () => {
    if (!selectedBookingId) return;
    setIsLoading(true);
    setSuccessMsg("");
    try {
      await bookingService.confirmBookingScan(selectedBookingId);
      setSuccessMsg(`Đã quét & xác nhận vào bãi thành công cho đặt giữ chỗ ${selectedBookingId}!`);
      await loadPaidBookings();
    } catch (e) {
      alert(e.message || "Xác nhận quét mã QR thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
            Cổng Vận Hành Kiểm Soát Vào (Entry)
          </h2>
          <p className="text-sm text-slate-500 font-semibold mt-0.5">
            Xử lý xe vào bãi bằng Thẻ Từ (NFC) hoặc quét Vé Đặt Trước (QR Code)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => { setActiveTab("nfc"); setSuccessMsg(""); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "nfc" 
              ? "border-blue-600 text-blue-600 font-black" 
              : "border-transparent text-slate-500 hover:text-slate-800 font-semibold"
          }`}
        >
          💳 Quét Thẻ Từ (NFC)
        </button>
        <button 
          onClick={() => { setActiveTab("qr"); setSuccessMsg(""); }}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "qr" 
              ? "border-blue-600 text-blue-600 font-black" 
              : "border-transparent text-slate-500 hover:text-slate-800 font-semibold"
          }`}
        >
          <QrCode className="w-4 h-4" /> Quét Vé Đặt Trước (QR Code)
        </button>
      </div>

      {activeTab === "nfc" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Camera / Biển số */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden shadow-lg border-4 border-slate-800">
              <p className="text-slate-500 font-mono text-sm tracking-widest">[ CAMERA FEED STREAM ]</p>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-bold text-red-500">REC</span>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Ảnh Biển Số</p>
                <div className="h-24 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                  <span className="text-slate-400 text-sm font-semibold">Chưa có ảnh</span>
                </div>
              </Card>
              <Card className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
                <p className="text-xs font-black text-slate-400 uppercase mb-2">Biển Số Nhận Diện</p>
                <div className="h-24 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-3xl font-black text-slate-800 font-mono">-- --</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Form nhập liệu */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full justify-between">
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 border-b pb-4 text-base uppercase tracking-wide">
                Thông Tin Phiên Gửi
              </h3>
              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Mã Thẻ (Quét NFC)</label>
                  <Input type="text" placeholder="Chờ quét thẻ..." disabled className="w-full bg-slate-50 font-mono font-bold text-blue-600 cursor-not-allowed" />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Biển Số Xe</label>
                  <Input type="text" placeholder="Nhập thủ công nếu AI sai..." className="w-full bg-white font-mono font-bold" />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Loại Xe (Tự động/Chỉnh tay)</label>
                  <Select defaultValue="Xe Máy">
                    <SelectTrigger className="w-full bg-white border-slate-200">
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Xe Máy">Xe Máy</SelectItem>
                      <SelectItem value="Ô Tô">Ô Tô</SelectItem>
                      <SelectItem value="Xe Đạp">Xe Đạp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-xs font-black text-emerald-600 uppercase mb-1">Gợi Ý Chỗ Đỗ</p>
                  <p className="text-2xl font-black text-emerald-700 font-mono">TẦNG 1 - KHU A</p>
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">Còn 25 slot trống</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-xl shadow-lg transition-colors cursor-pointer text-sm">
              XÁC NHẬN VÀO BÃI (ENTER)
            </Button>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Mock Scanner Device Simulation */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 rounded-2xl aspect-video flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-lg border-4 border-slate-800">
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-bold text-cyan-400">SCANNER ONLINE</span>
              </div>

              {selectedBooking ? (
                <div className="text-center space-y-4 text-white z-10 flex flex-col items-center justify-center">
                  <div className="mx-auto w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center border-4 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${selectedBooking.id}&color=0f172a`} 
                      alt="Scanned QR"
                      className="w-20 h-20 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-cyan-400 uppercase tracking-widest">ĐÃ PHÁT HIỆN MÃ ĐẶT CHỖ</p>
                    <p className="text-2xl font-black font-mono text-white tracking-wider">{selectedBooking.id}</p>
                    <p className="text-xs text-slate-400 font-semibold">
                      Khu vực: <span className="text-white font-bold">{selectedBooking.areaName}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 space-y-3 flex flex-col items-center justify-center">
                  <QrCode className="w-16 h-16 mx-auto text-slate-700 animate-pulse" />
                  <p className="font-mono text-xs uppercase tracking-wider">ĐANG CHỜ THIẾT BỊ HOẶC TÀI XẾ TRÌNH MÃ QR...</p>
                  <p className="text-[10px] text-slate-600 font-sans max-w-sm mx-auto font-semibold">
                    (Vui lòng thực hiện đặt chỗ và thanh toán trên cổng Driver để có mã QR chờ xác nhận)
                  </p>
                </div>
              )}
            </Card>

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Form Confirm QR Scan */}
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-black text-slate-800 text-base uppercase tracking-wide">
                  Xác Nhận Booking QR
                </h3>
                <Button 
                  onClick={loadPaidBookings}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  title="Tải lại danh sách đặt chỗ"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">
                    Chọn mã đặt chỗ QR (Mô phỏng quét mã)
                  </label>
                  {paidBookings.length === 0 ? (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-400 italic font-semibold">
                      Không có đặt giữ chỗ nào đang chờ quét mã...
                    </div>
                  ) : (
                    <Select 
                      value={selectedBookingId} 
                      onValueChange={handleBookingChange}
                    >
                      <SelectTrigger className="w-full bg-white border-slate-300 font-mono font-bold text-xs">
                        <SelectValue placeholder="Chọn mã đặt chỗ QR..." />
                      </SelectTrigger>
                      <SelectContent>
                        {paidBookings.map((b) => (
                          <SelectItem key={b.id} value={b.id} className="font-mono font-bold text-xs">
                            {b.id} ({b.username} - {b.vehicleTypeName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {selectedBooking && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3.5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Người đặt chỗ:</span>
                      <span className="text-slate-800 font-bold">{selectedBooking.username}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Loại xe gửi:</span>
                      <Badge variant="secondary" className="font-bold uppercase text-[10px] bg-slate-200 text-slate-800 border-0 rounded px-2 py-0.5">
                        {selectedBooking.vehicleTypeName}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Khu vực đỗ xe:</span>
                      <span className="text-indigo-600 font-bold text-sm">{selectedBooking.areaName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Vị trí slot (Khóa cứng):</span>
                      <span className="text-slate-800 font-mono font-bold bg-white px-2 py-0.5 border rounded shadow-sm">
                        {selectedBooking.internalSlotCode}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Phí đã thanh toán:</span>
                      <span className="text-emerald-600 font-black">{selectedBooking.reservationFee.toLocaleString()} đ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleConfirmScan}
              disabled={!selectedBookingId || isLoading}
              className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-6 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>ĐANG XÁC NHẬN...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XÁC NHẬN ĐỖ XE (SCAN CONFIRM)</span>
                </>
              )}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
