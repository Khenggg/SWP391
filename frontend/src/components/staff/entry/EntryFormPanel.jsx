import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

const ENTRY_MODES = [
  { value: "CASUAL", label: "Khách vãng lai" },
  { value: "MONTHLY", label: "Vé tháng / Cư dân" },
  { value: "RESERVATION", label: "Khách Booking" },
];

function Field({ label, required, children, colSpan = 1, extraLabel }) {
  return (
    <div className={`flex flex-col gap-1 ${colSpan === 2 ? "col-span-2" : "col-span-1"}`}>
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {extraLabel}
      </div>
      {children}
    </div>
  );
}

export default function EntryFormPanel({
  form,
  derivedVehicleTypeId,
  onFieldChange,
  onEntryModeChange,
  onLoadSuggestion,
  isLoadingSuggestion,
  noPlateAllowed,
  canLoadSuggestion,
  gates = [],
  vehicleTypes = [],
  onCheckCard,
  onCheckReservation,
  // Override Props
  overrideEnabled,
  setOverrideEnabled,
  overrideFloorId,
  setOverrideFloorId,
  overrideAreaId,
  setOverrideAreaId,
  overrideSlotId,
  setOverrideSlotId,
  overrideReason,
  setOverrideReason,
  floors = [],
  areas = [],
  slots = [],
}) {
  const confidence = form?.ocrConfidence != null ? Number(form.ocrConfidence) : null;
  const isLowConfidence = confidence != null && confidence < 70;

  const requiresSlot = React.useMemo(() => {
    const vt = vehicleTypes.find((v) => String(v.id) === String(derivedVehicleTypeId));
    return vt ? vt.requiresSlot : false;
  }, [derivedVehicleTypeId, vehicleTypes]);

  // Filter areas by selected floor & vehicle type
  const filteredAreas = React.useMemo(() => {
    if (!overrideFloorId) return [];
    return areas.filter(a => {
      const isFloorMatch = String(a.floorId) === String(overrideFloorId);
      const isActive = a.status === "ACTIVE" || a.status === "AVAILABLE" || !a.status;
      
      let isVehicleTypeMatch = false;
      if (a.vehicleTypeIds && a.vehicleTypeIds.length > 0) {
        isVehicleTypeMatch = a.vehicleTypeIds.some(id => String(id) === String(derivedVehicleTypeId));
      } else if (a.vehicleTypeNames && a.vehicleTypeNames.length > 0) {
        const selectedVt = vehicleTypes.find(v => String(v.id) === String(derivedVehicleTypeId));
        if (selectedVt) {
          isVehicleTypeMatch = a.vehicleTypeNames.some(name => 
            name.toLowerCase().includes(selectedVt.name?.toLowerCase()) ||
            selectedVt.name?.toLowerCase().includes(name.toLowerCase())
          );
        }
      } else {
        // Fallback: If no vehicle types configured for the area, allow check
        isVehicleTypeMatch = true;
      }
      
      return isFloorMatch && isActive && isVehicleTypeMatch;
    });
  }, [overrideFloorId, areas, derivedVehicleTypeId, vehicleTypes]);

  // Filter slots by selected area and status AVAILABLE
  const filteredSlots = React.useMemo(() => {
    if (!overrideAreaId) return [];
    return slots.filter(s => 
      String(s.areaId) === String(overrideAreaId) && 
      s.status === "AVAILABLE"
    );
  }, [overrideAreaId, slots]);

  const ocrBadge = confidence != null ? (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold transition-all ${
        isLowConfidence
          ? "border-red-300 bg-red-50 text-red-700 animate-pulse shadow-sm"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
      title={isLowConfidence ? "Độ chính xác AI nhận diện dưới 70%. Nhân viên nên kiểm tra kỹ biển số!" : "Độ chính xác AI nhận diện cao"}
    >
      {isLowConfidence ? <ShieldAlert className="size-3 text-red-600" /> : <CheckCircle2 className="size-3 text-emerald-600" />}
      OCR: {confidence.toFixed(1)}% {isLowConfidence ? "(Cảnh báo < 70%)" : "(Tin cậy)"}
    </span>
  ) : null;

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="shrink-0 border-b border-slate-100 px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</div>
            <CardTitle className="text-sm font-bold">Thông tin xe vào</CardTitle>
          </div>
          {form.entryMode === "CASUAL" && (
            <Button size="sm" variant="secondary" onClick={onLoadSuggestion} disabled={!canLoadSuggestion || isLoadingSuggestion} className="h-7 px-2 text-[11px] font-semibold">
              {isLoadingSuggestion ? "Đang lấy..." : "Lấy gợi ý vị trí"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chế độ xe vào" required colSpan={2}>
            <Select value={form.entryMode} onValueChange={onEntryModeChange}>
              <SelectTrigger className="h-8 border-slate-200 bg-slate-50 text-sm focus:ring-blue-500"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTRY_MODES.map((mode) => <SelectItem key={mode.value} value={mode.value} className="text-sm">{mode.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Biển số" required={!form.noPlate} colSpan={2} extraLabel={ocrBadge}>
            <div className="flex items-center gap-2">
              <Input
                value={form.licensePlate}
                onChange={(event) => onFieldChange("licensePlate", event.target.value.toUpperCase())}
                placeholder="Ví dụ: 30F-123.45"
                disabled={form.noPlate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (form.entryMode === "MONTHLY" && onCheckCard && form.cardCode?.trim()) {
                      onCheckCard();
                    } else if (form.entryMode === "RESERVATION" && onCheckReservation && form.reservationCode?.trim()) {
                      onCheckReservation();
                    } else if (form.entryMode === "CASUAL" && canLoadSuggestion && onLoadSuggestion) {
                      onLoadSuggestion();
                    }
                  }
                }}
                className={`h-8 border-slate-200 bg-slate-50 text-sm font-bold uppercase focus-visible:ring-blue-500 ${
                  isLowConfidence ? "border-red-300 ring-2 ring-red-100" : ""
                }`}
              />
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-600">
                <input type="checkbox" checked={form.noPlate} onChange={(event) => onFieldChange("noPlate", event.target.checked)} disabled={!noPlateAllowed} className="size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Không biển số
              </label>
            </div>
          </Field>

          {form.noPlate && (
            <Field label="Mô tả xe" required colSpan={2}>
              <Input value={form.vehicleDescription} onChange={(event) => onFieldChange("vehicleDescription", event.target.value)} placeholder="Ghi chú nhận dạng xe..." className="h-8 border-slate-200 bg-slate-50 text-sm focus-visible:ring-blue-500" />
            </Field>
          )}

          <Field label="Mã thẻ" required>
            <Input
              value={form.cardCode}
              onChange={(event) => onFieldChange("cardCode", event.target.value.toUpperCase())}
              placeholder="VD: C001"
              className="h-8 border-slate-200 bg-slate-50 text-sm font-bold uppercase text-blue-700 focus-visible:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && onCheckCard && form.cardCode?.trim()) {
                  onCheckCard();
                }
              }}
            />
          </Field>

          {form.entryMode === "RESERVATION" ? (
            <Field label="Mã Booking" required>
              <Input
                value={form.reservationCode}
                onChange={(event) => onFieldChange("reservationCode", event.target.value.toUpperCase())}
                placeholder="RES-..."
                className="h-8 border-slate-200 bg-slate-50 text-sm uppercase focus-visible:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onCheckReservation && form.reservationCode?.trim()) {
                    onCheckReservation();
                  }
                }}
              />
            </Field>
          ) : (
            <Field label="Loại xe" required>
              <Select value={derivedVehicleTypeId ? String(derivedVehicleTypeId) : ""} onValueChange={(value) => onFieldChange("vehicleTypeId", value)} disabled={form.entryMode !== "CASUAL"}>
                <SelectTrigger className="h-8 border-slate-200 bg-slate-50 text-sm focus:ring-blue-500"><SelectValue placeholder="Chọn loại xe" /></SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((vehicleType) => <SelectItem key={vehicleType.id} value={String(vehicleType.id)}>{vehicleType.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field label="Cổng vào" required>
            <Select value={String(form.entryGateId)} onValueChange={(value) => onFieldChange("entryGateId", value)}>
              <SelectTrigger className="h-8 border-slate-200 bg-slate-50 text-sm focus:ring-blue-500"><SelectValue placeholder="Chọn cổng" /></SelectTrigger>
              <SelectContent>
                {gates.map((gate) => <SelectItem key={gate.id} value={String(gate.id)}>{gate.gateCode} - {gate.gateType}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Can thiệp vị trí đỗ */}
        {(form.entryMode === "CASUAL" || form.entryMode === "RESERVATION") && (
          <div className="mt-2 border-t border-slate-100 pt-3 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={overrideEnabled}
                  onChange={(e) => {
                    setOverrideEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setOverrideFloorId("");
                      setOverrideAreaId("");
                      setOverrideSlotId("");
                      setOverrideReason("");
                    }
                  }}
                  className="size-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Can thiệp vị trí đỗ (Override AI)
              </label>
              {overrideEnabled && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  Chế độ can thiệp
                </span>
              )}
            </div>

            {overrideEnabled && (
              <div className="grid grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100/80 animate-in slide-in-from-top-2 duration-200">
                <Field label="Chọn Tầng *" required>
                  <Select
                    value={overrideFloorId}
                    onValueChange={(val) => {
                      setOverrideFloorId(val);
                      setOverrideAreaId("");
                      setOverrideSlotId("");
                    }}
                  >
                    <SelectTrigger className="h-8 border-slate-200 bg-white text-sm focus:ring-amber-500">
                      <SelectValue placeholder="Chọn Tầng" />
                    </SelectTrigger>
                    <SelectContent>
                      {floors.map((f) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.floorCode} - {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Chọn Khu vực *" required>
                  <Select
                    value={overrideAreaId}
                    disabled={!overrideFloorId}
                    onValueChange={(val) => {
                      setOverrideAreaId(val);
                      setOverrideSlotId("");
                    }}
                  >
                    <SelectTrigger className="h-8 border-slate-200 bg-white text-sm focus:ring-amber-500">
                      <SelectValue placeholder="Chọn Khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAreas.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.areaCode} ({a.vehicleTypeNames?.join(", ")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {requiresSlot ? (
                  <Field label="Chọn Vị trí (Slot) *" required colSpan={2}>
                    <Select
                      value={overrideSlotId}
                      disabled={!overrideAreaId}
                      onValueChange={setOverrideSlotId}
                    >
                      <SelectTrigger className="h-8 border-slate-200 bg-white text-sm focus:ring-amber-500">
                        <SelectValue placeholder="Chọn Slot trống" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSlots.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.slotCode} - Trống
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                ) : null}

                <Field label="Lý do can thiệp *" required colSpan={2}>
                  <Input
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Nhập lý do đổi vị trí đỗ..."
                    className="h-8 border-slate-200 bg-white text-sm focus-visible:ring-amber-500 font-medium"
                  />
                </Field>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
