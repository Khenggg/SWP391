import React, { useState, useEffect, useCallback } from "react";
import { Plus, Info, Search, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { driverService } from "../../services/driverService";

// Import extracted components
import ApplicationFormDialog from "../../components/driver/vehicles/ApplicationFormDialog";
import ApplicationDetailDialog from "../../components/driver/vehicles/ApplicationDetailDialog";
import ApplicationTable from "../../components/driver/vehicles/ApplicationTable";
import ActiveVehiclesSection from "../../components/driver/vehicles/ActiveVehiclesSection";
import PayOSPaymentModal from "../../components/driver/vehicles/PayOSPaymentModal";

// ── Shared Helpers ────────────────────────────────────────────────────────────

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
      label: "Bị từ chối",
      icon: null,
      cls: "bg-rose-50 text-rose-700 border-rose-100",
    },
  };
  const cfg = map[status] || { label: status, icon: null, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DriverVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
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
  const [payTarget, setPayTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [vehiclesRes, appsRes] = await Promise.all([
        import("../../services/vehicleService").then(m => m.vehicleService.getVehicles()),
        driverService.getMonthlyPassApplications({
          keyword,
          status: filterStatus,
          page,
          pageSize: PAGE_SIZE,
        })
      ]);
      setVehicles(vehiclesRes.items || []);
      setApplications(appsRes.items);
      setTotalPages(appsRes.totalPages);
      setTotalItems(appsRes.totalItems);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [keyword, filterStatus, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applyFilter = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  const handleCreate = async (form) => {
    await driverService.submitMonthlyPassApplication(form);
    setPage(1);
    await fetchData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
            Quản Lý Phương Tiện & Vé Tháng
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Danh sách phương tiện và đơn đăng ký gửi xe vé tháng của bạn.
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

      {/* Active Vehicles Section */}
      <ActiveVehiclesSection 
        vehicles={vehicles}
        loading={loading}
        getStatusBadge={getStatusBadge}
      />

      <div className="border-t border-slate-200 my-8"></div>

      <h3 className="text-lg font-bold text-slate-800">Lịch sử đăng ký vé tháng</h3>

      {/* Info warning card */}
      <Card className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-600 font-medium">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <p className="font-extrabold text-slate-800">Quy định về Duyệt Vé Tháng:</p>
          <p>
            Cư dân **không tự thêm xe trực tiếp**. Hãy nhấn vào **"Đăng ký vé tháng"** để gửi biển số xe, thông tin xe và loại phương tiện.
          </p>
          <p>
            Manager bãi đỗ xe sẽ xem xét thông tin, đối chiếu và tiến hành duyệt hoặc từ chối đơn của bạn.
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
          onClick={fetchData}
          title="Làm mới"
          className="shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table Component */}
      <ApplicationTable
        applications={applications}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        setPage={setPage}
        setDetailTarget={setDetailTarget}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
        onPayClick={(app) => setPayTarget(app)}
      />

      {/* Dialog Components */}
      <ApplicationFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />
      
      <ApplicationDetailDialog
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        application={detailTarget}
        getStatusBadge={getStatusBadge}
      />

      <PayOSPaymentModal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        application={payTarget}
        onPaymentSuccess={async () => {
          setPayTarget(null);
          await fetchData();
        }}
      />
    </div>
  );
}
