import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { CarFront, MapPin, Hash, User, CreditCard, Clock } from "lucide-react";

export default function LicensePlateInfo({ data }) {
  if (!data) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <CarFront className="w-5 h-5 text-indigo-600" />
          <h3>Thông tin phương tiện</h3>
        </div>
        <Badge variant="outline" className="bg-white text-slate-600">
          Session ID: {data.parkingSessionId}
        </Badge>
      </div>
      
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Hash className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Plate</p>
            <p className="font-bold text-lg text-slate-800">{data.vehiclePlate || "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <CarFront className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Vehicle Type</p>
            <p className="font-semibold text-slate-700">{data.vehicleType || "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Owner Name</p>
            <p className="font-semibold text-slate-700">{data.ownerName || "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Parking Card</p>
            <p className="font-semibold text-slate-700">{data.parkingCard || "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Entry Time</p>
            <p className="font-semibold text-slate-700">{data.entryTime ? formatDateTime(data.entryTime) : "N/A"}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Location</p>
            <p className="font-semibold text-slate-700">
              Floor {data.floor || "-"} • Area {data.area || "-"} • Slot {data.slot || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
