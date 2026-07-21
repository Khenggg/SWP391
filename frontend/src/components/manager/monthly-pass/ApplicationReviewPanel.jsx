import React, { useState } from "react";
import {
  User, Shield, MessageSquare, XCircle, CheckCircle2, CreditCard, Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import LicensePlate from "@/components/ui/license-plate";
import { driverService } from "../../../services/driverService";
import { toast } from "sonner";

const APP_STATUS_BADGE = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-300",
  APPROVED_AWAITING_PAYMENT: "bg-blue-100 text-blue-700 border-blue-300",
  PAID: "bg-indigo-100 text-indigo-700 border-indigo-300",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-300",
};

const APP_STATUS_LABEL = {
  PENDING: "Chờ duyệt",
  APPROVED_AWAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  ACTIVE: "Đang hoạt động",
  REJECTED: "Bị từ chối",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function ApplicationReviewPanel({ application, onClose, onRefresh }) {
  // Reject dialog
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Payment dialog
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");

  // RFID dialog
  const [showRfidModal, setShowRfidModal] = useState(false);
  const [rfidCardCode, setRfidCardCode] = useState("");

  const [saving, setSaving] = useState(false);

  if (!application) return null;

  const handleApprove = async () => {
    setSaving(true);
    try {
      await driverService.reviewMonthlyPassApplication(application.id, "APPROVED_AWAITING_PAYMENT", "");
      toast.success("Đã phê duyệt đơn đăng ký!");
      onRefresh();
    } catch (e) {
      toast.error(e.message || "Phê duyệt thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setSaving(true);
    try {
      await driverService.reviewMonthlyPassApplication(application.id, "REJECTED", rejectReason);
      toast.success("Đã từ chối đơn đăng ký.");
      setShowRejectModal(false);
      setRejectReason("");
      onRefresh();
    } catch (e) {
      toast.error(e.message || "Từ chối thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmPayment = async () => {
    setSaving(true);
    try {
      await driverService.confirmApplicationPayment(application.id, paymentMethod, referenceNo);
      toast.success("Đã xác nhận thanh toán phí vé tháng!");
      setShowPaymentModal(false);
      setReferenceNo("");
      onRefresh();
    } catch (e) {
      toast.error(e.message || "Xác nhận thanh toán thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignRfid = async () => {
    if (!rfidCardCode.trim()) return;
    setSaving(true);
    try {
      await driverService.assignRfidToApplication(application.id, rfidCardCode);
      toast.success("Đã gán thẻ RFID và kích hoạt vé tháng!");
      setShowRfidModal(false);
      setRfidCardCode("");
      onRefresh();
    } catch (e) {
      toast.error(e.message || "Gán thẻ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="w-[420px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Chi tiết đơn đăng ký</h3>
            <p className="text-sm font-extrabold text-slate-800 mt-0.5">Mã đơn #{application.id}</p>
          </div>
          <Badge
            variant="outline"
            className={`px-2.5 py-1 text-[10px] font-black border rounded-full ${APP_STATUS_BADGE[application.status] || ""}`}
          >
            {APP_STATUS_LABEL[application.status] || application.status}
          </Badge>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-semibold text-slate-600">

          {/* 1. Thông tin cư dân */}
          <section className="space-y-2">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Thông tin cư dân
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Họ và tên:</span>
                <strong className="text-slate-800">{application.driverFullName || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <strong className="text-slate-800">{application.driverPhone || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <strong className="text-slate-800">{application.driverEmail || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Căn hộ:</span>
                <strong className="text-slate-800">{application.driverApartmentNumber || "—"}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Xác minh cư dân:</span>
                {application.driverResidentVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold text-[9px] shadow-none">ĐÃ XÁC MINH</Badge>
                ) : (
                  <Badge className="bg-slate-50 text-slate-500 border border-slate-200 font-extrabold text-[9px] shadow-none">CHƯA XÁC MINH</Badge>
                )}
              </div>
            </div>
          </section>

          {/* 2. Thông tin đơn đăng ký */}
          <section className="space-y-2">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Thông tin đơn đăng ký
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Biển số xe:</span>
                <LicensePlate plate={application.vehiclePlateNumber} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loại xe:</span>
                <strong className="text-slate-800">{application.vehicleTypeName || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày bắt đầu:</span>
                <strong className="text-slate-800">{formatDate(application.startDate)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phí vé tháng:</span>
                <strong className="text-amber-600 font-black">{Number(application.price).toLocaleString("vi-VN")} ₫</strong>
              </div>
              {application.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Phương thức TT:</span>
                  <strong className="text-slate-800">{application.paymentMethod}</strong>
                </div>
              )}
              {application.assignedCardId && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Thẻ RFID đã cấp:</span>
                  <strong className="text-slate-800">#{application.assignedCardId}</strong>
                </div>
              )}
            </div>
          </section>

          {/* 3. Danh sách xe khác của cư dân */}
          {application.driverVehicles && application.driverVehicles.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Xe khác của cư dân ({application.driverVehicles.length})
              </h4>
              <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100">
                {application.driverVehicles.map((v) => (
                  <div key={v.id} className="p-2.5 bg-white flex justify-between items-center hover:bg-slate-50 transition">
                    <div>
                      <LicensePlate plate={v.licensePlate} size="sm" />
                      <span className="text-slate-400 text-[10px] block mt-0.5">{v.vehicleTypeName} · {v.brand} · {v.color}</span>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge
                        variant="outline"
                        className={`px-1.5 py-0.5 text-[9px] font-black block w-fit ml-auto ${
                          v.approvalStatus === "APPROVED" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}
                      >
                        {v.approvalStatus}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`px-1.5 py-0.5 text-[9px] font-black block w-fit ml-auto ${
                          v.monthlyPassStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : "bg-slate-50 text-slate-400 border-slate-200"
                        }`}
                      >
                        {v.monthlyPassStatus === "ACTIVE"
                          ? `VÉ CÒN HẠN (${formatDate(v.monthlyPassEndDate)})`
                          : "CHƯA CÓ VÉ"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 4. Lý do từ chối nếu có */}
          {application.rejectionReason && (
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
              <span className="text-[10px] text-rose-500 font-black uppercase tracking-wide block mb-1">Lý do từ chối:</span>
              <p className="text-rose-800 font-bold">{application.rejectionReason}</p>
            </div>
          )}

          {/* 5. Ghi chú của cư dân */}
          {application.note && (
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/50 flex gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wide block mb-0.5">Ghi chú của cư dân:</span>
                <p className="text-slate-700 italic">{application.note}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-2">
          <Button variant="outline" className="text-xs font-bold rounded-xl flex-1" onClick={onClose}>
            Đóng
          </Button>

          {application.status === "PENDING" && (
            <>
              <Button
                className="text-xs font-bold rounded-xl flex-1 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => setShowRejectModal(true)}
                disabled={saving}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Từ chối
              </Button>
              <Button
                className="text-xs font-bold rounded-xl flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleApprove}
                disabled={saving}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Duyệt
              </Button>
            </>
          )}

          {application.status === "APPROVED_AWAITING_PAYMENT" && (
            <Button
              className="text-xs font-bold rounded-xl flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setShowPaymentModal(true)}
              disabled={saving}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" /> Xác nhận thanh toán
            </Button>
          )}

          {application.status === "PAID" && (
            <Button
              className="text-xs font-bold rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setShowRfidModal(true)}
              disabled={saving}
            >
              <Wifi className="w-3.5 h-3.5 mr-1" /> Cấp thẻ RFID
            </Button>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-rose-700">Lý do từ chối đơn đăng ký</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <textarea
              className="w-full border border-slate-200 rounded-lg p-2.5 h-24 text-xs font-semibold resize-none focus:outline-none focus:ring-2 focus:ring-rose-400"
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="text-xs font-bold" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>
              Hủy
            </Button>
            <Button
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleReject}
              disabled={!rejectReason.trim() || saving}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800">Xác nhận thanh toán phí vé tháng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs font-semibold">
            <div>
              <label className="block text-slate-500 mb-1.5">Phương thức thanh toán:</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">💵 Tiền mặt (Cash)</SelectItem>
                  <SelectItem value="BANK_TRANSFER">🏦 Chuyển khoản (Bank Transfer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-slate-500 mb-1.5">Mã tham chiếu / Số hóa đơn:</label>
              <Input
                placeholder="Vd: TXN123456"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="text-xs font-bold" onClick={() => setShowPaymentModal(false)}>
              Hủy
            </Button>
            <Button
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleConfirmPayment}
              disabled={saving}
            >
              Xác nhận thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RFID Modal */}
      <Dialog open={showRfidModal} onOpenChange={setShowRfidModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-800">Gán Thẻ RFID Vật Lý</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs font-semibold">
            <div>
              <label className="block text-slate-500 mb-1.5">Nhập mã thẻ RFID:</label>
              <Input
                placeholder="Vd: CARD001..."
                value={rfidCardCode}
                onChange={(e) => setRfidCardCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="text-xs font-bold" onClick={() => setShowRfidModal(false)}>
              Hủy
            </Button>
            <Button
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAssignRfid}
              disabled={!rfidCardCode.trim() || saving}
            >
              <Wifi className="w-3.5 h-3.5 mr-1" /> Kích hoạt vé tháng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
