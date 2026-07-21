import { Search, QrCode, DoorOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExitSearchSection({ cardCode, setCardCode, runSearch, isLoading, gates = [], exitGateId, setExitGateId }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-0">
      <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">1</span>
          <h3 className="font-bold text-slate-800 text-sm">Tìm phiên xe ra</h3>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4 text-slate-500" />
          <Select value={String(exitGateId)} onValueChange={setExitGateId} disabled={isLoading}>
            <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50">
              <SelectValue placeholder="Chọn cổng ra" />
            </SelectTrigger>
            <SelectContent>
              {gates.map((g) => (
                <SelectItem key={g.id} value={String(g.id)} className="text-xs">
                  {g.gateCode} - {g.gateType}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4 overflow-y-auto min-h-0 flex-1">
        <div className="flex gap-4">
          {/* Lồng quét QR */}
          <div className="w-1/3 aspect-square max-w-[120px] rounded-xl border-2 border-indigo-100 bg-indigo-50/50 flex flex-col items-center justify-center text-center p-2 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-xl animate-pulse"></div>
            <QrCode className="w-10 h-10 text-indigo-600 mb-2" />
            <p className="text-[10px] font-bold text-indigo-900 leading-tight">
              Quét mã QR thẻ xe
            </p>
            <p className="text-[8px] text-indigo-500 mt-1">Đưa mã vào khung để quét</p>
          </div>

          {/* Ô nhập mã */}
          <div className="flex-1 flex flex-col justify-center">
            <label className="text-xs font-bold text-slate-700 mb-2">Hoặc nhập mã thẻ / biển số</label>
            <div className="relative">
              <Input
                value={cardCode}
                onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                className="font-bold uppercase pr-10 h-11"
                placeholder="Nhập mã thẻ..."
                disabled={isLoading}
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => runSearch()}
                disabled={isLoading}
                className="absolute right-1 top-1 h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Gợi ý: TH-001122, 30F12345</p>
          </div>
        </div>
      </div>
    </section>
  );
}
