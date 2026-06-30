import React, { useEffect, useState, useMemo } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { auditService } from "@/services/auditService";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuditLogFilters from "./AuditLogFilters";
import AuditLogTable from "./AuditLogTable";
import AuditLogSidePanel from "./AuditLogSidePanel";

export default function AuditLogView({ mode = "manager" }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters state
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterTarget, setFilterTarget] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterService, setFilterService] = useState("ALL");

  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = { size: 1000 };
      if (filterKeyword) params.keyword = filterKeyword;
      if (filterAction !== "ALL") params.action = filterAction;
      if (filterTarget !== "ALL") params.targetType = filterTarget;
      if (filterDate) params.date = filterDate;
      if (mode === "admin" && filterRole !== "ALL") params.role = filterRole;
      if (mode === "admin" && filterService !== "ALL") params.sourceService = filterService;
      
      const data = await auditService.getAuditLogs(params);
      setLogs(data || []);
      setCurrentPage(1);
    } catch (error) {
      toast.error(error.message || "Không tải được dữ liệu nhật ký.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logs.slice(startIndex, startIndex + itemsPerPage);
  }, [logs, currentPage, itemsPerPage]);

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = () => {
    setFilterKeyword("");
    setFilterAction("ALL");
    setFilterTarget("ALL");
    setFilterDate("");
    setFilterRole("ALL");
    setFilterService("ALL");
    loadData();
  };

  const handleExport = async () => {
    try {
      toast.info("Đang xuất file Excel...");
      const params = { size: 1000 };
      if (filterKeyword) params.keyword = filterKeyword;
      if (filterAction !== "ALL") params.action = filterAction;
      if (filterTarget !== "ALL") params.targetType = filterTarget;
      if (filterDate) params.date = filterDate;
      if (mode === "admin" && filterRole !== "ALL") params.role = filterRole;
      if (mode === "admin" && filterService !== "ALL") params.sourceService = filterService;

      const blob = await auditService.exportAuditLogs(params);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AuditLog_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Xuất Excel thành công!");
    } catch (error) {
      toast.error("Xuất Excel thất bại: " + error.message);
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-col flex-1 gap-4 transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nhật ký hệ thống (Audit Logs) {mode === "admin" && "- Admin"}</h2>
            <p className="text-sm text-slate-500 mt-1">Tìm kiếm và xem lịch sử hoạt động của hệ thống</p>
          </div>
          <div className="flex gap-2">
            {mode === "admin" && (
              <Button variant="outline" onClick={handleExport} className="bg-white text-slate-700">
                <Download className="w-4 h-4 mr-2 text-slate-500" /> Xuất Excel
              </Button>
            )}
          </div>
        </div>

        <AuditLogFilters 
          filterKeyword={filterKeyword} setFilterKeyword={setFilterKeyword}
          filterAction={filterAction} setFilterAction={setFilterAction}
          filterTarget={filterTarget} setFilterTarget={setFilterTarget}
          filterDate={filterDate} setFilterDate={setFilterDate}
          filterRole={filterRole} setFilterRole={setFilterRole}
          filterService={filterService} setFilterService={setFilterService}
          mode={mode}
          onApply={loadData}
          onReset={handleReset}
          isLoading={isLoading}
        />

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex-1 flex flex-col shadow-sm">
          <div className="p-3 border-b border-slate-200 flex items-center text-sm text-slate-500 bg-white font-semibold">
            Danh sách nhật ký ({logs.length} kết quả)
          </div>
          
          <AuditLogTable 
            logs={paginatedLogs} 
            isLoading={isLoading} 
            selectedLogId={selectedLog?.id}
            onRowClick={setSelectedLog} 
          />
          
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-white">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-[70px] bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span>/ trang</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                Đang xem <span className="font-bold text-slate-700">{logs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> - <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, logs.length)}</span> trong <span className="font-bold text-slate-700">{logs.length}</span> kết quả
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-white"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center justify-center px-2 min-w-[3rem] font-medium text-slate-700">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-white"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <AuditLogSidePanel 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
          mode={mode}
        />
      )}
    </div>
  );
}
