import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { formatDateTime, formatVND } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  acknowledgeGateScanEvent,
  consumeLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { useMismatchStatus } from "@/hooks/useLicensePlateMismatch";

import ExitSearchSection from "./components/exit/ExitSearchSection";
import ExitSessionInfo from "./components/exit/ExitSessionInfo";
import ExitFeeSummary from "./components/exit/ExitFeeSummary";
import ExitConfirmation from "./components/exit/ExitConfirmation";
import ExitPayment from "./components/exit/ExitPayment";
import ExitImageSection from "./components/exit/ExitImageSection";

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
  const [isCashConfirmOpen, setIsCashConfirmOpen] = useState(false);
  const lookupSequenceRef = useRef(0);

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

  const loadFee = useCallback(async (sessionId, lookupId = null, includeLostCardFee = false) => {
    try {
      const result = await staffSessionService.previewFee(sessionId, new Date().toISOString(), includeLostCardFee);
      if (lookupId == null || lookupSequenceRef.current === lookupId) {
        setFee(result);
      }
      return result;
    } catch (error) {
      if (lookupId == null || lookupSequenceRef.current === lookupId) {
        toast.error(error.message || "Không tính được chi phí phiên.");
      }
      throw error;
    }
  }, []);

  const loadSessionByCard = useCallback(async (
    rawCardCode,
    { preserveScannedPlate = false, silent = false, notifyOnError = true } = {}
  ) => {
    const trimmedCard = String(rawCardCode || "").trim();
    if (!trimmedCard) {
      if (!silent) toast.error("Nhập mã thẻ để tìm phiên đỗ xe.");
      return;
    }

    const lookupId = ++lookupSequenceRef.current;
    setIsLoading(true);
    setMismatchCase(null);
    setFee(null);

    try {
      const foundSession = await staffSessionService.searchActiveSession(trimmedCard);
      if (lookupSequenceRef.current !== lookupId) return;

      setSession(foundSession);
      setCardCode(foundSession.cardCode || trimmedCard);
      if (!preserveScannedPlate) {
        setPlate(foundSession.plateNumber || "");
      }

      if (foundSession.customerType === "CASUAL" || foundSession.isCardLost) {
        await loadFee(foundSession.sessionId, lookupId, foundSession.isCardLost);
      }
      if (foundSession.isCardLost) {
        toast.warning("Thẻ của xe này đã được báo mất. Phí phạt sẽ được cộng vào tổng tiền.");
      } else if (!silent) {
        toast.success(`Đã tìm thấy phiên đỗ xe ${foundSession.sessionCode}`);
      }
    } catch (error) {
      if (lookupSequenceRef.current !== lookupId) return;
      setSession(null);
      setFee(null);
      if (notifyOnError) {
        toast.error(error.message || "Không tìm thấy phiên đỗ xe đang hoạt động.");
      }
    } finally {
      if (lookupSequenceRef.current === lookupId) {
        setIsLoading(false);
      }
    }
  }, [loadFee]);

  const applyExitDeviceEvent = useCallback((event) => {
    if (event.gateType !== "EXIT") return;

    acknowledgeGateScanEvent(event);
    setSession(null);
    setFee(null);
    setMismatchCase(null);
    setCardCode(event.cardCode || "");
    setPlate(event.detectedPlate || "");
    setExitPlateImageUrl(event.plateImageDataUrl || "");
    setExitVehicleImageUrl(event.vehicleImageDataUrl || "");
    setOcrConfidence(event.plateConfidence ?? 0.99);

    if (event.cardCode) {
      void loadSessionByCard(event.cardCode, {
        preserveScannedPlate: Boolean(event.detectedPlate),
        silent: true,
      });
    }
  }, [loadSessionByCard]);

  useEffect(() => {
    const lastEvent = consumeLastGateScanEvent("EXIT");
    if (lastEvent) applyExitDeviceEvent(lastEvent);
    return subscribeGateScanEvents(applyExitDeviceEvent);
  }, [applyExitDeviceEvent]);

  const runSearch = useCallback(
    () => loadSessionByCard(cardCode),
    [cardCode, loadSessionByCard]
  );

  useEffect(() => {
    if (!session?.pendingOnlinePayment || session.paymentStatus === "PAID") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      void loadSessionByCard(session.cardCode, {
        preserveScannedPlate: true,
        silent: true,
        notifyOnError: false,
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [
    loadSessionByCard,
    session?.cardCode,
    session?.paymentStatus,
    session?.pendingOnlinePayment,
  ]);

  const hasMismatch = useMemo(() => {
    if (!session) return false;
    return normalizePlate(session.plateNumber) !== normalizePlate(plate);
  }, [plate, session]);

  // Trong thực tế, gọi logic mismatch thật ở đây
  const handleCreateMismatchCase = async () => {
    if (!session) return;
    if (!exitVehicleImageUrl) {
      toast.error("Cần ảnh tổng thể xe ra trước khi gửi hồ sơ lệch biển số.");
      return;
    }

    setIsCreatingMismatch(true);
    try {
      await staffSessionService.createMismatchCase({
        sessionId: session.sessionId,
        exitPlateNumber: plate,
        reason: "Xác nhận ra xe nhưng biển số khác với lúc vào",
        exitPlateImageUrl: exitPlateImageUrl || undefined,
        exitVehicleImageUrl,
        ocrConfidence,
      });
      toast.success("Đã tạo hồ sơ xử lý sự cố lệch biển số!");
      setMismatchCase({ status: "PENDING" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCreatingMismatch(false);
    }
  };

  const isZeroCharge = useMemo(
    () => session?.customerType === "CASUAL" && fee?.totalAmount <= 0,
    [fee?.totalAmount, session?.customerType]
  );

  const hasExitVehicleImage = Boolean(exitVehicleImageUrl);

  const paymentReady = useMemo(() => {
    if (session?.customerType === "MONTHLY") return true;
    if (session?.paymentStatus === "PAID") return true;
    return isZeroCharge;
  }, [isZeroCharge, session]);

  // Block payment and exit when mismatch is PENDING or REJECTED
  const mismatchBlocked = mismatchStatus === "PENDING" || mismatchStatus === "REJECTED";

  const canExit = useMemo(() => {
    if (!paymentReady) return false;
    if (mismatchBlocked) return false;
    if (!hasExitVehicleImage) return false;
    return true;
  }, [paymentReady, mismatchBlocked, hasExitVehicleImage]);

  const resetPage = () => {
    setCardCode("");
    setPlate("");
    setSession(null);
    setFee(null);
    setMismatchCase(null);
    setExitPlateImageUrl("");
    setExitVehicleImageUrl("");
    setOcrConfidence(0.99);
    setIsCashConfirmOpen(false);
  };

  const handleRequestCash = () => {
    if (!session || !fee || fee.totalAmount <= 0) return;
    setIsCashConfirmOpen(true);
  };

  const handleConfirmCash = async () => {
    if (!session || !fee) return;
    try {
      setIsLoading(true);
      await staffSessionService.payCash({
        sessionId: session.sessionId,
        exitGateId: Number(exitGateId),
      });
      setIsCashConfirmOpen(false);
      await loadSessionByCard(session.cardCode, {
        preserveScannedPlate: true,
        silent: true,
      });
      toast.success("Đã ghi nhận tiền mặt. Xác nhận xe ra để mở cổng.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteExitPaid = async () => {
    if (!session) return;
    if (!exitVehicleImageUrl) {
      toast.error("Cần ảnh tổng thể xe ra trước khi xác nhận xe ra.");
      return;
    }

    try {
      setIsLoading(true);
      await staffSessionService.completeExit(session.sessionId, {
        exitGateId: Number(exitGateId),
        exitPlateNumber: plate || session.plateNumber,
        detectedPlateNumber: plate || session.plateNumber,
        ocrConfidence: ocrConfidence,
        exitPlateImageUrl: exitPlateImageUrl || undefined,
        exitVehicleImageUrl: exitVehicleImageUrl || undefined
      });
      toast.success(
        isZeroCharge
          ? "Đã hoàn tất xe ra bãi. Booking chưa phát sinh phí."
          : "Đã hoàn tất xe ra bãi (Đã thanh toán)!"
      );
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
      if (!res.paymentUrl) {
        await loadSessionByCard(session.cardCode, {
          preserveScannedPlate: true,
          silent: true,
        });
        toast.info("Phiên này chưa phát sinh phí, có thể xác nhận xe ra.");
        return;
      }

      window.open(res.paymentUrl, "_blank", "width=800,height=800");
      await loadSessionByCard(session.cardCode, {
        preserveScannedPlate: true,
        silent: true,
      });
      toast.success("Đã tạo QR PayOS. Chờ webhook xác minh thanh toán...");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMonthlyExit = async () => {
    if (!session) return;
    if (!exitVehicleImageUrl) {
      toast.error("Cần ảnh tổng thể xe ra trước khi xác nhận xe ra.");
      return;
    }

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

          {/* COLUMN 2: Session Info + Exit Images */}
          <div className="flex flex-col gap-4 lg:gap-6 min-h-0">
            <div className="flex-1 flex flex-col min-h-0">
              <ExitSessionInfo session={session} vehicleTypes={vehicleTypes} />
            </div>
            <ExitImageSection
              session={session}
              exitPlateImageUrl={exitPlateImageUrl}
              exitVehicleImageUrl={exitVehicleImageUrl}
              onPlateImageChange={setExitPlateImageUrl}
              onVehicleImageChange={setExitVehicleImageUrl}
              disabled={!session}
            />
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
              isZeroCharge={isZeroCharge}
              hasPendingOnlinePayment={Boolean(session?.pendingOnlinePayment)}
              isLoading={isLoading}
              handleRequestCash={handleRequestCash}
              handlePayOS={handlePayOS}
              handleCompleteExitPaid={handleCompleteExitPaid}
              handleCompleteMonthlyExit={handleCompleteMonthlyExit}
              refreshSession={runSearch}
              mismatchBlocked={mismatchBlocked}
              mismatchStatus={mismatchStatus}
              hasExitVehicleImage={hasExitVehicleImage}
            />
          </div>

        </div>
      </main>

      <Dialog open={isCashConfirmOpen} onOpenChange={setIsCashConfirmOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
          <DialogHeader>
            <DialogTitle>Xác nhận đã thu tiền mặt</DialogTitle>
            <DialogDescription>
              Chỉ xác nhận sau khi Staff đã nhận đủ tiền từ khách. Hệ thống sẽ tự tính lại phí ở backend.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Tổng cần thu</p>
            <p className="mt-1 text-2xl font-black text-indigo-700">{formatVND(fee?.totalAmount || 0)}</p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCashConfirmOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button type="button" onClick={handleConfirmCash} disabled={isLoading}>
              {isLoading ? "Đang ghi nhận..." : "Đã thu đủ tiền"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
