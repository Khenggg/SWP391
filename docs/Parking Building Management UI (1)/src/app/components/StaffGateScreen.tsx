import { useState } from "react";
import {
  Car, Bike, Truck, Zap, QrCode, CreditCard, Camera, ChevronDown,
  CheckCircle, AlertCircle, DoorOpen, Receipt, Clock, MapPin
} from "lucide-react";

const vehicleTypes = [
  { id: "xe_may", label: "Xe máy", icon: "🛵", floor: "B1", area: "A" },
  { id: "xe_dap", label: "Xe đạp", icon: "🚲", floor: "B1", area: "B" },
  { id: "xe_dien", label: "Xe điện", icon: "⚡", floor: "B1", area: "C" },
  { id: "oto", label: "Ô tô", icon: "🚗", floor: "B2", area: "A" },
  { id: "oto_dien", label: "Ô tô điện", icon: "🔌", floor: "B2", area: "B" },
  { id: "xe_tai", label: "Xe tải / Hàng hóa", icon: "🚚", floor: "B3", area: "A" },
];

const availableCards = ["C001", "C002", "C003", "C007", "C011", "C015", "C019"];

// Mini slot grid mock data: 5x6 grid, some occupied
function generateSlots(floor: string, area: string) {
  const slots = [];
  const total = floor === "B3" ? 12 : floor === "B2" ? 20 : 30;
  const occupied = floor === "B1" ? [1, 3, 4, 6, 8, 11, 14, 15, 16, 17, 19, 20, 22, 23, 25] :
                   floor === "B2" ? [1, 2, 4, 5, 7, 9, 10, 12, 13, 16] :
                   [1, 2, 4, 6, 8];
  for (let i = 1; i <= total; i++) {
    slots.push({ id: i, occupied: occupied.includes(i), suggested: i === (floor === "B1" ? 2 : floor === "B2" ? 3 : 3) });
  }
  return slots;
}

function SlotGrid({ floor, area }: { floor: string; area: string }) {
  const slots = generateSlots(floor, area);
  return (
    <div className="flex flex-wrap gap-1.5">
      {slots.map((s) => (
        <div
          key={s.id}
          className={`w-8 h-8 rounded-md text-xs flex items-center justify-center font-medium border transition-all
            ${s.suggested ? "bg-blue-500 text-white border-blue-600 ring-2 ring-blue-300 ring-offset-1" :
              s.occupied ? "bg-red-100 text-red-500 border-red-200" :
              "bg-green-100 text-green-600 border-green-200"}`}
        >
          {s.id}
        </div>
      ))}
    </div>
  );
}

function QRPlaceholder({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className="rounded-md">
      <rect width="80" height="80" fill="white" />
      {/* TL block */}
      <rect x="4" y="4" width="24" height="24" rx="2" fill="#1e40af" />
      <rect x="8" y="8" width="16" height="16" rx="1" fill="white" />
      <rect x="11" y="11" width="10" height="10" rx="1" fill="#1e40af" />
      {/* TR block */}
      <rect x="52" y="4" width="24" height="24" rx="2" fill="#1e40af" />
      <rect x="56" y="8" width="16" height="16" rx="1" fill="white" />
      <rect x="59" y="11" width="10" height="10" rx="1" fill="#1e40af" />
      {/* BL block */}
      <rect x="4" y="52" width="24" height="24" rx="2" fill="#1e40af" />
      <rect x="8" y="56" width="16" height="16" rx="1" fill="white" />
      <rect x="11" y="59" width="10" height="10" rx="1" fill="#1e40af" />
      {/* Data modules */}
      {[36,40,44,36,44,36,40,44].map((x, i) => (
        <rect key={i} x={x} y={4 + i * 9} width="5" height="5" fill="#1e40af" />
      ))}
      {[4,12,20,4,12,20].map((y, i) => (
        <rect key={i} x={36 + i * 7} y={36} width="5" height="5" fill="#1e40af" />
      ))}
      {[4,16,28,36,48,60,68].map((x, i) => (
        <rect key={i} x={x} y={44} width="5" height="5" fill="#1e40af" />
      ))}
      {[52,60,68,52,60,68].map((y, i) => (
        <rect key={i} x={36 + i * 7} y={52} width="5" height="5" fill="#1e40af" />
      ))}
    </svg>
  );
}

export function StaffGateScreen() {
  const [activeTab, setActiveTab] = useState<"vao" | "ra">("vao");
  const [plate, setPlate] = useState("51F-123.45");
  const [vehicleType, setVehicleType] = useState("xe_may");
  const [selectedCard, setSelectedCard] = useState("C001");
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [sessionCreated, setSessionCreated] = useState(false);
  const [cardInput, setCardInput] = useState("C004");
  const [exitDone, setExitDone] = useState(false);

  const vt = vehicleTypes.find((v) => v.id === vehicleType)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Cổng Ra/Vào</h1>
            <p className="text-xs text-gray-500">Nhân viên: Nguyễn Văn An | Ca: 06:00 – 14:00</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-gray-500">Hôm nay</div>
            <div className="text-sm font-semibold text-gray-900">Thứ Năm, 14/05/2026</div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Hệ thống hoạt động
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
          {[
            { id: "vao", label: "🚗 Xe vào", color: "text-blue-700" },
            { id: "ra", label: "🔓 Xe ra", color: "text-orange-700" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as "vao" | "ra")}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === t.id ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* XE VÀO */}
        {activeTab === "vao" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left col: form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Plate + Camera */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-500" /> Thông tin phương tiện
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Biển số xe</label>
                    <div className="flex gap-2">
                      <input
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        placeholder="VD: 51F-123.45"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      />
                      <button
                        onClick={() => setCameraActive(!cameraActive)}
                        className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-sm transition-all ${
                          cameraActive ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        {cameraActive ? "Đang quét..." : "Camera"}
                      </button>
                    </div>
                    {cameraActive && (
                      <div className="mt-2 rounded-xl bg-gray-900 h-24 flex items-center justify-center text-white text-xs">
                        <div className="text-center">
                          <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="opacity-50">Camera đang hoạt động</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Loại phương tiện</label>
                    <div className="grid grid-cols-2 gap-2">
                      {vehicleTypes.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setVehicleType(v.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                            vehicleType === v.id
                              ? "bg-blue-50 border-blue-300 text-blue-700"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-base">{v.icon}</span>
                          <span className="truncate">{v.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" /> Thẻ gửi xe
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Chọn thẻ trống</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowCardDropdown(!showCardDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
                            <CreditCard className="w-3.5 h-3.5 text-white" />
                          </div>
                          <span className="font-mono font-semibold">{selectedCard}</span>
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">AVAILABLE</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      {showCardDropdown && (
                        <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                          {availableCards.map((c) => (
                            <button
                              key={c}
                              onClick={() => { setSelectedCard(c); setShowCardDropdown(false); }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 text-sm text-left"
                            >
                              <span className="font-mono font-semibold">{c}</span>
                              <span className="ml-auto bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full">AVAILABLE</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <QRPlaceholder size={64} />
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">Mã thẻ</div>
                      <div className="font-mono font-bold text-blue-800 text-lg">{selectedCard}</div>
                      <div className="text-xs text-gray-500 mt-1">QR tĩnh gắn trên thẻ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              {!sessionCreated ? (
                <button
                  onClick={() => setSessionCreated(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                >
                  <CheckCircle className="w-5 h-5" />
                  Tạo lượt gửi xe
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800">Lượt gửi đã được tạo thành công!</div>
                    <div className="text-sm text-green-700">
                      Xe {plate} · Thẻ {selectedCard} · {vt.floor}/{vt.area} · Ô số{" "}
                      {vt.floor === "B1" ? 2 : vt.floor === "B2" ? 3 : 3}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right col: slot grid */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> Sơ đồ ô trống
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Tầng {vt.floor} · Khu {vt.area} · Gợi ý: <span className="text-blue-600 font-semibold">Ô số {vt.floor === "B1" ? 2 : vt.floor === "B2" ? 3 : 3}</span>
                </p>
                <div className="mb-3 flex gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block ring-1 ring-blue-300" /> Gợi ý</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" /> Trống</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-200 inline-block" /> Có xe</span>
                </div>
                <SlotGrid floor={vt.floor} area={vt.area} />
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Hướng dẫn nhân viên</h3>
                <ol className="space-y-2 text-xs text-gray-600">
                  {[
                    "Nhập biển số hoặc chụp ảnh camera",
                    "Chọn loại phương tiện phù hợp",
                    "Lấy thẻ gửi trống và chọn mã thẻ",
                    "Hướng dẫn xe vào ô được gợi ý",
                    "Nhấn Tạo lượt gửi → giao thẻ cho khách",
                  ].map((s, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-semibold">{i + 1}</span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* XE RA */}
        {activeTab === "ra" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              {/* Card input */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-orange-500" /> Xác định thẻ gửi
                </h3>
                <div className="flex gap-2">
                  <input
                    value={cardInput}
                    onChange={(e) => setCardInput(e.target.value)}
                    placeholder="Nhập mã thẻ VD: C004"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  />
                  <button className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium flex items-center gap-1.5 hover:bg-orange-600 transition-all">
                    <QrCode className="w-4 h-4" /> Quét QR
                  </button>
                </div>
              </div>

              {/* Session info */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Thông tin lượt gửi đang hoạt động
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Mã thẻ", value: cardInput, mono: true },
                    { label: "Biển số", value: "51F-678.90", mono: true },
                    { label: "Loại xe", value: "🚗 Ô tô" },
                    { label: "Tầng / Khu / Ô", value: "B2 / A / Ô 3" },
                    { label: "Giờ vào", value: "07:32 – 14/05" },
                    { label: "Thời gian gửi", value: "6 giờ 28 phút" },
                  ].map((f) => (
                    <div key={f.label} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-500 mb-0.5">{f.label}</div>
                      <div className={`font-semibold text-gray-900 text-sm ${f.mono ? "font-mono" : ""}`}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {/* Fee */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-orange-800 font-medium flex items-center gap-1">
                      <Receipt className="w-4 h-4" /> Chi tiết phí
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>Phí giờ đầu (2 giờ)</span><span>20.000đ</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Phí thêm (4.5 giờ × 5.000đ)</span><span>22.500đ</span>
                    </div>
                    <div className="border-t border-orange-200 pt-1 mt-1 flex justify-between font-bold text-orange-800">
                      <span>Tổng phí</span><span>42.500đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">Thanh toán tiền mặt</span>
                </button>
                <button
                  onClick={() => setExitDone(true)}
                  className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-white text-center">Hoàn tất · Xe ra</span>
                </button>
                <button className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <DoorOpen className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">Mở barrier</span>
                </button>
              </div>

              {exitDone && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800">Xe đã ra thành công!</div>
                    <div className="text-sm text-green-700">Thẻ {cardInput} → trạng thái AVAILABLE · Barrier đã mở</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Thống kê hôm nay</h3>
                <div className="space-y-3">
                  {[
                    { label: "Xe đã vào", value: "148", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Xe đã ra", value: "121", color: "text-green-600", bg: "bg-green-50" },
                    { label: "Đang gửi", value: "27", color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Doanh thu ca", value: "485.000đ", color: "text-purple-600", bg: "bg-purple-50" },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl px-3 py-2.5 flex justify-between items-center`}>
                      <span className="text-xs text-gray-600">{s.label}</span>
                      <span className={`font-bold text-sm ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Gần đây</h3>
                <div className="space-y-2">
                  {[
                    { time: "13:58", plate: "51G-222.11", action: "Vào", card: "C003", color: "text-blue-600" },
                    { time: "13:41", plate: "59A-888.22", action: "Ra", card: "C007", color: "text-green-600" },
                    { time: "13:29", plate: "30A-456.78", action: "Vào", card: "C015", color: "text-blue-600" },
                    { time: "13:15", plate: "51F-678.90", action: "Vào", card: "C004", color: "text-blue-600" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400 w-10">{r.time}</span>
                      <span className="font-mono flex-1 truncate">{r.plate}</span>
                      <span className={`font-medium ${r.color}`}>{r.action}</span>
                      <span className="font-mono text-gray-400">{r.card}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
