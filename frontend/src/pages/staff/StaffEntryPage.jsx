import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  CreditCard,
  QrCode,
  RadioTower,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "../../services/bookingService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";

const emptyDeviceDraft = {
  cardCode: "",
  plate: "",
  vehicleTypeName: "Xe Máy",
  gateCode: "GATE-IN-01",
  plateConfidence: 0,
  plateImageDataUrl: "",
  vehicleImageDataUrl: "",
  driverImageDataUrl: "",
};

export default function StaffEntryPage() {
  const [activeTab, setActiveTab] = useState("nfc");
  const [paidBookings, setPaidBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deviceDraft, setDeviceDraft] = useState(emptyDeviceDraft);
  const [lastDeviceEvent, setLastDeviceEvent] = useState(null);
  const processedEventRef = useRef("");

  const loadPaidBookings = useCallback(async (preferredBookingId = "") => {
    try {
      const data = await bookingService.getPaidBookingsForStaff();
      const matchedBooking = preferredBookingId
        ? data.find((booking) => booking.id === preferredBookingId)
        : null;
      const nextBooking = matchedBooking || data[0] || null;

      setPaidBookings(data);
      setSelectedBookingId(nextBooking?.id || "");
      setSelectedBooking(nextBooking);
      return data;
    } catch (error) {
      console.error("Lỗi lấy danh sách đặt giữ chỗ:", error);
      toast.error("Không tải được danh sách booking đã thanh toán.");
      return [];
    }
  }, []);

  const handleBookingChange = (id) => {
    setSelectedBookingId(id);
    setSelectedBooking(paidBookings.find((booking) => booking.id === id) || null);
  };

  const applyEntryDeviceEvent = useCallback(
    async (event) => {
      if (event.gateType !== "ENTRY" || processedEventRef.current === event.id) return;

      processedEventRef.current = event.id;
      setLastDeviceEvent(event);
      setSuccessMsg("");
      setDeviceDraft({
        cardCode: event.cardCode || "",
        plate: event.detectedPlate || "",
        vehicleTypeName: event.vehicleTypeName || "Xe Máy",
        gateCode: event.gateCode || "GATE-IN-01",
        plateConfidence: event.plateConfidence || 0,
        plateImageDataUrl: event.plateImageDataUrl || "",
        vehicleImageDataUrl: event.vehicleImageDataUrl || "",
        driverImageDataUrl: event.driverImageDataUrl || "",
      });

      if (event.scanType === "BOOKING_QR") {
        const requestedBookingId = event.bookingId || event.qrToken || "";
        setActiveTab("qr");
        const bookings = await loadPaidBookings(requestedBookingId);
        const foundBooking = bookings.find((booking) => booking.id === requestedBookingId);

        if (requestedBookingId && !foundBooking) {
          toast.warning(`Thiết bị gửi QR ${requestedBookingId}, nhưng booking này không còn trong danh sách chờ.`);
        } else {
          toast.success(`Đã nhận QR booking ${requestedBookingId || foundBooking?.id || ""}.`);
        }
        return;
      }

      setActiveTab("nfc");
      toast.success(`Đã nhận dữ liệu thẻ ${event.cardCode || "N/A"} từ thiết bị.`);
    },
    [loadPaidBookings]
  );

  useEffect(() => {
    if (activeTab === "qr" && paidBookings.length === 0) {
      loadPaidBookings();
    }
  }, [activeTab, loadPaidBookings, paidBookings.length]);

  useEffect(() => {
    const lastEvent = getLastGateScanEvent();
    if (lastEvent) {
      applyEntryDeviceEvent(lastEvent);
    }

    return subscribeGateScanEvents(applyEntryDeviceEvent);
  }, [applyEntryDeviceEvent]);

  const handleConfirmScan = async () => {
    if (!selectedBookingId) return;
    setIsLoading(true);
    setSuccessMsg("");
    try {
      await bookingService.confirmBookingScan(selectedBookingId);
      setSuccessMsg(`Đã quét và xác nhận vào bãi thành công cho đặt giữ chỗ ${selectedBookingId}!`);
      await loadPaidBookings();
    } catch (error) {
      toast.error(error.message || "Xác nhận quét mã QR thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmNfc = () => {
    if (!deviceDraft.cardCode) {
      toast.error("Chưa có mã thẻ từ thiết bị hoặc nhập tay.");
      return;
    }
    toast.info("Dữ liệu thẻ đã sẵn sàng. Bước ghi phiên vào bãi sẽ nối API backend thật ở phase tiếp theo.");
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-12">
      <div className="flex flex-col gap-3 border-b pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Cổng vào bãi xe</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Xử lý xe vào bằng thẻ NFC hoặc QR đặt chỗ. Dữ liệu thiết bị giả lập chỉ prefill để Staff xác nhận.
          </p>
        </div>
        {lastDeviceEvent && (
          <Badge variant="secondary" className="w-fit rounded-lg px-3 py-1 font-mono">
            {lastDeviceEvent.gateCode} / {lastDeviceEvent.scanType}
          </Badge>
        )}
      </div>

      {lastDeviceEvent && <DeviceBanner event={lastDeviceEvent} />}

      <div className="flex border-b">
        <TabButton active={activeTab === "nfc"} onClick={() => { setActiveTab("nfc"); setSuccessMsg(""); }}>
          <CreditCard className="size-4" />
          Quét thẻ NFC
        </TabButton>
        <TabButton active={activeTab === "qr"} onClick={() => { setActiveTab("qr"); setSuccessMsg(""); }}>
          <QrCode className="size-4" />
          Quét QR đặt chỗ
        </TabButton>
      </div>

      {activeTab === "nfc" ? (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col gap-6">
            <CameraFeed title="Camera làn vào" image={deviceDraft.vehicleImageDataUrl} />
            <div className="grid gap-4 md:grid-cols-3">
              <SnapshotCard title="Ảnh biển số" image={deviceDraft.plateImageDataUrl} />
              <SnapshotCard title="Ảnh người lái" image={deviceDraft.driverImageDataUrl} />
              <Card>
                <CardHeader>
                  <CardTitle>OCR biển số</CardTitle>
                  <CardDescription>Staff có thể chỉnh lại trước khi xác nhận.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border bg-muted/40 p-4 text-center">
                    <div className="font-mono text-2xl font-black">{deviceDraft.plate || "-- --"}</div>
                    <div className="mt-2 text-xs font-bold text-muted-foreground">
                      Confidence {deviceDraft.plateConfidence || 0}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin phiên gửi</CardTitle>
              <CardDescription>Dữ liệu được điền từ đầu đọc thẻ/camera.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Field label="Mã thẻ NFC">
                  <Input
                    value={deviceDraft.cardCode}
                    onChange={(event) => setDeviceDraft((current) => ({ ...current, cardCode: event.target.value.toUpperCase() }))}
                    placeholder="Chờ quét thẻ..."
                    className="font-mono font-bold"
                  />
                </Field>

                <Field label="Biển số xe">
                  <Input
                    value={deviceDraft.plate}
                    onChange={(event) => setDeviceDraft((current) => ({ ...current, plate: event.target.value.toUpperCase() }))}
                    placeholder="Nhập thủ công nếu OCR sai"
                    className="font-mono font-bold"
                  />
                </Field>

                <Field label="Loại xe">
                  <Select
                    value={deviceDraft.vehicleTypeName}
                    onValueChange={(value) => setDeviceDraft((current) => ({ ...current, vehicleTypeName: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Xe Máy">Xe Máy</SelectItem>
                      <SelectItem value="Ô Tô">Ô Tô</SelectItem>
                      <SelectItem value="Xe Đạp">Xe Đạp</SelectItem>
                      <SelectItem value="Xe Vận Chuyển">Xe Vận Chuyển</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-black uppercase text-emerald-700">Gợi ý chỗ đỗ</p>
                  <p className="mt-1 font-mono text-xl font-black text-emerald-800">TẦNG B1 - KHU A</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-700">Còn 25 slot trống, làn {deviceDraft.gateCode}</p>
                </div>

                <Button onClick={handleConfirmNfc} className="h-11">
                  <CheckCircle2 data-icon="inline-start" />
                  Xác nhận vào bãi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex flex-col gap-6">
            <Card className="bg-foreground text-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="size-4" />
                  Scanner QR online
                </CardTitle>
                <CardDescription className="text-background/70">
                  Chọn booking từ danh sách paid hoặc nhận tự động từ simulator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBooking ? (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="rounded-xl border-4 border-cyan-400/50 bg-white p-3 shadow-[0_0_18px_rgba(34,211,238,0.35)]">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedBooking.id}&color=0f172a`}
                        alt="Scanned QR"
                        className="size-32 bg-white"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Đã phát hiện mã đặt chỗ</p>
                      <p className="mt-1 font-mono text-2xl font-black">{selectedBooking.id}</p>
                      <p className="mt-1 text-xs font-semibold text-background/65">
                        Khu vực: <span className="text-background">{selectedBooking.areaName}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-background/45">
                    <QrCode className="size-16" />
                    <p className="max-w-sm text-xs font-bold uppercase tracking-wide">
                      Đang chờ thiết bị hoặc tài xế trình mã QR booking.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <SnapshotCard title="Ảnh biển số" image={deviceDraft.plateImageDataUrl} />
              <SnapshotCard title="Ảnh toàn xe" image={deviceDraft.vehicleImageDataUrl} />
              <SnapshotCard title="Ảnh người lái" image={deviceDraft.driverImageDataUrl} />
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Xác nhận booking QR</CardTitle>
                  <CardDescription>Danh sách booking đã thanh toán, chờ vào cổng.</CardDescription>
                </div>
                <Button
                  onClick={() => loadPaidBookings(selectedBookingId)}
                  variant="ghost"
                  size="icon"
                  title="Tải lại danh sách đặt chỗ"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Field label="Mã đặt chỗ QR">
                  {paidBookings.length === 0 ? (
                    <div className="rounded-xl border bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground">
                      Không có booking nào đang chờ quét mã.
                    </div>
                  ) : (
                    <Select value={selectedBookingId} onValueChange={handleBookingChange}>
                      <SelectTrigger className="w-full font-mono">
                        <SelectValue placeholder="Chọn mã đặt chỗ QR" />
                      </SelectTrigger>
                      <SelectContent>
                        {paidBookings.map((booking) => (
                          <SelectItem key={booking.id} value={booking.id}>
                            {booking.id} ({booking.username} - {booking.vehicleTypeName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>

                {selectedBooking && (
                  <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-xs font-semibold">
                    <DetailLine label="Người đặt chỗ" value={selectedBooking.username} />
                    <DetailLine label="Loại xe" value={selectedBooking.vehicleTypeName} />
                    <DetailLine label="Khu vực" value={selectedBooking.areaName} />
                    <DetailLine label="Slot khóa cứng" value={selectedBooking.internalSlotCode} mono />
                    <DetailLine label="Phí đã thanh toán" value={`${selectedBooking.reservationFee.toLocaleString()} đ`} />
                  </div>
                )}

                {lastDeviceEvent?.scanType === "BOOKING_QR" && !selectedBooking && (
                  <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                    <AlertTriangle className="size-4 shrink-0" />
                    QR simulator gửi chưa khớp booking paid-list hiện tại.
                  </div>
                )}

                <Button onClick={handleConfirmScan} disabled={!selectedBookingId || isLoading} className="h-11">
                  {isLoading ? (
                    <>
                      <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Đang xác nhận...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 data-icon="inline-start" />
                      Xác nhận đỗ xe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-black transition-colors",
        active ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DeviceBanner({ event }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-950 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <RadioTower className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-black">Dữ liệu từ thiết bị giả lập</p>
          <p className="text-xs font-semibold text-cyan-800">
            {event.gateCode} gửi {event.scanType} lúc {new Date(event.capturedAt).toLocaleTimeString("vi-VN")}
          </p>
        </div>
      </div>
      <div className="font-mono text-xs font-black">
        {event.cardCode || event.bookingId || event.qrToken || event.detectedPlate || "--"}
      </div>
    </div>
  );
}

function CameraFeed({ title, image }) {
  return (
    <Card className="bg-slate-950 text-white">
      <CardContent className="p-0">
        <div className="relative flex aspect-video items-center justify-center overflow-hidden">
          {image ? (
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Camera className="size-12" />
              <p className="font-mono text-xs font-bold uppercase tracking-widest">Camera feed stream</p>
            </div>
          )}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-black/55 px-2 py-1 text-xs font-black">
            <span className="size-2 rounded-full bg-red-500" />
            REC
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotCard({ title, image }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
          {image ? (
            <img src={image} alt={title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">Chưa có ảnh</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function DetailLine({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono font-black" : "font-bold"}>{value || "--"}</span>
    </div>
  );
}
