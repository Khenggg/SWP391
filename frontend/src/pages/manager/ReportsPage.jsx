import React, { useCallback, useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { reportService } from "@/services/reportService";
import { Button } from "@/components/ui/button";

import ReportStatCards from "@/components/manager/reports/ReportStatCards";

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const to = new Date().toISOString();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
      const from = fromDate.toISOString();

      const [revRes, trafficRes, occRes, cardsRes] = await Promise.allSettled([
        reportService.getRevenue({ from, to }),
        reportService.getTraffic({ from, to }),
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      toast.info("Đang xuất báo cáo...");
      const blob = await reportService.exportExcel({});
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BaoCao_${new Date().toISOString().split("T")[0]}.xlsx`
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Báo cáo & Thống kê</h2>
          <p className="text-sm text-slate-500 mt-1">
            Xem và xuất báo cáo hoạt động hệ thống gửi xe
          </p>
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

      {/* KPI Cards */}
      <ReportStatCards data={reportData} isLoading={isLoading} />
    </div>
  );
}
