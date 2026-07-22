import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import EntryActionPanel from "@/components/staff/entry/EntryActionPanel";
import EntryImageSection from "@/components/staff/entry/EntryImageSection";
import EntryFormPanel from "@/components/staff/entry/EntryFormPanel";
import EntryVerificationPanel from "@/components/staff/entry/EntryVerificationPanel";
import EntrySystemChecksPanel from "@/components/staff/entry/EntrySystemChecksPanel";
import EntrySuggestionPanel from "@/components/staff/entry/EntrySuggestionPanel";
import { entryService } from "@/services/entryService";
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

function formatCardCode(value) {
  const cardCode = String(value || "").trim().toUpperCase();
  if (!cardCode) return "";
  if (/^CARD-?\d+/i.test(cardCode)) {
    return `C${cardCode.replace(/^CARD-?/i, "").padStart(3, "0")}`;
  }
  if (/^\d+$/.test(cardCode)) return `C${cardCode.padStart(3, "0")}`;
  return cardCode;
}

export default function StaffEntryPage() {
  const [form, setForm] = useState(initialForm);
  const [cardCheck, setCardCheck] = useState(null);
  const [reservationCheck, setReservationCheck] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isCheckingCard, setIsCheckingCard] = useState(false);
  const [isCheckingReservation, setIsCheckingReservation] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gates, setGates] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gateResponse, vehicleTypeResponse] = await Promise.all([
          parkingService.getGates("ENTRY"),
          parkingService.getVehicleTypes(),
        ]);
        setGates(gateResponse);
        setVehicleTypes(vehicleTypeResponse);
        setForm((current) => ({
          ...current,
          entryGateId: current.entryGateId || (gateResponse[0] ? String(gateResponse[0].id) : ""),
          vehicleTypeId: current.vehicleTypeId || (vehicleTypeResponse[0] ? String(vehicleTypeResponse[0].id) : ""),
        }));
      } catch (error) {
        console.error("Failed to load entry metadata", error);
        toast.error("Không thể tải cổng vào hoặc loại xe.");
      }
    };
    void loadData();
  }, []);

  const setField = useCallback((name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (["cardCode", "entryGateId", "vehicleTypeId"].includes(name)) {
      setCardCheck(null);
      setSuggestion(null);
    }
    if (["reservationCode", "entryGateId"].includes(name)) {
      setReservationCheck(null);
    }
  }, []);

  const setEntryMode = useCallback((entryMode) => {
    setForm((current) => ({
      ...current,
      entryMode,
      reservationCode: entryMode === "RESERVATION" ? current.reservationCode : "",
      noPlate: entryMode === "MONTHLY" ? false : current.noPlate,
      vehicleDescription: entryMode === "MONTHLY" ? "" : current.vehicleDescription,
    }));
    setSuggestion(null);
    if (entryMode !== "RESERVATION") setReservationCheck(null);
  }, []);

  const resetFlow = useCallback(() => {
    setForm((current) => ({ ...initialForm, entryGateId: current.entryGateId, vehicleTypeId: current.vehicleTypeId }));
    setCardCheck(null);
    setReservationCheck(null);
    setSuggestion(null);
  }, []);

  const entryGateId = parseNumber(form.entryGateId);

  const handleCheckCard = useCallback(async () => {
    const cardCode = formatCardCode(form.cardCode);
    if (!cardCode || entryGateId == null || entryGateId <= 0) {
      toast.error("Nhập mã thẻ và chọn cổng vào hợp lệ trước khi kiểm tra.");
      return;
    }

    setField("cardCode", cardCode);
    setCardCheck(null);
    setSuggestion(null);
    setIsCheckingCard(true);
    try {
      const result = await entryService.checkCardEntry({ cardCode, entryGateId });
      setCardCheck(result);

      if (result.entryCardType === "MONTHLY") {
        setReservationCheck(null);
        setSuggestion(null);
        setForm((current) => ({
          ...current,
          entryMode: "MONTHLY",
          noPlate: false,
          vehicleDescription: "",
          licensePlate: result.plateNumber || current.licensePlate,
          vehicleTypeId: result.vehicleTypeId ? String(result.vehicleTypeId) : current.vehicleTypeId,
        }));
        toast.success("Đã xác minh thẻ tháng cư dân.");
      } else {
        setForm((current) => ({ ...current, entryMode: current.reservationCode ? "RESERVATION" : "CASUAL" }));
        toast.success(form.reservationCode ? "Đã xác minh thẻ lượt cho booking." : "Thẻ hợp lệ cho khách vãng lai.");
      }
    } catch (error) {
      setCardCheck(null);
      setSuggestion(null);
      toast.error(error.message || "Kiểm tra thẻ thất bại.");
    } finally {
      setIsCheckingCard(false);
    }
  }, [entryGateId, form.cardCode, form.reservationCode, setField]);

  const handleCheckReservation = useCallback(async () => {
    const reservationCode = normalizeText(form.reservationCode);
    if (!reservationCode || entryGateId == null || entryGateId <= 0) {
      toast.error("Nhập mã booking và chọn cổng vào hợp lệ trước khi kiểm tra.");
      return;
    }

    setReservationCheck(null);
    setSuggestion(null);
    setIsCheckingReservation(true);
    try {
      const result = await entryService.checkReservationEntry({ reservationCode, entryGateId });
      setReservationCheck(result);
      setForm((current) => ({
        ...current,
        entryMode: "RESERVATION",
        noPlate: result.plateRequiredAtEntry ? false : current.noPlate,
        vehicleDescription: result.plateRequiredAtEntry ? "" : current.vehicleDescription,
        licensePlate: result.plateNumber || current.licensePlate,
        vehicleTypeId: result.vehicleTypeId ? String(result.vehicleTypeId) : current.vehicleTypeId,
      }));

      if (result.status === "VALID") toast.success("Booking hợp lệ cho xe vào.");
      else toast.error(`Booking chưa thể vào bãi: ${result.status || "không hợp lệ"}.`);
    } catch (error) {
      setReservationCheck(null);
      toast.error(error.message || "Kiểm tra booking thất bại.");
    } finally {
      setIsCheckingReservation(false);
    }
  }, [entryGateId, form.reservationCode]);

  const derivedVehicleTypeId = useMemo(() => {
    if (form.entryMode === "MONTHLY") return cardCheck?.vehicleTypeId ? String(cardCheck.vehicleTypeId) : "";
    if (form.entryMode === "RESERVATION") return reservationCheck?.vehicleTypeId ? String(reservationCheck.vehicleTypeId) : "";
    return form.vehicleTypeId;
  }, [cardCheck, form.entryMode, form.vehicleTypeId, reservationCheck]);

  const selectedAreaId = useMemo(() => {
    if (form.entryMode === "MONTHLY") return cardCheck?.fixedAreaId ?? null;
    if (form.entryMode === "RESERVATION") return reservationCheck?.reservedAreaId ?? null;
    return suggestion?.suggestedAreaId ?? null;
  }, [cardCheck, form.entryMode, reservationCheck, suggestion]);

  const selectedSlotId = useMemo(() => {
    if (form.entryMode === "MONTHLY") return cardCheck?.fixedSlotId ?? null;
    if (form.entryMode === "RESERVATION") return reservationCheck?.reservedSlotId ?? null;
    return suggestion?.suggestedSlotId ?? null;
  }, [cardCheck, form.entryMode, reservationCheck, suggestion]);

  const noPlateAllowed = useMemo(() => {
    if (form.entryMode === "MONTHLY") return false;
    if (form.entryMode === "RESERVATION" && reservationCheck?.plateRequiredAtEntry) return false;
    return !requiresSlotFromVehicleTypeId(derivedVehicleTypeId);
  }, [derivedVehicleTypeId, form.entryMode, reservationCheck]);

  useEffect(() => {
    if (!noPlateAllowed && form.noPlate) {
      setForm((current) => ({ ...current, noPlate: false, vehicleDescription: "" }));
    }
  }, [form.noPlate, noPlateAllowed]);

  const isNormalCardVerified = Boolean(
    cardCheck?.entryCardType === "NORMAL" &&
    cardCheck?.cardStatus === "AVAILABLE" &&
    normalizeText(cardCheck?.cardCode).toUpperCase() === normalizeText(form.cardCode).toUpperCase()
  );

  const isMonthlyPlateMismatch = useMemo(() => {
    if (form.entryMode !== "MONTHLY" || !cardCheck?.plateNumber || !form.licensePlate) return false;
    return normalizeText(cardCheck.plateNumber).replace(/[^A-Z0-9]/gi, "").toUpperCase()
      !== normalizeText(form.licensePlate).replace(/[^A-Z0-9]/gi, "").toUpperCase();
  }, [cardCheck, form.entryMode, form.licensePlate]);

  const canCheckCard = Boolean(normalizeText(form.cardCode) && entryGateId && entryGateId > 0);
  const canCheckReservation = Boolean(form.entryMode === "RESERVATION" && normalizeText(form.reservationCode) && entryGateId && entryGateId > 0);
  const canLoadSuggestion = Boolean(form.entryMode === "CASUAL" && isNormalCardVerified && derivedVehicleTypeId && entryGateId && entryGateId > 0);
  const hasEntryImages = Boolean(normalizeText(form.entryPlateImageUrl) && normalizeText(form.entryVehicleImageUrl));

  const canSubmit = useMemo(() => {
    if (!normalizeText(form.cardCode) || !entryGateId || !hasEntryImages) return false;
    if (form.noPlate ? !normalizeText(form.vehicleDescription) || !noPlateAllowed : !normalizeText(form.licensePlate)) return false;

    if (form.entryMode === "CASUAL") return Boolean(isNormalCardVerified && derivedVehicleTypeId && suggestion?.suggestionToken);
    if (form.entryMode === "MONTHLY") return Boolean(cardCheck?.monthlyPassId && cardCheck?.monthlyEntryToken && !isMonthlyPlateMismatch);
    return Boolean(
      isNormalCardVerified &&
      reservationCheck?.reservationId &&
      reservationCheck?.reservationEntryToken &&
      canReservationProceed(reservationCheck?.status)
    );
  }, [cardCheck, derivedVehicleTypeId, entryGateId, form, hasEntryImages, isMonthlyPlateMismatch, isNormalCardVerified, noPlateAllowed, reservationCheck, suggestion]);

  const workflowChecks = useMemo(() => [
    { label: "Thẻ hợp lệ", passed: form.entryMode === "MONTHLY" ? Boolean(cardCheck?.monthlyEntryToken) : isNormalCardVerified },
    { label: "Cổng vào hợp lệ", passed: Boolean(entryGateId && entryGateId > 0) },
    { label: form.noPlate ? "Mô tả xe" : "Biển số", passed: form.noPlate ? Boolean(normalizeText(form.vehicleDescription)) : Boolean(normalizeText(form.licensePlate)) },
    { label: "Ảnh biển số xe vào", passed: Boolean(normalizeText(form.entryPlateImageUrl)) },
    { label: "Ảnh toàn xe vào", passed: Boolean(normalizeText(form.entryVehicleImageUrl)) },
    {
      label: form.entryMode === "CASUAL" ? "Gợi ý vị trí" : form.entryMode === "MONTHLY" ? "Xác minh vé tháng" : "Xác minh booking",
      passed: form.entryMode === "CASUAL" ? Boolean(suggestion?.suggestionToken) : form.entryMode === "MONTHLY" ? Boolean(cardCheck?.monthlyEntryToken) && !isMonthlyPlateMismatch : Boolean(reservationCheck?.reservationEntryToken) && canReservationProceed(reservationCheck?.status),
    },
  ], [cardCheck, entryGateId, form, isMonthlyPlateMismatch, isNormalCardVerified, reservationCheck, suggestion]);

  const handleLoadSuggestion = useCallback(async () => {
    const vehicleTypeId = parseNumber(derivedVehicleTypeId);
    if (!canLoadSuggestion || vehicleTypeId == null || entryGateId == null) {
      toast.error("Kiểm tra thẻ, loại xe và cổng vào trước khi lấy gợi ý.");
      return;
    }
    setIsLoadingSuggestion(true);
    try {
      const result = await entryService.getLocationSuggestion({ vehicleTypeId, entryGateId });
      setSuggestion(result);
      toast.success("Đã lấy gợi ý vị trí đỗ.");
    } catch (error) {
      setSuggestion(null);
      toast.error(error.message || "Lấy gợi ý vị trí thất bại.");
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, [canLoadSuggestion, derivedVehicleTypeId, entryGateId]);

  const buildCreatePayload = () => {
    const vehicleTypeId = parseNumber(derivedVehicleTypeId);
    if (entryGateId == null || vehicleTypeId == null) throw new Error("Cổng vào hoặc loại xe không hợp lệ.");

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
      entryPlateImageUrl: form.entryPlateImageUrl,
      entryVehicleImageUrl: form.entryVehicleImageUrl,
      detectedPlateNumber: form.noPlate ? null : normalizeText(form.licensePlate),
      detectedNormalizedPlateNumber: form.noPlate ? null : normalizeText(form.licensePlate).replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
      ocrConfidence: null,
    };

    if (form.entryMode === "CASUAL") return { ...basePayload, suggestionToken: suggestion?.suggestionToken || null };
    if (form.entryMode === "MONTHLY") return { ...basePayload, monthlyPassId: cardCheck?.monthlyPassId || null, monthlyEntryToken: cardCheck?.monthlyEntryToken || null };
    return { ...basePayload, reservationId: reservationCheck?.reservationId || null, reservationEntryToken: reservationCheck?.reservationEntryToken || null };
  };

  const handleCreateEntry = async () => {
    if (!hasEntryImages) {
      toast.error("Cần tải đủ ảnh biển số và ảnh toàn xe vào trước khi tạo phiên.");
      return;
    }
    if (!canSubmit) {
      toast.error("Hoàn thiện các bước xác minh trước khi tạo phiên.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await entryService.createEntry(buildCreatePayload());
      toast.success(`Đã tạo phiên ${result.sessionCode}.`);
      resetFlow();
    } catch (error) {
      toast.error(error.message || "Tạo phiên vào bãi thất bại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectBookingMode = useCallback((mode) => {
    if (mode === "RESERVATION") setEntryMode("RESERVATION");
    else if (cardCheck?.entryCardType === "MONTHLY") setEntryMode("MONTHLY");
    else setEntryMode("CASUAL");
  }, [cardCheck, setEntryMode]);

  const handleRetryCurrentStep = useCallback(() => {
    if (form.entryMode === "RESERVATION") void handleCheckReservation();
    else if (form.entryMode === "MONTHLY") void handleCheckCard();
    else void handleLoadSuggestion();
  }, [form.entryMode, handleCheckCard, handleCheckReservation, handleLoadSuggestion]);

  const canRetryCurrentStep = form.entryMode === "RESERVATION"
    ? canCheckReservation && !isCheckingReservation
    : form.entryMode === "MONTHLY"
      ? canCheckCard && !isCheckingCard
      : canLoadSuggestion && !isLoadingSuggestion;

  return (
    <div className="-m-4 flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-slate-50 text-slate-900 md:-m-6">
      <div className="min-h-0 flex-1 p-3 lg:p-4">
        <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-12">
          <div className="flex min-h-0 flex-col gap-4 md:col-span-4">
            <div className="h-[60%] shrink-0">
              <EntryImageSection
                plateImageUrl={form.entryPlateImageUrl}
                vehicleImageUrl={form.entryVehicleImageUrl}
                onPlateImageChange={(value) => setField("entryPlateImageUrl", value)}
                onVehicleImageChange={(value) => setField("entryVehicleImageUrl", value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="min-h-0 flex-1"><EntrySystemChecksPanel workflowChecks={workflowChecks} canSubmit={canSubmit} /></div>
          </div>

          <div className="flex min-h-0 flex-col gap-4 md:col-span-5">
            <div className="min-h-0 flex-1">
              <EntryFormPanel form={form} derivedVehicleTypeId={derivedVehicleTypeId} onFieldChange={setField} onEntryModeChange={setEntryMode} onLoadSuggestion={handleLoadSuggestion} canLoadSuggestion={canLoadSuggestion} isLoadingSuggestion={isLoadingSuggestion} noPlateAllowed={noPlateAllowed} gates={gates} vehicleTypes={vehicleTypes} />
            </div>
            <div className="h-[35%] shrink-0"><EntrySuggestionPanel suggestion={suggestion} /></div>
          </div>

          <div className="flex min-h-0 flex-col gap-4 md:col-span-3">
            <div className="min-h-0 flex-1">
              <EntryVerificationPanel entryMode={form.entryMode} cardCheck={cardCheck} reservationCheck={reservationCheck} onSelectBookingMode={handleSelectBookingMode} isMonthlyPlateMismatch={isMonthlyPlateMismatch} detectedPlate={form.licensePlate} />
            </div>
            <div className="shrink-0">
              <EntryActionPanel entryMode={form.entryMode} canSubmit={canSubmit} isSubmitting={isSubmitting} onCreateEntry={handleCreateEntry} onCheckCard={handleCheckCard} canCheckCard={canCheckCard} isCheckingCard={isCheckingCard} onRetryCurrentStep={handleRetryCurrentStep} canRetryCurrentStep={canRetryCurrentStep} isRetryingCurrentStep={form.entryMode === "RESERVATION" ? isCheckingReservation : form.entryMode === "MONTHLY" ? isCheckingCard : isLoadingSuggestion} onReset={resetFlow} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
