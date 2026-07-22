import React, { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareParkingImage } from "@/lib/parkingImage";

function ImageUploadSlot({ label, value, onChange, disabled, inputRef, id }) {
  const [hasLoadError, setHasLoadError] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const imageUrl = await prepareParkingImage(file);
      setHasLoadError(false);
      setUploadError("");
      onChange(imageUrl);
    } catch (error) {
      setUploadError(error.message || "Không thể xử lý ảnh đã chọn.");
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label} *</p>
      <button
        type="button"
        className="group relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {value && !hasLoadError ? (
          <img src={value} alt={label} className="size-full object-cover" onError={() => setHasLoadError(true)} />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-2 text-center">
            <Camera className="size-6 text-slate-300" />
            <span className="text-xs font-semibold text-slate-400">{hasLoadError ? "Không đọc được ảnh" : "Chọn ảnh"}</span>
          </span>
        )}
        {value && !hasLoadError && (
          <span className="absolute inset-x-0 bottom-0 bg-slate-950/65 px-2 py-1.5 text-center text-[11px] font-bold text-white opacity-0 transition group-hover:opacity-100">Bấm để đổi ảnh</span>
        )}
      </button>
      <input ref={inputRef} id={id} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" onChange={handleFileChange} />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled} className="h-8 flex-1 text-xs font-bold" onClick={() => inputRef.current?.click()}>
          <Upload className="mr-1.5 size-3.5" />
          {value ? "Đổi ảnh" : "Tải ảnh"}
        </Button>
        {value && (
          <Button type="button" variant="outline" size="icon" disabled={disabled} aria-label={`Xóa ${label}`} className="size-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onChange("")}>
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      {uploadError && <p className="text-[11px] font-medium text-red-600">{uploadError}</p>}
    </div>
  );
}

export default function EntryImageSection({ plateImageUrl, vehicleImageUrl, onPlateImageChange, onVehicleImageChange, disabled = false }) {
  const plateInputRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const hasAllImages = Boolean(plateImageUrl && vehicleImageUrl);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
          <h2 className="text-base font-bold text-slate-900">Ảnh xe vào</h2>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${hasAllImages ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>
          {hasAllImages ? "Đủ 2 ảnh" : "Bắt buộc 2 ảnh"}
        </span>
      </header>
      <div className="flex-1 p-3">
        <p className="mb-3 text-xs font-medium text-slate-500">Tải thủ công ảnh biển số và ảnh toàn xe trước khi tạo phiên.</p>
        <div className="grid grid-cols-2 gap-3">
          <ImageUploadSlot label="Ảnh biển số" value={plateImageUrl} onChange={onPlateImageChange} disabled={disabled} inputRef={plateInputRef} id="entry-plate-image" />
          <ImageUploadSlot label="Ảnh toàn xe" value={vehicleImageUrl} onChange={onVehicleImageChange} disabled={disabled} inputRef={vehicleInputRef} id="entry-vehicle-image" />
        </div>
      </div>
    </section>
  );
}
