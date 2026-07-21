import React, { useCallback, useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { reportService } from "@/services/reportService";
import { Button } from "@/components/ui/button";

import ReportStatCards from "@/components/manager/reports/ReportStatCards";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  // Default to last 30 days
  const defaultTo = new Date();
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const [dateRange, setDateRange] = useState({
    from: defaultFrom.toISOString().split("T")[0],
    to: defaultTo.toISOString().split("T")[0],
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Convert selected dates to ISO string for API
      const fromISO = new Date(dateRange.from).toISOString();
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      const toISO = toDate.toISOString();

      const [revRes, trafficRes, occRes, cardsRes] = await Promise.allSettled([
        reportService.getRevenue({ from: fromISO, to: toISO }),
        reportService.getTraffic({ from: fromISO, to: toISO }),
        reportService.getOccupancy({}),
        reportService.getCardSessionReport({}),
      ]);

      const getValue = (res) => (res.status === "fulfilled" ? res.value : null);

      setReportData({
        revenue: getValue(revRes),
        traffic: getValue(trafficRes),
        occupancy: getValue(occRes),
        cards: getValue(cardsRes),
      });

      const failures = [revRes, trafficRes, occRes, cardsRes].filter(
        (r) => r.status === "rejected"
      );
      if (failures.length > 0) {
        console.warn(
          "[ReportsPage] Một số API báo cáo thất bại:",
          failures.map((f) => f.reason)
        );
        toast.warning(`${failures.length} nguồn dữ liệu báo cáo không tải được.`);
      }
    } catch (error) {
      toast.error(error.message || "Không thể tải dữ liệu báo cáo.");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      toast.info("Đang xuất báo cáo...");
      const blob = await reportService.exportExcel({
        from: new Date(dateRange.from).toISOString(),
        to: new Date(dateRange.to).toISOString()
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BaoCao_${dateRange.from}_den_${dateRange.to}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      toast.error("Lỗi xuất báo cáo: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-2 md:p-6 pb-20 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê</h2>
          <p className="text-sm text-slate-500 mt-1">
            Xem và xuất báo cáo hoạt động hệ thống gửi xe
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium text-slate-600">Từ:</span>
              <input 
                type="date" 
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({...prev, from: e.target.value}))}
                className="bg-transparent border-none text-sm focus:ring-0 text-slate-700 font-medium cursor-pointer"
              />
            </div>
            <div className="h-4 w-[1px] bg-slate-300"></div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm font-medium text-slate-600">Đến:</span>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({...prev, to: e.target.value}))}
                className="bg-transparent border-none text-sm focus:ring-0 text-slate-700 font-medium cursor-pointer"
              />
            </div>
            <Button 
              size="sm" 
              className="bg-slate-800 hover:bg-slate-700 text-white rounded-md px-3 h-8 ml-1"
              onClick={loadData}
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              Lọc
            </Button>
          </div>

          <Button
            variant="outline"
            className="bg-white border-slate-200 text-slate-700 font-semibold shadow-sm rounded-lg"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <ReportStatCards data={reportData} isLoading={isLoading} />
    </div>
  );
}
