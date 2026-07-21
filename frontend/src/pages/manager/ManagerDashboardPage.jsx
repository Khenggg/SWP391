import React, { useState, useEffect, useMemo } from "react";
import { dashboardService } from "../../services/dashboardService";
import { auditService } from "../../services/auditService";
import { toast } from "sonner";
import { RefreshCw, Download, CarFront, CheckCircle2, PieChart, ArrowRightToLine, ArrowLeftFromLine, Wallet, CreditCard, ScanLine, AlertTriangle, FileWarning, Wrench, FileText, BarChart2, Info, ArrowRight, MoreVertical } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

function formatVND(amount) {
  return Number(amount || 0).toLocaleString("vi-VN") + "đ";
}

const StatCard = ({ label, value, subText, icon, colorClass, isLoading }) => {
  return (
    <div className="bg-white p-3 lg:p-4 rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-all h-[124px]">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-opacity-10 ${colorClass.bg} ${colorClass.text}`}>
          {icon}
        </div>
      </div>
      <div className="mt-1 md:mt-2">
        <h3 className="text-lg md:text-2xl font-black text-[#1e293b] truncate" title={String(value)}>
          {isLoading ? <div className="h-6 md:h-8 w-16 bg-slate-200 animate-pulse rounded" /> : value}
        </h3>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[10px] md:text-xs font-bold text-[#475569] truncate">{label}</p>
          {subText && <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 ml-1 shrink-0">{subText}</span>}
        </div>
      </div>
    </div>
  );
};

export default function ManagerDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (isFirstLoad = false, showToast = true) => {
    try {
      if (isFirstLoad) setIsLoading(true);
      const [dashRes, auditRes] = await Promise.all([
        dashboardService.getDashboardSummary(),
        auditService.getAuditLogs({ page: 0, size: 5 })
      ]);
      setDashboardData(dashRes);
      setAuditLogs(auditRes || []);
      setHasError(false);
    } catch (err) {
      console.error("Lỗi tải thông tin Dashboard:", err);
      // Chỉ hiện toast lần đầu hoặc khi refresh thủ công, không spam mỗi 10s
      if (showToast) toast.error("Không thể tải thông tin Dashboard");
      setHasError(true);
    } finally {
      if (isFirstLoad) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true, true);
    const pollInterval = setInterval(() => {
      // Không hiện toast khi auto-poll thất bại
      fetchData(false, false);
    }, 30000); // Tăng lên 30s để giảm tải
    return () => clearInterval(pollInterval);
  }, []);

  const handleRefresh = () => fetchData(true, true);

  // Computed Values
  const occupancyRate = useMemo(() => {
    if (!dashboardData?.slot) return 0;
    const { occupied, total } = dashboardData.slot;
    if (total === 0) return 0;
    return Math.round((occupied / total) * 100);
  }, [dashboardData]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'ENTRY': return <ArrowRightToLine className="w-4 h-4 text-emerald-500" />;
      case 'EXIT': return <ArrowLeftFromLine className="w-4 h-4 text-orange-500" />;
      case 'LOST_CARD': return <CreditCard className="w-4 h-4 text-red-500" />;
      case 'MISMATCH': return <CarFront className="w-4 h-4 text-amber-500" />;
      case 'MAINTENANCE': return <Wrench className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'ENTRY': return 'Xe vào';
      case 'EXIT': return 'Xe ra';
      case 'LOST_CARD': return 'Mất thẻ';
      case 'MISMATCH': return 'Sai biển số';
      case 'MAINTENANCE': return 'Bảo trì slot';
      default: return action || 'Khác';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS': return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700">Thành công</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-100 text-orange-700">Chờ duyệt</span>;
      case 'VERIFYING': return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">Chờ xác minh</span>;
      case 'PROCESSING': return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700">Đang xử lý</span>;
      default: return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 pb-20 space-y-8 max-w-[1600px] mx-auto flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Thống kê</h2>
          <p className="text-sm text-slate-500 mt-0.5">Theo dõi tình hình vận hành bãi xe, doanh thu và các ca xử lý đang chờ duyệt.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" className="bg-white border-slate-200 text-slate-700 font-semibold shadow-sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Button className="bg-slate-800 hover:bg-slate-900 text-white font-semibold shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* 8 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 shrink-0">
        <StatCard 
          label="Xe đang gửi" value={dashboardData?.traffic?.activeSessions || 0} subText="Xe"
          icon={<CarFront className="w-5 h-5" />} colorClass={{ bg: "bg-blue-500", text: "text-blue-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Slot trống" value={dashboardData?.slot?.available || 0} subText="Slot"
          icon={<CheckCircle2 className="w-5 h-5" />} colorClass={{ bg: "bg-emerald-500", text: "text-emerald-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Tỷ lệ lấp đầy" value={`${occupancyRate}%`} subText="%"
          icon={<PieChart className="w-5 h-5" />} colorClass={{ bg: "bg-purple-500", text: "text-purple-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Lượt vào hôm nay" value={dashboardData?.traffic?.entriesToday || 0} subText="Lượt"
          icon={<ArrowRightToLine className="w-5 h-5" />} colorClass={{ bg: "bg-indigo-500", text: "text-indigo-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Lượt ra hôm nay" value={dashboardData?.traffic?.exitsToday || 0} subText="Lượt"
          icon={<ArrowLeftFromLine className="w-5 h-5" />} colorClass={{ bg: "bg-orange-500", text: "text-orange-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Doanh thu hôm nay" value={formatVND(dashboardData?.revenue?.todayRevenue)} subText="VND"
          icon={<Wallet className="w-5 h-5" />} colorClass={{ bg: "bg-green-500", text: "text-green-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Mất thẻ chờ duyệt" value={dashboardData?.pending?.lostCardPending || 0} subText="HS"
          icon={<CreditCard className="w-5 h-5" />} colorClass={{ bg: "bg-red-500", text: "text-red-600" }} isLoading={isLoading}
        />
        <StatCard 
          label="Sai biển số chờ" value={dashboardData?.pending?.plateMismatchPending || 0} subText="Ca"
          icon={<ScanLine className="w-5 h-5" />} colorClass={{ bg: "bg-amber-500", text: "text-amber-600" }} isLoading={isLoading}
        />
      </div>

      {/* Cảnh báo & xử lý nhanh (Full width row) */}
      <div className="shrink-0">
        <h3 className="text-lg font-bold text-[#1e293b] mb-4">Cảnh báo & xử lý nhanh</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          
          {/* Card 1: Slot trống */}
          <div className="bg-white border border-red-100 rounded-xl p-3 flex gap-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:border-red-200 transition-colors">
            <div className="bg-red-50 text-red-500 p-2 rounded-xl h-fit shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <p className="text-[11px] font-bold text-[#475569] truncate">Bãi xe còn</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-[#1e293b] leading-none">{100 - occupancyRate}%</span>
                  <span className="text-[11px] font-bold text-[#475569] truncate">slot trống</span>
                </div>
              </div>
              <Link to="/manager/structures" className="text-xs text-red-500 font-bold mt-2 flex items-center group w-fit">
                Xem chi tiết <ArrowRightToLine className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Lost Card */}
          <div className="bg-white border border-orange-100 rounded-xl p-3 flex gap-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:border-orange-200 transition-colors">
            <div className="bg-orange-50 text-orange-500 p-2 rounded-xl h-fit shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-[#1e293b] leading-none">{dashboardData?.pending?.lostCardPending || 0}</span>
                  <span className="text-[11px] font-bold text-[#1e293b] truncate">hồ sơ</span>
                </div>
                <p className="text-[10px] font-semibold text-[#64748b] mt-1 leading-snug truncate">mất thẻ chờ duyệt</p>
              </div>
              <Link to="/manager/lost-card-approvals" className="text-xs text-orange-500 font-bold mt-2 flex items-center group w-fit">
                Xem & duyệt <ArrowRightToLine className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Mismatch */}
          <div className="bg-white border border-amber-100 rounded-xl p-3 flex gap-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:border-amber-200 transition-colors">
            <div className="bg-amber-50 text-amber-500 p-2 rounded-xl h-fit shrink-0">
              <CarFront className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-[#1e293b] leading-none">{dashboardData?.pending?.plateMismatchPending || 0}</span>
                  <span className="text-[11px] font-bold text-[#1e293b] truncate">ca</span>
                </div>
                <p className="text-[10px] font-semibold text-[#64748b] mt-1 leading-snug truncate">sai biển số chờ</p>
              </div>
              <Link to="/manager/mismatch-approvals" className="text-xs text-amber-500 font-bold mt-2 flex items-center group w-fit">
                Xem & xử lý <ArrowRightToLine className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 4: Maintenance */}
          <div className="bg-white border border-blue-100 rounded-xl p-3 flex gap-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:border-blue-200 transition-colors">
            <div className="bg-blue-50 text-blue-500 p-2 rounded-xl h-fit shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-black text-[#1e293b] leading-none">{dashboardData?.slot?.maintenance ?? 0}</span>
                  <span className="text-[11px] font-bold text-[#1e293b] truncate">slot</span>
                </div>
                <p className="text-[10px] font-semibold text-[#64748b] mt-1 leading-snug truncate">đang bảo trì</p>
              </div>
              <Link to="/manager/structures" className="text-xs text-blue-500 font-bold mt-2 flex items-center group w-fit">
                Xem chi tiết <ArrowRightToLine className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Buttons Row */}
          <Link to="/manager/lost-card-approvals" className="w-full">
            <Button className="bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold h-full min-h-[70px] w-full rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5 p-2">
              <CreditCard className="w-6 h-6" />
              <span className="text-[12px] text-center leading-tight">Duyệt mất thẻ</span>
            </Button>
          </Link>

          <Link to="/manager/mismatch-approvals" className="w-full">
            <Button className="bg-[#059669] hover:bg-emerald-700 text-white font-bold h-full min-h-[70px] w-full rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5 p-2">
              <ScanLine className="w-6 h-6" />
              <span className="text-[12px] text-center leading-tight">Duyệt sai biển số</span>
            </Button>
          </Link>

          <Link to="/manager/reports" className="w-full">
            <Button variant="outline" className="bg-white border-[#e2e8f0] text-[#1d4ed8] hover:bg-[#eff6ff] font-bold h-full min-h-[70px] w-full rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5 p-2">
              <BarChart2 className="w-6 h-6" />
              <span className="text-[12px] text-center leading-tight">Xem báo cáo</span>
            </Button>
          </Link>

        </div>
      </div>

      {/* Hoạt động gần đây Table */}
      <Card className="shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-[#1e293b]">Hoạt động gần đây</h3>
          <Button variant="outline" size="sm" className="text-[13px] font-semibold text-slate-600 border-slate-200 group" onClick={() => navigate('/manager/audit-logs')}>
            Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        <div className="bg-white overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc]">
                <th className="py-3 px-5 text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Thời gian</th>
                <th className="py-3 px-5 text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Loại sự kiện</th>
                <th className="py-3 px-5 text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Nguồn</th>
                <th className="py-3 px-5 text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Mục tiêu</th>
                <th className="py-3 px-5 text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Mã tham chiếu</th>
                <th className="py-3 px-5 text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Nhân viên (ID)</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length > 0 ? (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f8fafc] transition-colors group">
                    <td className="py-3.5 px-5 text-[13px] font-medium text-[#475569]">
                      {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#1e293b]">
                        {getActionIcon(log.action)}
                        {getActionLabel(log.action)}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[13px] font-medium text-[#475569]">{log.sourceService || '-'}</td>
                    <td className="py-3.5 px-5 text-[13px] font-medium text-[#475569]">{log.targetType || '-'}</td>
                    <td className="py-3.5 px-5 text-[13px] font-medium text-[#475569]">{log.targetId || '-'}</td>
                    <td className="py-3.5 px-5 text-[13px] font-medium text-[#475569]">{log.actorUserId || log.actor || '-'}</td>
                    <td className="py-3.5 px-2 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-medium">
                    {isLoading ? 'Đang tải dữ liệu...' : hasError ? 'Không thể tải hoạt động. Nhấn Làm mới để thử lại.' : 'Không có hoạt động nào gần đây'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
