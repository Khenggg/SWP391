import React, { useState, useEffect } from "react";
import { 
  Calendar, Clock, CreditCard, CheckCircle2, AlertTriangle, 
  Trash2, Play, RefreshCw, Layers, ShieldCheck, ShieldAlert, Users 
} from "lucide-react";
import { MOCK_MONTHLY_PASSES, MOCK_AREAS, MOCK_FLOORS } from "../../constants/mockData";

// Helper functions for date/time manipulation
const addMinutes = (dateStr, mins) => {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
};

const addHours = (dateStr, hrs) => {
  const d = new Date(dateStr);
  d.setHours(d.getHours() + hrs);
  return d.toISOString();
};

const getMinutesDiff = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2.getTime() - d1.getTime()) / 60000);
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export default function DriverBookingPage() {
  const [driver, setDriver] = useState({
    username: "driver01",
    fullName: "Nguyễn Văn A",
    phone: "0912345678",
  });

  // Simulated Time
  const [simTime, setSimTime] = useState("");
  // Current Active Booking
  const [activeBooking, setActiveBooking] = useState(null);
  // Driver's eligible vehicles
  const [myVehicles, setMyVehicles] = useState([]);
  
  // Form State: Areas
  const [selectedAreaCode, setSelectedAreaCode] = useState("B2-A");
  const [durationHours, setDurationHours] = useState(3);
  
  // Selection state for check-in
  const [checkInPlate, setCheckInPlate] = useState("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isManualPlate, setIsManualPlate] = useState(false);

  // Initializing page
  useEffect(() => {
    // 1. Get logged in driver details
    const savedUser = sessionStorage.getItem("currentUser");
    let driverName = "Nguyễn Văn A";
    let driverPhone = "0912345678";
    let driverUsername = "driver01";
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        driverName = parsed.fullName || "Nguyễn Văn A";
        driverPhone = parsed.phone || "0912345678";
        driverUsername = parsed.username || "driver01";
        setDriver({ username: driverUsername, fullName: driverName, phone: driverPhone });
      } catch (e) {
        console.error("Lỗi đọc user", e);
      }
    }

    // 2. Load driver's vehicles from MOCK_MONTHLY_PASSES
    const vehicles = MOCK_MONTHLY_PASSES.filter(
      (pass) => pass.ownerName === driverName || pass.phone === driverPhone
    );
    setMyVehicles(vehicles);

    // 3. Load simulated time (default to current actual time if not present)
    const savedSimTime = localStorage.getItem("driver_sim_time");
    if (savedSimTime) {
      setSimTime(savedSimTime);
    } else {
      const now = new Date().toISOString();
      setSimTime(now);
      localStorage.setItem("driver_sim_time", now);
    }

    // 4. Load active booking using the partitioned key
    const savedBooking = localStorage.getItem(`driver_active_booking_${driverUsername}`);
    if (savedBooking) {
      try {
        setActiveBooking(JSON.parse(savedBooking));
      } catch (e) {
        console.error("Lỗi tải active booking", e);
      }
    }
  }, []);

  // Time simulation engine runs whenever simulated time changes
  useEffect(() => {
    if (!simTime || !activeBooking) return;

    let updated = false;
    const booking = { ...activeBooking };

    if (booking.status === "PENDING_PAYMENT") {
      const diff = getMinutesDiff(booking.createdAt, simTime);
      if (diff > 15) {
        booking.status = "EXPIRED_TIMEOUT";
        updated = true;
      }
    } else if (booking.status === "PAID") {
      const paidAtTime = booking.paidAt;
      const durationMins = booking.hours * 60;
      const diff = getMinutesDiff(paidAtTime, simTime);
      
      // Total check-in window is duration + 15 minutes grace period
      if (diff > durationMins + 15) {
        booking.status = "EXPIRED_CHECKIN";
        updated = true;
      }
    }

    if (updated) {
      setActiveBooking(booking);
      localStorage.setItem(`driver_active_booking_${driver.username}`, JSON.stringify(booking));
      saveToHistory(booking);
    }
  }, [simTime, activeBooking]);

  // Helper to save a completed or expired booking to history
  const saveToHistory = (booking) => {
    if (["EXPIRED_TIMEOUT", "EXPIRED_CHECKIN", "CANCELLED", "COMPLETED"].includes(booking.status)) {
      const enrichedBooking = {
        ...booking,
        reservationFee: booking.reservationFee !== undefined ? booking.reservationFee : (booking.fee || 0),
        actualParkingFee: booking.actualParkingFee !== undefined ? booking.actualParkingFee : 0,
        actualHours: booking.actualHours !== undefined ? booking.actualHours : 0
      };
      const historyKey = `driver_history_${driver.username}`;
      const history = JSON.parse(localStorage.getItem(historyKey) || "[]");
      if (!history.find(h => h.id === enrichedBooking.id)) {
        history.unshift(enrichedBooking);
        localStorage.setItem(historyKey, JSON.stringify(history));
      }
      localStorage.removeItem(`driver_active_booking_${driver.username}`);
      setActiveBooking(null);
    }
  };

  // Adjust time
  const handleAdjustTime = (amountMinutes) => {
    const current = new Date(simTime);
    current.setMinutes(current.getMinutes() + amountMinutes);
    const newTime = current.toISOString();
    setSimTime(newTime);
    localStorage.setItem("driver_sim_time", newTime);
  };

  const handleResetTime = () => {
    const now = new Date().toISOString();
    setSimTime(now);
    localStorage.setItem("driver_sim_time", now);
  };

  // Get pricing dynamically
  const getHourlyPrice = (vehicleType) => {
    if (vehicleType === "Xe Máy") return 5000;
    return 20000; // default to Ô Tô / Xe Vận Chuyển
  };

  // Create Booking Action
  const handleCreateBooking = (e) => {
    e.preventDefault();

    const area = MOCK_AREAS.find(a => a.code === selectedAreaCode);
    if (!area || area.status !== "ACTIVE") {
      alert("Khu vực đỗ xe không khả dụng.");
      return;
    }

    const pricePerHour = getHourlyPrice(area.vehicleTypeName);
    const fee = durationHours * pricePerHour;

    // Simulate backend logic: automatically scanning empty slots and allocating one internally
    const allocatedSlotId = Math.floor(100 + Math.random() * 900); // Internal slot ID (e.g. 995)
    const allocatedSlotCode = `${area.code}-0${Math.floor(10 + Math.random() * 89)}`;

    const newBooking = {
      id: "BK-" + Math.floor(100000 + Math.random() * 900000),
      areaCode: area.code,
      areaName: area.name,
      floorCode: area.floorCode,
      vehicleTypeName: area.vehicleTypeName,
      hours: durationHours,
      reservationFee: fee,
      fee, // backward compatibility
      actualParkingFee: 0,
      actualHours: 0,
      status: "PENDING_PAYMENT",
      createdAt: simTime,
      paidAt: null,
      checkInTime: null,
      checkOutTime: null,
      plate: null,
      internalSlotId: allocatedSlotId,
      internalSlotCode: allocatedSlotCode
    };

    setActiveBooking(newBooking);
    localStorage.setItem(`driver_active_booking_${driver.username}`, JSON.stringify(newBooking));
  };

  // Cancel Booking Action
  const handleCancelBooking = () => {
    if (!activeBooking) return;

    let confirmMsg = "Xác nhận hủy đặt chỗ?";
    if (activeBooking.status === "PAID") {
      confirmMsg = "Xác nhận hủy đặt chỗ? Phí đặt chỗ trước sẽ KHÔNG được hoàn lại.";
    }

    if (window.confirm(confirmMsg)) {
      const booking = { 
        ...activeBooking, 
        status: "CANCELLED",
        checkOutTime: simTime
      };
      setActiveBooking(null);
      localStorage.removeItem(`driver_active_booking_${driver.username}`);
      saveToHistory(booking);
    }
  };

  // Pay Booking Action
  const handlePayBooking = () => {
    if (!activeBooking || activeBooking.status !== "PENDING_PAYMENT") return;

    const booking = {
      ...activeBooking,
      status: "PAID",
      paidAt: simTime
    };

    setActiveBooking(booking);
    localStorage.setItem(`driver_active_booking_${driver.username}`, JSON.stringify(booking));
  };

  // Check-In Form Submit
  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    if (!checkInPlate) {
      alert("Vui lòng chọn biển số xe.");
      return;
    }

    const booking = {
      ...activeBooking,
      status: "CHECKED_IN",
      plate: checkInPlate,
      checkInTime: simTime
    };

    setActiveBooking(booking);
    localStorage.setItem(`driver_active_booking_${driver.username}`, JSON.stringify(booking));
    setShowCheckInModal(false);
  };

  // Check-Out Action
  const handleCheckOut = () => {
    if (!activeBooking || activeBooking.status !== "CHECKED_IN") return;

    // Calculate actual parking duration
    const actualDurationMins = getMinutesDiff(activeBooking.checkInTime, simTime);
    const actualHours = Math.max(1, Math.ceil(actualDurationMins / 60));
    const hourlyPrice = getHourlyPrice(activeBooking.vehicleTypeName);
    const actualParkingFee = actualHours * hourlyPrice;

    const confirmMsg = `Xác nhận cho xe ${activeBooking.plate} check-out?\n\n` +
      `- Thời gian đỗ thực tế: ${actualHours} Giờ (từ ${formatDateTime(activeBooking.checkInTime)} đến ${formatDateTime(simTime)})\n` +
      `- Phí đặt chỗ trước (Giữ chỗ): ${(activeBooking.reservationFee !== undefined ? activeBooking.reservationFee : activeBooking.fee).toLocaleString()} VND (Đã thanh toán trên App)\n` +
      `- Phí gửi xe thực tế tại bãi: ${actualParkingFee.toLocaleString()} VND (Cần thanh toán tại cổng ra)`;

    if (window.confirm(confirmMsg)) {
      const booking = {
        ...activeBooking,
        status: "COMPLETED",
        checkOutTime: simTime,
        actualHours,
        actualParkingFee
      };

      setActiveBooking(null);
      localStorage.removeItem(`driver_active_booking_${driver.username}`);
      saveToHistory(booking);
    }
  };

  // Timer Calculations
  const getBookingTimerDetails = () => {
    if (!activeBooking || !simTime) return null;

    const details = {
      isWarning: false,
      isGracePeriod: false,
      msg: "",
      timeLeftMins: 0
    };

    if (activeBooking.status === "PENDING_PAYMENT") {
      const diff = getMinutesDiff(activeBooking.createdAt, simTime);
      details.timeLeftMins = Math.max(0, 15 - diff);
      details.msg = `Vui lòng hoàn tất thanh toán trong: ${details.timeLeftMins} phút`;
    } else if (activeBooking.status === "PAID") {
      const paidAtTime = activeBooking.paidAt;
      const durationMins = activeBooking.hours * 60;
      const diff = getMinutesDiff(paidAtTime, simTime);
      
      const checkInExpiry = addHours(paidAtTime, activeBooking.hours);
      const graceExpiry = addMinutes(checkInExpiry, 15);
      
      const minsToExpiry = durationMins - diff;
      const minsToGrace = (durationMins + 15) - diff;

      details.timeLeftMins = Math.max(0, minsToGrace);

      if (simTime >= addMinutes(checkInExpiry, -15) && simTime <= checkInExpiry) {
        details.isWarning = true;
        details.msg = `⚠️ CẢNH BÁO: Còn lại ${minsToExpiry} phút để check-in hoặc đặt chỗ sẽ hết hạn!`;
      } else if (simTime > checkInExpiry && simTime <= graceExpiry) {
        details.isGracePeriod = true;
        details.msg = `⏳ THỜI GIAN GIA HẠN: Đã trễ giờ đỗ xe. Bạn còn ${minsToGrace} phút gia hạn để check-in!`;
      } else {
        details.msg = `Hạn check-in còn lại (gồm 15 phút gia hạn): ${details.timeLeftMins} phút`;
      }
    }

    return details;
  };

  const timerDetails = getBookingTimerDetails();

  const getEligibleVehicles = () => {
    if (!activeBooking) return [];
    // Chỉ áp dụng đặt chỗ cho các xe hết hạn vé tháng (EXPIRED). Xe còn hạn (ACTIVE) đỗ trực tiếp tại slot cố định.
    return myVehicles.filter(v => v.vehicleTypeName === activeBooking.vehicleTypeName && v.status === "EXPIRED");
  };

  const eligibleVehicles = getEligibleVehicles();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Time Simulator Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="animate-ping w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block"></span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              BẢNG GIẢ LẬP THỜI GIAN HỆ THỐNG
            </span>
          </div>
          <p className="text-xl font-mono font-black text-cyan-400">
            {formatDateTime(simTime)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleAdjustTime(1)} 
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            +1p
          </button>
          <button 
            onClick={() => handleAdjustTime(5)} 
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            +5p
          </button>
          <button 
            onClick={() => handleAdjustTime(15)} 
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            +15p
          </button>
          <button 
            onClick={() => handleAdjustTime(60)} 
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            +1h
          </button>
          <button 
            onClick={() => handleAdjustTime(180)} 
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            +3h
          </button>
          <button 
            onClick={handleResetTime} 
            className="bg-cyan-950 text-cyan-400 hover:bg-cyan-900 border border-cyan-800 px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Khôi phục thời gian thực
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Section: Active booking details or Create Booking form */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeBooking ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
              
              {/* Card Header */}
              <div className={`p-6 border-b text-white flex justify-between items-center ${
                activeBooking.status === "PENDING_PAYMENT" 
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 border-amber-600" 
                  : activeBooking.status === "PAID" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-700"
                  : "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-700"
              }`}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
                    Mã đặt chỗ: {activeBooking.id}
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    {activeBooking.status === "PENDING_PAYMENT" && "Chờ Thanh Toán Phí Đặt Trước"}
                    {activeBooking.status === "PAID" && "Đã Thanh Toán - Chờ Check-in"}
                    {activeBooking.status === "CHECKED_IN" && "Xe Đang Đỗ Tại Bãi"}
                  </h3>
                </div>
                
                <span className="text-3xl">
                  {activeBooking.status === "PENDING_PAYMENT" && "⏳"}
                  {activeBooking.status === "PAID" && "🎫"}
                  {activeBooking.status === "CHECKED_IN" && "🚗"}
                </span>
              </div>

              {/* Warning/Alert Display for Paid but Expiring soon or in Grace Period */}
              {timerDetails && (timerDetails.isWarning || timerDetails.isGracePeriod) && (
                <div className={`p-4 border-b flex gap-3 text-xs font-bold items-center animate-pulse ${
                  timerDetails.isWarning 
                    ? "bg-rose-50 text-rose-700 border-rose-100" 
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{timerDetails.msg}</span>
                </div>
              )}

              {/* Details Body */}
              <div className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-slate-400 mb-1">Vị trí đỗ gợi ý</p>
                    <p className="text-slate-800 font-extrabold text-sm">{activeBooking.areaName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Thời gian đặt</p>
                    <p className="text-slate-800 font-extrabold text-sm">{activeBooking.hours} Giờ</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Loại phương tiện</p>
                    <p className="text-slate-800 font-extrabold text-sm">{activeBooking.vehicleTypeName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Phí đặt trước</p>
                    <p className="text-indigo-600 font-black text-sm">{activeBooking.fee.toLocaleString()} VND</p>
                  </div>
                </div>

                {/* Sub-text explaining hidden internal slot ID for demo */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-500 font-mono">
                  💡 <strong>Thông tin kiểm định Demo (Nội bộ):</strong>
                  <div className="mt-1">
                    - Slot ID khóa cứng: <span className="text-indigo-600 font-bold">#{activeBooking.internalSlotId}</span>
                    <br />
                    - Mã Slot vật lý: <span className="text-indigo-600 font-bold">{activeBooking.internalSlotCode}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 italic">
                    (Backend đã tự động khóa slot này để tránh Overbooking. Driver chỉ nhìn thấy thông tin "Khu vực" gợi ý ở trên)
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                    <span>Thời điểm tạo đặt chỗ:</span>
                    <span className="text-slate-800 font-bold">{formatDateTime(activeBooking.createdAt)}</span>
                  </div>

                  {activeBooking.status === "PENDING_PAYMENT" && timerDetails && (
                    <div className="bg-amber-50 text-amber-800 rounded-xl p-4 flex gap-3 text-xs font-bold border border-amber-100 animate-pulse">
                      <Clock className="w-5 h-5 shrink-0 text-amber-600" />
                      <div>
                        <p>{timerDetails.msg}</p>
                        <p className="text-[10px] font-medium text-amber-600 mt-1 font-sans">
                          Nếu không hoàn tất thanh toán trước thời hạn, hệ thống sẽ tự động hủy yêu cầu đỗ xe này.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeBooking.status === "PAID" && (
                    <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Thời điểm thanh toán:</span>
                        <span className="text-slate-800 font-bold">{formatDateTime(activeBooking.paidAt)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Hạn check-in chính thức:</span>
                        <span className="text-slate-800 font-bold">{formatDateTime(addHours(activeBooking.paidAt, activeBooking.hours))}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                        <span>Hạn giữ chỗ tối đa (15p gia hạn):</span>
                        <span className="text-rose-600 font-black">{formatDateTime(addMinutes(addHours(activeBooking.paidAt, activeBooking.hours), 15))}</span>
                      </div>
                      {timerDetails && (
                        <p className="text-[11px] font-bold text-indigo-600 border-t pt-2 mt-2 font-sans">
                          ⏱️ {timerDetails.msg}
                        </p>
                      )}
                    </div>
                  )}

                  {activeBooking.status === "CHECKED_IN" && (
                    <div className="space-y-2 bg-emerald-50 text-emerald-900 rounded-xl p-4 border border-emerald-100">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Biển số xe đỗ thực tế:</span>
                        <span className="font-mono text-sm bg-white px-2 py-0.5 border border-emerald-200 rounded">{activeBooking.plate}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>Vị trí khu vực:</span>
                        <span className="text-sm bg-white px-2 py-0.5 border border-emerald-200 rounded text-emerald-700 font-extrabold">{activeBooking.areaName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>Thời điểm xe vào (Check-in):</span>
                        <span>{formatDateTime(activeBooking.checkInTime)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex gap-3 border-t border-slate-100 pt-6">
                  {activeBooking.status === "PENDING_PAYMENT" && (
                    <>
                      <button 
                        onClick={handlePayBooking}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" /> Giả lập Thanh Toán Thành Công
                      </button>
                      <button 
                        onClick={handleCancelBooking}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer"
                      >
                        Hủy Đặt
                      </button>
                    </>
                  )}

                  {activeBooking.status === "PAID" && (
                    <div className="flex flex-col gap-4 w-full">
                      {/* Driver actions */}
                      <div className="flex gap-3">
                        <button 
                          onClick={handleCancelBooking}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2.5 px-4 rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" /> Hủy đặt chỗ (Không hoàn phí)
                        </button>
                      </div>

                      {/* Simulation of system/staff sync */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Giả lập Cổng Vào (Staff thực hiện tại cổng)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                          * Thực tế: Tài xế không tự check-in trên App. Khi xe đi vào cổng, nhân viên (Staff) quét biển số, hệ thống backend tự động khớp với đặt chỗ đã thanh toán của tài xế này và cập nhật trạng thái.
                        </p>
                        <button 
                          onClick={() => {
                            if (eligibleVehicles.length > 0) {
                              setCheckInPlate(eligibleVehicles[0].plate);
                              setIsManualPlate(false);
                            } else {
                              setCheckInPlate("");
                              setIsManualPlate(true);
                            }
                            setShowCheckInModal(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <Play className="w-3.5 h-3.5" /> Giả lập Staff quét xe cho vào cổng
                        </button>
                      </div>
                    </div>
                  )}

                  {activeBooking.status === "CHECKED_IN" && (
                    <div className="flex flex-col gap-4 w-full">
                      {/* Simulation of system/staff check-out */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                            Giả lập Cổng Ra (Staff thực hiện tại cổng)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                          * Thực tế: Tài xế không tự check-out trên App. Khi xe ra cổng, nhân viên (Staff) quét biển số và xác nhận cho xe ra, hệ thống tự động hoàn tất phiên và lưu lịch sử.
                        </p>
                        <button 
                          onClick={handleCheckOut}
                          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2 px-3 rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Giả lập Staff quét xe cho ra cổng
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            // Form Đặt Chỗ
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-wide mb-6">
                Đặt Giữ Chỗ Đặt Trước (Booking)
              </h3>

              <form onSubmit={handleCreateBooking} className="space-y-6">
                
                {/* 1. Area Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Chọn khu vực đỗ xe gợi ý
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* B2-A Option (Ô tô) */}
                    <div 
                      onClick={() => setSelectedAreaCode("B2-A")}
                      className={`p-4.5 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
                        selectedAreaCode === "B2-A" 
                          ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 ring-2 ring-indigo-600/20" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-extrabold block text-slate-800">Khu A - Tầng B2</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                          Đỗ Xe Ô Tô (Quản lý Slot nội bộ)
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded">
                          Còn 13 chỗ trống
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-indigo-600">20k/h</span>
                          <span className="text-lg">🚗</span>
                        </div>
                      </div>
                    </div>

                    {/* B2-B Option (Ô tô) */}
                    <div 
                      onClick={() => setSelectedAreaCode("B2-B")}
                      className={`p-4.5 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
                        selectedAreaCode === "B2-B" 
                          ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 ring-2 ring-indigo-600/20" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-extrabold block text-slate-800">Khu B - Tầng B2</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                          Đỗ Xe Ô Tô (Quản lý Slot nội bộ)
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded">
                          Còn 7 chỗ trống
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-indigo-600">20k/h</span>
                          <span className="text-lg">🚗</span>
                        </div>
                      </div>
                    </div>

                    {/* B1-A Option (Xe máy) */}
                    <div 
                      onClick={() => setSelectedAreaCode("B1-A")}
                      className={`p-4.5 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
                        selectedAreaCode === "B1-A" 
                          ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 ring-2 ring-indigo-600/20" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-extrabold block text-slate-800">Khu A - Tầng B1</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                          Xe Máy Thường (Quản lý mật độ nội bộ)
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded">
                          Còn 35 chỗ trống
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-indigo-600">5k/h</span>
                          <span className="text-lg">🏍️</span>
                        </div>
                      </div>
                    </div>

                    {/* B1-B Option (Xe máy điện) */}
                    <div 
                      onClick={() => setSelectedAreaCode("B1-B")}
                      className={`p-4.5 border rounded-2xl cursor-pointer transition flex flex-col justify-between ${
                        selectedAreaCode === "B1-B" 
                          ? "border-indigo-600 bg-indigo-50/30 text-indigo-900 ring-2 ring-indigo-600/20" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <span className="text-sm font-extrabold block text-slate-800">Khu B - Tầng B1</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                          Xe Máy Điện (Quản lý mật độ nội bộ)
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-6">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded">
                          Còn 19 chỗ trống
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-indigo-600">5k/h</span>
                          <span className="text-lg">🏍️</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. Duration select */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Số giờ đặt trước
                  </label>
                  <select 
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 font-semibold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option value={1}>1 Giờ</option>
                    <option value={2}>2 Giờ</option>
                    <option value={3}>3 Giờ (Mặc định)</option>
                    <option value={4}>4 Giờ</option>
                    <option value={6}>6 Giờ</option>
                    <option value={8}>8 Giờ</option>
                    <option value={12}>12 Giờ</option>
                    <option value={24}>24 Giờ</option>
                  </select>
                </div>

                {/* 3. Dynamic Price info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Đơn giá đỗ xe
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {selectedAreaCode.startsWith("B2") ? "20.000 VND / giờ (Ô Tô)" : "5.000 VND / giờ (Xe Máy)"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Tổng chi phí đặt trước
                    </span>
                    <span className="text-xl font-black text-indigo-600">
                      {(durationHours * (selectedAreaCode.startsWith("B2") ? 20000 : 5000)).toLocaleString()} VND
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 hover:from-blue-500 hover:via-indigo-500 hover:to-violet-600 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition cursor-pointer"
                >
                  Xác nhận đặt giữ chỗ đỗ xe
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Right Section: Rules & Classifications */}
        <div className="space-y-6">
          
          {/* Categorization Info Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-500" />
              Phân loại người dùng
            </h4>
            
            <div className="space-y-4 text-xs font-medium text-slate-600">
              <div className="border-l-4 border-indigo-500 pl-3">
                <p className="font-extrabold text-slate-800">1. Cư Dân (Resident)</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Là người sinh sống tại tòa nhà. Có quyền đăng ký vé tháng dài hạn theo các biển số xe cố định và được hưởng quyền lợi đỗ xe ưu đãi.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-3">
                <p className="font-extrabold text-slate-800">2. Driver đặt trước (Registered)</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Là tài xế đăng ký tài khoản thành viên để đặt chỗ trước trực tuyến qua App. Cho phép khóa cứng slot và thanh toán trực tiếp.
                </p>
              </div>

              <div className="border-l-4 border-slate-400 pl-3">
                <p className="font-extrabold text-slate-800">3. Driver vãng lai (Casual)</p>
                <p className="text-slate-500 mt-0.5 leading-relaxed">
                  Không đăng ký tài khoản, gửi xe theo lượt trực tiếp tại cổng kiểm soát đầu vào (lấy thẻ) và thanh toán tiền mặt/QR khi ra bãi.
                </p>
              </div>
            </div>
          </div>

          {/* Rules / Business Logic Widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Nghiệp Vụ Đặt Chỗ
            </h4>
            
            <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">1.</span>
                <span>Chỉ đặt chỗ trước thành công khi khu vực đỗ xe còn trống tối thiểu 1 chỗ.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">2.</span>
                <span>
                  Sau khi gửi yêu cầu, bạn có **15 phút** để thanh toán phí đặt trước. Quá hạn hệ thống hủy tự động.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">3.</span>
                <span>
                  Thời gian đặt đếm ngược từ lúc thanh toán. Bạn có **X giờ** đỗ xe + **15 phút gia hạn** check-in tối đa.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">4.</span>
                <span>
                  Trước khi hết hạn đặt chỗ **15 phút**, một thông báo cảnh báo sẽ xuất hiện trên màn hình Driver.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">5.</span>
                <span>
                  Tài xế có thể **Hủy đặt chỗ** trước khi check-in, nhưng **không được hoàn lại tiền** phí đã đóng.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-500 font-bold shrink-0">6.</span>
                <span>
                  Chỉ check-in booking cho xe **hết hạn vé tháng (EXPIRED)**. Xe còn hạn (ACTIVE) được đỗ trực tiếp vào slot cố định của cư dân mà không cần đặt trước.
                </span>
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* 2. Check-In Modal for selecting vehicle */}
      {showCheckInModal && activeBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-md font-black text-slate-800 uppercase tracking-wide">
                Giả Lập Cổng Kiểm Soát (Staff Cổng Vào)
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Nhân viên (Staff) quét hoặc nhập biển số xe thực tế khi xe đi vào cổng (loại: {activeBooking.vehicleTypeName})
              </p>
            </div>

            <form onSubmit={handleCheckInSubmit} className="p-6 space-y-4">
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {isManualPlate ? "Nhập biển số xe đỗ thực tế" : "Chọn biển số xe đỗ"}
                  </label>
                  {myVehicles.length > 0 && eligibleVehicles.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextManual = !isManualPlate;
                        setIsManualPlate(nextManual);
                        setCheckInPlate(nextManual ? "" : eligibleVehicles[0].plate);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                    >
                      {isManualPlate ? "Chọn từ danh sách xe của bạn" : "Nhập biển số xe khác"}
                    </button>
                  )}
                </div>
                
                {isManualPlate ? (
                  <div>
                    <input 
                      type="text"
                      required
                      value={checkInPlate}
                      onChange={(e) => setCheckInPlate(e.target.value.toUpperCase())}
                      placeholder="Ví dụ: 30H-123.45"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 font-bold font-mono tracking-wider outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    />
                    {myVehicles.length > 0 && eligibleVehicles.length === 0 && (
                      <p className="text-[10px] text-amber-600 font-medium leading-relaxed font-sans mt-1">
                        ⚠️ Bạn không có xe vé tháng hết hạn nào thuộc loại này. Vui lòng nhập biển số xe khác để check-in đỗ theo phiên đặt trước này. (Xe còn hạn sẽ tự động đỗ trực tiếp vào slot riêng không cần booking).
                      </p>
                    )}
                    {myVehicles.length > 0 && eligibleVehicles.length > 0 && (
                      <p className="text-[10px] text-indigo-600 font-medium leading-relaxed font-sans mt-1">
                        💡 Nhập biển số xe khác không có sẵn trong danh sách vé tháng để gửi theo phiên đặt chỗ này.
                      </p>
                    )}
                  </div>
                ) : (
                  <select 
                    value={checkInPlate}
                    onChange={(e) => setCheckInPlate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 font-semibold outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                  >
                    {eligibleVehicles.map(v => (
                      <option key={v.id} value={v.plate}>
                        {v.plate} (Vé Tháng Hết Hạn)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-500 font-medium">
                🔔 Hệ thống ghi nhận xe đi vào cổng và tự động khớp biển số với mã Slot nội bộ <strong>{activeBooking.internalSlotCode}</strong> đã được khóa cứng trước đó tại <strong>{activeBooking.areaName}</strong>.
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={!checkInPlate.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  Xác nhận cho xe vào (Đồng bộ Check-in)
                </button>
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
