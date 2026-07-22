import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { parkingService } from "@/services/parkingService";
import { formatDateTime, formatVND } from "@/lib/format";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  const { data: mismatchStatusData } = useMismatchStatus(session?.sessionId ?? null);
  const mismatchStatus = mismatchStatusData?.status ?? "NONE";
  const managerReason = mismatchStatusData?.managerReason ?? null;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gateResponse, vehicleTypeResponse] = await Promise.all([
          parkingService.getGates("EXIT"),
          parkingService.getVehicleTypes(),
        ]);
        setGates(gateResponse);
        setVehicleTypes(vehicleTypeResponse);
        if (gateResponse[0]) setExitGateId(String(gateResponse[0].id));
      } catch (error) {
        console.error("Failed to load exit metadata", error);
        toast.error("Không thể tải cổng ra hoặc loại xe.");
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(formatDateTime(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const loadFee = useCallback(async (sessionId, lookupId = null, includeLostCardFee = false) => {
    try {
      const result = await staffSessionService.previewFee(sessionId, new Date().toISOString(), includeLostCardFee);
      if (lookupId == null || lookupSequenceRef.current === lookupId) setFee(result);
      return result;
    } catch (error) {
      if (lookupId == null || lookupSequenceRef.current === lookupId) toast.error(error.message || "Không thể tính phí phiên gửi xe.");
      throw error;
    }
  }, []);

  const loadSessionByCard = useCallback(async (rawCardCode, { preserveExitImages = false, silent = false, notifyOnError = true } = {}) => {
    const normalizedCardCode = String(rawCardCode || "").trim().toUpperCase();
    if (!normalizedCardCode) {
      if (!silent) toast.error("Nhập mã thẻ hoặc biển số để tìm phiên đỗ xe.");
      return;
    }

    const lookupId = ++lookupSequenceRef.current;
    setIsLoading(true);
    setSession(null);
    setFee(null);
    setMismatchCase(null);
    if (!preserveExitImages) {
      setExitPlateImageUrl("");
      setExitVehicleImageUrl("");
    }

    try {
      const foundSession = await staffSessionService.searchActiveSession(normalizedCardCode);
      if (lookupSequenceRef.current !== lookupId) return;
      setSession(foundSession);
      setCardCode(foundSession.cardCode || normalizedCardCode);
      setPlate(foundSession.plateNumber || "");
      if (foundSession.customerType === "CASUAL" || foundSession.isCardLost) {
        await loadFee(foundSession.sessionId, lookupId, foundSession.isCardLost);
      }
      if (foundSession.isCardLost) toast.warning("Thẻ của xe này đã được báo mất. Phí phạt sẽ được cộng vào tổng tiền.");
      else if (!silent) toast.success(`Đã tìm thấy phiên đỗ xe ${foundSession.sessionCode}.`);
    } catch (error) {
      if (lookupSequenceRef.current !== lookupId) return;
      setSession(null);
      setFee(null);
      if (notifyOnError) toast.error(error.message || "Không tìm thấy phiên đỗ xe đang hoạt động.");
    } finally {
      if (lookupSequenceRef.current === lookupId) setIsLoading(false);
    }
  }, [loadFee]);

  const runSearch = useCallback(() => loadSessionByCard(cardCode), [cardCode, loadSessionByCard]);

  useEffect(() => {
    if (!session?.pendingOnlinePayment || session.paymentStatus === "PAID") return undefined;
    const intervalId = window.setInterval(() => {
      void loadSessionByCard(session.cardCode, { preserveExitImages: true, silent: true, notifyOnError: false });
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [loadSessionByCard, session?.cardCode, session?.paymentStatus, session?.pendingOnlinePayment]);

  const hasMismatch = useMemo(() => Boolean(session && normalizePlate(session.plateNumber) !== normalizePlate(plate)), [plate, session]);
  const hasRequiredExitImages = Boolean(exitPlateImageUrl && exitVehicleImageUrl);
  const isZeroCharge = useMemo(() => session?.customerType === "CASUAL" && Number(fee?.totalAmount || 0) <= 0, [fee?.totalAmount, session?.customerType]);
  const paymentReady = useMemo(() => session?.customerType === "MONTHLY" || session?.paymentStatus === "PAID" || isZeroCharge, [isZeroCharge, session]);
  const mismatchBlocked = mismatchStatus === "PENDING" || mismatchStatus === "REJECTED";
  const canExit = Boolean(paymentReady && !mismatchBlocked && hasRequiredExitImages);

  const resetPage = useCallback(() => {
    setCardCode("");
    setPlate("");
    setSession(null);
    setFee(null);
    setMismatchCase(null);
    setExitPlateImageUrl("");
    setExitVehicleImageUrl("");
    setOcrConfidence(0.99);
    setIsCashConfirmOpen(false);
  }, []);

  const handleCreateMismatchCase = async () => {
    if (!session) return;
    if (!hasRequiredExitImages) {
      toast.error("Cần tải đủ ảnh biển số và ảnh toàn xe ra trước khi gửi hồ sơ lệch biển số.");
      return;
    }
    setIsCreatingMismatch(true);
    try {
      await staffSessionService.createMismatchCase({
        sessionId: session.sessionId,
        exitPlateNumber: plate,
        reason: "Xác nhận ra xe nhưng biển số khác với lúc vào",
        exitPlateImageUrl,
        exitVehicleImageUrl,
        ocrConfidence,
      });
      toast.success("Đã tạo hồ sơ xử lý sự cố lệch biển số.");
      setMismatchCase({ status: "PENDING" });
    } catch (error) {
      toast.error(error.message || "Không thể tạo hồ sơ lệch biển số.");
    } finally {
      setIsCreatingMismatch(false);
    }
  };

  const handleRequestCash = () => {
    if (!session || !fee || fee.totalAmount <= 0) return;
    setIsCashConfirmOpen(true);
  };

  const handleConfirmCash = async () => {
    if (!session || !fee) return;
    try {
      setIsLoading(true);
      await staffSessionService.payCash({ sessionId: session.sessionId, exitGateId: Number(exitGateId) });
      setIsCashConfirmOpen(false);
      await loadSessionByCard(session.cardCode, { preserveExitImages: true, silent: true });
      toast.success("Đã ghi nhận tiền mặt. Có thể xác nhận xe ra.");
    } catch (error) {
      toast.error(error.message || "Thanh toán tiền mặt thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const ensureExitImages = () => {
    if (hasRequiredExitImages) return true;
    toast.error("Cần tải đủ ảnh biển số và ảnh toàn xe ra trước khi xác nhận xe ra.");
    return false;
  };

  const handleCompleteExitPaid = async () => {
    if (!session || !ensureExitImages()) return;
    try {
      setIsLoading(true);
      await staffSessionService.completeExit(session.sessionId, {
        exitGateId: Number(exitGateId),
        exitPlateNumber: plate || session.plateNumber,
        detectedPlateNumber: plate || session.plateNumber,
        ocrConfidence,
        exitPlateImageUrl,
        exitVehicleImageUrl,
      });
      toast.success(isZeroCharge ? "Đã hoàn tất xe ra bãi, booking chưa phát sinh phí." : "Đã hoàn tất xe ra bãi.");
      resetPage();
    } catch (error) {
      toast.error(error.message || "Xác nhận xe ra thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayOS = async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const result = await staffSessionService.createOnlinePayment({ sessionId: session.sessionId, cardCode: session.cardCode });
      if (result.paymentUrl) {
        window.open(result.paymentUrl, "_blank", "width=800,height=800");
        toast.success("Đã tạo QR PayOS. Chờ webhook xác minh thanh toán.");
      } else {
        toast.info("Phiên này chưa phát sinh phí, có thể xác nhận xe ra.");
      }
      await loadSessionByCard(session.cardCode, { preserveExitImages: true, silent: true });
    } catch (error) {
      toast.error(error.message || "Tạo thanh toán online thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteMonthlyExit = async () => {
    if (!session || !ensureExitImages()) return;
    try {
      setIsLoading(true);
      await staffSessionService.completeMonthlyPassExit(session.sessionId, {
        exitGateId: Number(exitGateId),
        exitPlateNumber: plate || session.plateNumber,
        detectedPlateNumber: plate || session.plateNumber,
        ocrConfidence,
        exitPlateImageUrl,
        exitVehicleImageUrl,
      });
      toast.success("Đã xác nhận xe vé tháng ra bãi.");
      resetPage();
    } catch (error) {
      toast.error(error.message || "Xác nhận xe vé tháng ra bãi thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white shadow-inner">E</div><div><h1 className="leading-none text-lg font-black tracking-tight text-slate-800">Làn Ra 01</h1><p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">Xử lý thu phí và ra xe</p></div></div>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden p-4 lg:p-6">
        <div className="mx-auto grid h-full max-w-[1600px] grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="relative flex min-h-0 flex-col gap-4">
            <ExitSearchSection cardCode={cardCode} setCardCode={setCardCode} runSearch={runSearch} isLoading={isLoading} gates={gates} exitGateId={exitGateId} setExitGateId={setExitGateId} />
            <ExitConfirmation plate={plate} setPlate={setPlate} session={session} hasMismatch={hasMismatch} mismatchCase={mismatchCase} handleCreateMismatchCase={handleCreateMismatchCase} isCreatingMismatch={isCreatingMismatch} currentTime={currentTime} staffName={currentUser?.fullName || currentUser?.username || "Nhân viên trực"} mismatchStatus={mismatchStatus} managerReason={managerReason} vehicleTypes={vehicleTypes} exitPlateImageUrl={exitPlateImageUrl} exitVehicleImageUrl={exitVehicleImageUrl} ocrConfidence={ocrConfidence} />
          </div>
          <div className="min-h-0"><section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex shrink-0 items-center justify-between border-b bg-white p-3"><div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">2</span><h3 className="text-sm font-bold text-slate-800">Thông tin phiên và ảnh xe</h3></div>{session && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Đang hoạt động</span>}</div><div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4"><ExitSessionInfo session={session} vehicleTypes={vehicleTypes} embedded /><div className="border-t border-dashed border-slate-200" /><ExitImageSection session={session} exitPlateImageUrl={exitPlateImageUrl} exitVehicleImageUrl={exitVehicleImageUrl} onPlateImageChange={setExitPlateImageUrl} onVehicleImageChange={setExitVehicleImageUrl} disabled={!session || isLoading} embedded /></div></section></div>
          <div className="flex min-h-0 flex-col gap-4 lg:gap-6"><div className="flex min-h-0 flex-1 flex-col"><ExitFeeSummary fee={fee} /></div><ExitPayment session={session} fee={fee} canExit={canExit} isZeroCharge={isZeroCharge} hasPendingOnlinePayment={Boolean(session?.pendingOnlinePayment)} isLoading={isLoading} handleRequestCash={handleRequestCash} handlePayOS={handlePayOS} handleCompleteExitPaid={handleCompleteExitPaid} handleCompleteMonthlyExit={handleCompleteMonthlyExit} refreshSession={runSearch} mismatchBlocked={mismatchBlocked} mismatchStatus={mismatchStatus} hasExitImages={hasRequiredExitImages} /></div>
        </div>
      </main>
      <Dialog open={isCashConfirmOpen} onOpenChange={setIsCashConfirmOpen}><DialogContent className="sm:max-w-md" showCloseButton={!isLoading}><DialogHeader><DialogTitle>Xác nhận đã thu tiền mặt</DialogTitle><DialogDescription>Chỉ xác nhận sau khi Staff đã nhận đủ tiền. Backend sẽ tự tính lại phí tại thời điểm ghi nhận.</DialogDescription></DialogHeader><div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Tổng cần thu</p><p className="mt-1 text-2xl font-black text-indigo-700">{formatVND(fee?.totalAmount || 0)}</p></div><DialogFooter><Button type="button" variant="outline" onClick={() => setIsCashConfirmOpen(false)} disabled={isLoading}>Hủy</Button><Button type="button" onClick={handleConfirmCash} disabled={isLoading}>{isLoading ? "Đang ghi nhận..." : "Đã thu đủ tiền"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
