import React from "react";
import { useNavigate } from "react-router-dom";
import { Car, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PASS_STATUS } from "@/constants";

export default function VehiclesList({ vehicles }) {
  const navigate = useNavigate();
  const recentVehicles = vehicles.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">Phương tiện của tôi ({vehicles.length})</h3>
        <Button 
          variant="link" 
          className="text-blue-600 text-sm font-semibold h-auto p-0" 
          onClick={() => navigate("/driver/vehicles")}
        >
          Xem tất cả
        </Button>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="divide-y divide-slate-100 flex-grow">
          {recentVehicles.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Chưa có phương tiện nào</p>
            </div>
          ) : (
            recentVehicles.map((v, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-mono font-black text-slate-800 tracking-tight">
                      {v.plate || v.plateNumber || v.normalizedPlateNumber}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      {v.vehicleTypeName || v.vehicleType || "Ô Tô"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {v.status === PASS_STATUS.ACTIVE ? (
                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 shadow-none text-[10px] font-bold">Vé Tháng</Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 border-slate-200 shadow-none text-[10px] font-bold">Vãng Lai</Badge>
                  )}
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {vehicles.length > 5 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <Button 
              variant="link" 
              size="sm" 
              className="text-blue-600 h-auto p-0 text-xs font-semibold" 
              onClick={() => navigate("/driver/vehicles")}
            >
              Xem tất cả phương tiện
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
