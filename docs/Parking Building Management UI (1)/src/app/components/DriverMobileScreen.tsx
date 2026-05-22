import { useState } from "react";
import {
  QrCode, MapPin, Clock, Car, CheckCircle, Scan, RefreshCw, ParkingCircle
} from "lucide-react";

function QRPlaceholder({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="rounded-xl">
      <rect width="140" height="140" fill="white" />
      {/* TL block */}
      <rect x="8" y="8" width="40" height="40" rx="4" fill="#1e40af" />
      <rect x="14" y="14" width="28" height="28" rx="2" fill="white" />
      <rect x="19" y="19" width="18" height="18" rx="2" fill="#1e40af" />
      {/* TR block */}
      <rect x="92" y="8" width="40" height="40" rx="4" fill="#1e40af" />
      <rect x="98" y="14" width="28" height="28" rx="2" fill="white" />
      <rect x="103" y="19" width="18" height="18" rx="2" fill="#1e40af" />
      {/* BL block */}
      <rect x="8" y="92" width="40" height="40" rx="4" fill="#1e40af" />
      <rect x="14" y="98" width="28" height="28" rx="2" fill="white" />
      <rect x="19" y="103" width="18" height="18" rx="2" fill="#1e40af" />
      {/* Random data modules */}
      {[60,70,80,60,70,80,60,70,80,60].map((x, i) => (
        <rect key={`d${i}`} x={x} y={8 + i * 13} width="7" height="7" fill="#1e40af" />
      ))}
      {[60,72,84,96,60,72,84,60,72].map((x, i) => (
        <rect key={`r${i}`} x={x} y={65} width="7" height="7" fill="#1e40af" />
      ))}
      {[8,22,36,60,72,84,96,108,122].map((x, i) => (
        <rect key={`b${i}`} x={x} y={80} width="7" height="7" fill={i % 2 === 0 ? "#1e40af" : "transparent"} />
      ))}
      {[60,76,92,108,60,76,92,108].map((x, i) => (
        <rect key={`c${i}`} x={x} y={95 + (i % 4) * 13} width="7" height="7" fill="#1e40af" />
      ))}
    </svg>
  );
}

export function DriverMobileScreen() {
  const [scanned, setScanned] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Phone frame */}
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
          {/* Notch */}
          <div className="bg-gray-900 h-7 flex items-center justify-center mb-1">
            <div className="w-24 h-4 bg-black rounded-full" />
          </div>

          {/* Screen */}
          <div className="bg-gray-50 rounded-[2rem] overflow-hidden min-h-[680px]">
            {/* Status bar */}
            <div className="bg-blue-700 px-5 pt-1 pb-3">
              <div className="flex justify-between items-center text-white/70 text-xs mb-3">
                <span>14:00</span>
                <span>●●●</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <ParkingCircle className="w-5 h-5" />
                <span className="font-semibold text-sm">ParkSmart – Tra cứu thẻ</span>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4 space-y-3">
              {!scanned ? (
                /* Scan prompt */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Scan className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-gray-900 mb-2">Quét mã QR thẻ gửi</h2>
                  <p className="text-sm text-gray-500 mb-6">Mở camera và hướng vào mã QR trên thẻ gửi xe để tra cứu thông tin</p>
                  <button
                    onClick={() => setScanned(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> Mở camera quét QR
                  </button>
                </div>
              ) : (
                <>
                  {/* Card badge */}
                  <div className="bg-blue-700 rounded-2xl p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-blue-200 mb-0.5">Mã thẻ</div>
                        <div className="text-2xl font-bold font-mono">C004</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-green-400 text-green-900 text-xs font-bold px-2 py-0.5 rounded-full">IN_USE</span>
                        <button
                          onClick={handleRefresh}
                          className="text-blue-200 hover:text-white transition-colors"
                        >
                          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center bg-white rounded-xl p-3">
                      <QRPlaceholder size={130} />
                    </div>
                    <div className="text-center text-xs text-blue-200 mt-2">QR Token: QR-C004-7X2K9P</div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Biển số xe", value: "51F-***.**5", icon: Car, masked: true },
                      { label: "Loại xe", value: "🚗 Ô tô", icon: null },
                      { label: "Tầng / Khu", value: "B2 / Khu A", icon: MapPin },
                      { label: "Ô đỗ", value: "Ô số 3", icon: null },
                    ].map((f) => (
                      <div key={f.label} className="bg-white rounded-xl p-3 border border-gray-100">
                        <div className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                          {f.icon && <f.icon className="w-3 h-3" />}
                          {f.label}
                        </div>
                        <div className={`font-semibold text-sm text-gray-900 ${f.masked ? "tracking-wider" : ""}`}>
                          {f.value}
                        </div>
                        {f.masked && (
                          <div className="text-xs text-orange-500 mt-0.5">* Đã ẩn thông tin</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Time info */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 text-gray-700 mb-3">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">Thời gian gửi xe</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500">Giờ vào</div>
                        <div className="font-semibold text-gray-900">07:32</div>
                        <div className="text-xs text-gray-400">14/05/2026</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Đang gửi</div>
                        <div className="font-semibold text-blue-600">6g 28p</div>
                        <div className="text-xs text-gray-400">Đến hiện tại</div>
                      </div>
                    </div>
                    {/* Timeline */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1 h-1 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                      </div>
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>07:32</span>
                      <span>Hiện tại: 14:00</span>
                    </div>
                  </div>

                  {/* Fee estimate */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-orange-600 mb-0.5">Phí tạm tính</div>
                        <div className="text-xl font-bold text-orange-700">42.500đ</div>
                        <div className="text-xs text-orange-500">Cập nhật mỗi giờ</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Trạng thái</div>
                        <div className="flex items-center gap-1 text-green-600 font-semibold text-sm mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                          Đang gửi
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Directions */}
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-blue-800 mb-1">Hướng dẫn tìm xe</div>
                        <div className="text-xs text-blue-700 leading-relaxed">
                          Vào thang máy → Tầng B2 → Đi thẳng khu A → Ô số 3 (bên trái)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scan again */}
                  <button
                    onClick={() => setScanned(false)}
                    className="w-full border-2 border-blue-200 text-blue-600 rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all"
                  >
                    <QrCode className="w-4 h-4" /> Quét thẻ khác
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Home bar */}
          <div className="flex justify-center py-2">
            <div className="w-24 h-1 bg-gray-600 rounded-full" />
          </div>
        </div>

        {/* Label below */}
        <div className="text-center mt-4 text-gray-500 text-sm">
          Giao diện di động · Lái xe / Khách hàng
        </div>
      </div>
    </div>
  );
}
