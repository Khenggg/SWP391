import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { approvalService } from "@/services/approvalService";
import { Button } from "@/components/ui/button";
import MismatchFilters from "@/components/manager/mismatch/MismatchFilters";
import MismatchTable from "@/components/manager/mismatch/MismatchTable";
import MismatchSidePanel from "@/components/manager/mismatch/MismatchSidePanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function MismatchApprovalsPage() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [filterMismatchType, setFilterMismatchType] = useState("ALL");
  const [filterCardGroup, setFilterCardGroup] = useState("ALL");
  const [filterReason, setFilterReason] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [decisionType, setDecisionType] = useState("");
  const [reasonText, setReasonText] = useState("");

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const data = await approvalService.getMismatchCases();
      setCases(data || []);
    } catch (error) {
      console.error("Loi lay danh sach ho so lech bien so:", error);
      toast.error("Khong the tai du lieu ho so lech bien so.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterKeyword, filterStatus, filterPriority, filterMismatchType, filterCardGroup, filterReason, filterDateRange]);

  const counts = {
    PENDING: cases.filter((item) => item.status === "PENDING").length,
    CONFIRMED: cases.filter((item) => item.status === "CONFIRMED").length,
    REJECTED: cases.filter((item) => item.status === "REJECTED").length,
    ALL: cases.length,
  };

  const filtered = useMemo(() => {
    return cases.filter((item) => {
      if (activeTab !== "ALL" && item.status !== activeTab) return false;
      if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
      if (filterPriority !== "ALL" && (item.priority || "MEDIUM") !== filterPriority) return false;

      if (filterReason !== "ALL") {
        const reasonLower = String(item.reason || "").toLowerCase();
        if (filterReason === "MISTAKE" && !reasonLower.includes("nham")) return false;
        if (filterReason === "DIRTY" && !reasonLower.includes("ban") && !reasonLower.includes("mo")) return false;
        if (filterReason === "RECOGNITION" && !reasonLower.includes("camera") && !reasonLower.includes("ocr")) return false;
      }

      if (!filterKeyword) return true;

      const keyword = filterKeyword.toLowerCase();
      return [
        item.caseCode,
        item.cardCode,
        item.entryPlateNumber,
        item.exitPlateNumber,
        item.reporterName,
        item.createdBy,
      ].some((value) => String(value || "").toLowerCase().includes(keyword));
    });
  }, [activeTab, cases, filterKeyword, filterPriority, filterReason, filterStatus]);

  const paginatedCases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, filtered, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  const handleResetFilters = () => {
    setFilterKeyword("");
    setFilterStatus("ALL");
    setFilterPriority("ALL");
    setFilterDateRange("");
    setFilterMismatchType("ALL");
    setFilterCardGroup("ALL");
    setFilterReason("ALL");
  };

  const openDecisionDialog = (type) => {
    setDecisionType(type);
    setReasonText("");
    setShowReasonDialog(true);
  };

  const confirmDecision = async () => {
    if (!selectedCase) return;
    if (decisionType !== "APPROVE" && !reasonText.trim()) {
      toast.error("Vui long nhap ly do tu choi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (decisionType === "APPROVE") {
        await approvalService.confirmMismatchCase(selectedCase.sessionId || selectedCase.id, { reason: reasonText });
        toast.success("Da phe duyet ho so lech bien so.");
      } else {
        await approvalService.rejectMismatchCase(selectedCase.sessionId || selectedCase.id, { reason: reasonText });
        toast.success("Da tu choi ho so lech bien so.");
      }

      setShowReasonDialog(false);
      setSelectedCase(null);
      await loadCases();
    } catch (error) {
      toast.error(error.message || "Xu ly ho so that bai.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full gap-4">
      <div className="flex flex-1 flex-col gap-6 overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Duyet lech bien so</h2>
            <p className="mt-1 text-sm text-slate-500">Xem xet va xu ly cac ho so can manager xac nhan.</p>
          </div>
          <Button variant="outline" className="bg-white text-slate-700" onClick={loadCases} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Lam moi
          </Button>
        </div>

        <MismatchFilters
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filterKeyword={filterKeyword}
          setFilterKeyword={setFilterKeyword}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterPriority={filterPriority}
          setFilterPriority={setFilterPriority}
          filterDateRange={filterDateRange}
          setFilterDateRange={setFilterDateRange}
          filterMismatchType={filterMismatchType}
          setFilterMismatchType={setFilterMismatchType}
          filterCardGroup={filterCardGroup}
          setFilterCardGroup={setFilterCardGroup}
          filterReason={filterReason}
          setFilterReason={setFilterReason}
          onSearch={loadCases}
          onReset={handleResetFilters}
          counts={counts}
        />

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800">Danh sach yeu cau ({filtered.length})</h3>
          </div>

          <MismatchTable
            cases={paginatedCases}
            isLoading={isLoading}
            selectedCaseId={selectedCase?.id}
            onRowClick={setSelectedCase}
          />

          <div className="flex items-center justify-between border-t border-slate-200 bg-white p-3 text-sm text-slate-500">
            <div>
              Hien thi {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} cua {filtered.length} ket qua
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="primary" className="h-8 bg-blue-600 px-3">
                {currentPage} / {totalPages}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="ml-2 h-8 w-[100px]">
                  <SelectValue placeholder={`${itemsPerPage} / trang`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 / trang</SelectItem>
                  <SelectItem value="15">15 / trang</SelectItem>
                  <SelectItem value="30">30 / trang</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {selectedCase && (
        <MismatchSidePanel
          item={selectedCase}
          onClose={() => setSelectedCase(null)}
          onApprove={() => openDecisionDialog("APPROVE")}
          onReject={() => openDecisionDialog("REJECT")}
          isSubmitting={isSubmitting}
        />
      )}

      <Dialog
        open={showReasonDialog}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setShowReasonDialog(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{decisionType === "APPROVE" ? "Phe duyet ho so" : "Tu choi ho so"}</DialogTitle>
            <DialogDescription>
              {decisionType === "APPROVE"
                ? "Nhap ghi chu neu can truoc khi phe duyet."
                : "Nhap ly do tu choi."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={decisionType === "APPROVE" ? "Ghi chu phe duyet" : "Ly do tu choi"}
              value={reasonText}
              onChange={(event) => setReasonText(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReasonDialog(false)} disabled={isSubmitting}>
              Huy
            </Button>
            <Button
              className={decisionType === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
              onClick={confirmDecision}
              disabled={isSubmitting}
            >
              Xac nhan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
