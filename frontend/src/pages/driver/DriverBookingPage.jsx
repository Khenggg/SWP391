import React, { useState, useEffect } from "react";
import { CheckCircle2, ScanLine } from "lucide-react";
import { vehicleService } from "../../services/vehicleService";
import { parkingService } from "../../services/parkingService";
import { reservationService } from "../../services/reservationService";
import { pricingService } from "../../services/pricingService";
import { Button } from "@/components/ui/button";

import BookingStepper from "../../components/driver/booking/BookingStepper";
import VehicleSelectionStep from "../../components/driver/booking/VehicleSelectionStep";
import TimeSelectionStep from "../../components/driver/booking/TimeSelectionStep";
import LocationSelectionStep from "../../components/driver/booking/LocationSelectionStep";
import BookingSummaryPanel from "../../components/driver/booking/BookingSummaryPanel";
import PaymentStep from "../../components/driver/booking/PaymentStep";

export default function DriverBookingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [activeReservation, setActiveReservation] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [durationHours, setDurationHours] = useState(3);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedAreaName, setSelectedAreaName] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlotName, setSelectedSlotName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, areasData, historyData, pricingData, activeData, slotsData] = await Promise.all([
          vehicleService.getVehiclesByOwner(),
          parkingService.getAreas(),
          reservationService.getHistory(0, 3), // Get 3 recent
          pricingService.getPublicPricing(),
          reservationService.getActiveReservation().catch(() => null),
          reservationService.getAvailableSlots()
        ]);
        
        setVehicles(vehiclesData || []);
        setAreas(areasData || []);
        setRecentHistory(historyData || []);
        setPricingRules(pricingData || []);
        
        setActiveReservation(activeData);
        // Nếu load trang mà có Đặt chỗ đang PENDING thanh toán -> Nhảy vào luồng thanh toán luôn
        if (activeData && activeData.status === "PENDING" && activeData.paymentStatus === "PENDING") {
          setCurrentStep(5);
        } else if (activeData && activeData.status === "CONFIRMED") {
          setCurrentStep(6);
        }
        
        setAvailableSlots(slotsData?.slots || []);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };
    fetchData();
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedVehicle) {
      alert("Vui lòng chọn phương tiện");
      return;
    }
    if (currentStep === 3) {
      if (!selectedAreaId) {
        alert("Vui lòng chọn vị trí khu vực đỗ");
        return;
      }
      if (selectedVehicle?.vehicleTypeName === "Ô Tô" && !selectedSlotId) {
        alert("Vui lòng chọn slot đỗ cụ thể cho Ô tô");
        return;
      }
    }
    setCurrentStep(Math.min(5, currentStep + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const handleCreateReservation = async () => {
    if (!selectedVehicle || !selectedAreaId || !durationHours) return;
    
    setIsSubmitting(true);
    try {
      // Map vehicleTypeId logic (assuming from name or object)
      const vehicleTypeId = selectedVehicle.vehicleTypeName === "Ô Tô" ? 1 : 2; 

      const res = await reservationService.createReservation(
        selectedVehicle.plateNumber || selectedVehicle.plate,
        vehicleTypeId,
        selectedAreaId,
        durationHours,
        selectedSlotId // Truyền thêm slotId cho Ô tô
      );
      // alert("Đặt chỗ thành công!");
      setActiveReservation(res);
      setCurrentStep(5); // Chuyển sang bước thanh toán
    } catch (error) {
      alert(error.message || "Đặt chỗ thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!activeReservation || !window.confirm("Bạn có chắc chắn muốn hủy đặt chỗ này?")) return;
    try {
      await reservationService.cancelReservation(activeReservation.id);
      alert("Hủy đặt chỗ thành công");
      setActiveReservation(null);
      setCurrentStep(1); // Reset flow
      // Reload history
      const historyData = await reservationService.getHistory(0, 3);
      setRecentHistory(historyData || []);
    } catch (error) {
      alert(error.message || "Hủy thất bại");
    }
  };
  const handlePaymentComplete = async () => {
    // Tải lại active reservation để cập nhật trạng thái sang CONFIRMED
    const updatedRes = await reservationService.getActiveReservation().catch(() => null);
    if (updatedRes) {
      setActiveReservation(updatedRes);
    }
    // Tải lại lịch sử sau khi thanh toán thành công
    const historyData = await reservationService.getHistory(0, 3);
    setRecentHistory(historyData || []);
    // Đổi currentStep để thoát khỏi bước thanh toán (5), UI sẽ tự render trạng thái Active
    setCurrentStep(6);
  };

  // Calculate dynamic hourly price based on selected vehicle
  const getDynamicHourlyPrice = () => {
    if (!selectedVehicle) return 0;
    const rule = pricingRules.find(r => r.vehicleTypeName === selectedVehicle.vehicleTypeName && r.status === "ACTIVE");
    return rule ? rule.dayPrice : (selectedVehicle.vehicleTypeName === "Ô Tô" ? 20000 : 5000);
  };
  
  const hourlyPrice = getDynamicHourlyPrice();

  // If there's an active reservation with CONFIRMED status, show active state
  if (activeReservation && activeReservation.status === "CONFIRMED" && currentStep !== 5) {
    const checkInQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(activeReservation.reservationCode)}&size=250`;
    
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-slate-800">
            <span className="text-xl font-black">Đặt chỗ của bạn (Active Reservation)</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">Bạn đang có 1 đặt chỗ hiệu lực!</h2>
            <p className="text-slate-500">Vui lòng chạy xe đến đúng bãi đỗ trước thời gian hết hạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
            {/* Left: Info */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mã đặt chỗ</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{activeReservation.reservationCode}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Biển số xe</p>
                  <p className="font-bold text-slate-700">{activeReservation.plateNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Khu vực</p>
                  <p className="font-bold text-indigo-600">{activeReservation.areaName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng thái</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700">
                    {activeReservation.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hết hạn lúc</p>
                  <p className="font-bold text-rose-600">
                    {new Date(activeReservation.reservationEndTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center justify-center border-l-0 md:border-l border-slate-200 pt-6 md:pt-0 pl-0 md:pl-8">
              <div className="relative group cursor-pointer">
                {/* Ping animation wrapper */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-lg shadow-indigo-200 animate-bounce z-10">
                  <ScanLine className="w-3.5 h-3.5" />
                  ĐƯA MÃ NÀY CHO BẢO VỆ
                </div>
                
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mt-2 transition-transform group-hover:scale-105 duration-300">
                  <img 
                    src={checkInQrUrl} 
                    alt="Check-in QR Code" 
                    className="w-40 h-40 object-contain"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-4 text-center">
                Dùng mã QR này để xác nhận Check-in<br/>tại cổng kiểm soát bãi đỗ.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button variant="destructive" onClick={handleCancelReservation} className="font-bold px-8">
              Hủy đặt chỗ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-slate-800">
          <span className="text-xl font-black">Đặt chỗ (Reservation)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">Đặt chỗ trước</h2>
                <p className="text-sm text-slate-500 mt-1">Đặt trước chỗ đỗ ô tô tại tầng B2. Giữ chỗ tối đa 15 phút kể từ thời điểm xác nhận.</p>
              </div>
            </div>

            <BookingStepper currentStep={currentStep} />

            <div className="mt-8 min-h-[300px]">
              {currentStep === 1 && (
                <VehicleSelectionStep 
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={setSelectedVehicle}
                  onVehicleAdded={(newVehicle) => {
                    setVehicles(prev => [...prev, newVehicle]);
                    setSelectedVehicle(newVehicle);
                  }}
                />
              )}
              
              {currentStep === 2 && (
                <TimeSelectionStep 
                  durationHours={durationHours}
                  setDurationHours={setDurationHours}
                />
              )}

              {currentStep === 3 && (
                <LocationSelectionStep 
                  areas={areas}
                  slots={availableSlots}
                  selectedAreaId={selectedAreaId}
                  onSelectArea={(id, name) => {
                    setSelectedAreaId(id);
                    setSelectedAreaName(name);
                    setSelectedSlotId(null);
                    setSelectedSlotName("");
                  }}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={(id, name) => {
                    setSelectedSlotId(id);
                    setSelectedSlotName(name);
                  }}
                  vehicleTypeName={selectedVehicle?.vehicleTypeName}
                />
              )}

              {currentStep === 4 && (
                <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận thông tin</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Kiểm tra lại kỹ thông tin đặt chỗ của bạn bên thanh tóm tắt trước khi bấm xác nhận. 
                    Hệ thống sẽ khóa slot đỗ tạm thời cho bạn trong 15 phút để chờ thanh toán.
                  </p>
                </div>
              )}

              {currentStep === 5 && (
                <PaymentStep 
                  activeReservation={activeReservation} 
                  onPaymentComplete={handlePaymentComplete}
                  onCancel={handleCancelReservation}
                />
              )}
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6 flex justify-between">
              {currentStep > 1 && currentStep < 5 ? (
                <Button variant="outline" onClick={handlePrevStep} className="font-semibold px-6">
                  Quay lại
                </Button>
              ) : <div></div>}
              
              {currentStep < 4 ? (
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
                  Tiếp tục →
                </Button>
              ) : currentStep === 4 ? (
                <Button onClick={handleCreateReservation} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8">
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-1">
          <BookingSummaryPanel 
            selectedVehicle={selectedVehicle}
            durationHours={durationHours}
            selectedAreaName={selectedAreaName}
            selectedSlotName={selectedSlotName}
            hourlyPrice={hourlyPrice}
            recentHistory={recentHistory}
          />
        </div>
      </div>
    </div>
  );
}
