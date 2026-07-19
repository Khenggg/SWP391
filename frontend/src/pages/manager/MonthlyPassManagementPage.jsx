import React, { useState, useEffect, useCallback } from "react";
import { vehicleService } from "../../services/vehicleService";
import { parkingService } from "../../services/parkingService";
import { driverService } from "../../services/driverService";
import { cardService } from "../../services/cardService";
import { PASS_STATUS } from "@/constants";
import MonthlyPassFilters from "@/components/manager/monthly-pass/MonthlyPassFilters";
import MonthlyPassTable from "@/components/manager/monthly-pass/MonthlyPassTable";
import MonthlyPassSidePanel from "@/components/manager/monthly-pass/MonthlyPassSidePanel";
import { toast } from "sonner";
import {
  Calendar, CheckCircle, Clock, Lock, RefreshCw, XCircle,
  FileText, User, CreditCard, Shield, Camera, Image as ImageIcon,
  CheckCircle2, XCircle as XCircleIcon, Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LicensePlate from "@/components/ui/license-plate";

const STATUS_BADGE = {
  [PASS_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-300",
  [PASS_STATUS.EXPIRED]: "bg-slate-100 text-slate-500 border-slate-300",
  [PASS_STATUS.LOCKED]: "bg-red-100 text-red-700 border-red-300",
  [PASS_STATUS.CANCELLED]: "bg-amber-100 text-amber-700 border-amber-300",
};

const APP_STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  APPROVED_AWAITING_PAYMENT: "bg-blue-100 text-blue-700 border-blue-300",
  PAID: "bg-indigo-100 text-indigo-700 border-indigo-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-300",
};

const STATUSES = Object.values(PASS_STATUS);
const EMPTY_FORM = { ownerName: "", phone: "", plate: "", vehicleTypeId: "", cardId: "", areaId: "", slotId: "", startDate: "", endDate: "" };

const InputField = ({ label, name, type = "text", placeholder, required, form, setField, formErrors }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-slate-600 uppercase">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <Input type={type} value={form[name] || ""} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder}
      className={formErrors[name] ? "border-red-400 bg-red-50 focus-visible:ring-red-400" : ""} />
    {formErrors[name] && <p className="text-red-500 text-xs">{formErrors[name]}</p>}
  </div>
);

export default function MonthlyPassManagementPage() {
  const [activeTab, setActiveTab] = useState("passes"); // "passes" or "applications"
  
  // passes data
  const [passes, setPasses] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [cards, setCards] = useState([]);
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // passes filters
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("");

  const [selectedPass, setSelectedPass] = useState(null);

  // passes modals
  const [showCreate, setShowCreate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const [form, setForm] = useState(EMPTY_FORM);
  const [renewDate, setRenewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // applications data
  const [applications, setApplications] = useState([]);
  const [appKeyword, setAppKeyword] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [appPage, setAppPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appTotalItems, setAppTotalItems] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);

  // review dialogs
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rfidCardCode, setRfidCardCode] = useState("");
  const [showAssignRfidModal, setShowAssignRfidModal] = useState(false);
  
  // payment dialog
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "passes") {
        const passesData = await vehicleService.getMonthlyPasses();
        setPasses(passesData || []);
        
        const availData = await parkingService.getAvailableSlots();
        setAreas(availData.areas || []);
        setSlots(availData.slots || []);
        setVehicleTypes(availData.vehicleTypes || await parkingService.getVehicleTypes() || []);
        
        const cardsData = await cardService.getCards();
        setCards(cardsData || []);
      } else {
        const result = await driverService.getMonthlyPassApplications({
          keyword: appKeyword,
          status: appStatusFilter === "ALL" ? "" : appStatusFilter,
          page: appPage,
          pageSize: 20
        });
        setApplications(result.items || []);
        setAppTotalPages(result.totalPages || 1);
        setAppTotalItems(result.totalItems || 0);
      }
    } catch (e) {
      console.error("Lỗi lấy danh sách dữ liệu:", e);
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, appKeyword, appStatusFilter, appPage]);

  const handleAppClick = async (app) => {
    try {
      const detail = await driverService.getMonthlyPassApplicationById(app.id);
      setSelectedApp(detail);
    } catch (e) {
      toast.error("Không thể tải chi tiết đơn.");
    }
  };

  // Approval review actions
  const handleApproveApp = async () => {
    if (!selectedApp) return;
    try {
      await driverService.reviewMonthlyPassApplication(selectedApp.id, "APPROVED_AWAITING_PAYMENT", "");
      toast.success("Đã phê duyệt đơn đăng ký cư dân!");
      loadData();
      handleAppClick(selectedApp); // reload detail
    } catch (e) {
      toast.error(e.message || "Phê duyệt thất bại.");
    }
  };

  const handleRejectApp = async () => {
    if (!selectedApp || !rejectReason.trim()) return;
    try {
      await driverService.reviewMonthlyPassApplication(selectedApp.id, "REJECTED", rejectReason);
      toast.success("Đã từ chối đơn đăng ký.");
      setShowRejectModal(false);
      setRejectReason("");
      loadData();
      handleAppClick(selectedApp);
    } catch (e) {
      toast.error(e.message || "Từ chối thất bại.");
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedApp) return;
    try {
      await driverService.confirmApplicationPayment(selectedApp.id, paymentMethod, referenceNo);
      toast.success("Đã xác nhận thanh toán phí vé tháng!");
      setShowPaymentModal(false);
      setReferenceNo("");
      loadData();
      handleAppClick(selectedApp);
    } catch (e) {
      toast.error(e.message || "Xác nhận thanh toán thất bại.");
    }
  };

  const handleAssignRfid = async () => {
    if (!selectedApp || !rfidCardCode.trim()) return;
    try {
      await driverService.assignRfidToApplication(selectedApp.id, rfidCardCode);
      toast.success("Đã gán thẻ RFID và kích hoạt vé tháng thành công!");
      setShowAssignRfidModal(false);
      setRfidCardCode("");
      loadData();
      handleAppClick(selectedApp);
    } catch (e) {
      toast.error(e.message || "Gán thẻ thất bại.");
    }
  };

  // Passes filtering logic
  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filteredPasses = passes.filter((p) => {
    let effectiveStatus = p.status;
    if (p.status === PASS_STATUS.ACTIVE && p.endDate) {
      const remainingDays = Math.ceil((new Date(p.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      if (remainingDays < 0) {
        effectiveStatus = PASS_STATUS.EXPIRED;
      }
    }

    const matchStatus = filterStatus === "ALL" || effectiveStatus === filterStatus;
    const matchVehicle = filterVehicle === "ALL" || p.vehicleTypeName === filterVehicle;
    const matchSearch = !filterKeyword || 
      (p.plate && p.plate.toLowerCase().includes(filterKeyword.toLowerCase())) || 
      (p.ownerName && p.ownerName.toLowerCase().includes(filterKeyword.toLowerCase())) ||
      (p.phone && p.phone.includes(filterKeyword));
    
    return matchStatus && matchVehicle && matchSearch;
  });

  const countTotal = passes.length;
  const countActive = passes.filter(p => p.status === PASS_STATUS.ACTIVE).length;
  const countExpired = passes.filter(p => p.status === PASS_STATUS.EXPIRED || (p.status === PASS_STATUS.ACTIVE && p.endDate < new Date().toISOString().split("T")[0])).length;

  const validate = (data) => {
    const errs = {};
    if (!data.ownerName?.trim()) errs.ownerName = "Bắt buộc";
    if (!data.plate?.trim()) errs.plate = "Bắt buộc";
    if (!data.vehicleTypeId) errs.vehicleTypeId = "Bắt buộc";
    if (!data.cardId) errs.cardId = "Bắt buộc";
    
    const vt = vehicleTypes.find(v => String(v.id) === String(data.vehicleTypeId));
    if (vt) {
      if (vt.requiresSlot && !data.slotId) errs.slotId = "Bắt buộc chọn vị trí đỗ";
      if (!vt.requiresSlot && !data.areaId) errs.areaId = "Bắt buộc chọn khu vực";
    }

    if (!data.startDate) errs.startDate = "Bắt buộc";
    if (!data.endDate) errs.endDate = "Bắt buộc";
    if (data.startDate && data.endDate && data.endDate < data.startDate) errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    return errs;
  };

  const handleSavePass = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const vt = vehicleTypes.find((v) => String(v.id) === String(form.vehicleTypeId));
    const passData = {
      ownerName: form.ownerName, phone: form.phone, plateNumber: form.plate.toUpperCase(),
      vehicleTypeId: Number(form.vehicleTypeId), vehicleTypeName: vt?.name || "",
      cardId: Number(form.cardId),
      areaId: form.areaId ? Number(form.areaId) : null,
      slotId: form.slotId ? Number(form.slotId) : null,
      startDate: form.startDate, endDate: form.endDate, status: PASS_STATUS.ACTIVE,
    };
    
    try {
      if (isEditing) {
         toast.info("[CHƯA HOÀN THIỆN TỪ BACKEND] Chức năng sửa vé chưa gọi API thật");
      } else {
         await vehicleService.addMonthlyPass(passData);
         toast.success("Tạo vé tháng thành công!");
      }
      loadData();
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
    } catch (e) {
      toast.error(e.message || "Lưu vé tháng thất bại!");
    }
  };

  const handleRenew = async () => {
    if (!renewDate) return;
    if (renewDate <= selectedPass.endDate) { toast.error("Ngày gia hạn phải sau ngày kết thúc hiện tại!"); return; }
    try {
      await vehicleService.renewMonthlyPass(selectedPass.id, renewDate);
      loadData();
      setShowRenew(false);
      setSelectedPass({ ...selectedPass, endDate: renewDate });
      toast.success(`Gia hạn vé ${selectedPass.plate} đến ${renewDate}`);
    } catch (e) {
      toast.error(e.message || "Gia hạn vé tháng thất bại!");
    }
  };

  const handleStatus = async () => {
    try {
      await vehicleService.updateMonthlyPassStatus(selectedPass.id, newStatus);
      loadData();
      setShowStatusModal(false);
      setSelectedPass({ ...selectedPass, status: newStatus });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (e) {
      toast.error(e.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const handleLockToggle = async (pass) => {
    const nextStatus = pass.status === PASS_STATUS.LOCKED ? PASS_STATUS.ACTIVE : PASS_STATUS.LOCKED;
    try {
      await vehicleService.updateMonthlyPassStatus(pass.id, nextStatus);
      loadData();
      if (selectedPass?.id === pass.id) {
         setSelectedPass({ ...selectedPass, status: nextStatus });
      }
      toast.success(nextStatus === PASS_STATUS.LOCKED ? "Khóa vé thành công!" : "Mở khóa thành công!");
    } catch (e) {
      toast.error(e.message || "Cập nhật khóa vé thất bại!");
    }
  };

  const handleResetFilters = () => {
    setFilterKeyword("");
    setFilterVehicle("ALL");
    setFilterStatus("ALL");
    setFilterDateRange("");
  };



  return (
    <div className="flex h-full gap-4">
      {/* ── Main panel ── */}
      <div className="flex flex-col flex-1 gap-6 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Vé tháng & Đăng ký</h2>
            <p className="text-sm text-slate-500 mt-1">Duyệt yêu cầu đăng ký vé tháng của cư dân và quản lý danh sách vé đang hoạt động.</p>
          </div>
          {/* Tab toggler */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit self-start md:self-auto border border-slate-200">
            <button
              onClick={() => { setActiveTab("passes"); setSelectedApp(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                activeTab === "passes" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Danh sách Vé tháng
            </button>
            <button
              onClick={() => { setActiveTab("applications"); setSelectedPass(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                activeTab === "applications" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Đơn Đăng Ký Cư Dân
            </button>
          </div>
        </div>

        {activeTab === "passes" ? (
          // Tab 1: Passes List
          <>
            {/* Top Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Tổng vé tháng</p>
                  <p className="text-xl font-bold text-slate-800">{countTotal.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Đang hoạt động</p>
                  <p className="text-xl font-bold text-slate-800">{countActive.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 flex-shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Đã hết hạn</p>
                  <p className="text-xl font-bold text-slate-800">{countExpired.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <MonthlyPassFilters 
              filterKeyword={filterKeyword} setFilterKeyword={setFilterKeyword}
              filterVehicle={filterVehicle} setFilterVehicle={setFilterVehicle}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filterDateRange={filterDateRange} setFilterDateRange={setFilterDateRange}
              vehicleTypes={vehicleTypes}
              onSearch={loadData}
              onReset={handleResetFilters}
              onCreate={() => { setForm(EMPTY_FORM); setFormErrors({}); setIsEditing(false); setShowCreate(true); }}
            />

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
              <MonthlyPassTable 
                passes={filteredPasses} 
                isLoading={isLoading} 
                selectedPassId={selectedPass?.id}
                onRowClick={(p) => setSelectedPass(p)}
                onEdit={(p) => {
                  setForm({ ownerName: p.ownerName, phone: p.phone, plate: p.plate || p.plateNumber, vehicleTypeId: String(p.vehicleTypeId || ""), startDate: p.startDate, endDate: p.endDate });
                  setFormErrors({});
                  setIsEditing(true);
                  setShowCreate(true);
                }}
                onRenew={(p) => { setSelectedPass(p); setRenewDate(""); setShowRenew(true); }}
                onLockToggle={handleLockToggle}
              />
              <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-white">
                <div>Hiển thị {filteredPasses.length > 0 ? 1 : 0} - {filteredPasses.length} trong tổng số {filteredPasses.length} vé</div>
              </div>
            </div>
          </>
        ) : (
          // Tab 2: Resident Applications List
          <>
            {/* Filters */}
            <div className="flex gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-9 text-xs font-semibold"
                  placeholder="Tìm biển số xe, tên cư dân..."
                  value={appKeyword}
                  onChange={(e) => setAppKeyword(e.target.value)}
                />
              </div>

              <Select value={appStatusFilter} onValueChange={setAppStatusFilter}>
                <SelectTrigger className="w-48 text-xs font-bold">
                  <SelectValue placeholder="Trạng thái đơn" />
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

              <Button variant="outline" size="icon" onClick={loadData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <TableHead className="py-4 px-6">ID</TableHead>
                    <TableHead className="py-4 px-6">Cư dân</TableHead>
                    <TableHead className="py-4 px-6">Biển số</TableHead>
                    <TableHead className="py-4 px-6">Loại xe</TableHead>
                    <TableHead className="py-4 px-6">Ngày bắt đầu</TableHead>
                    <TableHead className="py-4 px-6 text-right">Phí tháng</TableHead>
                    <TableHead className="py-4 px-6 text-center">Trạng thái</TableHead>
                    <TableHead className="py-4 px-6 text-right">Gửi lúc</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-400 font-bold">Đang tải...</TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-400 font-bold">Không tìm thấy đơn đăng ký nào.</TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        className={`hover:bg-slate-50/60 transition cursor-pointer ${
                          selectedApp?.id === app.id ? "bg-indigo-50/40" : ""
                        }`}
                      >
                        <TableCell className="py-4 px-6 font-extrabold text-slate-800">#{app.id}</TableCell>
                        <TableCell className="py-4 px-6">{app.driverFullName}</TableCell>
                        <TableCell className="py-4 px-6">
                          <LicensePlate plate={app.vehiclePlateNumber} size="sm" />
                        </TableCell>
                        <TableCell className="py-4 px-6">{app.vehicleTypeName === "Ô Tô" ? "🚗 Ô tô" : "🏍️ Xe máy"}</TableCell>
                        <TableCell className="py-4 px-6 text-slate-500">{formatDate(app.startDate)}</TableCell>
                        <TableCell className="py-4 px-6 text-right font-black text-amber-600">
                          {Number(app.price).toLocaleString()} ₫
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${APP_STATUS_BADGE[app.status]}`}>
                            {app.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right text-slate-400">{formatDate(app.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Application pagination */}
              {appTotalPages > 1 && (
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500 font-semibold bg-white">
                  <span>Hiển thị {applications.length} / {appTotalItems} đơn</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" disabled={appPage <= 1} onClick={() => setAppPage(p => p - 1)} className="h-7 w-7">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="font-bold text-slate-700">Trang {appPage} / {appTotalPages}</span>
                    <Button variant="outline" size="icon" disabled={appPage >= appTotalPages} onClick={() => setAppPage(p => p + 1)} className="h-7 w-7">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Active monthly pass side panel ── */}
      {selectedPass && activeTab === "passes" && (
        <MonthlyPassSidePanel 
          pass={selectedPass} 
          onClose={() => setSelectedPass(null)} 
          onEdit={(p) => {
            setForm({ ownerName: p.ownerName, phone: p.phone, plate: p.plate || p.plateNumber, vehicleTypeId: String(p.vehicleTypeId || ""), startDate: p.startDate, endDate: p.endDate });
            setFormErrors({});
            setIsEditing(true);
            setShowCreate(true);
          }}
          onRenew={(p) => { setSelectedPass(p); setRenewDate(""); setShowRenew(true); }}
          onStatusChange={(p) => { setSelectedPass(p); setNewStatus(p.status); setShowStatusModal(true); }}
          onLockToggle={handleLockToggle}
        />
      )}

      {/* ── Application Detail review side panel ── */}
      {selectedApp && activeTab === "applications" && (
        <div className="w-[450px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden shrink-0 animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide">Chi tiết đơn đăng ký</h3>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">Mã đơn #{selectedApp.id}</p>
            </div>
            <Badge variant="outline" className={`px-2.5 py-1 text-[10px] font-black border rounded-full ${APP_STATUS_BADGE[selectedApp.status]}`}>
              {selectedApp.status}
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-semibold text-slate-600">
            {/* 1. Account Info */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Thông tin cư dân
              </h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                <p><span className="text-slate-400">Họ và tên:</span> <strong className="text-slate-800">{selectedApp.driverFullName}</strong></p>
                <p><span className="text-slate-400">Số điện thoại:</span> <strong className="text-slate-800">{selectedApp.driverPhone || "—"}</strong></p>
                <p><span className="text-slate-400">Email:</span> <strong className="text-slate-800">{selectedApp.driverEmail || "—"}</strong></p>
                <p><span className="text-slate-400">Căn hộ:</span> <strong className="text-slate-800">{selectedApp.driverApartmentNumber || "—"}</strong></p>
                <p>
                  <span className="text-slate-400">Xác minh cư dân:</span>{" "}
                  {selectedApp.driverResidentVerified ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px]">ĐÃ XÁC MINH</Badge>
                  ) : (
                    <Badge className="bg-slate-50 text-slate-500 border border-slate-200 font-extrabold text-[9px]">CHƯA XÁC MINH</Badge>
                  )}
                </p>
              </div>
            </div>

            {/* 2. Registered Vehicles Statistics */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Thống kê phương tiện cư dân
              </h4>
              <p className="text-[11px] text-slate-500 font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Tài khoản này có <strong className="text-indigo-600">{selectedApp.driverVehicles?.length || 0} xe</strong> đã đăng ký trong hệ thống bãi đỗ:
              </p>
              {selectedApp.driverVehicles && selectedApp.driverVehicles.length > 0 && (
                <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100">
                  {selectedApp.driverVehicles.map((v) => (
                    <div key={v.id} className="p-2.5 bg-white flex justify-between items-center text-[10px] hover:bg-slate-50">
                      <div>
                        <LicensePlate plate={v.licensePlate} size="sm" />
                        <span className="text-slate-400 block mt-0.5">{v.brand} · {v.color}</span>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="px-1.5 py-0.5 text-[8px] font-bold block w-fit ml-auto">{v.approvalStatus}</Badge>
                        <Badge variant="outline" className={`px-1.5 py-0.5 text-[8px] font-black block w-fit ml-auto ${
                          v.monthlyPassStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {v.monthlyPassStatus === "ACTIVE" ? `VÉ CON HẠN (${formatDate(v.monthlyPassEndDate)})` : "VÉ HẾT HẠN / CHƯA ĐK"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Verification Images */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Ảnh chụp xác thực của đơn
              </h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">CCCD Trước</span>
                  <Dialog>
                    <button className="w-full border border-slate-100 rounded-lg overflow-hidden aspect-[1.5] bg-slate-50 hover:opacity-90">
                      <img src={selectedApp.cccdFrontImageUrl || "—"} alt="CCCD Front" className="w-full h-full object-cover" />
                    </button>
                    <DialogContent className="max-w-lg">
                      <img src={selectedApp.cccdFrontImageUrl || "—"} alt="CCCD Front Preview" className="w-full h-auto rounded-lg" />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">CCCD Sau</span>
                  <Dialog>
                    <button className="w-full border border-slate-100 rounded-lg overflow-hidden aspect-[1.5] bg-slate-50 hover:opacity-90">
                      <img src={selectedApp.cccdBackImageUrl || "—"} alt="CCCD Back" className="w-full h-full object-cover" />
                    </button>
                    <DialogContent className="max-w-lg">
                      <img src={selectedApp.cccdBackImageUrl || "—"} alt="CCCD Back Preview" className="w-full h-auto rounded-lg" />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Gương mặt</span>
                  <Dialog>
                    <button className="w-full border border-slate-100 rounded-lg overflow-hidden aspect-[1.5] bg-slate-50 hover:opacity-90">
                      <img src={selectedApp.faceImageUrl || "—"} alt="Face" className="w-full h-full object-cover" />
                    </button>
                    <DialogContent className="max-w-lg">
                      <img src={selectedApp.faceImageUrl || "—"} alt="Face Preview" className="w-full h-auto rounded-lg" />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Biển số xe</span>
                  <Dialog>
                    <button className="w-full border border-slate-100 rounded-lg overflow-hidden aspect-[1.5] bg-slate-50 hover:opacity-90">
                      <img src={selectedApp.plateImageUrl || "—"} alt="Plate" className="w-full h-full object-cover" />
                    </button>
                    <DialogContent className="max-w-lg">
                      <img src={selectedApp.plateImageUrl || "—"} alt="Plate Preview" className="w-full h-auto rounded-lg" />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Note */}
            {selectedApp.note && (
              <div className="space-y-1 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                <span className="text-[10px] text-slate-400 block">Lời nhắn của cư dân:</span>
                <p className="text-slate-800 italic">{selectedApp.note}</p>
              </div>
            )}
            {selectedApp.rejectionReason && (
              <div className="space-y-1 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                <span className="text-[10px] text-rose-400 block">Lý do từ chối trước đó:</span>
                <p className="text-rose-800 font-bold">{selectedApp.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Action buttons footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <Button variant="outline" className="w-full text-xs font-bold rounded-xl" onClick={() => setSelectedApp(null)}>Đóng</Button>
            
            {selectedApp.status === "PENDING" && (
              <>
                <Button className="w-full text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white" onClick={() => setShowRejectModal(true)}>Từ chối</Button>
                <Button className="w-full text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={handleApproveApp}>Duyệt</Button>
              </>
            )}

            {selectedApp.status === "APPROVED_AWAITING_PAYMENT" && (
              <Button className="w-full text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowPaymentModal(true)}>Xác nhận thanh toán</Button>
            )}

            {selectedApp.status === "PAID" && (
              <Button className="w-full text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setShowAssignRfidModal(true)}>Cấp thẻ RFID</Button>
            )}
          </div>
        </div>
      )}

      {/* ── Create / Edit Modal (Passes) ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Chỉnh sửa Vé Tháng" : "Tạo Vé Tháng Mới"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <InputField label="Họ Tên Chủ Xe" name="ownerName" placeholder="Nguyễn Văn A" required form={form} setField={setField} formErrors={formErrors} />
            <InputField label="Điện Thoại" name="phone" placeholder="09xxxxxxxx" form={form} setField={setField} formErrors={formErrors} />
            <InputField label="Biển Số Xe" name="plate" placeholder="51A-12345" required form={form} setField={setField} formErrors={formErrors} />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Loại Xe <span className="text-red-500">*</span></label>
              <Select value={form.vehicleTypeId || ""} onValueChange={(val) => { setField("vehicleTypeId", val); setField("areaId", ""); setField("slotId", ""); }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.vehicleTypeId && <p className="text-red-500 text-xs">{formErrors.vehicleTypeId}</p>}
            </div>

            {form.vehicleTypeId && (() => {
               const vt = vehicleTypes.find(v => String(v.id) === String(form.vehicleTypeId));
               if (!vt) return null;
               
               if (vt.requiresSlot) {
                 const availableSlots = slots.filter(s => String(s.allowedVehicleTypeId) === String(vt.id));
                 return (
                   <div className="space-y-1">
                     <label className="block text-xs font-bold text-slate-600 uppercase">Vị Trí Đỗ <span className="text-red-500">*</span></label>
                     <Select value={form.slotId || ""} onValueChange={(val) => { setField("slotId", val); setField("areaId", ""); }}>
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Chọn vị trí đỗ" />
                       </SelectTrigger>
                       <SelectContent>
                         {availableSlots.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.slotCode || `Slot ${s.id}`}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     {formErrors.slotId && <p className="text-red-500 text-xs">{formErrors.slotId}</p>}
                   </div>
                 );
               } else {
                 const availableAreas = areas.filter(a => String(a.vehicleTypeName) === vt.name || !a.vehicleTypeName);
                 return (
                   <div className="space-y-1">
                     <label className="block text-xs font-bold text-slate-600 uppercase">Khu Vực <span className="text-red-500">*</span></label>
                     <Select value={form.areaId || ""} onValueChange={(val) => { setField("areaId", val); setField("slotId", ""); }}>
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Chọn khu vực" />
                       </SelectTrigger>
                       <SelectContent>
                         {availableAreas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     {formErrors.areaId && <p className="text-red-500 text-xs">{formErrors.areaId}</p>}
                   </div>
                 );
               }
            })()}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Mã Thẻ <span className="text-red-500">*</span></label>
              <Select value={form.cardId || ""} onValueChange={(val) => setField("cardId", val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn thẻ gán vé" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.cardNumber} {c.status !== 'AVAILABLE' ? `(${c.status})` : ''}</SelectItem>)}
                </SelectContent>
              </Select>
              {formErrors.cardId && <p className="text-red-500 text-xs">{formErrors.cardId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Từ Ngày" name="startDate" type="date" required form={form} setField={setField} formErrors={formErrors} />
              <InputField label="Đến Ngày" name="endDate" type="date" required form={form} setField={setField} formErrors={formErrors} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
            <Button onClick={handleSavePass} className="bg-blue-600 hover:bg-blue-700 text-white">{isEditing ? "Lưu thay đổi" : "Tạo Vé Tháng"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Renew Modal (Passes) ── */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gia Hạn Vé: {selectedPass?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">Ngày hết hạn hiện tại: <strong className="text-red-600">{selectedPass?.endDate}</strong></p>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">Ngày Hết Hạn Mới <span className="text-red-500">*</span></label>
              <Input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} min={selectedPass?.endDate} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenew(false)}>Hủy</Button>
            <Button onClick={handleRenew} className="bg-emerald-600 hover:bg-emerald-700 text-white">Gia Hạn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Status Modal (Passes) ── */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Trạng Thái: {selectedPass?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
                <input type="radio" name="passStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-blue-600" />
                <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[s]}`}>{s}</Badge>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Hủy</Button>
            <Button onClick={handleStatus} className="bg-amber-600 hover:bg-amber-700 text-white">Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Application Modal ── */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-rose-700">Lý do từ chối đơn đăng ký</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs font-semibold">
            <textarea
              className="w-full border border-slate-200 rounded-lg p-2.5 h-20 text-xs font-semibold focus-visible:ring-indigo-600"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="text-xs font-bold rounded-xl" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>Hủy</Button>
              <Button className="text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white" onClick={handleRejectApp} disabled={!rejectReason.trim()}>Xác nhận từ chối</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Payment Application Modal ── */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800">Xác nhận thanh toán phí vé tháng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs font-semibold">
            <div>
              <label className="block text-slate-500 mb-1">Phương thức thanh toán:</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">💵 Tiền mặt (Cash)</SelectItem>
                  <SelectItem value="BANK_TRANSFER">🏦 Chuyển khoản (Bank Transfer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Mã tham chiếu / Số hóa đơn:</label>
              <Input
                placeholder="Vd: TXN123456"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="text-xs font-bold rounded-xl" onClick={() => setShowPaymentModal(false)}>Hủy</Button>
              <Button className="text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleConfirmPayment}>Xác nhận thanh toán</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Assign RFID Modal ── */}
      <Dialog open={showAssignRfidModal} onOpenChange={setShowAssignRfidModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800">Gán Thẻ RFID Vật Lý</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs font-semibold">
            <div>
              <label className="block text-slate-500 mb-1">Nhập mã thẻ RFID:</label>
              <Input
                placeholder="Vd: CARD001..."
                value={rfidCardCode}
                onChange={(e) => setRfidCardCode(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="text-xs font-bold rounded-xl" onClick={() => setShowAssignRfidModal(false)}>Hủy</Button>
              <Button className="text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAssignRfid} disabled={!rfidCardCode.trim()}>Kích hoạt vé tháng</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
