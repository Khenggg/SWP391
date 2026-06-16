import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CreditCard,
  ReceiptText,
  RadioTower,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { approvalService } from "@/services/approvalService";
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { formatDateTime, formatVND } from "@/lib/format";
import { DetailTile, PageShell, PageHeader } from "@/components/layout/PageScaffold";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function normalizePlate(value) {
  return String(value || "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

export default function StaffExitPage() {
  const [cardCode, setCardCode] = useState("CARD-0002");
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState(null);
  const [fee, setFee] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceEvent, setDeviceEvent] = useState(null);
  const [mismatchCase, setMismatchCase] = useState(null);
  const [isCreatingMismatch, setIsCreatingMismatch] = useState(false);
  const processedEventRef = useRef("");

  const loadFee = useCallback(async (targetSession) => {
    if (!targetSession?.id) return null;
    try {
      const preview = await staffSessionService.previewFee(targetSession.id, new Date().toISOString());
      setFee(preview);
      setReceivedAmount(preview.totalAmount ? String(preview.totalAmount) : "0");
      return preview;
    } catch (error) {
      toast.error(error.message || "Không tính được chi phí phiên.");
      return null;
    }
  }, []);

  const runSearch = useCallback(
    async ({ nextCardCode = cardCode, nextPlate = plate } = {}) => {
      const trimmedCard = nextCardCode.trim();
      const trimmedPlate = nextPlate.trim();
      if (!trimmedCard && !trimmedPlate) {
        toast.error("Nhập mã thẻ hoặc biển số để tìm phiên đỗ xe.");
        return;
      }

      setIsLoading(true);
      setMismatchCase(null);
      try {
        const found = await staffSessionService.searchActiveSession({
          cardCode: trimmedCard,
          plate: trimmedPlate,
        });
        setSession(found);
        await loadFee(found);
        
        // Check if there is an existing mismatch case for this session
        try {
          const mismatches = await approvalService.getMismatchCases();
          const matched = mismatches.find((m) => m.sessionId === found.id);
          if (matched) {
            setMismatchCase(matched);
          }
        } catch (err) {
          console.error("Lỗi lấy hồ sơ lệch biển:", err);
        }

        toast.success(`Đã tìm thấy phiên ${found.sessionCode}`);
      } catch (error) {
        setSession(null);
        setFee(null);
        toast.error(error.message || "Không tìm thấy phiên đỗ xe đang hoạt động.");
      } finally {
        setIsLoading(false);
      }
    },
    [cardCode, loadFee, plate]
  );

  const applyExitDeviceEvent = useCallback(
    async (event) => {
      if (event.gateType !== "EXIT" || processedEventRef.current === event.id) return;

      processedEventRef.current = event.id;
      setDeviceEvent(event);
      setCardCode(event.cardCode || "");
      setPlate(event.detectedPlate || "");
      setReceipt(null);
      setMismatchCase(null);

      if (event.cardCode || event.detectedPlate) {
        await runSearch({
          nextCardCode: event.cardCode || "",
          nextPlate: event.detectedPlate || "",
        });
      } else {
        toast.info("Thiết bị cổng ra đã kết nối nhưng chưa có payload thẻ hoặc biển số.");
      }
    },
    [runSearch]
  );

  useEffect(() => {
    const lastEvent = getLastGateScanEvent();
    if (lastEvent) {
      applyExitDeviceEvent(lastEvent);
    }

    return subscribeGateScanEvents(applyExitDeviceEvent);
  }, [applyExitDeviceEvent]);

  // Polling for mismatch approval status updates from manager
  useEffect(() => {
    if (!session || !mismatchCase || mismatchCase.status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const mismatches = await approvalService.getMismatchCases();
        const matched = mismatches.find((m) => m.id === mismatchCase.id);
        if (matched && matched.status !== mismatchCase.status) {
          setMismatchCase(matched);
          toast.info(`Hồ sơ sự cố ${matched.caseCode} đã được cập nhật thành: ${matched.status}`);
        }
      } catch (err) {
        console.error("Lỗi cập nhật trạng thái hồ sơ:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [session, mismatchCase]);

  // Derived state (no intermediate useState + useEffect) - Vercel Best Practices
  const hasMismatch = useMemo(() => {
    if (!session) return false;
    // Compare entry plate with current plate input (which is mutable and can be corrected by staff)
    return normalizePlate(session.plateNumber) !== normalizePlate(plate);
  }, [plate, session]);

  const paymentReady = useMemo(() => {
    return fee && (!fee.paymentRequired || fee.paymentStatus === "PAID" || session?.paymentStatus === "PAID");
  }, [fee, session]);

  const canExit = useMemo(() => {
    if (!paymentReady) return false;
    // Can exit if plates match, OR if the mismatch has been approved by the manager
    return !hasMismatch || mismatchCase?.status === "APPROVE";
  }, [paymentReady, hasMismatch, mismatchCase]);

  const handleSearch = () => runSearch();

  const handlePayCash = async () => {
    if (!session || !fee) return;
    try {
      await staffSessionService.payCash(session.id, Number(receivedAmount || 0));
      setSession((prev) => prev ? { ...prev, paymentStatus: "PAID" } : null);
      setFee((prev) => prev ? { ...prev, paymentStatus: "PAID" } : null);
      toast.success("Đã ghi nhận thanh toán tiền mặt.");
    } catch (error) {
      toast.error(error.message || "Thanh toán thất bại.");
    }
  };

  const handleCreateMismatchCase = async () => {
    if (!session || !deviceEvent?.detectedPlate) return;
    setIsCreatingMismatch(true);
    try {
      const createdCase = await staffSessionService.createMismatchCase({
        sessionId: session.id,
        exitPlateNumber: deviceEvent.detectedPlate,
        reason: `Thiết bị ${deviceEvent.gateCode} đọc ${deviceEvent.detectedPlate}, khác biển số vào ${session.plateNumber}.`,
      });
      setMismatchCase(createdCase);
      toast.success(`Đã tạo hồ sơ lệch biển số ${createdCase.caseCode}.`);
    } catch (error) {
      toast.error(error.message || "Không thể tạo hồ sơ lệch biển số.");
    } finally {
      setIsCreatingMismatch(false);
    }
  };

  const handleCompleteExit = async () => {
    if (!session || !fee) return;
    try {
      const result = await staffSessionService.completeExit(session.id, {
        exitTime: fee.exitTime,
        exitGateCode: deviceEvent?.gateCode || "GATE-OUT-01",
      });
      setReceipt(result.receipt);
      setSession(null);
      setFee(null);
      setDeviceEvent(null);
      toast.success("Đã hoàn tất lượt xe ra và giải phóng slot đỗ.");
    } catch (error) {
      toast.error(error.message || "Không thể xác nhận hoàn tất lượt xe ra.");
    }
  };

  return (
    <PageShell>
      <PageHeader
        eyebrow="Staff · Exit desk"
        title="Cổng ra bãi xe"
        description="Quét thẻ hoặc nhập biển số lúc ra để đối chiếu trực quan thông tin vào/ra, thu phí và hoàn tất lượt gửi."
        icon={ReceiptText}
        meta={deviceEvent ? <Badge variant="secondary" className="w-fit rounded-lg font-mono">{deviceEvent.gateCode} / {deviceEvent.scanType}</Badge> : null}
      />

      {deviceEvent && <DeviceBanner event={deviceEvent} />}

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] mt-6">
        {/* Left Column - Real-time camera feeds and snapshot comparison */}
        <div className="flex flex-col gap-6">
          <CameraComparisonFeed
            entryImage={session?.entryVehicleImageDataUrl}
            exitImage={deviceEvent?.vehicleImageDataUrl}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <ComparisonCard
              title="Ảnh chụp biển số"
              entryImage={session?.entryPlateImageDataUrl}
              exitImage={deviceEvent?.plateImageDataUrl}
            />
            <ComparisonCard
              title="Ảnh chân dung tài xế"
              entryImage={session?.entryDriverImageDataUrl}
              exitImage={deviceEvent?.driverImageDataUrl}
            />
          </div>

          {session && (
            <OCRComparisonCard
              entryPlate={session.plateNumber}
              exitPlate={plate}
              hasMismatch={hasMismatch}
              confidence={deviceEvent?.plateConfidence}
            />
          )}
        </div>

        {/* Right Column - Controls and Details */}
        <div className="flex flex-col gap-6">
          <Card className="app-card">
            <CardHeader>
              <CardTitle>Tra cứu phiên đỗ xe</CardTitle>
              <CardDescription>Quét thẻ NFC lúc ra hoặc nhập biển số để đối soát thông tin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="app-field-label">Mã thẻ NFC</span>
                  <Input
                    name="exit-card-code"
                    autoComplete="off"
                    spellCheck={false}
                    value={cardCode}
                    onChange={(event) => setCardCode(event.target.value.toUpperCase())}
                    placeholder="CARD-0002…"
                    className="font-mono font-bold"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="app-field-label">Biển số xe</span>
                  <Input
                    name="exit-plate"
                    autoComplete="off"
                    spellCheck={false}
                    value={plate}
                    onChange={(event) => setPlate(event.target.value.toUpperCase())}
                    placeholder="51A-12345…"
                    className="font-mono font-bold"
                  />
                </label>
                <Button onClick={handleSearch} disabled={isLoading} className="h-11">
                  <Search aria-hidden="true" data-icon="inline-start" />
                  Tìm phiên đỗ
                </Button>
              </div>
            </CardContent>
          </Card>

          {session && (
            <Card className="app-card">
              <CardHeader>
                <CardTitle>Thông tin phiên vào</CardTitle>
                <CardDescription className="font-mono tabular-nums">{session.sessionCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailTile label="Biển số vào" value={session.plateNumber} mono />
                  <DetailTile label="Thẻ NFC" value={session.cardCode} mono />
                  <DetailTile label="Loại xe" value={session.vehicleTypeName} />
                  <DetailTile label="Khách hàng" value={session.customerType === "MONTHLY" ? "Vé tháng" : "Vãng lai"} />
                  <DetailTile className="col-span-2" label="Thời điểm vào bãi" value={formatDateTime(session.entryTime)} />
                  <DetailTile className="col-span-2" label="Vị trí đỗ" value={`${session.floorCode} / ${session.areaCode} / ${session.slotCode}`} />
                </div>
              </CardContent>
            </Card>
          )}

          {hasMismatch && (
            <Card className="status-warning border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <ShieldAlert aria-hidden="true" className="size-4 text-amber-700" />
                  Cảnh báo lệch biển số
                </CardTitle>
                <CardDescription className="text-amber-800 text-xs">
                  Biển số lúc ra không khớp với dữ liệu lúc vào. Cần tạo hồ sơ chờ Manager duyệt hoặc tự xác thực nếu nhân viên kiểm chứng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mismatchCase ? (
                  <div className="rounded-lg border border-amber-300 bg-white/70 p-3 text-xs font-semibold text-amber-900 font-mono">
                    Đã tạo hồ sơ: {mismatchCase.caseCode} (PENDING)
                  </div>
                ) : (
                  <Button variant="outline" onClick={handleCreateMismatchCase} disabled={isCreatingMismatch} className="w-full border-amber-300 hover:bg-amber-100 text-amber-900">
                    <AlertTriangle aria-hidden="true" data-icon="inline-start" />
                    Tạo hồ sơ sự cố lệch biển
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {session && fee && (
            <PaymentCard
              fee={fee}
              hasMismatch={hasMismatch}
              receivedAmount={receivedAmount}
              setReceivedAmount={setReceivedAmount}
              handlePayCash={handlePayCash}
              handleCompleteExit={handleCompleteExit}
              canExit={canExit}
            />
          )}
        </div>
      </div>

      <ReceiptDialog receipt={receipt} setReceipt={setReceipt} />
    </PageShell>
  );
}

function DeviceBanner({ event }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border status-info p-4 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <RadioTower aria-hidden="true" className="mt-0.5 shrink-0 text-sky-700" />
        <div>
          <p className="font-black">Thiết bị cổng ra: {event.gateCode}</p>
          <p className="text-xs font-semibold text-sky-800">
            Quét lúc <span className="font-mono tabular-nums">{new Date(event.capturedAt).toLocaleTimeString("vi-VN")}</span> bằng {event.scanType}
          </p>
        </div>
      </div>
      <div className="font-mono text-xs font-black rounded bg-sky-100/80 px-2 py-1 text-sky-900">
        {event.cardCode || event.qrToken || event.detectedPlate || "No payload"}
      </div>
    </div>
  );
}

function CameraComparisonFeed({ entryImage, exitImage }) {
  return (
    <Card className="app-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Camera aria-hidden="true" className="size-4" />
          Camera làn xe (Đối chiếu toàn cảnh)
        </CardTitle>
        <CardDescription>So sánh xe lúc vào bãi và lúc ra bãi để kiểm tra màu sắc, kiểu dáng.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Entry Feed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Ảnh lúc vào bãi</span>
              {entryImage && <Badge variant="outline" className="text-[10px] border-emerald-200 bg-emerald-50 text-emerald-800">Đã lưu</Badge>}
            </div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-slate-400">
              {entryImage ? (
                <img src={entryImage} alt="Camera làn vào" width="480" height="270" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500">Không có dữ liệu ảnh xe vào…</span>
              )}
            </div>
          </div>
          {/* Exit Feed */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Ảnh lúc ra bãi (Hiện tại)</span>
              {exitImage && <Badge variant="outline" className="text-[10px] border-sky-200 bg-sky-50 text-sky-800 animate-pulse">Live</Badge>}
            </div>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-slate-400">
              {exitImage ? (
                <img src={exitImage} alt="Camera làn ra" width="480" height="270" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-slate-500 animate-pulse">Chờ tín hiệu từ camera exit…</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonCard({ title, entryImage, exitImage }) {
  return (
    <Card className="app-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2">
          {/* Entry column */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Lúc vào</span>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-background">
              {entryImage ? (
                <img src={entryImage} alt={`${title} lúc vào`} width="240" height="135" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground">Không có ảnh…</span>
              )}
            </div>
          </div>
          {/* Exit column */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wide text-muted-foreground">Lúc ra</span>
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-background">
              {exitImage ? (
                <img src={exitImage} alt={`${title} lúc ra`} width="240" height="135" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-muted-foreground">Chờ thiết bị…</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OCRComparisonCard({ entryPlate, exitPlate, hasMismatch, confidence }) {
  return (
    <Card className="app-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">Đối soát biển số xe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 items-center">
          <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>Biển số vào</span>
              <span>Đăng ký</span>
            </div>
            <div className="font-mono text-xl font-black text-center py-2 bg-background border rounded">{entryPlate || "-- --"}</div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase">
              <span>Biển số ra</span>
              <span className="font-mono tabular-nums">{confidence ? `OCR ${confidence}%` : "Nhập tay"}</span>
            </div>
            <div className={`font-mono text-xl font-black text-center py-2 border rounded ${hasMismatch ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"}`}>
              {exitPlate || "-- --"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentCard({ fee, hasMismatch, receivedAmount, setReceivedAmount, handlePayCash, handleCompleteExit, canExit }) {
  return (
    <Card className="app-card">
      <CardHeader>
        <CardTitle>Thanh toán và biên lai</CardTitle>
        <CardDescription>{fee.rateLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-4 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Thời lượng gửi</span>
              <strong className="tabular-nums">{fee.durationHours} giờ</strong>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Đơn giá</span>
              <strong className="tabular-nums">{formatVND(fee.rate)}</strong>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3 text-base">
              <span className="font-bold">Tổng thu</span>
              <span className="text-2xl font-black text-primary tabular-nums">{formatVND(fee.totalAmount)}</span>
            </div>
          </div>

          {!fee.paymentRequired ? (
            <Badge variant="secondary" className="justify-center rounded-md py-2.5 border border-emerald-100 bg-emerald-50 text-emerald-800 font-bold text-sm">
              <ShieldCheck aria-hidden="true" data-icon="inline-start" className="size-4 mr-1 text-emerald-700" />
              {fee.waiveReason || "Không cần thanh toán"}
            </Badge>
          ) : (
            <label className="flex flex-col gap-2">
              <span className="app-field-label">Số tiền khách đưa</span>
              <Input
                name="exit-received-amount"
                autoComplete="off"
                value={receivedAmount}
                onChange={(event) => setReceivedAmount(event.target.value)}
                inputMode="numeric"
                className="font-mono text-lg font-bold"
              />
              <Button variant="outline" onClick={handlePayCash} className="h-10 border-slate-300">
                <CreditCard aria-hidden="true" data-icon="inline-start" />
                Xác nhận thu tiền mặt
              </Button>
            </label>
          )}

          {hasMismatch && (
            <div className="rounded-lg border status-warning p-3 text-xs font-semibold text-amber-800 bg-amber-50 border-amber-100">
              Đang lệch biển số. Yêu cầu xử lý báo cáo sự cố hoặc chờ Quản lý duyệt trước khi cho xe ra.
            </div>
          )}

          <Button onClick={handleCompleteExit} disabled={!canExit} className="h-11">
            <ReceiptText aria-hidden="true" data-icon="inline-start" />
            Xác nhận xe ra bãi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReceiptDialog({ receipt, setReceipt }) {
  return (
    <Dialog open={Boolean(receipt)} onOpenChange={(open) => !open && setReceipt(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Biên lai đỗ xe thành công</DialogTitle>
          <DialogDescription>Thẻ và vị trí đỗ đã được giải phóng trên hệ thống.</DialogDescription>
        </DialogHeader>
        {receipt && (
          <div className="rounded-lg border bg-muted/20 p-4 font-mono text-sm space-y-2.5">
            <ReceiptLine label="Mã biên lai" value={receipt.receiptCode} />
            <ReceiptLine label="Biển số xe" value={receipt.plateNumber} />
            <ReceiptLine label="Mã thẻ NFC" value={receipt.cardCode} />
            <ReceiptLine label="Thời điểm vào" value={formatDateTime(receipt.entryTime)} />
            <ReceiptLine label="Thời điểm ra" value={formatDateTime(receipt.exitTime)} />
            <div className="mt-4 flex justify-between border-t pt-3 text-base font-bold">
              <span>Tổng tiền thanh toán</span>
              <span className="text-lg text-primary tabular-nums">{formatVND(receipt.totalAmount)}</span>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setReceipt(null)} className="w-full sm:w-auto">Đóng biên lai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptLine({ label, value }) {
  return (
    <div className="flex justify-between text-xs font-medium border-b border-dashed border-slate-200 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}
