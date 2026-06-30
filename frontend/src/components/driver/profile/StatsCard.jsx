import React from "react";
import { Car, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function StatsCard({ vehiclesCount, historyCount, latestHistory, formatDate }) {
  return (
    <Card className="rounded-2xl shadow-sm border-slate-200 h-full">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-sm font-bold text-slate-800">Tổng quan tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
              <Car className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Tổng số xe</p>
            <p className="text-xl font-black text-slate-800">{vehiclesCount}</p>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Tổng lượt gửi xe</p>
            <p className="text-xl font-black text-slate-800">{historyCount}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-0.5">Ngày gửi gần nhất</p>
            <p className="text-sm font-black text-slate-800">
              {latestHistory ? formatDate(latestHistory.checkOutTime || latestHistory.createdAt || latestHistory.entryTime) : "Chưa có"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
