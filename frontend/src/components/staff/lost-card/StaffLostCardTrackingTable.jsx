import React, { useState } from "react";
import { Search, RefreshCw, CheckCircle2, XCircle, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  PENDING: {
    label: "Chờ Manager duyệt",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    icon: <Clock className="mr-1 h-3 w-3 text-amber-600" />,
  },
  APPROVED: {
    label: "Đã phê duyệt",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />,
  },
  REJECTED: {
    label: "Đã từ chối",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    icon: <XCircle className="mr-1 h-3 w-3 text-rose-600" />,
  },
};

export default function StaffLostCardTrackingTable({
  cases = [],
  isLoading = false,
  onRefresh,
}) {
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const navigate = useNavigate();

  const filteredCases = cases.filter((item) => {
    if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
    if (!filterKeyword.trim()) return true;

    const kw = filterKeyword.toLowerCase();
    return (
      (item.caseCode || "").toLowerCase().includes(kw) ||
      (item.plateNumber || "").toLowerCase().includes(kw) ||
      (item.cardCode || "").toLowerCase().includes(kw) ||
      (item.reporterName || "").toLowerCase().includes(kw)
    );
  });

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-800">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Theo dõi danh sách hồ sơ mất thẻ
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500">
              Danh sách hồ sơ cập nhật kết quả phê duyệt thời gian thực từ Manager/Admin.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            Làm mới
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm theo mã hồ sơ, biển số, mã thẻ..."
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            {[
              { id: "ALL", label: "Tất cả" },
              { id: "PENDING", label: "Chờ duyệt" },
              { id: "APPROVED", label: "Đã duyệt" },
              { id: "REJECTED", label: "Từ chối" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  filterStatus === tab.id
                    ? "bg-white text-blue-600 shadow-sm font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-xs font-semibold text-slate-500">
                <TableHead className="whitespace-nowrap">Mã hồ sơ</TableHead>
                <TableHead className="whitespace-nowrap">Biển số / Thẻ</TableHead>
                <TableHead className="whitespace-nowrap">Người khai báo</TableHead>
                <TableHead className="whitespace-nowrap">Thời gian tạo</TableHead>
                <TableHead className="whitespace-nowrap text-center">Trạng thái</TableHead>
                <TableHead className="whitespace-nowrap">Ghi chú Manager</TableHead>
                <TableHead className="whitespace-nowrap text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    Đang tải dữ liệu hồ sơ mất thẻ...
                  </TableCell>
                </TableRow>
              ) : filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    Chưa có hồ sơ báo mất thẻ nào phù hợp.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
                  const plate = item.plateNumber || item.parkingSession?.plateNumber || "";
                  const card = item.cardCode || item.parkingCard?.cardNumber || "";

                  const managerNote = item.decisionReason || item.rejectionReason || item.decisionNote || item.note || item.approvalNote;

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm font-bold text-blue-600 whitespace-nowrap">
                        {item.caseCode || `LC-${item.id}`}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono font-bold text-slate-800 text-sm">
                          {plate || "---"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Thẻ: {card || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold text-slate-700">
                          {item.reporterName || "Khách hàng"}
                        </div>
                        <div className="text-xs text-slate-500">{item.phone || "N/A"}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {item.createdAt ? formatDateTime(item.createdAt) : "---"}
                      </TableCell>
                      <TableCell className="text-center whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${cfg.badgeClass}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs text-slate-600">
                        {managerNote ? (
                          <span className="font-medium text-slate-800" title={managerNote}>
                            {managerNote}
                          </span>
                        ) : item.status === "PENDING" ? (
                          <span className="italic text-slate-400">Đang đợi Manager xem xét</span>
                        ) : (
                          <span className="italic text-slate-400">Không có ghi chú</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {item.status === "APPROVED" ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs h-8 px-3"
                            onClick={() =>
                              navigate(`/staff/exit?query=${encodeURIComponent(plate || card || "")}`)
                            }
                          >
                            Cho xe ra
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="text-xs h-8 text-slate-400 cursor-not-allowed"
                          >
                            {item.status === "REJECTED" ? "Đã từ chối" : "Đang chờ"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
