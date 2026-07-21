import React, { useRef } from "react";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExitImageSection({
  exitPlateImageUrl,
  exitVehicleImageUrl,
  onPlateImageChange,
  onVehicleImageChange,
  disabled,
}) {
  const plateInputRef = useRef(null);
  const vehicleInputRef = useRef(null);

  const handleFileSelect = (callback) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const ImageSlot = ({ label, url, onClear, inputRef, onChange, id }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {url ? (
        <div className="relative group rounded-lg border border-slate-200 bg-slate-50 overflow-hidden aspect-video">
          <img
            src={url}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <Camera className="w-6 h-6 text-slate-300" />
          <span className="text-[10px] font-bold text-slate-400">
            Chưa có ảnh
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect(onChange)}
        id={id}
      />
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="flex-1 h-7 text-[10px] font-bold"
        >
          <Upload className="w-3 h-3 mr-1" />
          {url ? "Đổi ảnh" : "Tải lên"}
        </Button>
      </div>
    </div>
  );

  const hasAnyImage = Boolean(exitPlateImageUrl || exitVehicleImageUrl);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
            3
          </span>
          <h3 className="font-bold text-slate-800 text-sm">Ảnh chụp xe ra</h3>
        </div>
        {hasAnyImage ? (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            ✓ Đã có ảnh
          </span>
        ) : (
          <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            ⚠ Bắt buộc
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <ImageSlot
            label="Ảnh biển số"
            url={exitPlateImageUrl}
            onClear={() => onPlateImageChange("")}
            inputRef={plateInputRef}
            onChange={onPlateImageChange}
            id="exit-plate-image"
          />
          <ImageSlot
            label="Ảnh tổng thể xe"
            url={exitVehicleImageUrl}
            onClear={() => onVehicleImageChange("")}
            inputRef={vehicleInputRef}
            onChange={onVehicleImageChange}
            id="exit-vehicle-image"
          />
        </div>
        {!hasAnyImage && (
          <p className="mt-3 text-[10px] text-red-500 font-semibold text-center">
            Vui lòng chụp hoặc tải lên ít nhất 1 ảnh trước khi cho xe ra.
          </p>
        )}
      </div>
    </section>
  );
}
