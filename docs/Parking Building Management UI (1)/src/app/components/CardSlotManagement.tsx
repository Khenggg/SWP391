import { useState } from "react";
import {
  QrCode, CreditCard, Search, Filter, X, CheckCircle,
  AlertTriangle, XCircle, Lock, Wrench, ChevronDown, Plus
} from "lucide-react";

function QRModal({ card, onClose }: { card: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">QR Preview – {card.code}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center gap-3 border border-blue-100">
          <svg width="160" height="160" viewBox="0 0 160 160" className="rounded-xl bg-white p-2">
            <rect width="160" height="160" fill="white" />
            <rect x="8" y="8" width="45" height="45" rx="4" fill="#1e40af" />
            <rect x="15" y="15" width="31" height="31" rx="2" fill="white" />
            <rect x="21" y="21" width="19" height="19" rx="2" fill="#1e40af" />
            <rect x="107" y="8" width="45" height="45" rx="4" fill="#1e40af" />
            <rect x="114" y="15" width="31" height="31" rx="2" fill="white" />
            <rect x="120" y="21" width="19" height="19" rx="2" fill="#1e40af" />
            <rect x="8" y="107" width="45" height="45" rx="4" fill="#1e40af" />
            <rect x="15" y="114" width="31" height="31" rx="2" fill="white" />
            <rect x="21" y="120" width="19" height="19" rx="2" fill="#1e40af" />
            {[65,75,85,65,75,85,65,75,85,65].map((x, i) => (
              <rect key={i} x={x} y={8 + i * 15} width="8" height="8" fill="#1e40af" opacity={i % 3 === 0 ? 1 : 0.5} />
            ))}
            {[65,80,95,110,65,80,95].map((x, i) => (
              <rect key={i} x={x} y={65} width="8" height="8" fill="#1e40af" opacity={i % 2 === 0 ? 1 : 0.5} />
            ))}
            {[65,80,95,110,65,80].map((x, i) => (
              <rect key={i} x={x} y={110 + (i % 3) * 15} width="8" height="8" fill="#1e40af" opacity={0.7} />
            ))}
          </svg>
          <div className="text-center">
            <div className="font-mono font-bold text-blue-800 text-lg">{card.code}</div>
            <div className="text-xs text-gray-500 mt-1">Token: {card.qrToken}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-gray-500 mb-0.5">Trạng thái</div>
            <StatusBadge status={card.status} />
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-gray-500 mb-0.5">Phiên hiện tại</div>
            <div className="font-medium text-gray-900">{card.session || "–"}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
            In mã QR
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    AVAILABLE: { label: "AVAILABLE", cls: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    IN_USE: { label: "IN_USE", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: CreditCard },
    LOST: { label: "LOST", cls: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
    DAMAGED: { label: "DAMAGED", cls: "bg-orange-100 text-orange-700 border-orange-200", icon: AlertTriangle },
    OCCUPIED: { label: "OCCUPIED", cls: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle },
    LOCKED: { label: "LOCKED", cls: "bg-gray-100 text-gray-600 border-gray-200", icon: Lock },
    MAINTENANCE: { label: "MAINTENANCE", cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Wrench },
  };
  const d = map[status] || map.AVAILABLE;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${d.cls}`}>
      <d.icon className="w-3 h-3" />
      {d.label}
    </span>
  );
}

const cards = [
  { code: "C001", qrToken: "QR-C001-4A2B1C", status: "AVAILABLE", session: null, created: "01/01/2026" },
  { code: "C002", qrToken: "QR-C002-9D3E4F", status: "AVAILABLE", session: null, created: "01/01/2026" },
  { code: "C003", qrToken: "QR-C003-2G5H6I", status: "IN_USE", session: "51G-222.11 · B1/A/12 · 13:58", created: "01/01/2026" },
  { code: "C004", qrToken: "QR-C004-7X2K9P", status: "IN_USE", session: "51F-678.90 · B2/A/3 · 07:32", created: "01/01/2026" },
  { code: "C005", qrToken: "QR-C005-8M1N2O", status: "LOST", session: null, created: "01/01/2026" },
  { code: "C006", qrToken: "QR-C006-3P4Q5R", status: "DAMAGED", session: null, created: "02/01/2026" },
  { code: "C007", qrToken: "QR-C007-6S7T8U", status: "IN_USE", session: "59A-888.22 · B2/B/5 · 11:20", created: "02/01/2026" },
  { code: "C008", qrToken: "QR-C008-1V2W3X", status: "AVAILABLE", session: null, created: "02/01/2026" },
  { code: "C009", qrToken: "QR-C009-9Y0Z1A", status: "AVAILABLE", session: null, created: "03/01/2026" },
  { code: "C010", qrToken: "QR-C010-2B3C4D", status: "IN_USE", session: "29A-111.22 · B1/B/4 · 09:20", created: "03/01/2026" },
];

function generateFloorSlots(floor: string) {
  const configs: Record<string, { areas: string[]; slotsPerArea: number; occupiedPattern: number[] }> = {
    B1: { areas: ["A – Xe máy", "B – Xe đạp", "C – Xe điện"], slotsPerArea: 10, occupiedPattern: [1,2,4,5,6,8,3,7,9,1,3,5,7,1,2,4] },
    B2: { areas: ["A – Ô tô", "B – Ô tô điện"], slotsPerArea: 12, occupiedPattern: [1,2,3,4,6,8,9,10,11,1,3,5,7] },
    B3: { areas: ["A – Hàng hóa"], slotsPerArea: 10, occupiedPattern: [1,2,4,6,8] },
  };
  return configs[floor];
}

const SLOT_STATUS = ["AVAILABLE", "OCCUPIED", "LOCKED", "MAINTENANCE"];
function getSlotStatus(floor: string, area: number, slot: number): string {
  const seed = (floor.charCodeAt(1) + area * 7 + slot * 13) % 20;
  if (seed < 11) return "AVAILABLE";
  if (seed < 17) return "OCCUPIED";
  if (seed === 17) return "LOCKED";
  return "MAINTENANCE";
}

function SlotGridFull({ floor }: { floor: string }) {
  const cfg = generateFloorSlots(floor);
  if (!cfg) return null;

  return (
    <div className="space-y-4">
      {cfg.areas.map((area, ai) => (
        <div key={area}>
          <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
            <span>{area}</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: cfg.slotsPerArea }, (_, i) => {
              const slotNum = i + 1;
              const status = getSlotStatus(floor, ai, slotNum);
              return (
                <div
                  key={slotNum}
                  title={`Ô ${slotNum} – ${status}`}
                  className={`w-10 h-10 rounded-lg text-xs flex flex-col items-center justify-center border cursor-pointer transition-all hover:scale-105 font-medium ${
                    status === "AVAILABLE" ? "bg-green-100 text-green-700 border-green-200" :
                    status === "OCCUPIED" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    status === "LOCKED" ? "bg-gray-100 text-gray-500 border-gray-200" :
                    "bg-yellow-100 text-yellow-700 border-yellow-200"
                  }`}
                >
                  <span>{slotNum}</span>
                  <span className="text-[8px] opacity-60">
                    {status === "AVAILABLE" ? "✓" :
                     status === "OCCUPIED" ? "●" :
                     status === "LOCKED" ? "🔒" : "⚙"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSlotManagement() {
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [searchCard, setSearchCard] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeFloor, setActiveFloor] = useState("B1");

  const filteredCards = cards.filter((c) => {
    const matchSearch = c.code.toLowerCase().includes(searchCard.toLowerCase()) ||
      c.qrToken.toLowerCase().includes(searchCard.toLowerCase());
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = cards.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedCard && <QRModal card={selectedCard} onClose={() => setSelectedCard(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">Quản lý Thẻ & Ô đỗ</h1>
          <p className="text-xs text-gray-500">Tổng: {cards.length} thẻ · 200 ô đỗ</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">
          <Plus className="w-4 h-4" /> Thêm thẻ mới
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Card section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" /> Danh sách thẻ gửi xe
            </h2>
          </div>

          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { status: "ALL", label: "Tất cả", count: cards.length },
              { status: "AVAILABLE", label: "AVAILABLE", count: statusCounts.AVAILABLE || 0 },
              { status: "IN_USE", label: "IN_USE", count: statusCounts.IN_USE || 0 },
              { status: "LOST", label: "LOST", count: statusCounts.LOST || 0 },
              { status: "DAMAGED", label: "DAMAGED", count: statusCounts.DAMAGED || 0 },
            ].map((f) => (
              <button
                key={f.status}
                onClick={() => setFilterStatus(f.status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  filterStatus === f.status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  filterStatus === f.status ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
                }`}>{f.count}</span>
              </button>
            ))}

            {/* Search */}
            <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                value={searchCard}
                onChange={(e) => setSearchCard(e.target.value)}
                placeholder="Tìm mã thẻ, QR token..."
                className="text-xs bg-transparent focus:outline-none w-40 text-gray-700"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium">Mã thẻ</th>
                  <th className="text-left py-2 pr-4 font-medium">QR Token</th>
                  <th className="text-left py-2 pr-4 font-medium">Trạng thái</th>
                  <th className="text-left py-2 pr-4 font-medium">Phiên hiện tại</th>
                  <th className="text-left py-2 pr-4 font-medium">Ngày tạo</th>
                  <th className="text-left py-2 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((c) => (
                  <tr key={c.code} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className="font-mono font-bold text-blue-700">{c.code}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-xs text-gray-500">{c.qrToken}</span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-2.5 pr-4">
                      {c.session ? (
                        <span className="text-xs text-gray-600">{c.session}</span>
                      ) : (
                        <span className="text-xs text-gray-400">–</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-xs text-gray-500">{c.created}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedCard(c)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" /> QR
                        </button>
                        {c.status === "LOST" || c.status === "DAMAGED" ? (
                          <button className="text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all">
                            Phục hồi
                          </button>
                        ) : (
                          <button className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all">
                            Báo mất
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slot grid section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Sơ đồ ô đỗ theo tầng
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" /> Trống</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200 inline-block" /> Có xe</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block" /> Khóa</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-200 inline-block" /> Bảo trì</span>
            </div>
          </div>

          {/* Floor tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
            {["B1", "B2", "B3"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFloor(f)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeFloor === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "B1" ? "🛵 Tầng B1" : f === "B2" ? "🚗 Tầng B2" : "🚚 Tầng B3"}
              </button>
            ))}
          </div>

          <SlotGridFull floor={activeFloor} />

          {/* Floor stats */}
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-4 gap-3">
            {[
              { label: "Tổng ô", value: activeFloor === "B1" ? 120 : activeFloor === "B2" ? 60 : 20, color: "text-gray-700" },
              { label: "Ô trống", value: activeFloor === "B1" ? 25 : activeFloor === "B2" ? 18 : 12, color: "text-green-600" },
              { label: "Đang dùng", value: activeFloor === "B1" ? 91 : activeFloor === "B2" ? 40 : 7, color: "text-blue-600" },
              { label: "Bảo trì/Khóa", value: activeFloor === "B1" ? 4 : activeFloor === "B2" ? 2 : 1, color: "text-orange-600" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-0.5">{s.label}</div>
                <div className={`font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
