import React from "react";
import { Card } from "@/components/ui/card";

export default function ActiveVehiclesSection({ vehicles, loading, getStatusBadge, isResident }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-slate-800">Phương tiện của tôi ({vehicles.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {vehicles.length === 0 && !loading && (
          <div className="col-span-full p-8 border border-dashed rounded-xl bg-slate-50 text-center text-slate-500 text-sm font-semibold">
            {isResident 
              ? "Chưa có phương tiện nào. Vui lòng đăng ký vé tháng để thêm phương tiện." 
              : "Chưa có phương tiện nào."}
          </div>
        )}
        {vehicles.map((v, i) => (
          <Card key={i} className="p-4 flex flex-col justify-between gap-4 border-slate-200 shadow-sm hover:shadow transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xl font-black text-slate-800 tracking-tight">
                  {v.plateNumber || v.normalizedPlateNumber}
                </div>
                <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-2">
                  <span>{v.vehicleType?.name || v.vehicleTypeName || "Ô Tô"}</span>
                  {v.approvalStatus === 'APPROVED' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-bold uppercase tracking-wider">
                      Vé Tháng
                    </span>
                  ) : v.approvalStatus === 'PENDING' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">
                      Đang xét duyệt
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      Vãng Lai
                    </span>
                  )}
                </div>
              </div>
              {getStatusBadge(v.status)}
            </div>
            <div className="text-xs text-slate-500 font-medium space-y-1">
              <div className="flex justify-between">
                <span>Hãng xe:</span>
                <span className="font-semibold text-slate-700">{v.brand || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Màu xe:</span>
                <span className="font-semibold text-slate-700">{v.color || "—"}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
