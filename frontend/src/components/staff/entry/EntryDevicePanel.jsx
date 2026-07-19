import React from "react";
import { Radio, ScanLine, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export default function EntryDevicePanel({
  lastDeviceEvent,
  plateImageUrl,
  vehicleImageUrl,
  onPreviewPlate,
  onPreviewVehicle,
}) {
  return (
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm h-full overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
              1
            </div>
            <CardTitle className="text-base font-bold">Camera nhận diện</CardTitle>
            <Badge className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 hover:bg-emerald-50 border border-emerald-100 uppercase font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Live
            </Badge>
          </div>
          <div className="text-sm font-semibold text-slate-600">
            {lastDeviceEvent ? lastDeviceEvent.gateCode || "CAM_ENTRY_01" : "Chưa có thiết bị"}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-2 flex flex-col gap-2 overflow-hidden relative">
        <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-900 group">
          {vehicleImageUrl ? (
            <img
              src={vehicleImageUrl}
              alt="Vehicle"
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onPreviewVehicle}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800">
              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
              <span className="text-sm font-medium">Chưa có ảnh xe</span>
            </div>
          )}

          {/* Timestamp overlay */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md">
            {lastDeviceEvent?.timestamp ? formatDateTime(lastDeviceEvent.timestamp) : "Đang chờ thiết bị..."}
          </div>

          {/* Plate Image Overlay */}
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
            {plateImageUrl && (
              <div 
                className="w-32 h-12 bg-white rounded shadow-lg border-2 border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                onClick={onPreviewPlate}
              >
                <img src={plateImageUrl} alt="Plate" className="w-full h-full object-contain" />
              </div>
            )}
            {lastDeviceEvent?.detectedPlate && (
              <div className="bg-white px-3 py-1.5 rounded shadow-lg font-mono font-bold text-lg text-slate-800 border-2 border-slate-200">
                {lastDeviceEvent.detectedPlate}
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="shrink-0 flex items-center justify-between bg-slate-900 text-white rounded-xl px-4 py-3 shadow-inner">
          <div className="flex items-center gap-2">
            {lastDeviceEvent?.detectedPlate ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <ScanLine className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm font-semibold ${lastDeviceEvent?.detectedPlate ? "text-emerald-400" : "text-slate-400"}`}>
              {lastDeviceEvent?.detectedPlate ? "Biển số đã nhận diện" : "Đang chờ biển số"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {lastDeviceEvent?.cardCode ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <ScanLine className="h-4 w-4 text-slate-400" />
            )}
            <span className={`text-sm font-semibold ${lastDeviceEvent?.cardCode ? "text-emerald-400" : "text-slate-400"}`}>
              {lastDeviceEvent?.cardCode ? "Thẻ đã quét" : "Đang chờ quét thẻ"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
