import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, RotateCcw, XCircle } from "lucide-react";

export default function EntryActionPanel({
  entryMode,
  canSubmit,
  isSubmitting,
  onCreateEntry,
  onCheckCard,
  canCheckCard,
  isCheckingCard,
  onRetryCurrentStep,
  canRetryCurrentStep,
  isRetryingCurrentStep,
  onReset,
}) {
  const retryLabel =
    entryMode === "RESERVATION"
      ? isRetryingCurrentStep
        ? "Đang kiểm tra..."
        : "Kiểm tra Booking"
      : entryMode === "MONTHLY"
        ? isRetryingCurrentStep
          ? "Đang kiểm tra..."
          : "Kiểm tra vé tháng"
        : isRetryingCurrentStep
          ? "Đang lấy..."
          : "Kiểm tra lại";

  return (
    <Card className="flex flex-col border-slate-200 bg-white shadow-sm flex-1 min-h-0 overflow-hidden">
      <CardHeader className="border-b border-slate-100 py-2 px-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-[10px]">
            6
          </div>
          <CardTitle className="text-sm font-bold">Thao tác</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-2 flex flex-col gap-2 justify-center">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 rounded-lg text-xs"
          onClick={onCreateEntry}
          disabled={!canSubmit || isSubmitting}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {isSubmitting ? "Đang tạo..." : "Tạo phiên đỗ xe"}
        </Button>

        <Button
          variant="outline"
          className="w-full font-bold h-9 rounded-lg border-slate-200 text-blue-600 hover:bg-blue-50 text-xs"
          onClick={onCheckCard}
          disabled={!canCheckCard || isCheckingCard}
        >
          <CreditCard className="mr-1.5 h-4 w-4" />
          {isCheckingCard ? "Đang quét..." : "Quét thẻ"}
        </Button>

        <Button
          variant="outline"
          className="w-full font-bold h-9 rounded-lg border-slate-200 text-amber-600 hover:bg-amber-50 text-xs"
          onClick={onRetryCurrentStep}
          disabled={!canRetryCurrentStep || isRetryingCurrentStep}
        >
          <RotateCcw className="mr-1.5 h-4 w-4" />
          {retryLabel}
        </Button>

        <div className="mt-1 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            className="w-full font-bold h-9 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-red-50 text-xs"
            onClick={onReset}
          >
            <XCircle className="mr-1.5 h-4 w-4" />
            Hủy giao dịch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
