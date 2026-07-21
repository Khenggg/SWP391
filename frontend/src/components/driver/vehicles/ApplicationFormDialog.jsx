import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";
import { toast } from "sonner";

export default function ApplicationFormDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    licensePlate: "",
    vehicleType: "",
    brand: "",
    color: "",
    description: "",
    note: "",
    startDate: new Date().toISOString().split("T")[0],
  });

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
      setErrors({});
    }
  }, [open]);

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
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Thông tin phương tiện
            </h3>
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
                <Input
                  placeholder="Vd: CAR hoặc MOTORBIKE"
                  className="text-sm font-semibold uppercase"
                  {...field("vehicleType")}
                />
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
