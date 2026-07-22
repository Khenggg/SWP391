import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Car } from "lucide-react";
import { toast } from "sonner";
import { vehicleService } from "@/services/vehicleService";
import { parkingService } from "@/services/parkingService";

export default function ApplicationFormDialog({ open, onClose, onSubmit, vehicles: initialVehicles = [] }) {
  const [form, setForm] = useState({
    licensePlate: "",
    vehicleType: "",
    brand: "",
    color: "",
    description: "",
    note: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [userVehicles, setUserVehicles] = useState(initialVehicles);
  const [dbVehicleTypes, setDbVehicleTypes] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        licensePlate: "",
        vehicleType: "",
        brand: "",
        color: "",
        description: "",
        note: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      setSelectedVehicleId("");
      setErrors({});

      // 1. Tải danh sách xe của tài khoản từ CSDL
      const loadUserVehicles = async () => {
        setLoadingVehicles(true);
        try {
          const res = await vehicleService.getVehicles({ pageSize: 50 });
          if (res.items) {
            setUserVehicles(res.items);
          }
        } catch (err) {
          console.error("Lỗi tải danh sách xe của tài khoản:", err);
        } finally {
          setLoadingVehicles(false);
        }
      };

      // 2. Tải trực tiếp tất cả loại phương tiện từ CSDL qua API getVehicleTypes
      const loadVehicleTypes = async () => {
        setLoadingTypes(true);
        try {
          const types = await parkingService.getVehicleTypes();
          if (Array.isArray(types)) {
            setDbVehicleTypes(types);
          }
        } catch (err) {
          console.error("Lỗi gọi API getVehicleTypes:", err);
        } finally {
          setLoadingTypes(false);
        }
      };

      loadUserVehicles();
      loadVehicleTypes();
    }
  }, [open]);

  useEffect(() => {
    if (initialVehicles && initialVehicles.length > 0) {
      setUserVehicles(initialVehicles);
    }
  }, [initialVehicles]);

  const handleSelectVehicle = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    if (!vehicleId || vehicleId === "CUSTOM") {
      return;
    }
    const found = userVehicles.find((v) => String(v.id) === String(vehicleId));
    if (found) {
      const typeStr = found.vehicleTypeName || found.vehicleType || "";
      setForm((prev) => ({
        ...prev,
        licensePlate: found.licensePlate || found.plateNumber || "",
        vehicleType: typeStr,
        brand: found.brand || "",
        color: found.color || "",
        description: found.description || prev.description || "",
      }));
      setErrors({});
    }
  };

  const handleSelectType = (val) => {
    setForm((prev) => ({ ...prev, vehicleType: val }));
    setErrors((prev) => ({ ...prev, vehicleType: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.licensePlate.trim()) e.licensePlate = "Biển số xe là bắt buộc.";
    if (!form.vehicleType.trim()) e.vehicleType = "Loại xe là bắt buộc.";
    if (!form.brand.trim()) e.brand = "Hãng xe là bắt buộc.";
    if (!form.color.trim()) e.color = "Màu xe là bắt buộc.";
    if (!form.startDate) e.startDate = "Bắt buộc chọn ngày bắt đầu.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        cccdFrontImageUrl: "",
        cccdBackImageUrl: "",
        faceImageUrl: "",
        plateImageUrl: ""
      };
      await onSubmit(payload);
      toast.success("Gửi đơn đăng ký thành công!");
      onClose();
    } catch (err) {
      console.error("Submit Application Error:", err);
      const detail = err.errorCode ? ` (${err.errorCode})` : "";
      const msg = (err.message || "Gửi yêu cầu thất bại.") + detail;
      setErrors({ _global: msg });
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Đơn Đăng Ký Vé Tháng Cư Dân
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {errors._global && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
              {errors._global}
            </p>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Thông tin phương tiện
              </h3>
              {loadingVehicles && (
                <span className="text-[11px] text-indigo-600 font-semibold animate-pulse">
                  Đang tải danh sách xe...
                </span>
              )}
            </div>

            {/* Select Vehicle from DB Dropdown */}
            <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/80 space-y-1.5">
              <label className="block text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-indigo-600" />
                Chọn xe có sẵn trong tài khoản (từ CSDL)
              </label>
              <Select value={selectedVehicleId} onValueChange={handleSelectVehicle}>
                <SelectTrigger className="w-full text-xs font-semibold bg-white border-indigo-200 focus:ring-indigo-500">
                  <SelectValue
                    placeholder={
                      loadingVehicles
                        ? "Đang tải danh sách xe..."
                        : userVehicles.length > 0
                        ? "-- Chọn phương tiện đã đăng ký trong hệ thống --"
                        : "Chưa có xe nào trong CSDL (Vui lòng tự nhập ở dưới)"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOM">-- Tự nhập thông tin xe mới --</SelectItem>
                  {userVehicles.map((v) => {
                    const plate = v.licensePlate || v.plateNumber || "Xe chưa có biển";
                    const brandColor = [v.brand, v.color].filter(Boolean).join(" - ");
                    const typeLabel = v.vehicleTypeName || v.vehicleType || "Phương tiện";
                    return (
                      <SelectItem key={v.id} value={String(v.id)}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-indigo-600">{plate}</span>
                          <span className="text-slate-600 text-xs">
                            {brandColor ? `(${brandColor})` : ""} [{typeLabel}]
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Biển số xe <span className="text-rose-500">*</span>
                </label>
                <Input
                  placeholder="Vd: 51A-12345"
                  className="text-sm font-semibold uppercase"
                  {...field("licensePlate")}
                />
                {errors.licensePlate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.licensePlate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Loại phương tiện <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={form.vehicleType}
                  onValueChange={handleSelectType}
                >
                  <SelectTrigger className="w-full text-sm font-semibold uppercase">
                    <SelectValue
                      placeholder={
                        loadingTypes
                          ? "Đang lấy danh sách loại xe từ CSDL..."
                          : "Chọn loại phương tiện..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {dbVehicleTypes.map((vt) => (
                      <SelectItem key={vt.id} value={vt.name}>
                        {vt.name.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleType && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.vehicleType}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Hãng xe <span className="text-rose-500">*</span>
                </label>
                <Input placeholder="Vd: Toyota, Honda..." className="text-sm font-semibold" {...field("brand")} />
                {errors.brand && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Màu xe <span className="text-rose-500">*</span>
                </label>
                <Input placeholder="Vd: Trắng, Đen..." className="text-sm font-semibold" {...field("color")} />
                {errors.color && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.color}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Ngày bắt đầu vé tháng <span className="text-rose-500">*</span>
                </label>
                <Input type="date" className="text-sm font-semibold" {...field("startDate")} />
                {errors.startDate && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mô tả chi tiết (tuỳ chọn)
                </label>
                <Input placeholder="Vd: trầy xước đuôi xe..." className="text-sm" {...field("description")} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Ghi chú thêm gửi quản lý (lý do/note)
            </label>
            <Input placeholder="Lý do đăng ký hoặc nhắn gửi..." className="text-sm font-semibold" {...field("note")} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs font-bold rounded-xl">
              Huỷ
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
            >
              {saving ? "Đang gửi..." : "Gửi đơn đăng ký"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
