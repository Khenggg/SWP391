import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Layers } from "lucide-react";

// Helper components inside this module
function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">{description}</p>
    </div>
  );
}

export default function CapacityPanel({ filteredNonCarAreas, openEditCapacity }) {
  return (
    <div className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Quản lý Sức chứa (Không chia slot)</h3>
          <p className="text-xs text-slate-500">Đặt tổng sức chứa chỗ đỗ cho các khu vực tự do không chia slot.</p>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 min-h-[400px]">
        {filteredNonCarAreas.length === 0 ? (
          <EmptyState
            icon={<Layers />}
            title="Không tìm thấy khu vực nào"
            description="Hãy thêm khu vực sức chứa mới ở tab Khu vực."
          />
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-600 text-xs py-3">Tầng</TableHead>
                  <TableHead className="font-bold text-slate-600 text-xs">Khu vực</TableHead>
                  <TableHead className="font-bold text-slate-600 text-xs">Loại xe</TableHead>
                  <TableHead className="font-bold text-slate-600 text-xs text-center">Đang đỗ / Sức chứa</TableHead>
                  <TableHead className="font-bold text-slate-600 text-xs text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNonCarAreas.map((area) => (
                  <TableRow key={area.id} className="text-xs">
                    <TableCell className="font-medium text-slate-700">{area.floorCode}</TableCell>
                    <TableCell className="font-semibold text-slate-800">{area.areaCode}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(area.vehicleTypeNames || []).map((name, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 border-blue-100"
                          >
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-700">
                      <span
                        className={
                          area.currentRealOccupancy >= area.totalCapacity ? "text-red-600 font-black" : "text-slate-800"
                        }
                      >
                        {area.currentRealOccupancy || 0}
                      </span>
                      <span className="text-slate-400 font-normal"> / </span>
                      <span>{area.totalCapacity || 0}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditCapacity(area)}
                        className="text-blue-600 hover:text-blue-700 font-bold text-[11px] p-1.5 h-auto"
                      >
                        Sửa sức chứa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
