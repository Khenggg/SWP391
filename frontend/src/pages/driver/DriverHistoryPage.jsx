import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History, Layers, Tag, CheckCircle2, AlertCircle, Clock, ScanLine } from "lucide-react";
import { reservationService } from "../../services/reservationService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import LicensePlate from "@/components/ui/license-plate";
import EmptyState from "@/components/ui/empty-state";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const getVehicleTypeLabel = (vehicleTypeId) => {
  if (vehicleTypeId === 5) return "O TO";
  if (vehicleTypeId === 7) return "XE VAN CHUYEN";
  return "XE MAY";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="outline" className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" /> Hoan thanh
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="outline" className="flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-rose-100">
          <AlertCircle className="w-3.5 h-3.5" /> Het han
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="outline" className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-100">
          <Clock className="w-3.5 h-3.5" /> Cho thanh toan
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge variant="outline" className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-indigo-100">
          <CheckCircle2 className="w-3.5 h-3.5" /> Da xac nhan
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {status || "--"}
        </Badge>
      );
  }
};

const HistoryTableSkeleton = () => (
  <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
    <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
      <div className="h-4 w-56 bg-slate-200 rounded" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 px-6 py-5">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded" />
          <div className="col-span-2 space-y-2">
            <div className="h-4 w-40 bg-slate-200 rounded" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
          <div className="h-4 w-20 bg-slate-200 rounded justify-self-end" />
          <div className="h-7 w-24 bg-slate-200 rounded-full justify-self-center" />
        </div>
      ))}
    </div>
  </Card>
);

export default function DriverHistoryPage() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setErrorMessage("");
      try {
        const history = await reservationService.getHistory(0, 50);
        setHistoryList(history);
      } catch (e) {
        console.error("Error loading booking history:", e);
        setHistoryList([]);
        setErrorMessage(e.message || "Khong the tai lich su booking.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            Lich su booking
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Xem cac booking dang cho thanh toan, da xac nhan, het han hoac da su dung.
          </p>
        </div>
      </div>

      {loading ? (
        <HistoryTableSkeleton />
      ) : errorMessage ? (
        <EmptyState
          icon="!"
          title="Khong the tai lich su booking"
          description={errorMessage}
          className="animate-fadeIn"
        />
      ) : historyList.length === 0 ? (
        <EmptyState
          icon="--"
          title="Chua co du lieu booking"
          description="Khi ban tao booking, du lieu se xuat hien o day neu don con can theo doi."
          className="animate-fadeIn"
        />
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <TableHead className="py-4.5 px-6">Ma Booking / Loai Xe</TableHead>
                <TableHead className="py-4.5 px-6">Bien So Xe</TableHead>
                <TableHead className="py-4.5 px-6">Khu Vuc</TableHead>
                <TableHead className="py-4.5 px-6">Thoi Gian</TableHead>
                <TableHead className="py-4.5 px-6 text-right">Phi Booking</TableHead>
                <TableHead className="py-4.5 px-6 text-right">Thanh Toan</TableHead>
                <TableHead className="py-4.5 px-6 text-center">Trang Thai</TableHead>
                <TableHead className="py-4.5 px-6 text-center">Ma QR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {historyList.map((reservation) => (
                <TableRow key={reservation.id} className="hover:bg-slate-50/50 transition">
                  <TableCell className="py-4 px-6">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-slate-800">{reservation.reservationCode || reservation.id}</span>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide">
                        {getVehicleTypeLabel(reservation.vehicleTypeId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <LicensePlate plate={reservation.plateNumber} size="md" />
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-extrabold">{reservation.areaName || "--"}</span>
                      </div>
                      {reservation.slotName && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Slot: {reservation.slotName}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-12">Tao:</span>
                      <span className="text-slate-700 font-bold">{formatDateTime(reservation.createdAt || reservation.reservationStartTime)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="text-[10px] font-bold text-slate-400 uppercase w-12">Het han:</span>
                      <span className="text-slate-700 font-bold">{formatDateTime(reservation.reservationEndTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <span className="font-black text-amber-600">
                      {(reservation.bookingAmount || reservation.totalAmount || 0).toLocaleString()} VND
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <span className="font-bold text-indigo-600">{reservation.paymentStatus || "--"}</span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    {getStatusBadge(reservation.status)}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    {reservation.status === "CONFIRMED" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5 mx-auto py-1 px-3 rounded-xl transition-all"
                        onClick={() => navigate(`/driver/booking/detail/${reservation.id}`)}
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        Xem QR
                      </Button>
                    ) : (
                      <span className="text-slate-400 font-mono">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4.5 text-[11px] text-slate-500 font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <span>Danh sach doc truc tiep tu backend reservation history va khong hien thi booking da huy.</span>
          </div>
        </Card>
      )}
    </div>
  );
}
