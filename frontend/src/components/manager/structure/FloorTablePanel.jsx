import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, AlertTriangle } from "lucide-react";

export default function FloorTablePanel({
  floors,
  openEditFloor,
  openCreateFloor,
  onDeleteFloor,
  AREA_STATUS_BADGE,
  STATUS_LABELS,
}) {
  const [deleteTargetFloor, setDeleteTargetFloor] = useState(null);

  const handleConfirmSoftDelete = () => {
    if (!deleteTargetFloor) return;
    onDeleteFloor(deleteTargetFloor.id, false);
    setDeleteTargetFloor(null);
  };

  const handleConfirmHardDelete = () => {
    if (!deleteTargetFloor) return;
    onDeleteFloor(deleteTargetFloor.id, true);
    setDeleteTargetFloor(null);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Quản lý Tầng</h3>
        <Button onClick={openCreateFloor} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          <Plus className="w-4 h-4 mr-2" /> Thêm tầng
        </Button>
      </div>
      <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 bg-white">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="font-bold text-slate-600 py-4">Mã tầng</TableHead>
              <TableHead className="font-bold text-slate-600">Tên tầng</TableHead>
              <TableHead className="font-bold text-slate-600">Loại xe được phép</TableHead>
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
                  <div className="flex flex-wrap gap-1">
                    {floor.vehicleTypeNames && floor.vehicleTypeNames.length > 0 ? (
                      floor.vehicleTypeNames.map((name, idx) => (
                        <Badge key={idx} variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[11px] font-semibold">
                          {name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">Tất cả / Chưa chọn</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`font-bold rounded-md px-2.5 py-1 ${AREA_STATUS_BADGE[floor.status] || "text-slate-600 bg-slate-100 hover:bg-slate-200"}`}>
                    {STATUS_LABELS[floor.status] || floor.status || "ACTIVE"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditFloor(floor)} className="text-slate-400 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTargetFloor(floor)} className="text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Choice Modal */}
      <Dialog open={!!deleteTargetFloor} onOpenChange={() => setDeleteTargetFloor(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Xóa Tầng {deleteTargetFloor?.code || deleteTargetFloor?.floorCode}
            </DialogTitle>
            <DialogDescription className="pt-2 text-slate-600">
              Vui lòng chọn hình thức xóa tầng <strong>{deleteTargetFloor?.name || deleteTargetFloor?.floorName}</strong>:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <button
              onClick={handleConfirmSoftDelete}
              className="w-full text-left p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 transition-all flex flex-col gap-1 cursor-pointer group"
            >
              <div className="font-bold text-amber-800 text-sm group-hover:text-amber-900">
                🟡 Xóa mềm (Ngừng hoạt động)
              </div>
              <div className="text-xs text-amber-700">
                Chuyển trạng thái tầng sang INACTIVE (Ngừng hoạt động). Giữ nguyên dữ liệu cũ.
              </div>
            </button>

            <button
              onClick={handleConfirmHardDelete}
              className="w-full text-left p-3.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/70 transition-all flex flex-col gap-1 cursor-pointer group"
            >
              <div className="font-bold text-red-800 text-sm group-hover:text-red-900">
                🔴 Xóa cứng (Xóa vĩnh viễn)
              </div>
              <div className="text-xs text-red-700">
                Xóa toàn bộ bản ghi tầng khỏi cơ sở dữ liệu. Chỉ cho phép nếu tầng không chứa khu vực.
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetFloor(null)}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
