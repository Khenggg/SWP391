import React, { useState, useEffect, useCallback } from "react";
import {
  History, Search, ChevronLeft, ChevronRight,
  RefreshCw, Image as ImageIcon, X, Clock, CheckCircle2,
  Car, Bike, CalendarClock,
} from "lucide-react";
import { driverService } from "../../services/driverService";
import { reservationService } from "../../services/reservationService";
import { Card } from "@/components/ui/card";
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

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(
    d.getMonth() + 1
  )}/${d.getFullYear()}`;
};

const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return Number(amount).toLocaleString("vi-VN") + " ₫";
};

// ── Session Status Badge ─────────────────────────────────────────────────────

const SessionStatusBadge = ({ status }) => {
  if (status === "IN_BUILDING") {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
      >
        <Clock className="w-3 h-3" />
        Trong bãi
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
    >
      <CheckCircle2 className="w-3 h-3" />
      Đã ra
    </Badge>
  );
};

// ── Booking Status Badge ─────────────────────────────────────────────────────

const BOOKING_STATUS_MAP = {
  CONFIRMED: { label: "Đã xác nhận", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING: { label: "Đang chờ", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  CANCELLED: { label: "Đã hủy", cls: "bg-red-50 text-red-600 border-red-200" },
  EXPIRED: { label: "Hết hạn", cls: "bg-slate-50 text-slate-500 border-slate-200" },
  COMPLETED: { label: "Hoàn thành", cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

const BookingStatusBadge = ({ status, paymentStatus }) => {
  const isPaid = paymentStatus === "PAID";
  const key = isPaid ? "CONFIRMED" : (status || "PENDING");
  const cfg = BOOKING_STATUS_MAP[key] || { label: key, cls: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <Badge variant="outline" className={`text-[10px] font-black px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </Badge>
  );
};

// ── Vehicle Type Label ────────────────────────────────────────────────────────

const VehicleTypeLabel = ({ type }) => (
  <div className="flex items-center gap-1 text-slate-600">
    {type === "CAR" ? (
      <Car className="w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <Bike className="w-3.5 h-3.5 text-violet-500" />
    )}
    <span className="font-bold">{type === "CAR" ? "Ô tô" : "Xe máy"}</span>
  </div>
);

// ── Image Viewer Dialog ───────────────────────────────────────────────────────

function ImageViewerDialog({ open, onClose, entryUrl, exitUrl, plate }) {
  const [active, setActive] = useState("entry");

  useEffect(() => {
    if (open) setActive(entryUrl ? "entry" : "exit");
  }, [open, entryUrl]);

  const url = active === "entry" ? entryUrl : exitUrl;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-black text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            Ảnh chụp xe — {plate}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <div className="flex gap-2">
            <button
              onClick={() => setActive("entry")}
              disabled={!entryUrl}
              className={`flex-1 text-xs font-bold py-1.5 rounded-lg border transition ${
                active === "entry"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-200 text-slate-500 hover:border-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              📥 Lúc vào
            </button>
            <button
              onClick={() => setActive("exit")}
              disabled={!exitUrl}
              className={`flex-1 text-xs font-bold py-1.5 rounded-lg border transition ${
                active === "exit"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-200 text-slate-500 hover:border-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              📤 Lúc ra
            </button>
          </div>

          {url ? (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center">
              <img
                src={url}
                alt={active === "entry" ? "Ảnh vào" : "Ảnh ra"}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div
                className="hidden w-full h-full items-center justify-center text-xs text-slate-400 font-semibold"
                style={{ display: "none" }}
              >
                Không thể tải ảnh
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 aspect-video flex items-center justify-center text-slate-400 text-xs font-semibold">
              Không có ảnh
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Table Skeleton ────────────────────────────────────────────────────────────

const TableSkeleton = ({ cols = 7 }) => (
  <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`grid gap-3 px-6 py-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className={`h-4 ${j % 2 === 0 ? "bg-slate-200" : "bg-slate-100"} rounded`} />
          ))}
        </div>
      ))}
    </div>
  </Card>
);

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, totalItems, count, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500 font-semibold">
      <span>Hiển thị {count} / {totalItems} bản ghi</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={onPrev} className="h-7 w-7">
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        <span className="font-bold text-slate-700">Trang {page} / {totalPages}</span>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={onNext} className="h-7 w-7">
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ── Session History Tab ───────────────────────────────────────────────────────

function SessionHistoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewerTarget, setViewerTarget] = useState(null);
  const PAGE_SIZE = 20;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await driverService.getEntryExitHistory({
        keyword,
        status: statusFilter,
        fromDate: fromDate ? new Date(fromDate).toISOString() : null,
        toDate: toDate ? new Date(toDate + "T23:59:59").toISOString() : null,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử vào/ra xe.");
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, fromDate, toDate, page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const resetPage = (setter) => (val) => { setter(val); setPage(1); };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9 text-sm font-semibold" placeholder="Tìm theo biển số..." value={keyword} onChange={(e) => resetPage(setKeyword)(e.target.value)} />
        </div>
        <Select value={statusFilter || "ALL"} onValueChange={(v) => resetPage(setStatusFilter)(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-44 text-xs font-bold">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="IN_BUILDING">🔵 Đang trong bãi</SelectItem>
            <SelectItem value="DEPARTED">✅ Đã ra</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Từ ngày</label>
          <Input type="date" className="text-xs font-semibold w-36" value={fromDate} onChange={(e) => resetPage(setFromDate)(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Đến ngày</label>
          <Input type="date" className="text-xs font-semibold w-36" value={toDate} onChange={(e) => resetPage(setToDate)(e.target.value)} />
        </div>
        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-rose-500" onClick={() => { setFromDate(""); setToDate(""); setPage(1); }}>
            <X className="w-3.5 h-3.5 mr-1" />Xoá ngày
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={fetchHistory} title="Làm mới" className="shrink-0">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton cols={7} />
      ) : error ? (
        <EmptyState icon="⚠️" title="Không thể tải lịch sử" description={error} />
      ) : items.length === 0 ? (
        <EmptyState icon="🕐" title="Chưa có lịch sử vào/ra xe" description="Khi phương tiện của bạn vào bãi đỗ, lịch sử sẽ xuất hiện ở đây." />
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <TableHead className="py-4 px-5">Biển số / Loại</TableHead>
                  <TableHead className="py-4 px-5">Giờ vào</TableHead>
                  <TableHead className="py-4 px-5">Giờ ra</TableHead>
                  <TableHead className="py-4 px-5">Thời gian đỗ</TableHead>
                  <TableHead className="py-4 px-5 text-right">Phí đỗ xe</TableHead>
                  <TableHead className="py-4 px-5 text-center">Trạng thái</TableHead>
                  <TableHead className="py-4 px-5 text-center">Ảnh chụp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 transition">
                    <TableCell className="py-4 px-5">
                      <LicensePlate plate={item.licensePlate} size="md" />
                      <div className="mt-1.5"><VehicleTypeLabel type={item.vehicleType} /></div>
                    </TableCell>
                    <TableCell className="py-4 px-5"><span className="font-bold text-slate-800">{formatDateTime(item.entryTime)}</span></TableCell>
                    <TableCell className="py-4 px-5">
                      {item.exitTime ? <span className="font-bold text-slate-800">{formatDateTime(item.exitTime)}</span> : <span className="text-slate-400 font-mono">—</span>}
                    </TableCell>
                    <TableCell className="py-4 px-5"><span className="font-mono font-bold text-indigo-700">{item.parkingDuration ?? "—"}</span></TableCell>
                    <TableCell className="py-4 px-5 text-right"><span className="font-black text-amber-600">{formatCurrency(item.parkingFee)}</span></TableCell>
                    <TableCell className="py-4 px-5 text-center"><SessionStatusBadge status={item.status} /></TableCell>
                    <TableCell className="py-4 px-5 text-center">
                      {(item.entryImageUrl || item.exitImageUrl) ? (
                        <Button variant="outline" size="sm" className="text-[11px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex items-center gap-1 mx-auto px-2.5 py-1 rounded-lg" onClick={() => setViewerTarget(item)}>
                          <ImageIcon className="w-3 h-3" />Xem ảnh
                        </Button>
                      ) : <span className="text-slate-400 font-mono">—</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} count={items.length} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
        </Card>
      )}

      <ImageViewerDialog open={Boolean(viewerTarget)} onClose={() => setViewerTarget(null)} entryUrl={viewerTarget?.entryImageUrl} exitUrl={viewerTarget?.exitImageUrl} plate={viewerTarget?.licensePlate} />
    </div>
  );
}

// ── Booking History Tab ───────────────────────────────────────────────────────

function BookingHistoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const PAGE_SIZE = 20;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await reservationService.getReservationHistory({
        keyword,
        status: statusFilter,
        fromDate: fromDate ? new Date(fromDate).toISOString() : null,
        toDate: toDate ? new Date(toDate + "T23:59:59").toISOString() : null,
        page,
        pageSize: PAGE_SIZE,
      });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      setError(err.message || "Không thể tải lịch sử đặt chỗ.");
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, fromDate, toDate, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const resetPage = (setter) => (val) => { setter(val); setPage(1); };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9 text-sm font-semibold" placeholder="Tìm theo biển số..." value={keyword} onChange={(e) => resetPage(setKeyword)(e.target.value)} />
        </div>
        <Select value={statusFilter || "ALL"} onValueChange={(v) => resetPage(setStatusFilter)(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-48 text-xs font-bold">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">⏳ Đang chờ thanh toán</SelectItem>
            <SelectItem value="CONFIRMED">✅ Đã xác nhận</SelectItem>
            <SelectItem value="COMPLETED">🏁 Hoàn thành</SelectItem>
            <SelectItem value="EXPIRED">⌛ Hết hạn</SelectItem>
            <SelectItem value="CANCELLED">❌ Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Từ ngày</label>
          <Input type="date" className="text-xs font-semibold w-36" value={fromDate} onChange={(e) => resetPage(setFromDate)(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Đến ngày</label>
          <Input type="date" className="text-xs font-semibold w-36" value={toDate} onChange={(e) => resetPage(setToDate)(e.target.value)} />
        </div>
        {(fromDate || toDate) && (
          <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-rose-500" onClick={() => { setFromDate(""); setToDate(""); setPage(1); }}>
            <X className="w-3.5 h-3.5 mr-1" />Xoá ngày
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={fetchBookings} title="Làm mới" className="shrink-0">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton cols={6} />
      ) : error ? (
        <EmptyState icon="⚠️" title="Không thể tải lịch sử đặt chỗ" description={error} />
      ) : items.length === 0 ? (
        <EmptyState icon="📅" title="Chưa có lịch sử đặt chỗ" description="Các lần đặt chỗ của bạn sẽ xuất hiện ở đây." />
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <TableHead className="py-4 px-5">Ngày tạo</TableHead>
                  <TableHead className="py-4 px-5">Biển số</TableHead>
                  <TableHead className="py-4 px-5">Khu vực / Slot</TableHead>
                  <TableHead className="py-4 px-5">Thời gian</TableHead>
                  <TableHead className="py-4 px-5 text-right">Phí booking</TableHead>
                  <TableHead className="py-4 px-5 text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/60 transition">
                    <TableCell className="py-4 px-5 font-bold text-slate-700">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="py-4 px-5">
                      <LicensePlate plate={item.plateNumber} size="md" />
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <div className="font-bold text-slate-800">{item.areaName || "—"}</div>
                      {item.slotName && <div className="text-slate-400 text-[10px] mt-0.5">Slot: {item.slotName}</div>}
                    </TableCell>
                    <TableCell className="py-4 px-5">
                      <div className="font-mono text-slate-700">{formatDateTime(item.reservationStartTime)}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">→ {formatDateTime(item.reservationEndTime)}</div>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-right">
                      <span className="font-black text-indigo-700">{formatCurrency(item.bookingAmount)}</span>
                    </TableCell>
                    <TableCell className="py-4 px-5 text-center">
                      <BookingStatusBadge status={item.status} paymentStatus={item.paymentStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={totalItems} count={items.length} onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} />
        </Card>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DriverHistoryPage() {
  const [activeTab, setActiveTab] = useState("sessions");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Lịch sử gửi xe
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Toàn bộ lịch sử vào/ra bãi và các lần đặt chỗ của bạn.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
            activeTab === "sessions"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <History className="w-4 h-4" />
          Vào/Ra bãi
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
            activeTab === "bookings"
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          Đặt chỗ (Booking)
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "sessions" ? <SessionHistoryTab /> : <BookingHistoryTab />}
    </div>
  );
}
