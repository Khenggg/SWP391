import React, { useState, useEffect } from "react";
import { pricingService } from "@/services/pricingService";
import { DollarSign, Moon, Sun, CreditCard, AlertTriangle, ShieldCheck, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

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
      const data = await pricingService.getPublicPricing();
      setRules(data);
      
      const uniqueTypes = Array.from(new Set(data.map(r => r.vehicleTypeName))).filter(Boolean);
      setVehicleTypes(uniqueTypes);
    } catch {
      setError("Không tải được thông tin bảng giá. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const displayed = filterVehicle === "ALL"
    ? rules
    : rules.filter((r) => r.vehicleTypeName === filterVehicle);

  const vehicleOptions = ["ALL", ...vehicleTypes];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
      {/* Page Header with Premium Gradient Overlay */}
      <div className="bg-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-3 px-3 py-1 font-semibold rounded-full">
            Bảng giá minh bạch
          </Badge>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">BẢNG GIÁ GỬI XE</h1>
          </div>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Áp dụng từ 01/01/2026. Giá đã bao gồm thuế suất hiện hành và các loại bảo hiểm phương tiện liên quan.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Modern Filter Segmented Control */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Tag size={14} className="text-blue-500" />
            Lọc theo loại xe:
          </span>
          <div className="flex flex-wrap gap-2">
            {vehicleOptions.map((v) => (
              <Button
                key={v}
                onClick={() => setFilterVehicle(v)}
                className={`rounded-xl text-xs font-bold px-4 py-2 transition-all ${
                  filterVehicle === v 
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border-none"
                }`}
              >
                {v === "ALL" ? "Tất cả phương tiện" : v}
              </Button>
            ))}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-slate-200 rounded-2xl" />)}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200 p-10 text-center shadow-none rounded-2xl">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>
            <Button variant="destructive" onClick={load} className="rounded-xl">
              Thử lại
            </Button>
          </Card>
        ) : displayed.length === 0 ? (
          <EmptyState 
            icon={<DollarSign size={40} className="text-slate-300" />} 
            title="Chưa có bảng giá" 
            description="Không tìm thấy thông tin cho loại xe này." 
            className="border-slate-100 rounded-2xl bg-white"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((rule) => (
              <Card
                key={rule.pricingRuleId ?? rule.id}
                className="bg-white border-slate-100/90 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden rounded-2xl flex flex-col justify-between"
              >
                {/* Header */}
                <div className="bg-slate-900 px-6 py-5 border-b border-slate-800">
                  <h3 className="text-base font-extrabold text-white tracking-wide">{rule.vehicleTypeName}</h3>
                </div>

                {/* Body */}
                <CardContent className="p-6 space-y-4">
                  {/* Monthly Price Highlighting */}
                  <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute right-3 top-3 opacity-10">
                      <CreditCard size={48} className="text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CreditCard size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Gói Vé Tháng</span>
                    </div>
                    <p className="text-3xl font-black text-blue-700 leading-tight">
                      {formatVND(rule.monthlyPrice)}
                      <span className="text-xs font-semibold text-slate-400 ml-1">/ tháng</span>
                    </p>
                  </div>

                  {/* Day / Night prices */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                        <Sun size={14} className="text-amber-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ban Ngày</span>
                      </div>
                      <p className="font-extrabold text-slate-800 text-base">{formatVND(rule.dayPrice)}</p>
                      <span className="text-[10px] text-slate-400">06:00 - 22:00</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100/50 rounded-2xl p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                        <Moon size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Ban Đêm</span>
                      </div>
                      <p className="font-extrabold text-slate-800 text-base">{formatVND(rule.nightPrice)}</p>
                      <span className="text-[10px] text-slate-400">22:00 - 06:00</span>
                    </div>
                  </div>

                  {/* Lost Card Fee */}
                  <div className="flex items-center justify-between bg-red-50/50 border border-red-100 rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-red-600">Phí đền bù mất thẻ</span>
                    <span className="text-sm font-black text-red-700">{formatVND(rule.lostCardFee)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fineprint Note */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-5 flex gap-3 items-start text-sm text-amber-800">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Lưu ý quan trọng khi gửi xe:</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Giá gửi xe theo giờ được làm tròn theo block 1 tiếng. Vé tháng được định danh theo thông tin khách hàng và biển số xe đã đăng ký, không hỗ trợ chuyển nhượng hoặc sử dụng chéo phương tiện khác.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
