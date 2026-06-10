import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Phone, Mail, Shield, Car, Calendar, History, ArrowRight } from "lucide-react";
import { vehicleService } from "../../services/vehicleService";
import { bookingService } from "../../services/bookingService";

export default function DriverProfilePage() {
  const [driver, setDriver] = useState({
    username: "driver01",
    fullName: "Nguyễn Văn A",
    email: "driver01@parking.vn",
    phone: "0912345678",
    role: "DRIVER",
  });

  const [vehicleStats, setVehicleStats] = useState({ active: 0, expired: 0, total: 0 });
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    // 1. Lấy thông tin tài khoản từ sessionStorage
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setDriver(prev => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error("Lỗi đọc thông tin user", e);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Đếm số xe của tài xế này từ vehicleService
    const myPasses = vehicleService.getVehiclesByOwner(driver.fullName, driver.phone);
    const active = myPasses.filter((p) => p.status === "ACTIVE").length;
    const expired = myPasses.filter((p) => p.status === "EXPIRED").length;
    setVehicleStats({
      active,
      expired,
      total: myPasses.length,
    });

    // 3. Đếm số booking từ bookingService
    const savedHistory = bookingService.getHistory(driver.username);
    const hasActiveBooking = bookingService.getActiveBooking(driver.username) ? 1 : 0;
    setBookingCount(savedHistory.length + hasActiveBooking);
  }, [driver]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Pattern Elements */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <svg width="260" height="260" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </div>
        <div className="absolute top-0 right-1/4 opacity-5">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="currentColor">
            <rect x="10" y="10" width="80" height="80" rx="15" />
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-white/20 shrink-0">
            👨‍✈️
          </div>
          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1.5">
              <h2 className="text-3xl font-black tracking-tight">{driver.fullName}</h2>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase border border-white/15">
                {driver.username === "driver01" ? "CƯ DÂN" : "TÀI XẾ ĐẶT TRƯỚC"}
              </span>
            </div>
            <p className="text-blue-100 font-medium text-sm mb-4">
              {driver.username === "driver01" ? "Tài khoản Cư dân có liên kết vé tháng" : "Tài khoản đặt trước thông thường (Không cư dân)"}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-white/95">
              <span className="bg-slate-950/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                <Phone className="w-3.5 h-3.5 text-blue-300" /> {driver.phone}
              </span>
              <span className="bg-slate-950/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                <Mail className="w-3.5 h-3.5 text-indigo-300" /> {driver.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid thông số tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Xe */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xe của tôi</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mb-1">{vehicleStats.total} Xe</p>
          <div className="flex gap-3 text-xs font-bold text-slate-500">
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {vehicleStats.active} Hạn Vé Tháng
            </span>
            {vehicleStats.expired > 0 && (
              <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                {vehicleStats.expired} Hết Hạn
              </span>
            )}
          </div>
        </div>

        {/* Card Booking */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng Đặt Chỗ</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mb-1">{bookingCount} Đợt đặt</p>
          <p className="text-xs text-slate-500 font-semibold">Theo dõi lịch sử đặt trước và trạng thái thanh toán</p>
        </div>

        {/* Card Loại tài khoản */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loại tài khoản</span>
          </div>
          <p className="text-3xl font-black text-slate-800 mb-1">
            {driver.username === "driver01" ? "Cư Dân" : "Tài Xế Đặt Trước"}
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            {driver.username === "driver01" 
              ? "Đăng ký vé tháng dài hạn & đặt chỗ trước trực tuyến" 
              : "Đặt chỗ trước trực tuyến qua App & đỗ xe trả phí theo giờ"}
          </p>
        </div>
      </div>

      {/* Lối tắt các nghiệp vụ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <h3 className="font-black text-slate-800 uppercase tracking-wide mb-6">Tiện ích dành cho tài xế</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lối tắt 1: Booking */}
          <Link 
            to="/driver/booking" 
            className="group flex flex-col justify-between p-6 rounded-xl border border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50 hover:border-indigo-200 transition-all text-left"
          >
            <div>
              <div className="text-2xl mb-3">📅</div>
              <h4 className="font-extrabold text-slate-800 mb-2">Đặt Chỗ Trước</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                Đặt giữ chỗ trước cho các xe hết hạn vé tháng. Xe còn hạn vé tháng (ACTIVE) đỗ trực tiếp tại slot cố định không cần đặt.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Đặt chỗ ngay <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Lối tắt 2: Vehicles */}
          <Link 
            to="/driver/vehicles" 
            className="group flex flex-col justify-between p-6 rounded-xl border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
          >
            <div>
              <div className="text-2xl mb-3">🚗</div>
              <h4 className="font-extrabold text-slate-800 mb-2">Xe Của Tôi</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                Xem danh sách phương tiện được liên kết với thẻ vé tháng của bạn. Được cập nhật bởi Quản lý.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Xem danh sách xe <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          {/* Lối tắt 3: History */}
          <Link 
            to="/driver/history" 
            className="group flex flex-col justify-between p-6 rounded-xl border border-purple-100 bg-purple-50/20 hover:bg-purple-50 hover:border-purple-200 transition-all text-left"
          >
            <div>
              <div className="text-2xl mb-3">⏱️</div>
              <h4 className="font-extrabold text-slate-800 mb-2">Lịch Sử Gửi Xe</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                Xem chi tiết lịch sử các phiên đỗ xe thực tế đã hoàn thành, có đối chiếu biển số và chi phí.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Xem lịch sử <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
