import React, { useMemo, useState, useEffect } from "react";
import {
  Camera,
  CarFront,
  Code2,
  CreditCard,
  QrCode,
  RadioTower,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/layout/PageScaffold";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  clearLastGateScanEvent,
  normalizeGateScanEvent,
  sendGateScanEvent,
} from "@/services/gateSimulatorBus";
import { parkingService } from "@/services/parkingService";
import { staffSessionService } from "@/services/staffSessionService";

const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_RESIZED_IMAGE_BYTES = 900 * 1024;
const IMAGE_MAX_WIDTH = 1280;
const IMAGE_MAX_HEIGHT = 960;
const IMAGE_OUTPUT_TYPE = "image/jpeg";
const IMAGE_INITIAL_QUALITY = 0.82;
const IMAGE_MIN_QUALITY = 0.5;

const defaultForm = {
  gateType: "ENTRY",
  scanType: "CARD",
  gateCode: "",
  cardCode: "",
  bookingId: "",
  qrToken: "",
  detectedPlate: "",
  vehicleTypeId: "",
  plateConfidence: 100,
  plateImageDataUrl: "",
  vehicleImageDataUrl: "",
  driverImageDataUrl: "",
};

const scanTypeLabels = {
  CARD: "Thẻ NFC",
  BOOKING_QR: "QR đặt chỗ",
  PLATE_ONLY: "Biển số",
};

function withScanTypeDefaults(form, scanType, gateType = form.gateType) {
  const next = {
    ...form,
    gateType,
    scanType,
  };

  if (scanType === "BOOKING_QR") {
    next.gateType = "ENTRY";
    next.cardCode = "";
  }

  if (scanType === "CARD") {
    next.bookingId = "";
    if (gateType === "ENTRY") next.qrToken = "";
  }

  if (scanType === "PLATE_ONLY") {
    next.cardCode = "";
    next.bookingId = "";
    next.qrToken = "";
  }

  return next;
}

function normalizeBookingToken(value) {
  return String(value || "").trim().replace(/^booking-/i, "").toUpperCase();
}

function isBookingToken(value) {
  return /^BK-\d+/i.test(normalizeBookingToken(value));
}

function generateMockPlateSvg(plateText) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120">
    <rect width="320" height="120" fill="#f8fafc" rx="12"/>
    <rect x="8" y="8" width="304" height="104" fill="#ffffff" stroke="#0f172a" stroke-width="4" rx="8"/>
    <rect x="14" y="14" width="292" height="92" fill="none" stroke="#0f172a" stroke-width="1.5" rx="6"/>
    <circle cx="28" cy="24" r="4" fill="#64748b"/>
    <circle cx="292" cy="24" r="4" fill="#64748b"/>
    <text x="160" y="72" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="#0f172a" text-anchor="middle" letter-spacing="3">${plateText}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function generateMockVehicleSvg(title) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#bg)"/>
    <path d="M50,220 L350,220" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 8"/>
    <path d="M120,170 Q140,110 200,110 Q260,110 280,170 L330,170 Q340,170 340,185 L340,210 Q340,220 330,220 L310,220 Q310,200 290,200 Q270,200 270,220 L130,220 Q130,200 110,200 Q90,200 90,220 L70,220 Q60,220 60,210 L60,185 Q60,170 70,170 Z" fill="#3b82f6" stroke="#60a5fa" stroke-width="3"/>
    <circle cx="110" cy="215" r="22" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
    <circle cx="290" cy="215" r="22" fill="#0284c7" stroke="#ffffff" stroke-width="3"/>
    <rect x="150" y="125" width="100" height="40" rx="4" fill="#93c5fd" opacity="0.6"/>
    <text x="200" y="270" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#f8fafc" text-anchor="middle">${title}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const presets = [
  {
    label: "Vé tháng Cư dân",
    description: "Thẻ C007 + Biển đăng ký 51A-99999",
    values: {
      gateType: "ENTRY",
      scanType: "CARD",
      gateCode: "B1-IN",
      cardCode: "C007",
      bookingId: "",
      qrToken: "",
      detectedPlate: "51A-99999",
      vehicleTypeName: "Xe máy",
      plateConfidence: 98,
      plateImageDataUrl: generateMockPlateSvg("51A-99999"),
      vehicleImageDataUrl: generateMockVehicleSvg("Xe máy cư dân - C007"),
    },
  },
  {
    label: "Vé tháng (Sai biển)",
    description: "Thẻ C007 + Biển 59B-12345 khác đăng ký",
    values: {
      gateType: "ENTRY",
      scanType: "CARD",
      gateCode: "B1-IN",
      cardCode: "C007",
      bookingId: "",
      qrToken: "",
      detectedPlate: "59B-12345",
      vehicleTypeName: "Xe máy",
      plateConfidence: 95,
      plateImageDataUrl: generateMockPlateSvg("59B-12345"),
      vehicleImageDataUrl: generateMockVehicleSvg("Xe máy sai biển - 59B-12345"),
    },
  },
  {
    label: "Vãng lai (Xe máy)",
    description: "Thẻ C004 + Biển 51K-12345",
    values: {
      gateType: "ENTRY",
      scanType: "CARD",
      gateCode: "B1-IN",
      cardCode: "C004",
      bookingId: "",
      qrToken: "",
      detectedPlate: "51K-12345",
      vehicleTypeName: "Xe máy",
      plateConfidence: 96,
      plateImageDataUrl: generateMockPlateSvg("51K-12345"),
      vehicleImageDataUrl: generateMockVehicleSvg("Xe máy vãng lai - C004"),
    },
  },
  {
    label: "Vãng lai (Ô tô)",
    description: "Thẻ C005 + Biển 59H-67890",
    values: {
      gateType: "ENTRY",
      scanType: "CARD",
      gateCode: "B1-IN",
      cardCode: "C005",
      bookingId: "",
      qrToken: "",
      detectedPlate: "59H-67890",
      vehicleTypeName: "Ô tô",
      plateConfidence: 97,
      plateImageDataUrl: generateMockPlateSvg("59H-67890"),
      vehicleImageDataUrl: generateMockVehicleSvg("Ô tô vãng lai - C005"),
    },
  },
  {
    label: "Exit Cư dân",
    description: "Cổng ra B1-OUT + Thẻ C007",
    values: {
      gateType: "EXIT",
      scanType: "CARD",
      gateCode: "B1-OUT",
      cardCode: "C007",
      bookingId: "",
      qrToken: "QR-C007",
      detectedPlate: "51A-99999",
      vehicleTypeName: "Xe máy",
      plateConfidence: 98,
      plateImageDataUrl: generateMockPlateSvg("51A-99999"),
      vehicleImageDataUrl: generateMockVehicleSvg("Xe máy ra cổng - C007"),
    },
  },
  {
    label: "Exit Vãng lai",
    description: "Cổng ra B1-OUT + Thẻ C004",
    values: {
      gateType: "EXIT",
      scanType: "CARD",
      gateCode: "B1-OUT",
      cardCode: "C004",
      bookingId: "",
      qrToken: "QR-C004",
      detectedPlate: "51K-12345",
      vehicleTypeName: "Xe máy",
      plateConfidence: 96,
      plateImageDataUrl: generateMockPlateSvg("51K-12345"),
      vehicleImageDataUrl: generateMockVehicleSvg("Xe vãng lai ra cổng - C004"),
    },
  },
];

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function summarizeDataUrl(dataUrl) {
  if (!dataUrl) return "";
  const [header = "", payload = ""] = dataUrl.split(",");
  const mimeType = header.match(/^data:([^;]+);/)?.[1] || "image";
  const estimatedBytes = Math.round((payload.length * 3) / 4);
  return `[${mimeType}; ${formatBytes(estimatedBytes)}; Data URL hidden in preview]`;
}

function createSafeEventPreview(event) {
  return {
    ...event,
    plateImageDataUrl: summarizeDataUrl(event.plateImageDataUrl),
    vehicleImageDataUrl: summarizeDataUrl(event.vehicleImageDataUrl),
    driverImageDataUrl: summarizeDataUrl(event.driverImageDataUrl),
  };
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không đọc được kích thước ảnh."));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không thể nén ảnh bằng canvas."));
      },
      IMAGE_OUTPUT_TYPE,
      quality
    );
  });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Không thể chuyển ảnh đã resize sang Data URL."));
    reader.readAsDataURL(blob);
  });
}

async function resizeImageFile(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ hỗ trợ file ảnh PNG/JPEG/WebP.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(`Ảnh đầu vào tối đa ${formatBytes(MAX_SOURCE_IMAGE_BYTES)}.`);
  }

  const image = await loadImageFromFile(file);
  const initialScale = Math.min(1, IMAGE_MAX_WIDTH / image.naturalWidth, IMAGE_MAX_HEIGHT / image.naturalHeight);
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  let bestBlob = null;
  let bestWidth = width;
  let bestHeight = height;

  for (let sizeAttempt = 0; sizeAttempt < 5; sizeAttempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Trình duyệt không hỗ trợ canvas resize.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    for (let quality = IMAGE_INITIAL_QUALITY; quality >= IMAGE_MIN_QUALITY; quality -= 0.08) {
      const blob = await canvasToBlob(canvas, quality);
      bestBlob = blob;
      bestWidth = width;
      bestHeight = height;
      if (blob.size <= MAX_RESIZED_IMAGE_BYTES) {
        return {
          dataUrl: await blobToDataUrl(blob),
          width,
          height,
          size: blob.size,
          originalSize: file.size,
        };
      }
    }

    width = Math.max(1, Math.round(width * 0.82));
    height = Math.max(1, Math.round(height * 0.82));
  }

  if (!bestBlob) throw new Error("Không thể resize ảnh đã chọn.");
  return {
    dataUrl: await blobToDataUrl(bestBlob),
    width: bestWidth,
    height: bestHeight,
    size: bestBlob.size,
    originalSize: file.size,
  };
}

export default function GateSimulatorPage() {
  const [form, setForm] = useState(defaultForm);
  const [lastSent, setLastSent] = useState(null);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    parkingService.getVehicleTypes().then((res) => {
      setVehicleTypes(res);
      if (res.length > 0 && !form.vehicleTypeId) {
        setForm(f => ({ ...f, vehicleTypeId: String(res[0].id) }));
      }
    });
  }, []);

  const handleSearchCard = async (cardCode) => {
    if (!cardCode || form.gateType !== "EXIT") return;
    setIsSearching(true);
    try {
      const session = await staffSessionService.getSessionByCardCode(cardCode);
      if (session) {
        setForm(f => ({
          ...f,
          detectedPlate: session.licensePlate || "",
          vehicleTypeId: session.vehicleTypeId ? String(session.vehicleTypeId) : f.vehicleTypeId
        }));
        toast.success("Đã tìm thấy phiên gửi xe theo mã thẻ.");
      }
    } catch (error) {
      toast.error(error.message || "Không tìm thấy phiên gửi xe.");
    } finally {
      setIsSearching(false);
    }
  };

  const scanOptions = form.gateType === "ENTRY"
    ? ["CARD", "BOOKING_QR"]
    : ["CARD", "PLATE_ONLY"];

  const previewEvent = useMemo(
    () => normalizeGateScanEvent({ ...form, id: "preview", capturedAt: new Date().toISOString() }),
    [form]
  );
  const safePreviewEvent = useMemo(() => createSafeEventPreview(previewEvent), [previewEvent]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateScanType = (scanType) => {
    setForm((current) => withScanTypeDefaults(current, scanType));
  };

  const updateGateType = (gateType) => {
    setForm((current) => {
      const scanType = gateType === "ENTRY" && current.scanType === "BOOKING_QR" ? "BOOKING_QR" : "CARD";
      return withScanTypeDefaults(
        {
          ...current,
          gateCode: gateType === "ENTRY" ? (scanType === "BOOKING_QR" ? "GATE-IN-02" : "GATE-IN-01") : "GATE-OUT-01",
        },
        scanType,
        gateType
      );
    });
  };

  const applyPreset = (preset) => {
    setForm((current) => ({ ...current, ...preset.values }));
    toast.info(`Đã nạp preset ${preset.label}.`);
  };

  const handleImageChange = async (key, file) => {
    if (!file) return;
    try {
      const resized = await resizeImageFile(file);
      updateForm(key, resized.dataUrl);
      toast.success(
        `Đã resize ảnh ${resized.width}x${resized.height}: ${formatBytes(resized.originalSize)} -> ${formatBytes(resized.size)}.`
      );
    } catch (error) {
      toast.error(error.message || "Không xử lý được ảnh đã chọn.");
    }
  };

  const handleSend = () => {
    const eventForm =
      form.gateType === "ENTRY" && form.scanType === "CARD" && isBookingToken(form.qrToken)
        ? withScanTypeDefaults({ ...form, bookingId: normalizeBookingToken(form.qrToken) }, "BOOKING_QR", "ENTRY")
        : form;
    const sent = sendGateScanEvent({
      ...eventForm,
      capturedAt: new Date().toISOString(),
    });
    setLastSent(sent);
    toast.success(`Đã gửi ${sent.gateType} / ${scanTypeLabels[sent.scanType]} sang giao diện Staff.`);
  };

  const handleClear = () => {
    clearLastGateScanEvent();
    setLastSent(null);
    toast.success("Đã xóa sự kiện thiết bị mới nhất.");
  };

  const resetImages = () => {
    setForm((current) => ({
      ...current,
      plateImageDataUrl: "",
      vehicleImageDataUrl: "",
      driverImageDataUrl: "",
    }));
  };

  return (
    <PageShell>
      <div className="flex flex-col gap-3 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <RadioTower className="size-6 text-foreground" />
            <h1 className="text-2xl font-black text-foreground">Giả lập thiết bị cổng</h1>
          </div>
          <p className="mt-1 max-w-3xl text-sm font-medium text-muted-foreground">
            Mô phỏng đầu đọc thẻ, QR và camera OCR để đẩy dữ liệu sang màn hình Staff Entry/Exit đang mở cùng domain.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="app-card border-blue-200 bg-blue-50/40">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900">
                <Sparkles className="size-4 text-blue-600 shrink-0" />
                Mẫu test nhanh 1-Click (Presets)
              </CardTitle>
              <CardDescription className="text-xs text-blue-700">
                Bấm vào một mẫu bên dưới để tự động chọn đúng Thẻ, Biển số và Cổng từ Database:
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    className="flex flex-col items-start justify-center h-auto py-2 px-3 bg-white hover:bg-blue-100 hover:border-blue-300 border-blue-200 text-left transition-all shadow-sm rounded-lg"
                    onClick={() => {
                      const nextForm = {
                        ...form,
                        ...preset.values,
                      };
                      setForm(nextForm);
                      const eventForm =
                        nextForm.gateType === "ENTRY" && nextForm.scanType === "CARD" && isBookingToken(nextForm.qrToken)
                          ? withScanTypeDefaults({ ...nextForm, bookingId: normalizeBookingToken(nextForm.qrToken) }, "BOOKING_QR", "ENTRY")
                          : nextForm;
                      const sent = sendGateScanEvent({
                        ...eventForm,
                        capturedAt: new Date().toISOString(),
                      });
                      setLastSent(sent);
                      toast.success(`🚀 Đã gửi mẫu "${preset.label}" sang Staff UI!`);
                    }}
                  >
                    <span className="font-bold text-xs text-blue-950">{preset.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{preset.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="app-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RadioTower className="size-4" />
                Cấu hình tín hiệu
              </CardTitle>
              <CardDescription>Chọn làn, kiểu quét và payload mà thiết bị sẽ gửi.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Cổng vận hành">
                  <div className="grid grid-cols-2 gap-2">
                    <ModeButton active={form.gateType === "ENTRY"} onClick={() => updateGateType("ENTRY")}>
                      Entry
                    </ModeButton>
                    <ModeButton active={form.gateType === "EXIT"} onClick={() => updateGateType("EXIT")}>
                      Exit
                    </ModeButton>
                  </div>
                </Field>

                <Field label="Kiểu quét">
                  <Select value={form.scanType} onValueChange={updateScanType}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scanOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {scanTypeLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Mã làn">
                  <Input value={form.gateCode} onChange={(event) => updateForm("gateCode", event.target.value)} />
                </Field>

                <Field label="Loại xe">
                  <Select value={form.vehicleTypeId} onValueChange={(value) => updateForm("vehicleTypeId", value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map((vt) => (
                        <SelectItem key={vt.id} value={String(vt.id)}>
                          {vt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Mã thẻ">
                  <Input
                    value={form.cardCode}
                    onChange={(event) => updateForm("cardCode", event.target.value.toUpperCase())}
                    onBlur={(event) => handleSearchCard(event.target.value.toUpperCase())}
                    placeholder={form.scanType === "BOOKING_QR" ? "Quét NFC ở bước sau" : ""}
                    disabled={form.scanType === "BOOKING_QR" || form.scanType === "PLATE_ONLY"}
                  />
                </Field>

                <Field label="Booking ID / QR token">
                  <Input
                    value={form.scanType === "BOOKING_QR" ? form.bookingId : form.qrToken}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateForm(form.scanType === "BOOKING_QR" ? "bookingId" : "qrToken", value);
                    }}
                    placeholder={form.scanType === "BOOKING_QR" ? "BK-100001" : ""}
                  />
                </Field>

                <Field label="Biển số OCR">
                  <Input
                    value={form.detectedPlate}
                    onChange={(event) => updateForm("detectedPlate", event.target.value.toUpperCase())}
                    placeholder=""
                  />
                </Field>

                <Field label={`Độ tin cậy OCR: ${form.plateConfidence}%`}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.plateConfidence}
                    onChange={(event) => updateForm("plateConfidence", Number(event.target.value))}
                    className="h-8 w-full accent-foreground"
                  />
                </Field>
              </div>
            </CardContent>
          </Card>

          <Card className="app-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="size-4" />
                Ảnh camera gửi kèm
              </CardTitle>
              <CardDescription>Ảnh đầu vào được tự resize/nén trước khi mã hóa Data URL để demo local.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <ImageUploadField
                  label="Ảnh biển số"
                  image={form.plateImageDataUrl}
                  onChange={(file) => handleImageChange("plateImageDataUrl", file)}
                />
                <ImageUploadField
                  label="Ảnh toàn xe"
                  image={form.vehicleImageDataUrl}
                  onChange={(file) => handleImageChange("vehicleImageDataUrl", file)}
                />
                <ImageUploadField
                  label="Ảnh người lái"
                  image={form.driverImageDataUrl}
                  onChange={(file) => handleImageChange("driverImageDataUrl", file)}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="ghost" onClick={resetImages}>
                  <Trash2 data-icon="inline-start" />
                  Xóa ảnh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="app-soft-grid bg-foreground text-background">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CarFront className="size-4" />
                  Preview thiết bị
                </span>
                <Badge variant="secondary" className="rounded-md">
                  {form.gateType} / {scanTypeLabels[form.scanType]}
                </Badge>
              </CardTitle>
              <CardDescription className="text-background/70">
                Đây là trạng thái tài xế/xe mà nhân viên sẽ nhìn thấy sau khi Send.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <CameraTile label="Biển số" image={form.plateImageDataUrl} />
                <CameraTile label="Toàn xe" image={form.vehicleImageDataUrl} />
                <CameraTile label="Người lái" image={form.driverImageDataUrl} />
              </div>

              <div className="mt-5 grid gap-3 rounded-xl border border-background/15 bg-background/10 p-4 text-sm sm:grid-cols-2">
                <PreviewLine icon={<CreditCard className="size-4" />} label="Thẻ" value={form.cardCode || "--"} />
                <PreviewLine icon={<QrCode className="size-4" />} label="QR" value={form.bookingId || form.qrToken || "--"} />
                <PreviewLine label="Biển số OCR" value={form.detectedPlate || "--"} mono />
                <PreviewLine label="Confidence" value={`${form.plateConfidence}%`} />
              </div>
            </CardContent>
          </Card>

          <Card className="app-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="size-4" />
                Raw event
              </CardTitle>
              <CardDescription>Payload nội bộ được gửi qua BroadcastChannel + localStorage fallback.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">
                {JSON.stringify(safePreviewEvent, null, 2)}
              </pre>
              {lastSent && (
                <div className="mt-3 rounded-xl border bg-muted/50 p-3 text-xs font-semibold text-muted-foreground">
                  Sự kiện gần nhất: <span className="font-mono text-foreground">{lastSent.id}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button type="button" size="lg" onClick={handleSend} className="h-11">
              <Send data-icon="inline-start" />
              Send sang Staff UI
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={handleClear} className="h-11">
              <Trash2 data-icon="inline-start" />
              Clear latest
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
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

function ModeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-8 rounded-lg border px-3 text-sm font-black transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-input bg-background hover:bg-muted",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ImageUploadField({ label, image, onChange }) {
  const inputRef = React.useRef(null);

  const handleBoxClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</span>
        <Upload className="size-4 text-muted-foreground" />
      </div>
      <div 
        className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border bg-background cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={handleBoxClick}
      >
        {image ? (
          <img src={image} alt={label} width="320" height="180" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-muted-foreground flex flex-col items-center gap-2">
            <Upload className="size-5" />
            Bấm để chọn ảnh
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onChange(file);
          }
          // Delay resetting the input value so the browser doesn't invalidate the File object
          setTimeout(() => {
            if (event.target) event.target.value = '';
          }, 1000);
        }}
        className="hidden"
      />
    </div>
  );
}

function CameraTile({ label, image }) {
  return (
    <div className="overflow-hidden rounded-xl border border-background/15 bg-background/10">
      <div className="flex aspect-video items-center justify-center bg-black/30">
        {image ? (
          <img src={image} alt={label} width="320" height="180" className="h-full w-full object-cover" />
        ) : (
          <Camera className="size-6 text-background/40" />
        )}
      </div>
      <div className="px-3 py-2 text-xs font-black uppercase tracking-wide text-background/75">{label}</div>
    </div>
  );
}

function PreviewLine({ icon, label, value, mono }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-background/55">
        {icon}
        {label}
      </div>
      <div className={mono ? "truncate font-mono text-lg font-black" : "truncate font-black"}>{value}</div>
    </div>
  );
}
