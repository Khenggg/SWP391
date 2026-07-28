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
import { Plus, Edit2 } from "lucide-react";

export default function FloorTablePanel({
  floors,
  openEditFloor,
  openCreateFloor,
  AREA_STATUS_BADGE,
  STATUS_LABELS,
}) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Quản lý Tầng</h3>
        <Button onClick={openCreateFloor} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Thêm tầng
        </Button>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden flex-1">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="font-bold text-slate-600 py-4">Mã tầng</TableHead>
              <TableHead className="font-bold text-slate-600">Tên tầng</TableHead>
              <TableHead className="font-bold text-slate-600">Trạng thái</TableHead>
              <TableHead className="font-bold text-slate-600 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {floors.map((floor) => (
              <TableRow key={floor.id}>
                <TableCell className="font-semibold text-slate-800">{floor.code || floor.floorCode}</TableCell>
                <TableCell className="text-slate-600">{floor.name || floor.floorName}</TableCell>
                <TableCell>
                  <Badge className={`font-bold rounded-md px-2.5 py-1 ${AREA_STATUS_BADGE[floor.status] || "text-slate-600 bg-slate-100 hover:bg-slate-200"}`}>
                    {STATUS_LABELS[floor.status] || floor.status || "ACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditFloor(floor)} className="text-slate-400 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
