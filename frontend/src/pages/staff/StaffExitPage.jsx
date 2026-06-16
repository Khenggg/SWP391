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
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { formatDateTime, formatVND } from "@/lib/format";
import { DetailTile, NarrowPageShell, PageHeader } from "@/components/layout/PageScaffold";
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
    const preview = await staffSessionService.previewFee(targetSession.id, new Date().toISOString());
    setFee(preview);
    setReceivedAmount(preview.totalAmount ? String(preview.totalAmount) : "0");
    return preview;
  }, []);

  const runSearch = useCallback(
    async ({ nextCardCode = cardCode, nextPlate = plate } = {}) => {
      if (!nextCardCode.trim() && !nextPlate.trim()) {
        toast.error("Nhập mã thẻ hoặc biển số để tìm phiên.");
        return;
      }

      setIsLoading(true);
      setMismatchCase(null);
      try {
        const found = await staffSessionService.searchActiveSession({
          cardCode: nextCardCode,
          plate: nextPlate,
        });
        setSession(found);
        await loadFee(found);
        toast.success(`Đã tìm thấy phiên ${found.sessionCode}`);
      } catch (error) {
        setSession(null);
        setFee(null);
        toast.error(error.message || "Không tìm thấy phiên.");
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
        toast.info("Thiết bị Exit đã gửi event nhưng chưa có mã thẻ hoặc biển số.");
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

  const hasMismatch = useMemo(() => {
    if (!session || !deviceEvent?.detectedPlate) return false;
    return normalizePlate(session.plateNumber) !== normalizePlate(deviceEvent.detectedPlate);
  }, [deviceEvent, session]);

  const handleSearch = () => runSearch();

  const handlePayCash = async () => {
    if (!session || !fee) return;
    try {
      await staffSessionService.payCash(session.id, Number(receivedAmount || 0));
      setSession({ ...session, paymentStatus: "PAID" });
      setFee({ ...fee, paymentStatus: "PAID" });
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
      toast.success("Đã hoàn tất xe ra và giải phóng thẻ/slot.");
    } catch (error) {
      toast.error(error.message || "Không thể hoàn tất xe ra.");
    }
  };

  const paymentReady = fee && (!fee.paymentRequired || fee.paymentStatus === "PAID" || session?.paymentStatus === "PAID");
  const canExit = paymentReady && !hasMismatch;

  return (
    <NarrowPageShell>
      <PageHeader
        eyebrow="Staff · Exit control"
        title="Cổng ra bãi xe"
        description="Tìm active session, tính phí, thu tiền mặt hoặc miễn phí vé tháng trước khi giải phóng thẻ và slot."
        icon={ReceiptText}
        meta={deviceEvent ? <Badge variant="secondary" className="w-fit rounded-md font-mono">{deviceEvent.gateCode} / {deviceEvent.scanType}</Badge> : null}
      />

      {deviceEvent && <DeviceBanner event={deviceEvent} />}

      <Card className="app-card">
        <CardHeader>
          <CardTitle>Tra cứu phiên đỗ xe</CardTitle>
          <CardDescription>Quét thẻ NFC/QR hoặc nhập biển số xe tại làn ra.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Mã thẻ</span>
              <Input
                name="exit-card-code"
                autoComplete="off"
                value={cardCode}
                onChange={(event) => setCardCode(event.target.value.toUpperCase())}
                placeholder="CARD-0002"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="app-field-label">Biển số</span>
              <Input
                name="exit-plate"
                autoComplete="off"
                value={plate}
                onChange={(event) => setPlate(event.target.value.toUpperCase())}
                placeholder="51A-12345"
              />
            </label>
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading} className="w-full md:w-auto">
                <Search data-icon="inline-start" />
                Tìm phiên
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {deviceEvent && (
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera aria-hidden="true" />
              Ảnh thiết bị cổng ra
            </CardTitle>
            <CardDescription>Dùng để đối chiếu trước khi thu tiền và cho xe ra.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <SnapshotCard title="Ảnh biển số" image={deviceEvent.plateImageDataUrl} />
              <SnapshotCard title="Ảnh toàn xe" image={deviceEvent.vehicleImageDataUrl} />
              <SnapshotCard title="Ảnh người lái" image={deviceEvent.driverImageDataUrl} />
            </div>
          </CardContent>
        </Card>
      )}

      {session && fee && (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col gap-6">
            <Card className="app-card">
              <CardHeader>
                <CardTitle>Thông tin phiên</CardTitle>
                <CardDescription>{session.sessionCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <DetailTile label="Biển số lúc vào" value={session.plateNumber} mono />
                  <DetailTile label="Biển số OCR ra" value={deviceEvent?.detectedPlate || plate || "--"} mono />
                  <DetailTile label="Thẻ" value={session.cardCode} mono />
                  <DetailTile label="Loại xe" value={session.vehicleTypeName} />
                  <DetailTile label="Khách hàng" value={session.customerType === "MONTHLY" ? "Vé tháng" : "Vãng lai"} />
                  <DetailTile label="Vào lúc" value={formatDateTime(session.entryTime)} />
                  <DetailTile label="Vị trí" value={`${session.floorCode} / ${session.areaCode} / ${session.slotCode}`} />
                  <DetailTile label="Confidence OCR" value={deviceEvent ? `${deviceEvent.plateConfidence || 0}%` : "--"} />
                </div>
              </CardContent>
            </Card>

            {hasMismatch && (
              <Card className="status-warning">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert aria-hidden="true" />
                    Cảnh báo lệch biển số
                  </CardTitle>
                  <CardDescription className="text-amber-800">
                    Biển số OCR tại cổng ra khác biển số ghi nhận lúc vào. Xe chưa nên hoàn tất exit cho đến khi Manager duyệt.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mismatchCase ? (
                    <div className="rounded-lg border border-amber-300 bg-white/70 p-3 text-sm font-semibold text-amber-900">
                      Đã tạo hồ sơ <span className="font-mono font-black">{mismatchCase.caseCode}</span>, trạng thái chờ Manager duyệt.
                    </div>
                  ) : (
                    <Button variant="outline" onClick={handleCreateMismatchCase} disabled={isCreatingMismatch}>
                      <AlertTriangle data-icon="inline-start" />
                      Tạo hồ sơ lệch biển số
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <PaymentCard
            fee={fee}
            hasMismatch={hasMismatch}
            receivedAmount={receivedAmount}
            setReceivedAmount={setReceivedAmount}
            handlePayCash={handlePayCash}
            handleCompleteExit={handleCompleteExit}
            canExit={canExit}
          />
        </div>
      )}

      <ReceiptDialog receipt={receipt} setReceipt={setReceipt} />
    </NarrowPageShell>
  );
}

function DeviceBanner({ event }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border status-info p-4 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <RadioTower aria-hidden="true" className="mt-0.5 shrink-0" />
        <div>
          <p className="font-black">Dữ liệu từ thiết bị giả lập</p>
          <p className="text-xs font-semibold text-sky-800">
            {event.gateCode} gửi {event.scanType} lúc {new Date(event.capturedAt).toLocaleTimeString("vi-VN")}
          </p>
        </div>
      </div>
      <div className="font-mono text-xs font-black">
        {event.cardCode || event.qrToken || event.detectedPlate || "--"}
      </div>
    </div>
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
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Thời lượng</span>
              <strong>{fee.durationHours} giờ</strong>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Đơn giá</span>
              <strong>{formatVND(fee.rate)}</strong>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="font-bold">Tổng thu</span>
              <span className="text-2xl font-black">{formatVND(fee.totalAmount)}</span>
            </div>
          </div>

          {!fee.paymentRequired ? (
            <Badge variant="secondary" className="justify-center rounded-md py-2">
              <ShieldCheck data-icon="inline-start" />
              {fee.waiveReason || "Không cần thanh toán"}
            </Badge>
          ) : (
            <label className="flex flex-col gap-3">
              <span className="app-field-label">Số tiền nhận</span>
              <Input
                name="exit-received-amount"
                autoComplete="off"
                value={receivedAmount}
                onChange={(event) => setReceivedAmount(event.target.value)}
                inputMode="numeric"
              />
              <Button variant="outline" onClick={handlePayCash}>
                <CreditCard data-icon="inline-start" />
                Xác nhận thu tiền mặt
              </Button>
            </label>
          )}

          {hasMismatch && (
            <div className="rounded-lg border status-warning p-3 text-xs font-semibold">
              Đang có cảnh báo lệch biển số, cần tạo hồ sơ và chờ Manager xử lý trước khi hoàn tất exit.
            </div>
          )}

          <Button onClick={handleCompleteExit} disabled={!canExit}>
            <ReceiptText data-icon="inline-start" />
            Hoàn tất xe ra
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotCard({ title, image }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="mb-2 app-field-label">{title}</p>
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-background">
        {image ? (
          <img src={image} alt={title} width="320" height="180" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-muted-foreground">Chưa có ảnh</span>
        )}
      </div>
    </div>
  );
}

function ReceiptDialog({ receipt, setReceipt }) {
  return (
    <Dialog open={Boolean(receipt)} onOpenChange={(open) => !open && setReceipt(null)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Biên lai đỗ xe</DialogTitle>
          <DialogDescription>Thẻ và vị trí đã được giải phóng cho lượt tiếp theo.</DialogDescription>
        </DialogHeader>
        {receipt && (
          <div className="rounded-lg border bg-background p-4 font-mono text-sm">
            <ReceiptLine label="Mã biên lai" value={receipt.receiptCode} />
            <ReceiptLine label="Biển số" value={receipt.plateNumber} />
            <ReceiptLine label="Thẻ" value={receipt.cardCode} />
            <ReceiptLine label="Vào" value={formatDateTime(receipt.entryTime)} />
            <ReceiptLine label="Ra" value={formatDateTime(receipt.exitTime)} />
            <div className="mt-4 flex justify-between border-t pt-3 text-base">
              <span>Tổng tiền</span>
              <strong>{formatVND(receipt.totalAmount)}</strong>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={() => setReceipt(null)}>Đóng biên lai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptLine({ label, value }) {
  return (
    <div className="mt-2 flex justify-between first:mt-0">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
