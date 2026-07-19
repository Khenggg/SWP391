import React from "react";
import { Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ImagePreviewDialog({ preview, onOpenChange }) {
  return (
    <Dialog open={Boolean(preview)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>{preview?.title || "Anh thiet bi"}</DialogTitle>
          <DialogDescription>
            Anh duoc thiet bi cong gui len de doi chieu truoc khi tao entry.
          </DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[72dvh] items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
          {preview?.image ? (
            <img
              src={preview.image}
              alt={preview.title}
              className="max-h-[72dvh] w-full object-contain"
            />
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center gap-3 text-slate-400">
              <ImageIcon className="size-12" />
              <p className="text-sm font-bold">Chua co anh tu thiet bi</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
