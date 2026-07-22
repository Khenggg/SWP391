import React, { useState, useEffect, useRef, useCallback } from "react";
import { FileWarning, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { staffSessionService } from "@/services/staffSessionService";
import { approvalService } from "@/services/approvalService";
import { formatDateTime } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StaffLostCardTrackingTable from "@/components/staff/lost-card/StaffLostCardTrackingTable";

export default function StaffLostCardPage() {
  const [query, setQuery] = useState("51C-77888");
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({
    reporterName: "",
    phone: "",
    verificationNote: "",
    reason: "",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tracking state
  const [cases, setCases] = useState([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const previousStatusRef = useRef({});
  const isFirstLoadRef = useRef(true);

  // Fetch tracking cases & trigger toasts on Manager status update
  const fetchCases = useCallback(async () => {
    try {
      setIsLoadingCases(true);
      const data = await approvalService.getLostCardCases();
      const caseList = Array.isArray(data) ? data : data?.items || [];
      setCases(caseList);

      // Check status transitions
      if (isFirstLoadRef.current) {
        const initialMap = {};
        caseList.forEach((c) => {
          initialMap[c.id] = c.status;
        });
        previousStatusRef.current = initialMap;
        isFirstLoadRef.current = false;
      } else {
        caseList.forEach((c) => {
          const prevStatus = previousStatusRef.current[c.id];
          if (prevStatus === "PENDING" && c.status === "APPROVED") {
            toast.success(
              `Hồ sơ ${c.caseCode || `LC-${c.id}`} (${c.plateNumber || "Xe vãng lai"}) ĐÃ ĐƯỢC PHÊ DUYỆT! Bấm 'Cho xe ra' để hoàn tất.`
            );
          } else if (prevStatus === "PENDING" && c.status === "REJECTED") {
            const reasonText = c.decisionReason || c.rejectionReason || "Không có ghi chú";
            toast.error(
              `Hồ sơ ${c.caseCode || `LC-${c.id}`} (${c.plateNumber || "Xe vãng lai"}) BỊ TỪ CHỐI. Lý do: ${reasonText}`
            );
          }
          previousStatusRef.current[c.id] = c.status;
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hồ sơ báo mất thẻ:", error);
    } finally {
      setIsLoadingCases(false);
    }
  }, []);

  // Poll cases list every 10s
  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 10000);
    return () => clearInterval(interval);
  }, [fetchCases]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Vui lòng nhập mã thẻ hoặc biển số xe.");
      return;
    }

    try {
      const found = await staffSessionService.searchActiveSession(query);
      setSession(found);
      if (found.status === "LOST_CARD_PENDING") {
        toast.warning(`Phiên ${found.sessionCode} đã có hồ sơ báo mất thẻ đang chờ Manager phê duyệt.`);
      } else {
        toast.success(`Đã tìm thấy phiên ${found.sessionCode}`);
      }
    } catch (error) {
      setSession(null);
      toast.error(error.message || "Không tìm thấy phiên.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session) return;
    if (session.status === "LOST_CARD_PENDING") {
      toast.error(`Phiên ${session.sessionCode} đã được tạo hồ sơ báo mất thẻ trước đó và đang chờ Manager phê duyệt.`);
      return;
    }
    if (!form.reporterName.trim() || !form.verificationNote.trim() || !form.reason.trim()) {
      toast.error("Nhập đủ người báo mất, ghi chú xác minh và lý do.");
      return;
    }

    setIsSubmitting(true);
    let createdCaseId = null;
    let createdCaseCode = null;

    try {
      const created = await staffSessionService.createLostCardCase({
        ...form,
        sessionId: session.sessionId || session.id,
      });
      createdCaseId = created.id;
      createdCaseCode = created.caseCode || "";
    } catch (error) {
      const serverErrors = error.errors && Array.isArray(error.errors) ? error.errors.join(", ") : "";
      toast.error(
        "Lỗi tạo hồ sơ: " + (error.message || "Không thể tạo hồ sơ.") + (serverErrors ? ` Chi tiết: ${serverErrors}` : "")
      );
      setIsSubmitting(false);
      return;
    }

    if (files.length > 0 && createdCaseId) {
      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("Files", file);
          formData.append("DocumentTypes", "OTHER");
          formData.append("Notes", form.verificationNote || "");
        });

        await staffSessionService.uploadLostCardDocuments(createdCaseId, formData);
      } catch (uploadError) {
        toast.error(`Đã tạo hồ sơ ${createdCaseCode} nhưng tải ảnh thất bại: ${uploadError.message}`);
        setForm({ reporterName: "", phone: "", verificationNote: "", reason: "" });
        setFiles([]);
        setSession(null);
        setIsSubmitting(false);
        fetchCases();
        return;
      }
    }

    toast.success(`Đã tạo hồ sơ ${createdCaseCode} thành công, chờ Manager duyệt.`);
    setForm({ reporterName: "", phone: "", verificationNote: "", reason: "" });
    setFiles([]);
    setSession(null);
    setIsSubmitting(false);
    fetchCases();
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-foreground">Báo mất thẻ</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Staff tạo hồ sơ mất thẻ tại cổng ra và theo dõi kết quả phê duyệt thời gian thực từ Manager.
        </p>
      </div>

      {/* Tìm kiếm phiên */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm phiên cần xử lý</CardTitle>
          <CardDescription>Nhập mã thẻ hoặc biển số xe khách khai báo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="CARD-0099 hoặc 51C-77888"
            />
            <Button onClick={handleSearch} disabled={isSubmitting}>
              <Search className="mr-1.5 h-4 w-4" />
              Tìm phiên
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form tạo hồ sơ nếu tìm thấy phiên */}
      {session && (
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>Phiên đang hoạt động</CardTitle>
              <CardDescription>{session.sessionCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 text-sm">
                <Row label="Biển số" value={session.plateNumber} />
                <Row label="Thẻ" value={session.cardCode} />
                <Row label="Vào lúc" value={formatDateTime(session.entryTime)} />
                <Row label="Phí mất thẻ" value="Tính khi ra cổng" />
                <Badge variant="secondary" className="justify-center rounded-lg py-2">
                  {session.vehicleTypeName || "Vãng lai"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hồ sơ mất thẻ</CardTitle>
              <CardDescription>Thông tin này sẽ được đưa vào hàng đợi phê duyệt của Manager.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Người báo mất *"
                  value={form.reporterName}
                  onChange={(event) => setForm({ ...form, reporterName: event.target.value })}
                  disabled={isSubmitting}
                />
                <Input
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  disabled={isSubmitting}
                />
                <Input
                  className="md:col-span-2"
                  placeholder="Ghi chú xác minh giấy tờ *"
                  value={form.verificationNote}
                  onChange={(event) => setForm({ ...form, verificationNote: event.target.value })}
                  disabled={isSubmitting}
                />
                <Input
                  className="md:col-span-2"
                  placeholder="Lý do mất thẻ *"
                  value={form.reason}
                  onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  disabled={isSubmitting}
                />

                <div className="md:col-span-2">
                  <div className="mb-2 text-sm font-medium">Tài liệu xác minh (CCCD, Cà vẹt xe...)</div>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    disabled={isSubmitting}
                  />

                  {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {files.map((file, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 pl-3 pr-1 py-1">
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1 h-4 w-4 rounded-full"
                            onClick={() => removeFile(index)}
                            disabled={isSubmitting}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="mt-2 md:col-span-2" onClick={handleSubmit} disabled={isSubmitting}>
                  <FileWarning className="mr-1.5 h-4 w-4" />
                  {isSubmitting ? "Đang xử lý..." : "Tạo hồ sơ chờ duyệt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bảng theo dõi các ca báo mất thẻ */}
      <StaffLostCardTrackingTable
        cases={cases}
        isLoading={isLoadingCases}
        onRefresh={fetchCases}
      />
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
