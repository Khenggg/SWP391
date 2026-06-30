import React from "react";
import { formatVND } from "@/lib/format";
import {
  CarFront,
  LogOut,
  ShieldAlert,
  PieChartIcon,
  CircleDollarSign,
  Clock,
} from "lucide-react";

const CARDS = [
  {
    key: "revenue",
    title: "Doanh thu",
    icon: <CircleDollarSign className="w-5 h-5 text-purple-600" />,
    iconBg: "bg-purple-100",
    getValue: (d) => formatVND(d?.revenue?.totalRevenue ?? 0),
    getSub: (d) => `${(d?.revenue?.paidPayments ?? 0).toLocaleString("vi-VN")} giao dịch thành công`,
  },
  {
    key: "entries",
    title: "Lượt xe vào",
    icon: <CarFront className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-100",
    getValue: (d) => (d?.traffic?.totalEntries ?? 0).toLocaleString("vi-VN"),
    getSub: (d) => `Hoàn tất: ${(d?.traffic?.completedSessions ?? 0).toLocaleString("vi-VN")}`,
  },
  {
    key: "exits",
    title: "Lượt xe ra",
    icon: <LogOut className="w-5 h-5 text-emerald-600" />,
    iconBg: "bg-emerald-100",
    getValue: (d) => (d?.traffic?.totalExits ?? 0).toLocaleString("vi-VN"),
    getSub: (d) => `Đang trong bãi: ${(d?.traffic?.activeSessions ?? 0).toLocaleString("vi-VN")}`,
  },
  {
    key: "active",
    title: "Đang gửi",
    icon: <Clock className="w-5 h-5 text-orange-600" />,
    iconBg: "bg-orange-100",
    getValue: (d) => (d?.traffic?.activeSessions ?? 0).toLocaleString("vi-VN"),
    getSub: (d) => `Tổng sức chứa: ${(d?.occupancy?.totalCapacity ?? 0).toLocaleString("vi-VN")}`,
  },
  {
    key: "lost",
    title: "Thẻ bị mất",
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
    iconBg: "bg-red-100",
    getValue: (d) => (d?.cards?.summary?.lost ?? 0).toLocaleString("vi-VN"),
    getSub: (d) => `Đang sử dụng: ${(d?.cards?.summary?.inUse ?? 0).toLocaleString("vi-VN")}`,
  },
  {
    key: "occupancy",
    title: "Tỷ lệ lấp đầy",
    icon: <PieChartIcon className="w-5 h-5 text-blue-600" />,
    iconBg: "bg-blue-100",
    getValue: (d) => `${(d?.occupancy?.occupancyRate ?? 0).toFixed(1)}%`,
    getSub: (d) =>
      `Còn trống: ${(d?.occupancy?.available ?? 0).toLocaleString("vi-VN")} chỗ`,
  },
];

export default function ReportStatCards({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl border border-slate-200 animate-pulse min-h-[110px]"
          >
            <div className="h-3 bg-slate-200 rounded w-3/4 mb-4" />
            <div className="h-7 bg-slate-200 rounded w-1/2 mb-3" />
            <div className="h-2.5 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {CARDS.map((card) => (
        <div
          key={card.key}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-slate-500">{card.title}</p>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}
            >
              {card.icon}
            </div>
          </div>
          <div>
            <h3 className="text-[22px] font-bold text-slate-800 tracking-tight leading-none mb-2">
              {card.getValue(data)}
            </h3>
            <p className="text-[11px] text-slate-400 leading-snug">{card.getSub(data)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
