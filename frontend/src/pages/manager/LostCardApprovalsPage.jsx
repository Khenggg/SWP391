import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { approvalService } from "@/services/approvalService";
import { Button } from "@/components/ui/button";
import LostCardFilters from "@/components/manager/lost-card/LostCardFilters";
import LostCardTable from "@/components/manager/lost-card/LostCardTable";
import LostCardSidePanel from "@/components/manager/lost-card/LostCardSidePanel";
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

export default function LostCardApprovalsPage() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterDateRange, setFilterDateRange] = useState("");
  const [filterCreator, setFilterCreator] = useState("ALL");
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
      const data = await approvalService.getLostCardCases();
      setCases(data || []);
    } catch (error) {
      console.error("Loi lay danh sach ho so mat the:", error);
      toast.error("Khong the tai du lieu ho so mat the.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterKeyword, filterStatus, filterPriority, filterCreator, filterReason, filterDateRange]);

  const counts = {
    PENDING: cases.filter((item) => item.status === "PENDING").length,
    APPROVED: cases.filter((item) => item.status === "APPROVED").length,
    REJECTED: cases.filter((item) => item.status === "REJECTED").length,
    ALL: cases.length,
  };

  const filtered = useMemo(() => {
    return cases.filter((item) => {
      if (activeTab !== "ALL" && item.status !== activeTab) return false;
      if (filterStatus !== "ALL" && item.status !== filterStatus) return false;
      if (filterPriority !== "ALL" && (item.priority || "MEDIUM") !== filterPriority) return false;
      if (filterCreator !== "ALL" && (item.reporterName || "Staff") !== filterCreator) return false;

      if (filterReason !== "ALL") {
        const reasonLower = String(item.reason || "").toLowerCase();
        if (filterReason === "LOST" && !reasonLower.includes("that")) return false;
        if (filterReason === "STOLEN" && !reasonLower.includes("cap") && !reasonLower.includes("trom")) return false;
        if (filterReason === "DROPPED" && !reasonLower.includes("roi")) return false;
        if (filterReason === "UNKNOWN" && reasonLower.length > 0 && !reasonLower.includes("khong")) return false;
      }

      if (!filterKeyword) return true;

      const keyword = filterKeyword.toLowerCase();
      return [
        item.caseCode,
        item.cardCode,
        item.plateNumber,
        item.reporterName,
      ].some((value) => String(value || "").toLowerCase().includes(keyword));
    });
  }, [
    activeTab,
    cases,
    filterCreator,
    filterKeyword,
    filterPriority,
    filterReason,
    filterStatus,
  ]);

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
    setFilterCreator("ALL");
    setFilterReason("ALL");
  };

  const handleSelectCase = async (item) => {
    setSelectedCase(item);

    try {
      const detail = await approvalService.getLostCardCaseById(item.id);
      setSelectedCase(detail);
    } catch (error) {
      toast.error(error.message || "Khong the tai chi tiet ho so.");
    }
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
        await approvalService.approveLostCardCase(selectedCase.id, { reason: reasonText });
        toast.success("Da phe duyet ho so mat the.");
      } else {
        await approvalService.rejectLostCardCase(selectedCase.id, { reason: reasonText });
        toast.success("Da tu choi ho so mat the.");
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
            <h2 className="text-2xl font-bold text-slate-800">Phe duyet the mat</h2>
            <p className="mt-1 text-sm text-slate-500">Xem xet va duyet yeu cau xu ly mat the.</p>
          </div>
          <Button variant="outline" className="bg-white text-slate-700" onClick={loadCases} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Lam moi
          </Button>
        </div>

        <LostCardFilters
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
          filterCreator={filterCreator}
          setFilterCreator={setFilterCreator}
          filterReason={filterReason}
          setFilterReason={setFilterReason}
          onSearch={loadCases}
          onReset={handleResetFilters}
          counts={counts}
        />

        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-800">
              Danh sach yeu cau ({filtered.length})
            </h3>
          </div>

          <LostCardTable
            cases={paginatedCases}
            isLoading={isLoading}
            selectedCaseId={selectedCase?.id}
            onRowClick={handleSelectCase}
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
        <LostCardSidePanel
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
