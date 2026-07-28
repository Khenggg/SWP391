import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Plus, Edit2 } from "lucide-react";

export default function AreaTablePanel({
  filterFloor,
  setFilterFloor,
  floors,
  filteredAreas,
  openCreateArea,
  openEditArea,
}) {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Quản lý Khu vực</h3>
          <Select value={filterFloor} onValueChange={setFilterFloor}>
            <SelectTrigger className="w-[180px] border-slate-200 h-9">
              <SelectValue placeholder="Tất cả tầng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả tầng</SelectItem>
              {floors.map((f) => (
                <SelectItem key={f.id} value={f.floorCode}>
                  {f.floorCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openCreateArea} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Thêm khu vực
        </Button>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden flex-1">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="font-bold text-slate-600 py-4">Mã khu</TableHead>
              <TableHead className="font-bold text-slate-600">Tên khu</TableHead>
              <TableHead className="font-bold text-slate-600">Tầng</TableHead>
              <TableHead className="font-bold text-slate-600 text-center">Ưu tiên</TableHead>
              <TableHead className="font-bold text-slate-600">Loại xe áp dụng</TableHead>
              <TableHead className="font-bold text-slate-600 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAreas.map((area) => (
              <TableRow key={area.id}>
                <TableCell className="font-semibold text-slate-800">{area.areaCode}</TableCell>
                <TableCell className="text-slate-600">{area.areaName}</TableCell>
                <TableCell className="text-slate-600 font-medium">{area.floorCode}</TableCell>
                <TableCell className="text-center text-slate-500">{area.priorityOrder ?? "—"}</TableCell>
                <TableCell>
                  {(area.vehicleTypeNames || []).length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {area.vehicleTypeNames.map((name, idx) => (
                        <Badge
                          key={idx}
                          className="px-2.5 py-1 font-semibold rounded-md bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">Không rõ</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditArea(area)}
                    className="text-slate-400 hover:text-blue-600"
                  >
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
