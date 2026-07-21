import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Clock, CheckCircle2, XCircle, Search, ChevronLeft,
  ChevronRight, RefreshCw, FileText, Info, Camera, Image as ImageIcon
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LicensePlate from "@/components/ui/license-plate";
import EmptyState from "@/components/ui/empty-state";
import { toast } from "sonner";

// ── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const getStatusBadge = (status) => {
  const map = {
    PENDING: {
      label: "Chờ duyệt",
      icon: <Clock className="w-3 h-3 animate-spin" />,
      cls: "bg-amber-50 text-amber-700 border-amber-100",
    },
    APPROVED_AWAITING_PAYMENT: {
      label: "Đang chờ thanh toán",
      icon: <Clock className="w-3 h-3" />,
      cls: "bg-blue-50 text-blue-700 border-blue-100",
    },
    PAID: {
      label: "Đã thanh toán",
      icon: <CheckCircle2 className="w-3 h-3" />,
      cls: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    ACTIVE: {
      label: "Đang hoạt động",
      icon: <CheckCircle2 className="w-3 h-3" />,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    REJECTED: {
      label: "Từ chối",
      icon: <XCircle className="w-3 h-3" />,
      cls: "bg-rose-50 text-rose-700 border-rose-100",
    },
    DRAFT: {
      label: "Nháp",
      icon: <Clock className="w-3 h-3" />,
      cls: "bg-slate-50 text-slate-700 border-slate-100",
    },
  };
  const config = map[status] ?? map.PENDING;
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${config.cls}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};

// ── Image Upload Simulation Helper ───────────────────────────────────────────

const MOCK_IMAGE_POOL = {
  cccdFront: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=600&auto=format&fit=crop",
  cccdBack: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop",
  face: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
  plate: "https://images.unsplash.com/photo-1598501479155-20853531624b?w=600&auto=format&fit=crop",
};

// ── Application Form Dialog ──────────────────────────────────────────────────

function ApplicationFormDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    licensePlate: "",
    vehicleType: "CAR",
    brand: "",
    color: "",
    description: "",
    cccdFrontImageUrl: "",
    cccdBackImageUrl: "",
    faceImageUrl: "",
    plateImageUrl: "",
    note: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        licensePlate: "",
        vehicleType: "CAR",
        brand: "",
        color: "",
        description: "",
        cccdFrontImageUrl: "",
        cccdBackImageUrl: "",
        faceImageUrl: "",
        plateImageUrl: "",
        note: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      setErrors({});
    }
  }, [open]);

  // Simulate file upload
  const handleSimulateUpload = (field, mockKey) => {
    toast.success("Tải lên ảnh thành công (giả lập)!");
    setForm((prev) => ({
      ...prev,
      [field]: MOCK_IMAGE_POOL[mockKey],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.licensePlate.trim()) e.licensePlate = "Biển số xe là bắt buộc.";
    if (!form.brand.trim()) e.brand = "Hãng xe là bắt buộc.";
    if (!form.color.trim()) e.color = "Màu xe là bắt buộc.";
    if (!form.cccdFrontImageUrl) e.cccdFrontImageUrl = "Bắt buộc tải lên ảnh CCCD mặt trước.";
    if (!form.cccdBackImageUrl) e.cccdBackImageUrl = "Bắt buộc tải lên ảnh CCCD mặt sau.";
    if (!form.faceImageUrl) e.faceImageUrl = "Bắt buộc tải lên ảnh chân dung.";
    if (!form.plateImageUrl) e.plateImageUrl = "Bắt buộc tải lên ảnh biển số xe.";
    if (!form.startDate) e.startDate = "Bắt buộc chọn ngày bắt đầu.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Vui lòng điền đầy đủ thông tin và tải lên các ảnh xác thực.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit(form);
      toast.success("Gửi đơn đăng ký thành công!");
      onClose();
    } catch (err) {
      setErrors({ _global: err.message });
      toast.error(err.message || "Gửi yêu cầu thất bại.");
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

          {/* 1. Vehicle Details */}
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
                  Loại phương tiện
                </label>
                <Select
                  value={form.vehicleType}
                  onValueChange={(v) => setForm((prev) => ({ ...prev, vehicleType: v }))}
                >
                  <SelectTrigger className="text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">🚗 Ô tô</SelectItem>
                    <SelectItem value="MOTORBIKE">🏍️ Xe máy</SelectItem>
                  </SelectContent>
                </Select>
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

          {/* 2. Verification Photos */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Ảnh chụp xác thực
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* CCCD Front */}
              <div className="border border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50 relative aspect-[1.6]">
                {form.cccdFrontImageUrl ? (
                  <>
                    <img src={form.cccdFrontImageUrl} alt="CCCD Front" className="w-full h-full object-cover rounded-lg" />
                    <Button variant="secondary" size="sm" className="absolute bottom-2 text-[10px] font-black h-7" onClick={() => setForm(p => ({ ...p, cccdFrontImageUrl: "" }))}>Thay ảnh</Button>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-[11px] font-bold text-slate-500 block">CCCD Mặt trước *</span>
                    <Button type="button" variant="outline" size="sm" className="text-[10px] font-black h-7" onClick={() => handleSimulateUpload("cccdFrontImageUrl", "cccdFront")}>Tải lên</Button>
                  </div>
                )}
                {errors.cccdFrontImageUrl && <p className="absolute bottom-1 text-[9px] text-rose-500 font-bold">{errors.cccdFrontImageUrl}</p>}
              </div>

              {/* CCCD Back */}
              <div className="border border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50 relative aspect-[1.6]">
                {form.cccdBackImageUrl ? (
                  <>
                    <img src={form.cccdBackImageUrl} alt="CCCD Back" className="w-full h-full object-cover rounded-lg" />
                    <Button variant="secondary" size="sm" className="absolute bottom-2 text-[10px] font-black h-7" onClick={() => setForm(p => ({ ...p, cccdBackImageUrl: "" }))}>Thay ảnh</Button>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-[11px] font-bold text-slate-500 block">CCCD Mặt sau *</span>
                    <Button type="button" variant="outline" size="sm" className="text-[10px] font-black h-7" onClick={() => handleSimulateUpload("cccdBackImageUrl", "cccdBack")}>Tải lên</Button>
                  </div>
                )}
                {errors.cccdBackImageUrl && <p className="absolute bottom-1 text-[9px] text-rose-500 font-bold">{errors.cccdBackImageUrl}</p>}
              </div>

              {/* Driver Face */}
              <div className="border border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50 relative aspect-[1.6]">
                {form.faceImageUrl ? (
                  <>
                    <img src={form.faceImageUrl} alt="Face Photo" className="w-full h-full object-cover rounded-lg" />
                    <Button variant="secondary" size="sm" className="absolute bottom-2 text-[10px] font-black h-7" onClick={() => setForm(p => ({ ...p, faceImageUrl: "" }))}>Thay ảnh</Button>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-[11px] font-bold text-slate-500 block">Ảnh gương mặt *</span>
                    <Button type="button" variant="outline" size="sm" className="text-[10px] font-black h-7" onClick={() => handleSimulateUpload("faceImageUrl", "face")}>Tải lên</Button>
                  </div>
                )}
                {errors.faceImageUrl && <p className="absolute bottom-1 text-[9px] text-rose-500 font-bold">{errors.faceImageUrl}</p>}
              </div>

              {/* Plate Image */}
              <div className="border border-dashed border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50 relative aspect-[1.6]">
                {form.plateImageUrl ? (
                  <>
                    <img src={form.plateImageUrl} alt="Plate Photo" className="w-full h-full object-cover rounded-lg" />
                    <Button variant="secondary" size="sm" className="absolute bottom-2 text-[10px] font-black h-7" onClick={() => setForm(p => ({ ...p, plateImageUrl: "" }))}>Thay ảnh</Button>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                    <span className="text-[11px] font-bold text-slate-500 block">Ảnh biển số xe *</span>
                    <Button type="button" variant="outline" size="sm" className="text-[10px] font-black h-7" onClick={() => handleSimulateUpload("plateImageUrl", "plate")}>Tải lên</Button>
                  </div>
                )}
                {errors.plateImageUrl && <p className="absolute bottom-1 text-[9px] text-rose-500 font-bold">{errors.plateImageUrl}</p>}
              </div>
            </div>
          </div>

          {/* 3. Note */}
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

// ── Application Detail Dialog ────────────────────────────────────────────────

function ApplicationDetailDialog({ open, onClose, application }) {
  if (!application) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-black text-slate-800 flex items-center justify-between pr-6">
            <span>Chi Tiết Đơn Đăng Ký #{application.id}</span>
            {getStatusBadge(application.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
          {/* Thông tin phương tiện */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px] text-slate-500">Thông tin xe</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-0.5">Biển số xe:</span>
                <LicensePlate plate={application.vehiclePlateNumber} size="sm" />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Loại xe:</span>
                <span className="text-slate-800 font-bold">{application.vehicleTypeName === "Ô Tô" ? "🚗 Ô tô" : "🏍️ Xe máy"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Hãng xe:</span>
                <span className="text-slate-800 font-extrabold">{application.brand || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Màu xe:</span>
                <span className="text-slate-800 font-extrabold">{application.color || "—"}</span>
              </div>
            </div>
          </div>

          {/* Ghi chú / Note */}
          {(application.note || application.rejectionReason) && (
            <div className="space-y-2">
              {application.note && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Ghi chú của bạn:</span>
                  <p className="text-slate-700 italic bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">{application.note}</p>
                </div>
              )}
              {application.rejectionReason && (
                <div>
                  <span className="text-rose-500 block mb-0.5">Phản hồi từ Manager:</span>
                  <p className="text-rose-700 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-100">{application.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Hình ảnh xác thực */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wide text-[10px] text-slate-500">Hình ảnh xác thực đã gửi</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block mb-1">CCCD Mặt trước:</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden aspect-[1.6] bg-slate-100">
                  {application.cccdFrontImageUrl ? (
                    <img src={application.cccdFrontImageUrl} alt="CCCD Front" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">CCCD Mặt sau:</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden aspect-[1.6] bg-slate-100">
                  {application.cccdBackImageUrl ? (
                    <img src={application.cccdBackImageUrl} alt="CCCD Back" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Ảnh chân dung:</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden aspect-[1.6] bg-slate-100">
                  {application.faceImageUrl ? (
                    <img src={application.faceImageUrl} alt="Face" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Ảnh biển số xe:</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden aspect-[1.6] bg-slate-100">
                  {application.plateImageUrl ? (
                    <img src={application.plateImageUrl} alt="Plate" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DriverVehiclesPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 20;

  // Dialogs
  const [showCreate, setShowCreate] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await driverService.getMonthlyPassApplications({
        keyword,
        status: filterStatus,
        page,
        pageSize: PAGE_SIZE,
      });
      setApplications(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đơn đăng ký.");
    } finally {
      setLoading(false);
    }
  }, [keyword, filterStatus, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const applyFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  const handleCreate = async (form) => {
    await driverService.submitMonthlyPassApplication(form);
    setPage(1);
    await fetchApplications();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
            Đăng Ký Vé Tháng Cư Dân
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Danh sách đơn đăng ký gửi xe vé tháng. Xe của bạn chỉ được phép đỗ sau khi được duyệt.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition"
        >
          <Plus className="w-4 h-4" />
          Đăng ký vé tháng
        </Button>
      </div>

      {/* Info warning card */}
      <Card className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-600 font-medium">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="font-extrabold text-slate-800">Quy định về Duyệt Vé Tháng:</p>
          <p>
            Cư dân **không tự thêm xe trực tiếp**. Hãy nhấn vào **"Đăng ký vé tháng"** để gửi biển số xe, thông tin xe và tải lên các ảnh xác thực gồm **CCCD trước/sau, chân dung cư dân và ảnh biển số xe**.
          </p>
          <p>
            Manager bãi đỗ xe sẽ xem xét các ảnh xác thực, đối chiếu căn hộ và tiến hành duyệt hoặc từ chối đơn của bạn.
          </p>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 text-sm font-semibold"
            placeholder="Tìm biển số..."
            value={keyword}
            onChange={(e) => applyFilter(setKeyword)(e.target.value)}
          />
        </div>

        <Select value={filterStatus || "ALL"} onValueChange={(v) => applyFilter(setFilterStatus)(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-48 text-xs font-bold">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">⏳ Chờ duyệt</SelectItem>
            <SelectItem value="APPROVED_AWAITING_PAYMENT">💳 Chờ thanh toán</SelectItem>
            <SelectItem value="PAID">💵 Đã thanh toán</SelectItem>
            <SelectItem value="ACTIVE">✅ Đang hoạt động</SelectItem>
            <SelectItem value="REJECTED">❌ Bị từ chối</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchApplications}
          title="Làm mới"
          className="shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 px-6 py-5">
                <div className="h-6 w-28 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-7 w-24 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <EmptyState icon="⚠️" title="Không thể tải danh sách đơn" description={error} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Chưa gửi đơn đăng ký nào"
          description="Nhấn 'Đăng ký vé tháng' ở góc trên để khai báo xe cư dân mới."
        />
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <TableHead className="py-4 px-6">Biển số</TableHead>
                <TableHead className="py-4 px-6">Loại xe</TableHead>
                <TableHead className="py-4 px-6">Ngày bắt đầu</TableHead>
                <TableHead className="py-4 px-6 text-right">Phí vé tháng</TableHead>
                <TableHead className="py-4 px-6 text-center">Trạng thái đơn</TableHead>
                <TableHead className="py-4 px-6 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {applications.map((app) => (
                <TableRow key={app.id} className="hover:bg-slate-50/60 transition">
                  <TableCell className="py-4 px-6">
                    <LicensePlate plate={app.vehiclePlateNumber} size="sm" />
                  </TableCell>
                  <TableCell className="py-4 px-6 font-bold text-slate-700">
                    {app.vehicleTypeName === "Ô Tô" ? "🚗 Ô tô" : "🏍️ Xe máy"}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-slate-500">
                    {formatDate(app.startDate)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right font-black text-amber-600">
                    {Number(app.price).toLocaleString()} VND
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    {getStatusBadge(app.status)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[11px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg"
                      onClick={() => setDetailTarget(app)}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Hiển thị {applications.length} / {totalItems} đơn đăng ký</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-7 w-7"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-bold text-slate-700">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 w-7"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Form Dialog */}
      <ApplicationFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      {/* Detail Dialog */}
      <ApplicationDetailDialog
        open={Boolean(detailTarget)}
        application={detailTarget}
        onClose={() => setDetailTarget(null)}
      />
    </div>
  );
}
