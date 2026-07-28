import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { parkingService } from "@/services/parkingService";
import { toast } from "sonner";
import { Trash2, Plus, Info } from "lucide-react";

export default function VehicleTypeManagerModal({
  isOpen,
  onClose,
  vehicleTypes,
  onRefresh,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requiresSlot, setRequiresSlot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên loại xe");
      return;
    }

    try {
      setIsSubmitting(true);
      await parkingService.createVehicleType({
        name: name.trim(),
        description: description.trim(),
        isActive: true,
        requiresSlot,
      });
      toast.success("Thêm loại xe mới thành công!");
      
      // Reset form
      setName("");
      setDescription("");
      setRequiresSlot(true);
      setShowAddForm(false);

      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(error.message || "Lỗi khi tạo loại xe mới");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, typeName) => {
    try {
      setIsDeletingId(id);
      await parkingService.deleteVehicleType(id);
      toast.success(`Đã xóa loại xe "${typeName}" thành công!`);
      setConfirmDeleteId(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      // Handle foreign key constraint failure or other errors gracefully
      console.error("Delete vehicle type error:", error);
      toast.error(
        "Không thể xóa loại xe này vì đang được liên kết với phương tiện hoặc cấu hình giá trong hệ thống."
      );
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Quản lý danh sách loại xe</span>
            <Button
              size="sm"
              variant={showAddForm ? "ghost" : "outline"}
              onClick={() => {
                setShowAddForm(!showAddForm);
                setConfirmDeleteId(null); // Reset confirm status
              }}
              className="text-xs font-bold gap-1 cursor-pointer"
            >
              {showAddForm ? "Quay lại danh sách" : "+ Thêm loại xe"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        {showAddForm ? (
          /* Create Form */
          <form onSubmit={handleCreate} className="space-y-4 py-4 border-t border-slate-100 mt-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Tên loại xe <span className="text-red-500">*</span></label>
              <Input
                placeholder="Ví dụ: Xe điện, Xe bán tải..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Mô tả</label>
              <Input
                placeholder="Nhập mô tả ngắn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="space-y-0.5">
                <label className="block text-xs font-semibold text-slate-700">Có cần chia slot đỗ xe không?</label>
                <span className="text-[10px] text-slate-400 block font-medium">Bật đối với Ô tô (cần phân chia vị trí đỗ), Tắt đối với Xe máy</span>
              </div>
              <input
                type="checkbox"
                checked={requiresSlot}
                onChange={(e) => setRequiresSlot(e.target.checked)}
                className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                {isSubmitting ? "Đang lưu..." : "Lưu loại xe"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* List Table */
          <div className="space-y-4 mt-2">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 flex items-start gap-2 text-amber-800 text-xs font-medium">
              <Info className="size-4 shrink-0 mt-0.5" />
              <p>Lưu ý: Không thể xóa những loại xe đang được sử dụng (có xe đang đăng ký hoặc đang áp dụng cấu hình giá).</p>
            </div>
            
            <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b">
                    <TableHead className="font-semibold text-slate-600 text-xs">Tên loại xe</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs">Mô tả</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs text-center">Phân slot</TableHead>
                    <TableHead className="font-semibold text-slate-600 text-xs text-center w-[150px]">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-slate-600 font-medium text-xs">
                  {vehicleTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                        Chưa có loại xe nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicleTypes.map((type) => (
                      <TableRow key={type.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-800 py-3">{type.name}</TableCell>
                        <TableCell className="text-slate-500 py-3">{type.description || "—"}</TableCell>
                        <TableCell className="text-center py-3">
                          <Badge variant="outline" className={type.requiresSlot ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600"}>
                            {type.requiresSlot ? "Có chia slot" : "Không chia slot"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-3">
                          {confirmDeleteId === type.id ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                size="xs"
                                variant="destructive"
                                disabled={isDeletingId === type.id}
                                onClick={() => handleDelete(type.id, type.name)}
                                className="px-2.5 py-1 font-bold text-[10px] cursor-pointer"
                              >
                                {isDeletingId === type.id ? "Đang xóa..." : "Xóa"}
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 font-bold text-[10px] cursor-pointer"
                              >
                                Hủy
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              disabled={isDeletingId === type.id}
                              onClick={() => setConfirmDeleteId(type.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-lg mx-auto"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <DialogFooter className="pt-2">
              <Button size="sm" onClick={() => onClose(false)} className="w-20">
                Đóng
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
