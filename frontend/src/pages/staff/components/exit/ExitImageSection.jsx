import React, { useEffect, useRef, useState } from "react";
import { Camera, Eye, ImageOff, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareParkingImage } from "@/lib/parkingImage";

function ImageSlot({ label, url, onClear, inputRef, onChange, disabled, id, readOnly }) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => setHasLoadError(false), [url]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      onChange?.(await prepareParkingImage(file));
      setUploadError("");
    } catch (error) {
      setUploadError(error.message || "Không thể xử lý ảnh đã chọn.");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
      {url && !hasLoadError ? (
        <div className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          <img src={url} alt={label} className="size-full object-cover" onError={() => setHasLoadError(true)} />
          {!readOnly && <button type="button" onClick={onClear} className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"><X className="size-3.5" /></button>}
        </div>
      ) : (
        <button type="button" disabled={disabled || readOnly} onClick={() => inputRef?.current?.click()} className={`flex aspect-video flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition ${readOnly ? "cursor-default border-slate-100 bg-slate-50" : "cursor-pointer border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/30 disabled:cursor-not-allowed disabled:opacity-60"}`}>
          {readOnly ? hasLoadError ? <ImageOff className="size-5 text-amber-400" /> : <Eye className="size-5 text-slate-200" /> : <Camera className="size-5 text-slate-300" />}
          <span className={`text-[10px] font-semibold ${hasLoadError ? "text-amber-600" : "text-slate-400"}`}>{hasLoadError ? "Không tải được ảnh" : readOnly ? "Không có ảnh" : "Chưa có ảnh"}</span>
        </button>
      )}
      {!readOnly && <><input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={handleFileSelect} /><Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()} className="h-7 text-[10px] font-bold"><Upload className="mr-1 size-3" />{url ? "Đổi ảnh" : "Tải lên"}</Button></>}
      {uploadError && <p className="text-[10px] font-medium text-red-600">{uploadError}</p>}
    </div>
  );
}

export default function ExitImageSection({ session, exitPlateImageUrl, exitVehicleImageUrl, onPlateImageChange, onVehicleImageChange, disabled, embedded = false }) {
  const plateInputRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const hasRequiredExitImages = Boolean(exitPlateImageUrl && exitVehicleImageUrl);
  const entryPlateUrl = session?.entryPlateImageUrl || "";
  const entryVehicleUrl = session?.entryVehicleImageUrl || "";

  return (
    <section className={embedded ? "flex flex-col" : "flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"}>
      <div className={embedded ? "flex items-center justify-between gap-3" : "flex shrink-0 items-center justify-between border-b bg-white p-3"}>
        <div className="flex items-center gap-2">{!embedded && <span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">3</span>}<h3 className="text-sm font-bold text-slate-800">Ảnh xe vào và ra</h3></div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${hasRequiredExitImages ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-red-200 bg-red-50 text-red-500"}`}>{hasRequiredExitImages ? "Đủ 2 ảnh xe ra" : "Bắt buộc 2 ảnh xe ra"}</span>
      </div>
      <div className={embedded ? "mt-4 space-y-4" : "space-y-4 p-4"}>
        {session && <><div><div className="mb-2 flex items-center gap-2"><div className="size-2 rounded-full bg-blue-500" /><span className="text-xs font-bold text-blue-700">Ảnh lúc vào</span></div><div className="grid grid-cols-2 gap-3"><ImageSlot label="Biển số lúc vào" url={entryPlateUrl} readOnly /><ImageSlot label="Toàn thể xe lúc vào" url={entryVehicleUrl} readOnly /></div></div><div className="border-t border-dashed border-slate-200" /></>}
        <div><div className="mb-2 flex items-center gap-2"><div className="size-2 rounded-full bg-emerald-500" /><span className="text-xs font-bold text-emerald-700">Ảnh lúc ra</span></div><div className="grid grid-cols-2 gap-3"><ImageSlot label="Biển số lúc ra *" url={exitPlateImageUrl} onClear={() => onPlateImageChange("")} inputRef={plateInputRef} onChange={onPlateImageChange} disabled={disabled} id="exit-plate-image" /><ImageSlot label="Toàn thể xe lúc ra *" url={exitVehicleImageUrl} onClear={() => onVehicleImageChange("")} inputRef={vehicleInputRef} onChange={onVehicleImageChange} disabled={disabled} id="exit-vehicle-image" /></div></div>
        {!hasRequiredExitImages && <p className="text-center text-[10px] font-semibold text-red-500">Tải đủ ảnh biển số và ảnh toàn xe trước khi xác nhận xe ra.</p>}
      </div>
    </section>
  );
}
