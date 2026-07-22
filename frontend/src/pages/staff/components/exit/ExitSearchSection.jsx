import { DoorOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExitSearchSection({ cardCode, setCardCode, runSearch, isLoading, gates = [], exitGateId, setExitGateId }) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b bg-white p-3"><div className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</span><h3 className="text-sm font-bold text-slate-800">Tìm phiên xe ra</h3></div><div className="flex items-center gap-2"><DoorOpen className="size-4 text-slate-500" /><Select value={String(exitGateId)} onValueChange={setExitGateId} disabled={isLoading}><SelectTrigger className="h-8 w-[140px] bg-slate-50 text-xs"><SelectValue placeholder="Chọn cổng ra" /></SelectTrigger><SelectContent>{gates.map((gate) => <SelectItem key={gate.id} value={String(gate.id)} className="text-xs">{gate.gateCode} - {gate.gateType}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"><p className="text-xs font-medium text-slate-500">Nhập thủ công mã thẻ hoặc biển số để tra cứu phiên đang hoạt động.</p><label className="text-xs font-bold text-slate-700">Mã thẻ hoặc biển số</label><div className="relative"><Input value={cardCode} onChange={(event) => setCardCode(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && runSearch()} className="h-11 pr-12 font-bold uppercase" placeholder="Ví dụ: C001 hoặc 30F-123.45" disabled={isLoading} autoFocus /><Button size="icon" variant="ghost" onClick={runSearch} disabled={isLoading} className="absolute right-1 top-1 size-9 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><Search className="size-5" /></Button></div></div>
    </section>
  );
}
