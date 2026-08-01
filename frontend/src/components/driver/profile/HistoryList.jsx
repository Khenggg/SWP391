import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function HistoryList({ history, formatDate, formatDateTime }) {
  const navigate = useNavigate();
  const recentHistory = history.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Lịch sử gửi xe gần đây</h3>
        <Button
          variant="link"
          className="text-blue-600 text-sm font-semibold h-auto p-0"
          onClick={() => navigate("/driver/history")}
        >
          Xem tất cả
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[100px] text-xs font-bold text-slate-500 uppercase">Ngày</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase">Biển số</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase">Thời gian</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase text-right">Phí gửi / booking</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase text-right">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-semibold">
                  Chưa có lịch sử gửi xe
                </TableCell>
              </TableRow>
            ) : (
              recentHistory.map((h, idx) => {
                const isPaid = h.paymentStatus === "PAID";
                const isCompleted = h.status === "COMPLETED";
                const isDeparted = h.status === "DEPARTED";
                const isInBuilding = h.status === "IN_BUILDING";
                const isCancelled = h.status === "CANCELLED";
                const isExpired = h.status === "EXPIRED";
                const isConfirmed = h.status === "CONFIRMED";
                const isPending = h.status === "PENDING";

                const statusColor =
                  isInBuilding
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : isDeparted || isPaid || isCompleted
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : isConfirmed
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : isCancelled
                          ? "bg-red-50 text-red-600 border-red-200"
                          : isExpired
                            ? "bg-slate-100 text-slate-500 border-slate-200"
                            : "bg-amber-50 text-amber-600 border-amber-200";

                const statusText =
                  isInBuilding
                    ? "🔵 Trong bãi"
                    : isDeparted
                      ? "✅ Đã ra"
                      : isPaid || isCompleted
                        ? "Đã thanh toán"
                        : isConfirmed
                          ? "Đã xác nhận"
                          : isCancelled
                            ? "Đã hủy"
                            : isExpired
                              ? "Hết hạn"
                              : isPending
                                ? "Đang chờ"
                                : h.status || "Không xác định";

                const startTime = h.entryTime || h.createdAt || h.reservationStartTime;
                const endTime = h.exitTime || h.reservationEndTime;
                const plateNo = h.licensePlate || h.plateNumber || "—";
                const feeAmount = h.parkingFee !== undefined && h.parkingFee !== null
                  ? h.parkingFee
                  : h.bookingAmount;

                return (
                  <TableRow key={h.id || idx} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-semibold text-slate-700 text-sm">
                      {formatDate(startTime)}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-slate-900">
                      {plateNo}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-slate-700">
                          {formatDateTime(startTime)}
                          {endTime ? ` - ${formatDateTime(endTime)}` : isInBuilding ? " (Đang đỗ)" : ""}
                        </span>
                        {h.parkingDuration && (
                          <span className="text-[11px] text-slate-400 font-semibold">{h.parkingDuration}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-800">
                      {feeAmount !== undefined && feeAmount !== null ? `${Number(feeAmount).toLocaleString("vi-VN")} ₫` : "0 ₫"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`shadow-none font-bold text-[10px] ${statusColor}`}>
                        {statusText}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
