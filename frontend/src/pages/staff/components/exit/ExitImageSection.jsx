import React, { useRef } from "react";
import { Camera, Upload, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

function ImageSlot({ label, url, onClear, inputRef, onChange, disabled, id, readOnly }) {
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {url ? (
        <div className="relative group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden aspect-video">
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          {!readOnly && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div
          className={`rounded-lg border-2 border-dashed ${readOnly ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-slate-50 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30"} aspect-video flex flex-col items-center justify-center gap-1.5 transition`}
          onClick={() => !disabled && !readOnly && inputRef?.current?.click()}
        >
          {readOnly ? (
            <>
              <Eye className="w-5 h-5 text-slate-200" />
              <span className="text-[10px] font-semibold text-slate-300">Không có ảnh</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400">Chưa có ảnh</span>
            </>
          )}
        </div>
      )}
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
            id={id}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="h-7 text-[10px] font-bold"
          >
            <Upload className="w-3 h-3 mr-1" />
            {url ? "Đổi ảnh" : "Tải lên"}
          </Button>
        </>
      )}
    </div>
  );
}

export default function ExitImageSection({
  session,
  exitPlateImageUrl,
  exitVehicleImageUrl,
  onPlateImageChange,
  onVehicleImageChange,
  disabled,
  embedded = false,
}) {
  const plateInputRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const hasExitVehicleImage = Boolean(exitVehicleImageUrl);
  const entryPlateUrl = session?.entryPlateImageUrl || "";
  const entryVehicleUrl = session?.entryVehicleImageUrl || "";
  const hasAnyEntryImage = Boolean(entryPlateUrl || entryVehicleUrl);

  return (
    <section className={embedded ? "flex flex-col" : "bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"}>
      <div className={embedded ? "flex items-center justify-between gap-3" : "p-3 border-b flex items-center justify-between bg-white shrink-0"}>
        <div className="flex items-center gap-2">
          {!embedded && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
              3
            </span>
          )}
          <h3 className="font-bold text-slate-800 text-sm">Ảnh xe vào / ra</h3>
        </div>
        {hasExitVehicleImage ? (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            ✓ Đã có ảnh xe ra
          </span>
        ) : (
          <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            ⚠ Bắt buộc ảnh xe ra
          </span>
        )}
      </div>
      <div className={embedded ? "mt-4 space-y-4" : "p-4 space-y-4"}>
        {session && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-blue-700">Ảnh lúc VÀO</span>
              {!hasAnyEntryImage && (
                <span className="text-[10px] text-slate-400 font-semibold">(Không có ảnh lúc vào)</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ImageSlot label="Biển số lúc vào" url={entryPlateUrl} readOnly />
              <ImageSlot label="Tổng thể xe lúc vào" url={entryVehicleUrl} readOnly />
            </div>
          </div>
        )}

        {session && <div className="border-t border-dashed border-slate-200" />}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">Ảnh lúc RA</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ImageSlot
              label="Biển số lúc ra (tùy chọn)"
              url={exitPlateImageUrl}
              onClear={() => onPlateImageChange("")}
              inputRef={plateInputRef}
              onChange={onPlateImageChange}
              disabled={disabled}
              id="exit-plate-image"
            />
            <ImageSlot
              label="Tổng thể xe lúc ra *"
              url={exitVehicleImageUrl}
              onClear={() => onVehicleImageChange("")}
              inputRef={vehicleInputRef}
              onChange={onVehicleImageChange}
              disabled={disabled}
              id="exit-vehicle-image"
            />
          </div>
        </div>

        {!hasExitVehicleImage && (
          <p className="text-[10px] text-red-500 font-semibold text-center">
            Vui lòng chụp hoặc tải lên ảnh tổng thể xe trước khi cho xe ra.
          </p>
        )}
      </div>
    </section>
  );
}
