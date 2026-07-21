import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import EntryActionPanel from "@/components/staff/entry/EntryActionPanel";
import EntryDevicePanel from "@/components/staff/entry/EntryDevicePanel";
import EntryFormPanel from "@/components/staff/entry/EntryFormPanel";
import EntryVerificationPanel from "@/components/staff/entry/EntryVerificationPanel";
import EntrySystemChecksPanel from "@/components/staff/entry/EntrySystemChecksPanel";
import EntrySuggestionPanel from "@/components/staff/entry/EntrySuggestionPanel";
import ImagePreviewDialog from "@/components/staff/entry/ImagePreviewDialog";
import { entryService } from "@/services/entryService";
import {
  getLastGateScanEvent,
  subscribeGateScanEvents,
} from "@/services/gateSimulatorBus";
import { parkingService } from "@/services/parkingService";

const initialForm = {
  entryMode: "CASUAL",
  entryGateId: "",
  cardCode: "",
  reservationCode: "",
  licensePlate: "",
  noPlate: false,
  vehicleDescription: "",
  vehicleTypeId: "",
  detectedPlateNumber: "",
  ocrConfidence: "",
  entryPlateImageUrl: "",
  entryVehicleImageUrl: "",
};

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function requiresSlotFromVehicleTypeId(vehicleTypeId) {
  return Number(vehicleTypeId) === 2;
}

function canReservationProceed(status) {
  return status === "VALID";
}

export default function StaffEntryPage() {
  const processedEventRef = useRef("");
  const [form, setForm] = useState(initialForm);
  const [lastDeviceEvent, setLastDeviceEvent] = useState(null);
  const [cardCheck, setCardCheck] = useState(null);
  const [reservationCheck, setReservationCheck] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isCheckingCard, setIsCheckingCard] = useState(false);
  const [isCheckingReservation, setIsCheckingReservation] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gates, setGates] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gRes, vRes] = await Promise.all([
          parkingService.getGates("ENTRY"),
          parkingService.getVehicleTypes(),
        ]);
        setGates(gRes);
        setVehicleTypes(vRes);
        if (gRes?.length > 0) {
          setForm((prev) => ({ ...prev, entryGateId: String(gRes[0].id) }));
        }
        if (vRes?.length > 0) {
          setForm((prev) => ({
            ...prev,
            vehicleTypeId: prev.vehicleTypeId || String(vRes[0].id),
          }));
        }
      } catch (e) {
        console.error("Failed to load gates/vehicle types", e);
      }
    };
    loadData();
  }, []);

  const setField = useCallback((name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const setEntryMode = useCallback((nextMode) => {
    setForm((current) => {
      const nextForm = { ...current, entryMode: nextMode };

      if (nextMode !== "RESERVATION") {
        nextForm.reservationCode = "";
      }

      if (nextMode === "MONTHLY") {
        nextForm.noPlate = false;
        nextForm.vehicleDescription = "";
      }

      return nextForm;
    });

    if (nextMode !== "RESERVATION") {
      setReservationCheck(null);
    }

    if (nextMode !== "CASUAL") {
      setSuggestion(null);
    }
  }, []);

  const resetFlow = useCallback(() => {
    setForm((current) => ({
      ...initialForm,
      entryGateId: current.entryGateId,
    }));
    setCardCheck(null);
    setReservationCheck(null);
    setSuggestion(null);
    setLastDeviceEvent(null);
  }, []);

  const resolveGateId = useCallback((overrideGateId) => {
    const direct = parseNumber(overrideGateId);
    if (direct != null && direct > 0) return direct;

    const gateStr = String(overrideGateId || "").trim().toUpperCase();
    if (gateStr) {
      const matched = gates.find(
        (g) => String(g.gateCode || "").trim().toUpperCase() === gateStr
      );
      if (matched) return matched.id;

      const KNOWN_GATE_MAP = {
        "B1-IN": 1,
        "B1-OUT": 2,
        "B2-IN": 3,
        "B2-OUT": 4,
        "B3-IN": 5,
        "B3-OUT": 6,
      };
      if (KNOWN_GATE_MAP[gateStr]) return KNOWN_GATE_MAP[gateStr];
    }

    const currentGateId = parseNumber(form.entryGateId);
    if (currentGateId != null && currentGateId > 0) return currentGateId;

    return gates[0]?.id ?? 1;
  }, [form.entryGateId, gates]);

  const handleCheckCard = useCallback(async (overrideCardCode, overrideGateId) => {
    const cardCode = normalizeText(overrideCardCode || form.cardCode);
    const entryGateId = resolveGateId(overrideGateId);
    if (!cardCode || entryGateId == null) {
      toast.error("Nhập mã thẻ và chọn cổng vào hợp lệ trước khi kiểm tra.");
      return;
    }

    setIsCheckingCard(true);
    try {
      const result = await entryService.checkCardEntry({
        cardCode,
        entryGateId,
      });

      setCardCheck(result);

      if (result.entryCardType === "MONTHLY") {
        setReservationCheck(null);
        setSuggestion(null);
        setForm((current) => {
          const effectivePlate = current.licensePlate || current.detectedPlateNumber || "";
          const normInput = String(effectivePlate).replace(/[^A-Z0-9]/gi, "").toUpperCase();
          const normRegistered = String(result.plateNumber || "").replace(/[^A-Z0-9]/gi, "").toUpperCase();
          const isMismatch = Boolean(normInput && normRegistered && normInput !== normRegistered);

          if (isMismatch) {
            toast.error(
              `⚠️ Lệch biển số! Biển quét (${effectivePlate}) KHÔNG KHỚP với biển đăng ký vé tháng (${result.plateNumber})`,
              { duration: 6000 }
            );
          } else {
            toast.success("Đã xác định thẻ tháng (Cư dân) hợp lệ.");
          }

          return {
            ...current,
            entryMode: "MONTHLY",
            entryGateId: String(entryGateId),
            noPlate: false,
            vehicleDescription: "",
            licensePlate: effectivePlate,
            vehicleTypeId: result.vehicleTypeId
              ? String(result.vehicleTypeId)
              : current.vehicleTypeId,
          };
        });
      } else {
        setForm((current) => ({
          ...current,
          entryMode: current.entryMode === "MONTHLY" ? "CASUAL" : current.entryMode,
          entryGateId: String(entryGateId),
        }));
        toast.success("Thẻ hợp lệ cho luồng khách vãng lai.");
      }
    } catch (error) {
      setCardCheck(null);
      toast.error(error.message || "Kiểm tra thẻ thất bại.");
    } finally {
      setIsCheckingCard(false);
    }
  }, [form.cardCode, resolveGateId]);

  const handleCheckReservation = useCallback(async (overrideReservationCode, overrideGateId) => {
    const reservationCode = normalizeText(overrideReservationCode || form.reservationCode);
    const entryGateId = resolveGateId(overrideGateId);
    if (!reservationCode || entryGateId == null) {
      toast.error("Nhập mã booking và chọn cổng vào hợp lệ trước khi kiểm tra.");
      return;
    }

    setIsCheckingReservation(true);
    try {
      const result = await entryService.checkReservationEntry({
        reservationCode,
        entryGateId,
      });

      setReservationCheck(result);
      setSuggestion(null);
      setForm((current) => ({
        ...current,
        entryMode: "RESERVATION",
        entryGateId: String(entryGateId),
        noPlate: result.plateRequiredAtEntry ? false : current.noPlate,
        vehicleDescription: result.plateRequiredAtEntry
          ? ""
          : current.vehicleDescription,
        licensePlate: result.plateNumber || current.licensePlate,
        vehicleTypeId: result.vehicleTypeId
          ? String(result.vehicleTypeId)
          : current.vehicleTypeId,
      }));

      if (result.status === "VALID") {
        toast.success("Booking hợp lệ cho xe vào.");
      } else if (result.status === "EXPIRED") {
        toast.error("Booking đã hết hạn.");
      } else if (result.status === "PAYMENT_PENDING") {
        toast.error("Booking chưa thanh toán.");
      } else if (result.status === "ALREADY_CHECKED_IN") {
        toast.error("Booking này đã được check-in trước đó.");
      } else if (result.status === "CANCELLED") {
        toast.error("Booking đã bị hủy.");
      } else if (result.status === "NOT_FOUND") {
        toast.error("Không tìm thấy booking.");
      } else {
        toast.error(`Trạng thái booking: ${result.status}`);
      }
    } catch (error) {
      setReservationCheck(null);
      toast.error(error.message || "Kiểm tra booking thất bại.");
    } finally {
      setIsCheckingReservation(false);
    }
  }, [form.reservationCode, resolveGateId]);

  const applyEntryDeviceEvent = useCallback((event) => {
    if (event.gateType !== "ENTRY" || processedEventRef.current === event.id) {
      return;
    }

    processedEventRef.current = event.id;
    setLastDeviceEvent(event);

    const targetCardCode = event.cardCode;
    const targetReservationCode = event.qrToken || event.bookingId;
    const isBookingScan = event.scanType === "BOOKING_QR" || (targetReservationCode && /^BK-/i.test(targetReservationCode));
    const matchedGateId = resolveGateId(event.gateCode || event.gateId);

    setForm((current) => {
      let nextMode = current.entryMode;
      if (isBookingScan) {
        nextMode = "RESERVATION";
      }

      return {
        ...current,
        entryMode: nextMode,
        entryGateId: matchedGateId ? String(matchedGateId) : current.entryGateId,
        cardCode: targetCardCode || current.cardCode,
        licensePlate: event.detectedPlate || current.licensePlate,
        detectedPlateNumber: event.detectedPlate || current.detectedPlateNumber,
        vehicleTypeId: event.vehicleTypeId || current.vehicleTypeId,
        ocrConfidence:
          event.plateConfidence != null
            ? String(event.plateConfidence)
            : current.ocrConfidence,
        entryPlateImageUrl:
          event.plateImageDataUrl || current.entryPlateImageUrl,
        entryVehicleImageUrl:
          event.vehicleImageDataUrl || current.entryVehicleImageUrl,
        reservationCode: targetReservationCode || current.reservationCode,
      };
    });

    // Auto check card or reservation if code provided
    if (isBookingScan && targetReservationCode) {
      setTimeout(() => {
        void handleCheckReservation(targetReservationCode, matchedGateId);
      }, 100);
    } else if (targetCardCode) {
      setTimeout(() => {
        void handleCheckCard(targetCardCode, matchedGateId);
      }, 100);
    }
  }, [handleCheckCard, handleCheckReservation, resolveGateId]);

  useEffect(() => {
    const lastEvent = getLastGateScanEvent("ENTRY");
    if (lastEvent) {
      applyEntryDeviceEvent(lastEvent);
    }

    return subscribeGateScanEvents(applyEntryDeviceEvent);
  }, [applyEntryDeviceEvent]);

  const derivedVehicleTypeId = useMemo(() => {
    if (form.entryMode === "MONTHLY") {
      return cardCheck?.vehicleTypeId ? String(cardCheck.vehicleTypeId) : "";
    }

    if (form.entryMode === "RESERVATION") {
      return reservationCheck?.vehicleTypeId
        ? String(reservationCheck.vehicleTypeId)
        : "";
    }

    return form.vehicleTypeId;
  }, [cardCheck, form.entryMode, form.vehicleTypeId, reservationCheck]);

  const selectedAreaId = useMemo(() => {
    if (form.entryMode === "MONTHLY") {
      return cardCheck?.fixedAreaId ?? null;
    }

    if (form.entryMode === "RESERVATION") {
      return reservationCheck?.reservedAreaId ?? null;
    }

    return suggestion?.suggestedAreaId ?? null;
  }, [cardCheck, form.entryMode, reservationCheck, suggestion]);

  const selectedSlotId = useMemo(() => {
    if (form.entryMode === "MONTHLY") {
      return cardCheck?.fixedSlotId ?? null;
    }

    if (form.entryMode === "RESERVATION") {
      return reservationCheck?.reservedSlotId ?? null;
    }

    return suggestion?.suggestedSlotId ?? null;
  }, [cardCheck, form.entryMode, reservationCheck, suggestion]);

  const noPlateAllowed = useMemo(() => {
    if (form.entryMode === "MONTHLY") {
      return false;
    }

    if (
      form.entryMode === "RESERVATION" &&
      reservationCheck?.plateRequiredAtEntry
    ) {
      return false;
    }

    return !requiresSlotFromVehicleTypeId(derivedVehicleTypeId);
  }, [derivedVehicleTypeId, form.entryMode, reservationCheck]);

  useEffect(() => {
    if (!noPlateAllowed && form.noPlate) {
      setForm((current) => ({
        ...current,
        noPlate: false,
        vehicleDescription: "",
      }));
    }
  }, [form.noPlate, noPlateAllowed]);

  const canCheckCard = Boolean(
    normalizeText(form.cardCode) && parseNumber(form.entryGateId)
  );
  const canCheckReservation = Boolean(
    form.entryMode === "RESERVATION" &&
      normalizeText(form.reservationCode) &&
      parseNumber(form.entryGateId)
  );
  const canLoadSuggestion = Boolean(
    form.entryMode === "CASUAL" &&
      derivedVehicleTypeId &&
      parseNumber(form.entryGateId)
  );

  const isMonthlyPlateMismatch = useMemo(() => {
    const inputPlate = form.licensePlate || form.detectedPlateNumber || "";
    if (form.entryMode !== "MONTHLY" || !cardCheck?.plateNumber || !inputPlate) {
      return false;
    }

    const normInput = String(inputPlate).replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const normRegistered = String(cardCheck.plateNumber).replace(/[^A-Z0-9]/gi, "").toUpperCase();
    return Boolean(normInput && normRegistered && normInput !== normRegistered);
  }, [cardCheck, form.entryMode, form.licensePlate, form.detectedPlateNumber]);

  const canSubmit = useMemo(() => {
    if (!normalizeText(form.cardCode)) return false;
    if (!parseNumber(form.entryGateId)) return false;

    if (form.entryMode === "CASUAL") {
      if (!derivedVehicleTypeId || !suggestion?.suggestionToken) return false;
      if (form.noPlate) {
        return noPlateAllowed && Boolean(normalizeText(form.vehicleDescription));
      }
      return Boolean(normalizeText(form.licensePlate));
    }

    if (form.entryMode === "MONTHLY") {
      if (isMonthlyPlateMismatch) return false;
      return Boolean(
        normalizeText(form.licensePlate) &&
          cardCheck?.monthlyPassId &&
          cardCheck?.monthlyEntryToken
      );
    }

    if (
      !reservationCheck?.reservationId ||
      !reservationCheck?.reservationEntryToken ||
      !canReservationProceed(reservationCheck?.status)
    ) {
      return false;
    }

    if (reservationCheck?.plateRequiredAtEntry) {
      return Boolean(normalizeText(form.licensePlate));
    }

    if (form.noPlate) {
      return noPlateAllowed && Boolean(normalizeText(form.vehicleDescription));
    }

    return Boolean(normalizeText(form.licensePlate));
  }, [
    cardCheck,
    derivedVehicleTypeId,
    form,
    isMonthlyPlateMismatch,
    noPlateAllowed,
    reservationCheck,
    suggestion,
  ]);

  const workflowChecks = useMemo(
    () => [
      {
        label: "Thẻ hợp lệ",
        passed: Boolean(normalizeText(form.cardCode)),
      },
      {
        label: "Cổng vào hợp lệ",
        passed: Boolean(parseNumber(form.entryGateId)),
      },
      {
        label: form.noPlate ? "Mô tả xe" : "Biển số",
        passed: form.noPlate
          ? Boolean(normalizeText(form.vehicleDescription))
          : Boolean(normalizeText(form.licensePlate)),
      },
      {
        label:
          form.entryMode === "CASUAL"
            ? "Gợi ý vị trí"
            : form.entryMode === "MONTHLY"
              ? isMonthlyPlateMismatch
                ? `Lệch biển vé tháng (${cardCheck?.plateNumber || ""})`
                : "Xác minh vé tháng"
              : "Xác minh booking",
        passed:
          form.entryMode === "CASUAL"
            ? Boolean(suggestion?.suggestionToken)
            : form.entryMode === "MONTHLY"
              ? Boolean(cardCheck?.monthlyEntryToken) && !isMonthlyPlateMismatch
              : Boolean(reservationCheck?.reservationEntryToken),
      },
      {
        label: "Quy tắc không biển số",
        passed: !form.noPlate || noPlateAllowed,
      },
    ],
    [cardCheck, form, isMonthlyPlateMismatch, noPlateAllowed, reservationCheck, suggestion]
  );

  const handleLoadSuggestion = async () => {
    const entryGateId = parseNumber(form.entryGateId);
    const vehicleTypeId = parseNumber(derivedVehicleTypeId);
    if (!canLoadSuggestion || entryGateId == null || vehicleTypeId == null) {
      toast.error("Nhập loại xe và cổng vào hợp lệ trước khi lấy gợi ý.");
      return;
    }

    setIsLoadingSuggestion(true);
    try {
      const result = await entryService.getLocationSuggestion({
        vehicleTypeId,
        entryGateId,
      });
      setSuggestion(result);
      toast.success("Đã lấy gợi ý vị trí đỗ.");
    } catch (error) {
      setSuggestion(null);
      toast.error(error.message || "Lấy gợi ý vị trí thất bại.");
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const buildCreatePayload = () => {
    const entryGateId = parseNumber(form.entryGateId);
    const vehicleTypeId = parseNumber(derivedVehicleTypeId);

    if (entryGateId == null || vehicleTypeId == null) {
      throw new Error("VehicleTypeId hoặc EntryGateId không hợp lệ.");
    }

    const detectedNormalizedPlateNumber = normalizeText(form.detectedPlateNumber)
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase();

    const basePayload = {
      entryMode: form.entryMode,
      cardCode: normalizeText(form.cardCode),
      licensePlate: form.noPlate ? null : normalizeText(form.licensePlate),
      noPlate: form.noPlate,
      vehicleDescription: normalizeText(form.vehicleDescription) || null,
      vehicleTypeId,
      entryGateId,
      selectedAreaId,
      selectedSlotId,
      entryPlateImageUrl: normalizeText(form.entryPlateImageUrl) || null,
      entryVehicleImageUrl: normalizeText(form.entryVehicleImageUrl) || null,
      detectedPlateNumber: normalizeText(form.detectedPlateNumber) || null,
      detectedNormalizedPlateNumber: detectedNormalizedPlateNumber || null,
      ocrConfidence: form.ocrConfidence ? Number(form.ocrConfidence) : null,
    };

    if (form.entryMode === "CASUAL") {
      return {
        ...basePayload,
        suggestionToken: suggestion?.suggestionToken || null,
      };
    }

    if (form.entryMode === "MONTHLY") {
      return {
        ...basePayload,
        monthlyPassId: cardCheck?.monthlyPassId || null,
        monthlyEntryToken: cardCheck?.monthlyEntryToken || null,
      };
    }

    return {
      ...basePayload,
      reservationId: reservationCheck?.reservationId || null,
      reservationEntryToken: reservationCheck?.reservationEntryToken || null,
    };
  };

  const handleCreateEntry = async () => {
    if (!canSubmit) {
      toast.error("Hoàn thiện các bước xác minh trước khi tạo entry.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildCreatePayload();
      const result = await entryService.createEntry(payload);
      toast.success(`Đã tạo phiên ${result.sessionCode}.`);
      setCardCheck(null);
      setReservationCheck(null);
      setSuggestion(null);
      setForm((current) => ({
        ...initialForm,
        entryGateId: current.entryGateId,
      }));
    } catch (error) {
      toast.error(error.message || "Tạo entry thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectBookingMode = useCallback(
    (mode) => {
      if (mode === "RESERVATION") {
        setEntryMode("RESERVATION");
        return;
      }

      if (cardCheck?.entryCardType === "MONTHLY") {
        setEntryMode("MONTHLY");
        return;
      }

      setEntryMode("CASUAL");
    },
    [cardCheck, setEntryMode]
  );

  const handleRetryCurrentStep = useCallback(() => {
    if (form.entryMode === "RESERVATION") {
      void handleCheckReservation();
      return;
    }

    if (form.entryMode === "MONTHLY") {
      void handleCheckCard();
      return;
    }

    void handleLoadSuggestion();
  }, [form.entryMode, handleLoadSuggestion, handleCheckCard, handleCheckReservation]);

  const canRetryCurrentStep = useMemo(() => {
    if (form.entryMode === "RESERVATION") {
      return canCheckReservation && !isCheckingReservation;
    }

    if (form.entryMode === "MONTHLY") {
      return canCheckCard && !isCheckingCard;
    }

    return canLoadSuggestion && !isLoadingSuggestion;
  }, [
    canCheckCard,
    canCheckReservation,
    canLoadSuggestion,
    form.entryMode,
    isCheckingCard,
    isCheckingReservation,
    isLoadingSuggestion,
  ]);

  return (
    <div className="-m-4 md:-m-6 h-[calc(100dvh-4rem)] flex flex-col bg-slate-50 overflow-hidden text-slate-900">
      <div className="flex-1 min-h-0 p-3 lg:p-4">
        <div className="h-full grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4 flex flex-col gap-4 min-h-0">
            <div className="h-[60%] shrink-0">
              <EntryDevicePanel
                lastDeviceEvent={lastDeviceEvent}
                plateImageUrl={form.entryPlateImageUrl}
                vehicleImageUrl={form.entryVehicleImageUrl}
                onPreviewPlate={() =>
                  setPreviewImage({
                    title: "Entry plate image",
                    image: form.entryPlateImageUrl,
                  })
                }
                onPreviewVehicle={() =>
                  setPreviewImage({
                    title: "Entry vehicle image",
                    image: form.entryVehicleImageUrl,
                  })
                }
              />
            </div>
            <div className="flex-1 min-h-0">
              <EntrySystemChecksPanel
                workflowChecks={workflowChecks}
                canSubmit={canSubmit}
              />
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <EntryFormPanel
                form={form}
                derivedVehicleTypeId={derivedVehicleTypeId}
                onFieldChange={setField}
                onEntryModeChange={setEntryMode}
                onLoadSuggestion={handleLoadSuggestion}
                canLoadSuggestion={canLoadSuggestion}
                isLoadingSuggestion={isLoadingSuggestion}
                noPlateAllowed={noPlateAllowed}
                gates={gates}
                vehicleTypes={vehicleTypes}
              />
            </div>
            <div className="h-[35%] shrink-0">
              <EntrySuggestionPanel suggestion={suggestion} />
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <EntryVerificationPanel
                entryMode={form.entryMode}
                cardCheck={cardCheck}
                reservationCheck={reservationCheck}
                onSelectBookingMode={handleSelectBookingMode}
                isMonthlyPlateMismatch={isMonthlyPlateMismatch}
                detectedPlate={form.licensePlate}
              />
            </div>
            <div className="shrink-0">
              <EntryActionPanel
                entryMode={form.entryMode}
                canSubmit={canSubmit}
                isSubmitting={isSubmitting}
                onCreateEntry={handleCreateEntry}
                onCheckCard={handleCheckCard}
                canCheckCard={canCheckCard}
                isCheckingCard={isCheckingCard}
                onRetryCurrentStep={handleRetryCurrentStep}
                canRetryCurrentStep={canRetryCurrentStep}
                isRetryingCurrentStep={
                  form.entryMode === "RESERVATION"
                    ? isCheckingReservation
                    : form.entryMode === "MONTHLY"
                      ? isCheckingCard
                      : isLoadingSuggestion
                }
                onReset={resetFlow}
              />
            </div>
          </div>
        </div>
      </div>

      <ImagePreviewDialog
        preview={previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      />
    </div>
  );
}
