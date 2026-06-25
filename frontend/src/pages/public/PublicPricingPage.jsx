import React, { useState, useEffect } from "react";
import { pricingService } from "@/services/pricingService";
import { parkingService } from "@/services/parkingService";
import { DollarSign, Moon, Sun, CreditCard, AlertTriangle } from "lucide-react";

function formatVND(amount) {
  if (!amount && amount !== 0) return "–";
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function PublicPricingPage() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [vehicleTypes, setVehicleTypes] = useState([]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pricingService.getPricingRules();
      setRules(data);
      
      // Lấy danh sách loại xe duy nhất từ dữ liệu bảng giá trả về
      const uniqueTypes = Array.from(new Set(data.map(r => r.vehicleTypeName))).filter(Boolean);
      setVehicleTypes(uniqueTypes);
    } catch {
      setError("Không tải được thông tin bảng giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Backend returns only ACTIVE rules
  const displayed = filterVehicle === "ALL"
    ? rules
    : rules.filter((r) => r.vehicleTypeName === filterVehicle);

  const vehicleOptions = ["ALL", ...vehicleTypes];

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Bảng Giá Gửi Xe</h1>
          </div>
          <p className="text-gray-500 text-sm ml-13 pl-0.5">
            Áp dụng từ 01/01/2026. Giá đã bao gồm thuế suất hiện hành.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loại xe:</span>
          <div className="flex flex-wrap gap-2">
            {vehicleOptions.map((v) => (
              <button
                key={v}
                onClick={() => setFilterVehicle(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  filterVehicle === v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {v === "ALL" ? "Tất cả" : v}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>
            <button onClick={load} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
              Thử lại
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <DollarSign size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700 text-lg">Chưa có bảng giá</p>
            <p className="text-sm text-gray-400 mt-1">Không tìm thấy thông tin cho loại xe này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((rule) => (
              <div
                key={rule.pricingRuleId ?? rule.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-blue-600 px-6 py-4">
                  <h3 className="text-base font-black text-white uppercase tracking-wide">{rule.vehicleTypeName}</h3>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  {/* Monthly Highlight */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CreditCard size={13} className="text-blue-500" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Vé Tháng</span>
                    </div>
                    <p className="text-2xl font-black text-blue-700">
                      {formatVND(rule.monthlyPrice)}
                      <span className="text-xs font-normal text-gray-400 ml-1">/ tháng</span>
                    </p>
                  </div>

                  {/* Day / Night */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Sun size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Ban Ngày</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{formatVND(rule.dayPrice)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Moon size={12} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Ban Đêm</span>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{formatVND(rule.nightPrice)}</p>
                    </div>
                  </div>

                  {/* Lost Card Fee */}
                  <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    <span className="text-xs font-semibold text-red-600">Phí mất thẻ</span>
                    <span className="text-sm font-black text-red-700">{formatVND(rule.lostCardFee)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 items-start text-sm text-yellow-800">
          <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p>
            Giá ban ngày áp dụng <strong>06:00 – 22:00</strong> | Giá ban đêm áp dụng <strong>22:00 – 06:00</strong>.
            Phí gửi giờ tính theo từng giờ lẻ làm tròn. Bảng giá có thể thay đổi mà không cần thông báo trước.
          </p>
        </div>
      </div>
    </div>
  );
}
