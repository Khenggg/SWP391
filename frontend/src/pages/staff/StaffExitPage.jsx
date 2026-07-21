import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { formatDateTime } from "@/lib/format";
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { useMismatchStatus } from "@/hooks/useLicensePlateMismatch";

import ExitSearchSection from "./components/exit/ExitSearchSection";
import ExitSessionInfo from "./components/exit/ExitSessionInfo";
import ExitFeeSummary from "./components/exit/ExitFeeSummary";
import ExitConfirmation from "./components/exit/ExitConfirmation";
import ExitPayment from "./components/exit/ExitPayment";

function normalizePlate(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export default function StaffExitPage() {
  const { currentUser } = useOutletContext() || {};

  const [cardCode, setCardCode] = useState("");
  const [plate, setPlate] = useState("");
  const [exitPlateImageUrl, setExitPlateImageUrl] = useState("");
  const [exitVehicleImageUrl, setExitVehicleImageUrl] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0.99);
  const [session, setSession] = useState(null);
  const [fee, setFee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mismatchCase, setMismatchCase] = useState(null);
  const [isCreatingMismatch, setIsCreatingMismatch] = useState(false);
  const [currentTime, setCurrentTime] = useState(formatDateTime(new Date()));
  const [gates, setGates] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [exitGateId, setExitGateId] = useState("");

  // Poll mismatch approval status whenever a session is loaded
  const { data: mismatchStatusData } = useMismatchStatus(session?.sessionId ?? null);
  const mismatchStatus = mismatchStatusData?.status ?? "NONE";
  const managerReason = mismatchStatusData?.managerReason ?? null;

  useEffect(() => {
    const loadData = async () => {
      try {
        const { parkingService } = await import("@/services/parkingService");
        const [gRes, vRes] = await Promise.all([
          parkingService.getGates("EXIT"),
          parkingService.getVehicleTypes(),
        ]);
        setGates(gRes);
        setVehicleTypes(vRes);
        if (gRes?.length > 0) {
          setExitGateId(String(gRes[0].id));
        }
      } catch (e) {
        console.error("Failed to load gates or vehicle types", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const applyExitDeviceEvent = useCallback((event) => {
    if (event.gateType !== "EXIT") return;
    if (event.cardCode) setCardCode(event.cardCode);
    if (event.detectedPlate) setPlate(event.detectedPlate);
    if (event.plateImageDataUrl) setExitPlateImageUrl(event.plateImageDataUrl);
    if (event.vehicleImageDataUrl) setExitVehicleImageUrl(event.vehicleImageDataUrl);
    if (event.plateConfidence) setOcrConfidence(event.plateConfidence);
  }, []);

  useEffect(() => {
    const lastEvent = getLastGateScanEvent("EXIT");
    if (lastEvent) applyExitDeviceEvent(lastEvent);
    return subscribeGateScanEvents(applyExitDeviceEvent);
  }, [applyExitDeviceEvent]);

  const loadFee = useCallback(async (sessionId) => {
    try {
      const result = await staffSessionService.previewFee(sessionId, new Date().toISOString());
      setFee(result);
    } catch (error) {
      toast.error(error.message || "Không tính được chi phí phiên.");
    }
  }, []);

  const runSearch = useCallback(async () => {
    const trimmedCard = cardCode.trim();
    if (!trimmedCard) {
      toast.error("Nhập mã thẻ để tìm phiên đỗ xe.");
      return;
    }

    setIsLoading(true);
    setMismatchCase(null);
    setFee(null);
    
    try {
      const foundSession = await staffSessionService.searchActiveSession(trimmedCard);
      setSession(foundSession);
      setPlate(foundSession.plateNumber || "");
      
      if (foundSession.customerType === "CASUAL") {
        await loadFee(foundSession.sessionId);
      }
      toast.success(`Đã tìm thấy phiên đỗ xe ${foundSession.sessionCode}`);
    } catch (error) {
      setSession(null);
      toast.error(error.message || "Không tìm thấy phiên đỗ xe đang hoạt động.");
    } finally {
      setIsLoading(false);
    }
  }, [cardCode, loadFee]);

  const hasMismatch = useMemo(() => {
    if (!session) return false;
    return normalizePlate(session.plateNumber) !== normalizePlate(plate);
  }, [plate, session]);

  // Trong thực tế, gọi logic mismatch thật ở đây
  const handleCreateMismatchCase = async () => {
    if (!session) return;
    setIsCreatingMismatch(true);
    try {
      await staffSessionService.createMismatchCase({
        sessionId: session.sessionId,
        exitPlateNumber: plate,
        reason: "Xác nhận ra xe nhưng biển số khác với lúc vào",
      });
      toast.success("Đã tạo hồ sơ xử lý sự cố lệch biển số!");
      setMismatchCase({ status: "PENDING" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCreatingMismatch(false);
    }
  };

  const paymentReady = useMemo(() => {
    if (session?.customerType === "MONTHLY") return true;
    if (session?.paymentStatus === "PAID") return true;
    return !!fee;
  }, [fee, session]);

  // Block payment and exit when mismatch is PENDING or REJECTED
  const mismatchBlocked = mismatchStatus === "PENDING" || mismatchStatus === "REJECTED";

  const canExit = useMemo(() => {
    if (!paymentReady) return false;
    if (mismatchBlocked) return false;
    return true;
  }, [paymentReady, mismatchBlocked]);

  const resetPage = () => {
    setCardCode("");
    setPlate("");
    setSession(null);
    setFee(null);
    setMismatchCase(null);
    setExitPlateImageUrl("");
    setExitVehicleImageUrl("");
    setOcrConfidence(0.99);
  };

  const handlePayCash = async () => {
    if (!session || !fee) return;
    try {
      setIsLoading(true);
      // 1. Tạo giao dịch tiền mặt
      const paymentRes = await staffSessionService.payCash({
        sessionId: session.sessionId,
        amount: fee.amount,
        lostCardFee: fee.lostCardFee,
        totalAmount: fee.totalAmount
      });
      // 2. Hoàn tất ra xe
      await staffSessionService.completeExit(session.sessionId, {
        exitGateId: Number(exitGateId),
        paymentId: paymentRes.paymentId,
        exitPlateNumber: plate || session.plateNumber,
        exitTime: fee.exitTime,
        detectedPlateNumber: plate || session.plateNumber,
        ocrConfidence: ocrConfidence,
        exitPlateImageUrl: exitPlateImageUrl || undefined,
        exitVehicleImageUrl: exitVehicleImageUrl || undefined
      });
      toast.success("Đã thanh toán và hoàn tất ra xe!");
      resetPage();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteExitPaid = async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      await staffSessionService.completeExit(session.sessionId, {
        exitGateId: Number(exitGateId),
        exitPlateNumber: plate || session.plateNumber,
        exitTime: fee?.exitTime,
        detectedPlateNumber: plate || session.plateNumber,
        ocrConfidence: ocrConfidence,
        exitPlateImageUrl: exitPlateImageUrl || undefined,
        exitVehicleImageUrl: exitVehicleImageUrl || undefined
      });
      toast.success("Đã hoàn tất xe ra bãi (Đã thanh toán)!");
      resetPage();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayOS = async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const res = await staffSessionService.createOnlinePayment({
        sessionId: session.sessionId,
        cardCode: session.cardCode
      });
      // Mở PayOS QR trong tab mới (hoặc có thể code dạng iframe/modal sau này)
      window.open(res.paymentUrl, "_blank", "width=800,height=800");
      toast.success("Đã tạo link thanh toán PayOS. Chờ khách quét mã...");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMonthlyExit = async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      await staffSessionService.completeMonthlyPassExit(session.sessionId, {
        exitGateId: Number(exitGateId),
        exitPlateNumber: plate || session.plateNumber,
        detectedPlateNumber: plate || session.plateNumber,
        ocrConfidence: ocrConfidence,
        exitPlateImageUrl: exitPlateImageUrl || undefined,
        exitVehicleImageUrl: exitVehicleImageUrl || undefined
      });
      toast.success("Đã xác nhận xe vé tháng ra bãi!");
      resetPage();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-inner">
            E
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 tracking-tight leading-none">
              Làn Ra 01
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Xử lý thu phí & ra xe
            </p>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 lg:p-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 max-w-[1600px] mx-auto">
          
          {/* COLUMN 1: Tìm kiếm */}
          <div className="flex-[0.4] min-h-0 flex flex-col gap-4 relative">
            <ExitSearchSection
              cardCode={cardCode}
              setCardCode={setCardCode}
              runSearch={runSearch}
              isLoading={isLoading}
              gates={gates}
              exitGateId={exitGateId}
              setExitGateId={setExitGateId}
            />

            <ExitConfirmation
              plate={plate}
              setPlate={setPlate}
              session={session}
              hasMismatch={hasMismatch}
              mismatchCase={mismatchCase}
              handleCreateMismatchCase={handleCreateMismatchCase}
              isCreatingMismatch={isCreatingMismatch}
              currentTime={currentTime}
              staffName={currentUser?.fullName || currentUser?.username || "Nhân viên Trực"}
              mismatchStatus={mismatchStatus}
              managerReason={managerReason}
            />
          </div>

          {/* COLUMN 2: Session Info */}
          <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <ExitSessionInfo session={session} vehicleTypes={vehicleTypes} />
            </div>
          </div>

          {/* COLUMN 3: Fee Summary & Payment */}
          <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <ExitFeeSummary fee={fee} />
            </div>
            <ExitPayment
              session={session}
              fee={fee}
              canExit={canExit}
              isLoading={isLoading}
              handlePayCash={handlePayCash}
              handlePayOS={handlePayOS}
              handleCompleteExitPaid={handleCompleteExitPaid}
              handleCompleteMonthlyExit={handleCompleteMonthlyExit}
              refreshSession={runSearch}
              mismatchBlocked={mismatchBlocked}
              mismatchStatus={mismatchStatus}
            />
          </div>

        </div>
      </main>
    </div>
  );
}
