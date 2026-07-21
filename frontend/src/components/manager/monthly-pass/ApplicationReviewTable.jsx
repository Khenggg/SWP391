import React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LicensePlate from "@/components/ui/license-plate";

const APP_STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  APPROVED_AWAITING_PAYMENT: "bg-blue-100 text-blue-700 border-blue-300",
  PAID: "bg-indigo-100 text-indigo-700 border-indigo-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-300",
};

const APP_STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED_AWAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Bị từ chối",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function ApplicationReviewTable({
  applications,
  isLoading,
  selectedAppId,
  onRowClick,
  page,
  totalPages,
  totalItems,
  onPageChange,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-100">
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Mã đơn</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Cư dân</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Biển số</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Loại xe</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Ngày bắt đầu</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Phí tháng</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Trạng thái</TableHead>
            <TableHead className="py-3.5 px-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Gửi lúc</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Đang tải...
                </div>
              </TableCell>
            </TableRow>
          ) : applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                Không tìm thấy đơn đăng ký nào.
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
              <TableRow
                key={app.id}
                onClick={() => onRowClick(app)}
                className={`hover:bg-slate-50/60 transition cursor-pointer ${
                  selectedAppId === app.id ? "bg-indigo-50/50 border-l-2 border-l-indigo-500" : ""
                }`}
              >
                <TableCell className="py-4 px-5 font-extrabold text-slate-800">#{app.id}</TableCell>
                <TableCell className="py-4 px-5">{app.driverFullName || "—"}</TableCell>
                <TableCell className="py-4 px-5">
                  <LicensePlate plate={app.vehiclePlateNumber} size="sm" />
                </TableCell>
                <TableCell className="py-4 px-5">
                  {app.vehicleTypeName === "Ô Tô" ? "🚗 Ô tô" : "🏍️ Xe máy"}
                </TableCell>
                <TableCell className="py-4 px-5 text-slate-500">{formatDate(app.startDate)}</TableCell>
                <TableCell className="py-4 px-5 text-right font-black text-amber-600">
                  {Number(app.price).toLocaleString("vi-VN")} ₫
                </TableCell>
                <TableCell className="py-4 px-5 text-center">
                  <Badge
                    variant="outline"
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${APP_STATUS_BADGE[app.status] || "bg-slate-100 text-slate-500 border-slate-200"}`}
                  >
                    {APP_STATUS_LABEL[app.status] || app.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-5 text-right text-slate-400">{formatDate(app.createdAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span>
          Hiển thị {applications.length} / {totalItems} đơn
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="font-bold text-slate-700">Trang {page} / {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
