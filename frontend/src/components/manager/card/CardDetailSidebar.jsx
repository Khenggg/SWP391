import React from "react";
import { 
  CreditCard, XCircle, Calendar, RefreshCw, Tag, Hash, Activity, 
  User, Car, MapPin, Clock, ShieldCheck, Camera
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CARD_STATUS } from "@/constants";

const CARD_STATUS_BADGE = {
  [CARD_STATUS.AVAILABLE]: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  [CARD_STATUS.IN_USE]: "bg-blue-100 text-blue-700 border border-blue-300",
  [CARD_STATUS.LOST]: "bg-red-100 text-red-700 border border-red-300",
  [CARD_STATUS.DAMAGED]: "bg-amber-100 text-amber-700 border border-amber-300",
  [CARD_STATUS.INACTIVE]: "bg-slate-100 text-slate-500 border border-slate-300",
};

const STATUS_LABELS = {
  [CARD_STATUS.AVAILABLE]: "Khả dụng",
  [CARD_STATUS.IN_USE]: "Đang sử dụng",
  [CARD_STATUS.LOST]: "Bị mất",
  [CARD_STATUS.DAMAGED]: "Bị hỏng",
  [CARD_STATUS.INACTIVE]: "Ngừng hoạt động",
};

export default function CardDetailSidebar({ 
  selectedCard, 
  setSelectedCard, 
  openStatusModal, 
  isLogsLoading, 
  auditLogs,
  activeSession,
  isActiveSessionLoading
}) {
  if (!selectedCard) return null;

  const monthlyPass = selectedCard.monthlyPass;
  const isMonthlyPass = Boolean(monthlyPass);

  return (
    <div className="w-full lg:w-[350px] flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full overflow-y-auto">
      {/* Header Bar */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" /> Chi tiết thẻ
        </h3>
        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8" onClick={() => setSelectedCard(null)}>
          <XCircle className="w-4 h-4 text-gray-400" />
        </Button>
      </div>
      
      <div className="p-5 flex flex-col gap-6">
        {/* Header Info */}
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">{selectedCard.cardNumber || selectedCard.code}</h4>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="outline" className={CARD_STATUS_BADGE[selectedCard.status]}>
                {STATUS_LABELS[selectedCard.status]}
              </Badge>
              {isMonthlyPass ? (
                <Badge className="bg-purple-100 text-purple-700 border border-purple-300">Vé tháng</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-600">Vé lượt</Badge>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: Người sử dụng thẻ / Đăng ký vé tháng / Liên kết vãng lai */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" /> Người sử dụng & Chủ thẻ
            </span>
            {isMonthlyPass ? (
              <Badge className="bg-purple-100 text-purple-700 border border-purple-300 text-[10px]">Chủ vé tháng</Badge>
            ) : (activeSession?.claimedUserFullName || activeSession?.claimedUserName || activeSession?.claimedByUserId) ? (
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300 text-[10px]">Tài xế vãng lai</Badge>
            ) : null}
          </h5>

          {isMonthlyPass ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Chủ thẻ</span>
                <span className="font-bold text-gray-900">{monthlyPass.ownerName || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> Biển số đăng ký</span>
                <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  {monthlyPass.plateNumber || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Thời hạn vé</span>
                <span className="text-xs font-medium text-gray-700">
                  {monthlyPass.startDate ? new Date(monthlyPass.startDate).toLocaleDateString("vi-VN") : ""} - {monthlyPass.endDate ? new Date(monthlyPass.endDate).toLocaleDateString("vi-VN") : ""}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Trạng thái vé</span>
                <Badge className={monthlyPass.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                  {monthlyPass.status === "ACTIVE" ? "Đang hiệu lực" : monthlyPass.status}
                </Badge>
              </div>
            </div>
          ) : (activeSession?.claimedUserFullName || activeSession?.claimedUserName || activeSession?.claimedByUserId) ? (
            <div className="space-y-2 text-sm bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-emerald-600" /> Tài xế liên kết</span>
                <span className="font-bold text-emerald-900">
                  {activeSession.claimedUserFullName || activeSession.claimedUserName || `User #${activeSession.claimedByUserId}`}
                </span>
              </div>
              {activeSession.claimedUserPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" /> Số điện thoại</span>
                  <span className="font-mono text-xs font-medium text-gray-800">{activeSession.claimedUserPhone}</span>
                </div>
              )}
              {activeSession.claimedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> Đã liên kết lúc</span>
                  <span className="text-xs text-gray-600">
                    {new Date(activeSession.claimedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-500 italic py-1">
              Thẻ lượt vãng lai (chưa gán chủ vé tháng & chưa có tài xế vãng lai liên kết ứng dụng).
            </div>
          )}
        </div>

        {/* SECTION 2: Thông tin Xe đang gửi bãi (Phiên hiện tại) */}
        {(selectedCard.status === CARD_STATUS.IN_USE || selectedCard.currentSessionId) && (
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
            <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-600" /> Xe đang gửi (Phiên hiện tại)
              </span>
              <span className="text-[11px] font-mono text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                #{selectedCard.currentSessionId || activeSession?.sessionId || "N/A"}
              </span>
            </h5>

            {isActiveSessionLoading ? (
              <div className="text-xs text-blue-600 py-2 text-center">Đang tải thông tin xe...</div>
            ) : activeSession ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> Biển số xe gửi</span>
                  <span className="font-mono font-extrabold text-blue-900 bg-white px-2.5 py-1 rounded-md border border-blue-300 text-base shadow-xs">
                    {activeSession.plateNumber || "Không xác định"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Thời gian vào bãi</span>
                  <span className="font-medium text-gray-900 text-xs">
                    {activeSession.entryTime ? new Date(activeSession.entryTime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Vị trí đỗ hiện tại</span>
                  <span className="font-semibold text-blue-700 text-xs">
                    {activeSession.slotCode ? `Ô ${activeSession.slotCode}` : ''} 
                    {activeSession.areaCode ? ` (Khu ${activeSession.areaCode})` : (activeSession.areaId ? ` (Khu ${activeSession.areaId})` : 'Bãi chính')}
                  </span>
                </div>

                {activeSession.entryPlateImageUrl && (
                  <div className="pt-2">
                    <p className="text-[11px] text-gray-500 font-medium mb-1 flex items-center gap-1">
                      <Camera className="w-3 h-3 text-gray-400" /> Ảnh chụp biển số vào bãi:
                    </p>
                    <img 
                      src={activeSession.entryPlateImageUrl} 
                      alt="Biển số xe vào" 
                      className="w-full h-28 object-cover rounded-lg border border-blue-200 bg-white shadow-xs"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-600">
                Thẻ đang gắn với phiên gửi xe #{selectedCard.currentSessionId}.
              </div>
            )}
          </div>
        )}

        {/* Details List */}
        <div className="space-y-4 text-sm pt-2">
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày tạo thẻ</span>
            <span className="font-medium text-gray-900">{selectedCard.createdAt ? new Date(selectedCard.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Cập nhật lần cuối</span>
            <span className="font-medium text-gray-900">{selectedCard.updatedAt ? new Date(selectedCard.updatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "N/A"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 flex items-center gap-2"><Hash className="w-4 h-4" /> Ghi chú</span>
            <span className="font-medium text-gray-900 bg-gray-50 p-2.5 rounded-lg border border-gray-100 min-h-[40px] text-xs">
              {selectedCard.note || "Không có ghi chú"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" className="w-full justify-start text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => openStatusModal(selectedCard)}>
            <RefreshCw className="w-4 h-4 mr-2" /> Đổi trạng thái
          </Button>
        </div>

        {/* Recent Activities */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-gray-900">Hoạt động gần đây (F054)</h4>
          </div>
          {isLogsLoading ? (
            <div className="text-center text-xs text-gray-500 py-4">Đang tải...</div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-4 bg-gray-50 rounded-lg border border-gray-100">Chưa có hoạt động nào</div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {auditLogs.map((log) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-blue-50 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-xs">{log.action}</div>
                      <time className="font-mono text-[10px] text-blue-600">{new Date(log.timestamp).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</time>
                    </div>
                    <div className="text-[11px] text-slate-500">{log.details} • {log.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
