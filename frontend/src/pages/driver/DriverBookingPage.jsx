import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { reservationService } from "../../services/reservationService";
import { pricingService } from "../../services/pricingService";
import { Button } from "@/components/ui/button";

import BookingStepper from "../../components/driver/booking/BookingStepper";
import VehicleSelectionStep from "../../components/driver/booking/VehicleSelectionStep";
import TimeSelectionStep from "../../components/driver/booking/TimeSelectionStep";
import LocationSelectionStep from "../../components/driver/booking/LocationSelectionStep";
import BookingSummaryPanel from "../../components/driver/booking/BookingSummaryPanel";
import PaymentStep from "../../components/driver/booking/PaymentStep";

const isConfirmedReservationActive = (reservation) => {
  if (!reservation || reservation.status !== "CONFIRMED") return false;
  if (!reservation.reservationEndTime) return true;

  const expiresAt = new Date(reservation.reservationEndTime).getTime();
  return !Number.isNaN(expiresAt) && expiresAt > Date.now();
};

export default function DriverBookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [areas, setAreas] = useState([]);
  const [recentHistory, setRecentHistory] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [activeReservation, setActiveReservation] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [durationHours, setDurationHours] = useState(3);
  const [selectedAreaId, setSelectedAreaId] = useState(null);
  const [selectedAreaName, setSelectedAreaName] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [selectedSlotName, setSelectedSlotName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedVehicleKey = selectedVehicle
    ? [
        selectedVehicle.id || selectedVehicle.vehicleId || "",
        selectedVehicle.plateNumber || selectedVehicle.plate || "",
        selectedVehicle.vehicleTypeId || selectedVehicle.vehicleTypeName || ""
      ].join("|")
    : null;

  const resetBookingFlow = () => {
    reservationService.clearActiveReservationCache();
    setActiveReservation(null);
    setCurrentStep(1);
    setSelectedVehicle(null);
    setSelectedAreaId(null);
    setSelectedAreaName("");
    setSelectedSlotId(null);
    setSelectedSlotName("");
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true);
      try {
        const [historyResult, pricingResult, activeResult] = await Promise.allSettled([
          reservationService.getHistory(0, 3),
          pricingService.getPublicPricing(),
          reservationService.getActiveReservation()
        ]);

        setVehicles([]);
        setRecentHistory(historyResult.status === "fulfilled" ? historyResult.value || [] : []);
        setPricingRules(pricingResult.status === "fulfilled" ? pricingResult.value || [] : []);

        const activeData = activeResult.status === "fulfilled" ? activeResult.value : null;

        if (!activeData) {
          resetBookingFlow();
          return;
        }

        setActiveReservation(activeData);
        if (activeData.status === "PENDING" && activeData.paymentStatus === "PENDING") {
          setCurrentStep(5);
          return;
        }

        // Nếu có đặt chỗ CONFIRMED đang hoạt động, không tự động chuyển hướng.
        // Cứ để cho tài xế tiếp tục đặt chỗ khác bình thường.
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedVehicle) return;

    let cancelled = false;

    setSelectedAreaId(null);
    setSelectedAreaName("");
    setSelectedSlotId(null);
    setSelectedSlotName("");

    const loadSlotsAndAreas = async () => {
      try {
        const vehicleTypeId =
          selectedVehicle.vehicleTypeId || (selectedVehicle.vehicleTypeName === "Ô Tô" ? 5 : 3);
        const slotsData = await reservationService.getAvailableSlots(vehicleTypeId);
        if (!cancelled) {
          setAvailableSlots(slotsData?.slots || []);
          setAreas(slotsData?.areas || []);
        }

      } catch (error) {
        console.error("Error loading slots:", error);
      }
    };

    loadSlotsAndAreas();

    return () => {
      cancelled = true;
    };
  }, [selectedVehicleKey]);

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
        alert("Vui lòng chọn slot đỗ cụ thể cho ô tô");
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
      const vehicleTypeId =
        selectedVehicle.vehicleTypeId || (selectedVehicle.vehicleTypeName === "Ô Tô" ? 5 : 3);

      const selectedAreaObj = areas.find((a) => a.id === selectedAreaId || a.code === selectedAreaId);
      const floorId = selectedAreaObj?.floorId || 1;

      const res = await reservationService.createReservation(
        selectedVehicle.plateNumber || selectedVehicle.plate,
        vehicleTypeId,
        floorId,
        selectedAreaId,
        durationHours,
        selectedSlotId,
        selectedAreaName,
        selectedSlotName
      );

      setActiveReservation(res);
      setCurrentStep(5);
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
      resetBookingFlow();
      const historyData = await reservationService.getHistory(0, 3);
      setRecentHistory(historyData || []);
    } catch (error) {
      alert(error.message || "Hủy thất bại");
    }
  };

  const handleExpireReservation = async () => {
    if (!activeReservation) return;

    try {
      await reservationService.cancelReservation(activeReservation.id).catch(() => null);
    } finally {
      resetBookingFlow();
      alert("Hết thời gian thanh toán (10 phút). Đơn đặt chỗ đã tự động bị hủy.");
    }
  };

  const handlePaymentComplete = async () => {
    alert("Thanh toán thành công! Bạn sẽ được chuyển sang trang Lịch sử đặt chỗ.");
    navigate("/driver/history");
  };

  const getDynamicHourlyPrice = () => {
    if (!selectedVehicle) return 0;
    const rule = pricingRules.find(
      (r) => r.vehicleTypeName === selectedVehicle.vehicleTypeName && r.status === "ACTIVE"
    );
    return rule ? rule.dayPrice : selectedVehicle.vehicleTypeName === "Ô Tô" ? 20000 : 5000;
  };

  const hourlyPrice = getDynamicHourlyPrice();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-slate-800">
          <span className="text-xl font-black">Đặt chỗ (Reservation)</span>
        </div>
        <Button variant="outline" onClick={() => navigate("/driver/history")} className="font-semibold">
          Xem lịch sử booking
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">Đặt chỗ trước</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Đặt trước chỗ đỗ ô tô tại tầng B2. Giữ chỗ tối đa 10 phút kể từ thời điểm xác nhận.
                </p>
              </div>
              {isInitialLoading && (
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Dang tai du lieu
                </div>
              )}
            </div>

            <BookingStepper currentStep={currentStep} />

            <div className="mt-8 min-h-[300px]">
              {currentStep === 1 && (
                <VehicleSelectionStep
                  vehicles={vehicles}
                  selectedVehicle={selectedVehicle}
                  onSelectVehicle={setSelectedVehicle}
                  onVehicleAdded={(newVehicle) => {
                    setVehicles((prev) => [...prev, newVehicle]);
                    setSelectedVehicle(newVehicle);
                  }}
                />
              )}

              {currentStep === 2 && (
                <TimeSelectionStep durationHours={durationHours} setDurationHours={setDurationHours} />
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
                  vehicleTypeId={selectedVehicle?.vehicleTypeId}
                  vehicleTypeName={selectedVehicle?.vehicleTypeName}
                />
              )}

              {currentStep === 4 && (
                <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Xác nhận thông tin đặt chỗ</h3>
                    <p className="text-slate-500 max-w-md mx-auto text-sm">
                      Vui lòng kiểm tra lại thông tin chi tiết đặt chỗ dưới đây trước khi bấm xác nhận.
                      Hệ thống sẽ giữ chỗ tạm thời trong 10 phút để bạn thực hiện thanh toán.
                    </p>
                  </div>

                  {/* Booking Info Card */}
                  <div className="max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                      <span className="text-sm text-slate-500">Phương tiện</span>
                      <span className="text-sm font-bold text-slate-800 uppercase">
                        {selectedVehicle ? `${selectedVehicle.plateNumber || selectedVehicle.plate} (${selectedVehicle.vehicleTypeName || "Không xác định"})` : "--"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                      <span className="text-sm text-slate-500">Thời gian đỗ dự kiến</span>
                      <span className="text-sm font-bold text-slate-800">
                        {durationHours} giờ
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                      <span className="text-sm text-slate-500">Vị trí đỗ</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-800 block">
                          {selectedAreaName || "Chưa chọn"}
                        </span>
                        {selectedSlotName && (
                          <span className="text-xs text-indigo-600 font-extrabold block mt-0.5">
                            Slot: {selectedSlotName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-bold text-slate-600">Tổng phí tạm tính</span>
                      <span className="text-lg font-black text-indigo-600">
                        {selectedVehicle ? `${(durationHours * hourlyPrice).toLocaleString()} VND` : "0 VND"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <PaymentStep
                  activeReservation={activeReservation}
                  onPaymentComplete={handlePaymentComplete}
                  onCancel={handleCancelReservation}
                  onExpire={handleExpireReservation}
                />
              )}
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6 flex justify-between">
              {currentStep > 1 && currentStep < 5 ? (
                <Button variant="outline" onClick={handlePrevStep} className="font-semibold px-6">
                  Quay lại
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 font-bold px-8">
                  Tiếp tục →
                </Button>
              ) : currentStep === 4 ? (
                <Button
                  onClick={handleCreateReservation}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 font-bold px-8"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận & Thanh toán"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingSummaryPanel
            selectedVehicle={selectedVehicle}
            durationHours={durationHours}
            selectedAreaName={selectedAreaName}
            selectedSlotName={selectedSlotName}
            hourlyPrice={hourlyPrice}
            recentHistory={recentHistory}
            isHistoryLoading={isInitialLoading}
            activeReservation={activeReservation}
          />
        </div>
      </div>
    </div>
  );
}
