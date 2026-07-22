import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const ENTRY_MODES = [
  { value: "CASUAL", label: "Khách vãng lai" },
  { value: "MONTHLY", label: "Vé tháng / Cư dân" },
  { value: "RESERVATION", label: "Khách Booking" },
];

function Field({ label, required, children, colSpan = 1 }) {
  return (
    <div className={`flex flex-col gap-1 ${colSpan === 2 ? "col-span-2" : "col-span-1"}`}>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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
}) {
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

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chế độ xe vào" required colSpan={2}>
            <Select value={form.entryMode} onValueChange={onEntryModeChange}>
              <SelectTrigger className="h-8 border-slate-200 bg-slate-50 text-sm focus:ring-blue-500"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENTRY_MODES.map((mode) => <SelectItem key={mode.value} value={mode.value} className="text-sm">{mode.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Biển số" required={!form.noPlate} colSpan={2}>
            <div className="flex items-center gap-2">
              <Input value={form.licensePlate} onChange={(event) => onFieldChange("licensePlate", event.target.value.toUpperCase())} placeholder="Ví dụ: 30F-123.45" disabled={form.noPlate} className="h-8 border-slate-200 bg-slate-50 text-sm font-bold uppercase focus-visible:ring-blue-500" />
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
            <Input value={form.cardCode} onChange={(event) => onFieldChange("cardCode", event.target.value.toUpperCase())} placeholder="VD: C001" className="h-8 border-slate-200 bg-slate-50 text-sm font-bold uppercase text-blue-700 focus-visible:ring-blue-500" />
          </Field>

          {form.entryMode === "RESERVATION" ? (
            <Field label="Mã Booking" required>
              <Input value={form.reservationCode} onChange={(event) => onFieldChange("reservationCode", event.target.value.toUpperCase())} placeholder="RES-..." className="h-8 border-slate-200 bg-slate-50 text-sm uppercase focus-visible:ring-blue-500" />
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
      </CardContent>
    </Card>
  );
}
