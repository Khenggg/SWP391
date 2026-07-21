import React, { useState, useEffect } from "react";
import { vehicleService } from "../../services/vehicleService";
import { parkingService } from "../../services/parkingService";
import { driverService } from "../../services/driverService";
import { PASS_STATUS } from "@/constants";
import MonthlyPassFilters from "@/components/manager/monthly-pass/MonthlyPassFilters";
import MonthlyPassTable from "@/components/manager/monthly-pass/MonthlyPassTable";
import MonthlyPassSidePanel from "@/components/manager/monthly-pass/MonthlyPassSidePanel";
import ApplicationReviewTable from "@/components/manager/monthly-pass/ApplicationReviewTable";
import ApplicationReviewPanel from "@/components/manager/monthly-pass/ApplicationReviewPanel";
import { toast } from "sonner";
import { Calendar, RefreshCw, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const STATUS_BADGE = {
  [PASS_STATUS.ACTIVE]: "bg-emerald-100 text-emerald-700 border-emerald-300",
  [PASS_STATUS.EXPIRED]: "bg-slate-100 text-slate-500 border-slate-300",
  [PASS_STATUS.LOCKED]: "bg-red-100 text-red-700 border-red-300",
  [PASS_STATUS.CANCELLED]: "bg-amber-100 text-amber-700 border-amber-300",
};

const STATUSES = Object.values(PASS_STATUS);

export default function MonthlyPassManagementPage() {
  const [activeTab, setActiveTab] = useState("applications"); // "passes" or "applications"

  // ── Passes state ────────────────────────────────────────────────
  const [passes, setPasses] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [selectedPass, setSelectedPass] = useState(null);

  // Pass modals (Edit / Renew / Status)
  const [isEditing, setIsEditing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // ── Applications state ──────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [appKeyword, setAppKeyword] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("ALL");
  const [appPage, setAppPage] = useState(1);
  const [appTotalPages, setAppTotalPages] = useState(1);
  const [appTotalItems, setAppTotalItems] = useState(0);
  const [selectedApp, setSelectedApp] = useState(null);

  // ── Data loading ────────────────────────────────────────────────
  const loadPasses = async () => {
    setIsLoading(true);
    try {
      const passesData = await vehicleService.getMonthlyPasses();
      setPasses(passesData || []);
      const vtData = await parkingService.getVehicleTypes().catch(() => []);
      setVehicleTypes(vtData || []);
    } catch (e) {
      toast.error("Không thể tải danh sách vé tháng.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const result = await driverService.getMonthlyPassApplications({
        keyword: appKeyword,
        status: appStatusFilter === "ALL" ? "" : appStatusFilter,
        page: appPage,
        pageSize: 20,
      });
      setApplications(result.items || []);
      setAppTotalPages(result.totalPages || 1);
      setAppTotalItems(result.totalItems || 0);
    } catch (e) {
      toast.error("Không thể tải danh sách đơn đăng ký.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "passes") {
      loadPasses();
    } else {
      loadApplications();
    }
  }, [activeTab, appKeyword, appStatusFilter, appPage]);

  // ── Application detail click ────────────────────────────────────
  const handleAppClick = async (app) => {
    try {
      const detail = await driverService.getMonthlyPassApplicationById(app.id);
      setSelectedApp(detail);
    } catch {
      toast.error("Không thể tải chi tiết đơn.");
    }
  };

  const handleAppRefresh = async () => {
    await loadApplications();
    // Reload selected detail too
    if (selectedApp) {
      try {
        const detail = await driverService.getMonthlyPassApplicationById(selectedApp.id);
        setSelectedApp(detail);
      } catch {
        setSelectedApp(null);
      }
    }
  };

  // ── Pass filter logic ───────────────────────────────────────────
  const filteredPasses = passes.filter((p) => {
    let effectiveStatus = p.status;
    if (p.status === PASS_STATUS.ACTIVE && p.endDate) {
      const remaining = Math.ceil((new Date(p.endDate).getTime() - Date.now()) / 86400000);
      if (remaining < 0) effectiveStatus = PASS_STATUS.EXPIRED;
    }
    const matchStatus = filterStatus === "ALL" || effectiveStatus === filterStatus;
    const matchVehicle = filterVehicle === "ALL" || p.vehicleTypeName === filterVehicle;
    const matchSearch =
      !filterKeyword ||
      p.plate?.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(filterKeyword.toLowerCase()) ||
      p.phone?.includes(filterKeyword);
    return matchStatus && matchVehicle && matchSearch;
  });

  // ── Pass actions ─────────────────────────────────────────────────
  const handleRenew = async () => {
    if (!renewDate) return;
    if (renewDate <= selectedPass.endDate) {
      toast.error("Ngày gia hạn phải sau ngày kết thúc hiện tại!");
      return;
    }
    try {
      await vehicleService.renewMonthlyPass(selectedPass.id, renewDate);
      toast.success(`Gia hạn vé ${selectedPass.plate} đến ${renewDate}`);
      setShowRenew(false);
      setSelectedPass({ ...selectedPass, endDate: renewDate });
      loadPasses();
    } catch (e) {
      toast.error(e.message || "Gia hạn vé tháng thất bại!");
    }
  };

  const handleStatus = async () => {
    try {
      await vehicleService.updateMonthlyPassStatus(selectedPass.id, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      setShowStatusModal(false);
      setSelectedPass({ ...selectedPass, status: newStatus });
      loadPasses();
    } catch (e) {
      toast.error(e.message || "Cập nhật trạng thái thất bại!");
    }
  };

  const handleLockToggle = async (pass) => {
    const nextStatus = pass.status === PASS_STATUS.LOCKED ? PASS_STATUS.ACTIVE : PASS_STATUS.LOCKED;
    try {
      await vehicleService.updateMonthlyPassStatus(pass.id, nextStatus);
      if (selectedPass?.id === pass.id) {
        setSelectedPass({ ...selectedPass, status: nextStatus });
      }
      toast.success(nextStatus === PASS_STATUS.LOCKED ? "Khóa vé thành công!" : "Mở khóa thành công!");
      loadPasses();
    } catch (e) {
      toast.error(e.message || "Cập nhật khóa vé thất bại!");
    }
  };

  const handleEditPass = async () => {
    // NOTE: Backend edit API not fully implemented — placeholder
    toast.info("Chức năng chỉnh sửa vé tháng chưa được hỗ trợ bởi backend.");
    setShowEdit(false);
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
      <div className="flex flex-col flex-1 gap-6 overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Vé tháng & Đăng ký</h2>
            <p className="text-sm text-slate-500 mt-1">
              Duyệt yêu cầu đăng ký vé tháng của cư dân và quản lý danh sách vé đang hoạt động.
            </p>
          </div>

          {/* Tab toggler */}
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
            <button
              onClick={() => { setActiveTab("applications"); setSelectedPass(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                activeTab === "applications" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              Đơn đăng ký cư dân
            </button>
            <button
              onClick={() => { setActiveTab("passes"); setSelectedApp(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-lg transition ${
                activeTab === "passes" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Danh sách vé tháng
            </button>
          </div>
        </div>

        {/* ── Tab: Đơn đăng ký ── */}
        {activeTab === "applications" && (
          <>
            {/* Filters */}
            <div className="flex gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
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
              <Button variant="outline" size="icon" onClick={loadApplications} title="Làm mới">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <ApplicationReviewTable
              applications={applications}
              isLoading={isLoading}
              selectedAppId={selectedApp?.id}
              onRowClick={handleAppClick}
              page={appPage}
              totalPages={appTotalPages}
              totalItems={appTotalItems}
              onPageChange={setAppPage}
            />
          </>
        )}

        {/* ── Tab: Danh sách vé tháng ── */}
        {activeTab === "passes" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Tổng vé</p>
                  <p className="text-xl font-bold text-slate-800">{passes.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Đang hoạt động</p>
                  <p className="text-xl font-bold text-slate-800">
                    {passes.filter((p) => p.status === PASS_STATUS.ACTIVE).length}
                  </p>
                </div>
              </div>
            </div>

            <MonthlyPassFilters
              filterKeyword={filterKeyword} setFilterKeyword={setFilterKeyword}
              filterVehicle={filterVehicle} setFilterVehicle={setFilterVehicle}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filterDateRange={filterDateRange} setFilterDateRange={setFilterDateRange}
              vehicleTypes={vehicleTypes}
              onSearch={loadPasses}
              onReset={handleResetFilters}
            />

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
              <MonthlyPassTable
                passes={filteredPasses}
                isLoading={isLoading}
                selectedPassId={selectedPass?.id}
                onRowClick={(p) => setSelectedPass(p)}
                onEdit={(p) => {
                  setEditForm({
                    ownerName: p.ownerName, phone: p.phone,
                    plate: p.plate || p.plateNumber,
                    vehicleTypeId: String(p.vehicleTypeId || ""),
                    startDate: p.startDate, endDate: p.endDate,
                  });
                  setFormErrors({});
                  setIsEditing(true);
                  setShowEdit(true);
                }}
                onRenew={(p) => { setSelectedPass(p); setRenewDate(""); setShowRenew(true); }}
                onLockToggle={handleLockToggle}
              />
              <div className="p-3 border-t border-slate-200 flex items-center text-sm text-slate-500 bg-white">
                Hiển thị {filteredPasses.length} / {passes.length} vé
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Side panel: Passes ── */}
      {selectedPass && activeTab === "passes" && (
        <MonthlyPassSidePanel
          pass={selectedPass}
          onClose={() => setSelectedPass(null)}
          onEdit={(p) => {
            setEditForm({
              ownerName: p.ownerName, phone: p.phone,
              plate: p.plate || p.plateNumber,
              vehicleTypeId: String(p.vehicleTypeId || ""),
              startDate: p.startDate, endDate: p.endDate,
            });
            setFormErrors({});
            setIsEditing(true);
            setShowEdit(true);
          }}
          onRenew={(p) => { setSelectedPass(p); setRenewDate(""); setShowRenew(true); }}
          onStatusChange={(p) => { setSelectedPass(p); setNewStatus(p.status); setShowStatusModal(true); }}
          onLockToggle={handleLockToggle}
        />
      )}

      {/* ── Side panel: Application Review ── */}
      {selectedApp && activeTab === "applications" && (
        <ApplicationReviewPanel
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRefresh={handleAppRefresh}
        />
      )}

      {/* ── Modal: Renew Pass ── */}
      <Dialog open={showRenew} onOpenChange={setShowRenew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gia Hạn Vé: {selectedPass?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <p className="text-slate-600">
              Ngày hết hạn hiện tại: <strong className="text-red-600">{selectedPass?.endDate}</strong>
            </p>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase">
                Ngày Hết Hạn Mới <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={renewDate}
                min={selectedPass?.endDate}
                onChange={(e) => setRenewDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenew(false)}>Hủy</Button>
            <Button onClick={handleRenew} className="bg-emerald-600 hover:bg-emerald-700 text-white">Gia Hạn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Change Pass Status ── */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đổi Trạng Thái: {selectedPass?.plate}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {STATUSES.map((s) => (
              <label
                key={s}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
              >
                <input
                  type="radio"
                  name="passStatus"
                  value={s}
                  checked={newStatus === s}
                  onChange={() => setNewStatus(s)}
                  className="accent-blue-600"
                />
                <Badge variant="outline" className={`px-2 py-0.5 rounded-full text-xs font-black border ${STATUS_BADGE[s]}`}>
                  {s}
                </Badge>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Hủy</Button>
            <Button onClick={handleStatus} className="bg-amber-600 hover:bg-amber-700 text-white">Cập Nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Edit Pass (placeholder — backend not implemented) ── */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Vé Tháng</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3 text-xs text-slate-600 font-semibold">
            <div>
              <label className="block text-slate-500 uppercase mb-1">Họ tên chủ xe</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={editForm.ownerName || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, ownerName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-slate-500 uppercase mb-1">Số điện thoại</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 uppercase mb-1">Từ ngày</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={editForm.startDate || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-slate-500 uppercase mb-1">Đến ngày</label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={editForm.endDate || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(false)}>Hủy</Button>
            <Button onClick={handleEditPass} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
