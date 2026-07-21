import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useMismatchCases } from "@/hooks/useLicensePlateMismatch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/format";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING: { cls: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <Clock className="w-3 h-3" />, label: "Chờ duyệt" },
    APPROVED: { cls: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle2 className="w-3 h-3" />, label: "Đã duyệt" },
    CONFIRMED: { cls: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle2 className="w-3 h-3" />, label: "Đã duyệt" },
    REJECTED: { cls: "bg-red-100 text-red-800 border-red-300", icon: <XCircle className="w-3 h-3" />, label: "Từ chối" },
  };
  const c = map[status] ?? { cls: "bg-slate-100 text-slate-600 border-slate-300", icon: null, label: status };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-bold ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
function TabBar({ activeTab, setActiveTab, counts }) {
  const tabs = [
    { key: "ALL", label: "Tất cả" },
    { key: "PENDING", label: "Chờ duyệt" },
    { key: "APPROVED", label: "Đã duyệt" },
    { key: "REJECTED", label: "Từ chối" },
  ];
  return (
    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setActiveTab(t.key)}
          className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
            activeTab === t.key
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {t.label}
          {counts[t.key] !== undefined && (
            <span className="ml-1.5 text-[10px] bg-slate-200 rounded-full px-1.5 py-0.5">
              {counts[t.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MismatchApprovalsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("PENDING");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: rawCases = [], isLoading, refetch } = useMismatchCases();

  const counts = {
    ALL: rawCases.length,
    PENDING: rawCases.filter((c) => c.status === "PENDING").length,
    APPROVED: rawCases.filter((c) => c.status === "APPROVED" || c.status === "CONFIRMED").length,
    REJECTED: rawCases.filter((c) => c.status === "REJECTED").length,
  };

  const filtered = useMemo(() => {
    return rawCases.filter((item) => {
      if (activeTab !== "ALL") {
        const normalised = item.status === "CONFIRMED" ? "APPROVED" : item.status;
        if (normalised !== activeTab) return false;
      }
      if (!filterKeyword) return true;
      const kw = filterKeyword.toLowerCase();
      return [
        String(item.id),
        String(item.sessionId),
        item.entryPlateNumber,
        item.exitPlateNumber,
        item.createdBy,
        item.submittedBy,
      ].some((v) => String(v || "").toLowerCase().includes(kw));
    });
  }, [rawCases, activeTab, filterKeyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full gap-6 p-6 overflow-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Duyệt lệch biển số</h2>
          <p className="mt-1 text-sm text-slate-500">Xem xét và xử lý các hồ sơ cần Manager xác nhận.</p>
        </div>
        <Button variant="outline" className="bg-white text-slate-700" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <TabBar activeTab={activeTab} setActiveTab={handleTabChange} counts={counts} />
        <input
          type="text"
          value={filterKeyword}
          onChange={(e) => { setFilterKeyword(e.target.value); setCurrentPage(1); }}
          placeholder="Tìm theo ID, biển số, nhân viên..."
          className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-sm font-bold text-slate-800">Danh sách yêu cầu ({filtered.length})</h3>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Đang tải...
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              Không có hồ sơ nào.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["ID", "Session ID", "Biển số đăng ký", "Biển số thực tế", "Nhân viên báo cáo", "Thời gian", "Trạng thái", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-indigo-50/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/manager/mismatch-approvals/${item.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">#{item.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.sessionId}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{item.entryPlateNumber || "—"}</td>
                    <td className="px-4 py-3 font-bold text-rose-600">{item.exitPlateNumber || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{item.submittedBy || item.createdBy || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {item.createdAt ? formatDateTime(item.createdAt) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/manager/mismatch-approvals/${item.id}`); }}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white p-3 text-sm text-slate-500">
          <span>
            Hiện {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filtered.length)} / {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="primary" className="h-8 bg-blue-600 px-3 text-white text-xs">
              {currentPage} / {totalPages}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="ml-2 h-8 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / trang</SelectItem>
                <SelectItem value="20">20 / trang</SelectItem>
                <SelectItem value="50">50 / trang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
