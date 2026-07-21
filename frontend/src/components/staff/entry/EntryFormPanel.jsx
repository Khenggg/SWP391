import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const ENTRY_MODES = [
  { value: "CASUAL", label: "Khách vãng lai" },
  { value: "MONTHLY", label: "Vé tháng / Cư dân" },
  { value: "RESERVATION", label: "Khách Booking" },
];

function Field({ label, required, children, colSpan = 1 }) {
  return (
    <div
      className={`flex flex-col gap-1 ${
        colSpan === 2 ? "col-span-2" : "col-span-1"
      }`}
    >
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
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
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm h-full overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-2.5 px-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-xs">
              2
            </div>
            <CardTitle className="text-sm font-bold">Thông tin xe vào</CardTitle>
          </div>
          {form.entryMode === "CASUAL" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onLoadSuggestion}
              disabled={!canLoadSuggestion || isLoadingSuggestion}
              className="text-[11px] font-semibold h-7 px-2"
            >
              {isLoadingSuggestion ? "Đang lấy..." : "Lấy gợi ý vị trí"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chế độ xe vào" required colSpan={2}>
            <Select value={form.entryMode} onValueChange={onEntryModeChange}>
              <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-blue-500 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_MODES.map((mode) => (
                  <SelectItem
                    key={mode.value}
                    value={mode.value}
                    className="text-sm"
                  >
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Biển số" required={!form.noPlate} colSpan={2}>
            <div className="flex items-center gap-2">
              <Input
                value={form.licensePlate}
                onChange={(event) =>
                  onFieldChange("licensePlate", event.target.value.toUpperCase())
                }
                placeholder="Ví dụ: 30F-123.45"
                disabled={form.noPlate}
                className="bg-slate-50 border-slate-200 font-bold focus-visible:ring-blue-500 uppercase h-8 text-sm"
              />
              <label className="flex items-center gap-1.5 shrink-0 cursor-pointer text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={form.noPlate}
                  onChange={(event) =>
                    onFieldChange("noPlate", event.target.checked)
                  }
                  disabled={!noPlateAllowed}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                Không biển số
              </label>
            </div>
          </Field>

          {form.noPlate && (
            <Field label="Mô tả xe" required colSpan={2}>
              <Input
                value={form.vehicleDescription}
                onChange={(event) =>
                  onFieldChange("vehicleDescription", event.target.value)
                }
                placeholder="Ghi chú nhận dạng xe..."
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500 h-8 text-sm"
              />
            </Field>
          )}

          <Field label="Mã thẻ">
            <Input
              value={form.cardCode}
              onChange={(event) =>
                onFieldChange("cardCode", event.target.value.toUpperCase())
              }
              placeholder="VD: TH-123"
              className="bg-slate-50 border-slate-200 font-bold text-blue-700 focus-visible:ring-blue-500 h-8 text-sm uppercase"
            />
          </Field>

          {form.entryMode === "RESERVATION" ? (
            <Field label="Mã Booking" required>
              <Input
                value={form.reservationCode}
                onChange={(event) =>
                  onFieldChange("reservationCode", event.target.value.toUpperCase())
                }
                placeholder="BK-100001"
                className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500 uppercase h-8 text-sm"
              />
            </Field>
          ) : (
            <Field label="Loại xe" required>
              <Select
                value={derivedVehicleTypeId ? String(derivedVehicleTypeId) : undefined}
                onValueChange={(val) => onFieldChange("vehicleTypeId", val)}
                disabled={form.entryMode !== "CASUAL"}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-blue-500 h-8 text-sm">
                  <SelectValue placeholder="Chọn loại xe" />
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
          )}

          <Field label="Cổng vào" required>
            <Select
              value={String(form.entryGateId)}
              onValueChange={(val) => onFieldChange("entryGateId", val)}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-blue-500 h-8 text-sm">
                <SelectValue placeholder="Chọn cổng" />
              </SelectTrigger>
              <SelectContent>
                {gates.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.gateCode} - {g.gateType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Field label="Ảnh xe (URL)">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={form.entryVehicleImageUrl}
                onChange={(event) =>
                  onFieldChange("entryVehicleImageUrl", event.target.value)
                }
                placeholder="URL ảnh xe..."
                className="pl-8 bg-slate-50 border-slate-200 text-xs h-8"
              />
            </div>
          </Field>
          <Field label="Ảnh biển số (URL)">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={form.entryPlateImageUrl}
                onChange={(event) =>
                  onFieldChange("entryPlateImageUrl", event.target.value)
                }
                placeholder="URL ảnh biển..."
                className="pl-8 bg-slate-50 border-slate-200 text-xs h-8"
              />
            </div>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
}
