import React from "react";
import { CarFront, Clock3, AlertTriangle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

export default function ExitSessionInfo({ session, vehicleTypes = [] }) {
  const navigate = useNavigate();
  // Helper to get vehicle type name
  const getVehicleTypeName = (id) => {
    if (!id) return "Khác";
    const vt = vehicleTypes.find(v => Number(v.id) === Number(id));
    return vt ? vt.name : "Khác";
  };

  return (
    <section className="h-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
      <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">2</span>
          <h3 className="font-bold text-slate-800 text-sm">Thông tin phiên</h3>
        </div>
        {session && <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Đang hoạt động</Badge>}
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
        {session ? (
          <>
            <div className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-12 h-12 bg-white rounded-lg border shadow-sm flex flex-col items-center justify-center shrink-0">
                <CarFront className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                  {session.plateNumber || "CHƯA RÕ"}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-700">
                    {session.customerType === "MONTHLY" ? "VÉ THÁNG" : "VÃNG LAI"}
                  </Badge>
                  <span>•</span>
                  <span>Mã: {session.sessionCode}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Loại xe</p>
                  <p className="font-bold text-slate-700">{getVehicleTypeName(session.vehicleTypeId)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mã thẻ</p>
                  <p className="font-bold text-slate-700">{session.cardCode}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Loại thẻ</p>
                  <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                    {session.customerType === "MONTHLY" ? "Thẻ vé tháng" : "Thẻ vãng lai"}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian vào</p>
                  <p className="font-bold text-slate-700">{formatDateTime(session.entryTime)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Vị trí đỗ</p>
                  <p className="font-bold text-slate-700">{session.floorId ? `Tầng ${session.floorId} - Khu ${session.areaId}` : "Chưa rõ"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái</p>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                    Đang đỗ
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/staff/license-plate-mismatch", { state: { parkingSessionId: session.sessionId || session.id } })}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                ⚠ Report Plate Mismatch
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
            <AlertTriangle className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">Chưa có thông tin phiên</p>
          </div>
        )}
      </div>
    </section>
  );
}
