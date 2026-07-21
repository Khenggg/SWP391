import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LicensePlate from "@/components/ui/license-plate";

function EmptyState({ icon, title, description }) {
  return (
    <Card className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-black text-slate-800 mb-2">{title}</h3>
      <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">{description}</p>
    </Card>
  );
}

export default function ApplicationTable({
  applications,
  loading,
  error,
  page,
  totalPages,
  totalItems,
  setPage,
  setDetailTarget,
  formatDate,
  getStatusBadge,
}) {
  if (loading) {
    return (
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
    );
  }

  if (error) {
    return <EmptyState icon="⚠️" title="Không thể tải danh sách đơn" description={error} />;
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Chưa gửi đơn đăng ký nào"
        description="Nhấn 'Đăng ký vé tháng' ở góc trên để khai báo xe cư dân mới."
      />
    );
  }

  return (
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
  );
}
