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
              <TableHead className="w-[100px] text-xs font-bold text-slate-500 uppercase">Ngày gửi</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase">Biển số</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase">Vào - Ra</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase text-right">Tổng tiền</TableHead>
              <TableHead className="text-xs font-bold text-slate-500 uppercase text-right">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  Chưa có lịch sử gửi xe
                </TableCell>
              </TableRow>
            ) : (
              recentHistory.map((h, idx) => {
                const isPaidOrCompleted = h.status === "COMPLETED" || h.status === "PAID";
                const isCancelled = h.status === "CANCELLED";
                
                const statusColor = isPaidOrCompleted 
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                  : isCancelled ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-amber-50 text-amber-600 border-amber-200";
                
                const statusText = isPaidOrCompleted 
                  ? "Đã thanh toán" 
                  : isCancelled ? "Đã hủy"
                  : "Đang đỗ";

                return (
                  <TableRow key={idx} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-semibold text-slate-700 text-sm">
                      {formatDate(h.createdAt || h.entryTime)}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-slate-900">
                      {h.plate || h.plateNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium text-slate-700">
                          {formatDateTime(h.createdAt || h.entryTime)} - {formatDateTime(h.checkOutTime || h.exitTime)}
                        </span>
                        {h.hours && <span className="text-xs text-slate-400">{h.hours}h đỗ</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-800">
                      {h.fee !== undefined ? `${h.fee.toLocaleString()} đ` : (h.totalAmount ? `${h.totalAmount.toLocaleString()} đ` : '0 đ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`shadow-none font-bold text-[10px] ${statusColor}`}>
                        {statusText}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
