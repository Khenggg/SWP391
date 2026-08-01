import React, { useState, useEffect } from "react";
import { parkingService } from "@/services/parkingService";
import { MapPin, Phone, ShieldCheck, HardHat, Info, HelpCircle, Layers, ArrowRight, Video, Flame, LifeBuoy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AMENITIES = [
  { icon: <ShieldCheck className="w-5 h-5 text-blue-600" />, title: "An Ninh 24/7", desc: "Camera giám sát AI kết hợp lực lượng an ninh trực chiến liên tục." },
  { icon: <Video className="w-5 h-5 text-blue-600" />, title: "Nhận Diện Biển Số", desc: "Hệ thống tự động chụp và đối soát biển số xe lúc vào và lúc ra." },
  { icon: <Flame className="w-5 h-5 text-red-500" />, title: "PCCC Hiện Đại", desc: "Hệ thống báo cháy tự động và vòi phun nước cảm biến nhiệt độ." },
  { icon: <LifeBuoy className="w-5 h-5 text-emerald-500" />, title: "Cứu Hộ Khẩn Cấp", desc: "Hỗ trợ kích bình ác-quy, hỗ trợ kỹ thuật xe gặp sự cố miễn phí." },
];

const FLOOR_DETAILS = [
  {
    floor: "Tầng Trệt (G)",
    type: "Khu vực Xe Máy",
    capacity: "250 xe",
    desc: "Khu vực gửi xe máy của khách vãng lai và cư dân. Lối ra vào rộng rãi ngay mặt đường chính, thuận tiện cho việc di chuyển nhanh chóng."
  },
  {
    floor: "Tầng Hầm B1",
    type: "Khu vực Xe Máy & Ô tô",
    capacity: "150 xe máy / 80 ô tô",
    desc: "Trang bị trạm sạc điện chuyên dụng cho xe máy điện và ô tô điện. Có phân khu dành riêng cho xe của người khuyết tật."
  },
  {
    floor: "Tầng Hầm B2",
    type: "Khu vực Ô tô",
    capacity: "160 ô tô",
    desc: "Khu vực chuyên dụng dành cho ô tô đăng ký thẻ tháng và xe của ban quản lý. Khoảng cách giữa các ô đỗ rộng rãi, an toàn cho mọi dòng xe gầm cao/thấp."
  }
];

export default function ParkingInfoPage() {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFloorTab, setActiveFloorTab] = useState(0);

  const fetchInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await parkingService.getParkingInfo();
      setInfo(data);
    } catch {
      setError("Không tải được thông tin bãi xe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* ===== HERO COMPACT FOR INFO PAGE ===== */}
      <div className="bg-slate-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-900 to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-3 px-3 py-1 font-semibold rounded-full">
            Cơ sở vật chất
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">THÔNG TIN BÃI XE</h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            Tìm hiểu chi tiết cấu trúc các tầng hầm đỗ xe, trang thiết bị kỹ thuật và hệ thống an toàn tại SWP Building.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ===== MAIN CONTENT: FLOORS & FACILITIES ===== */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* FLOOR STRUCTURE DETAILS */}
          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Cấu Trúc Các Tầng Đỗ Xe
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-100 mb-6 overflow-x-auto">
                {FLOOR_DETAILS.map((fd, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFloorTab(idx)}
                    className={`pb-3 px-4 font-bold text-sm whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeFloorTab === idx 
                        ? "border-blue-600 text-blue-600" 
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {fd.floor}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-bold px-3 py-1">
                    {FLOOR_DETAILS[activeFloorTab].type}
                  </Badge>
                  <span className="text-sm text-slate-500">Sức chứa: <strong>{FLOOR_DETAILS[activeFloorTab].capacity}</strong></span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                  {FLOOR_DETAILS[activeFloorTab].desc}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AMENITIES / SAFETY FACILITIES */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 px-1">
              <HardHat className="w-5 h-5 text-blue-600" />
              Tiện Ích & Trang Thiết Bị
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AMENITIES.map((amenity, idx) => (
                <Card key={idx} className="border-slate-100/85 hover:border-slate-200/90 shadow-sm transition-all rounded-xl p-5 flex items-start gap-4 bg-white">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {amenity.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 mb-1">{amenity.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{amenity.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* ===== SIDEBAR: CONTACT & STATUS ===== */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-slate-100 shadow-sm rounded-2xl bg-white p-6 space-y-6">
            <h3 className="font-extrabold text-base text-slate-800 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Thông Tin Liên Hệ
            </h3>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-5/6" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-xs">{error}</p>
            ) : info ? (
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Địa chỉ bãi xe</p>
                    <p className="text-xs text-slate-500 mt-1">{info.address}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Đường dây nóng</p>
                    <p className="text-xs text-slate-500 mt-1">{info.hotline}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <ShieldCheck size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Đơn vị quản lý</p>
                    <p className="text-xs text-slate-500 mt-1">Ban Quản Lý Tòa Nhà SWP Building</p>
                  </div>
                </div>
              </div>
            ) : null}
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-2xl bg-blue-600 text-white p-6 space-y-4 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Layers className="w-32 h-32" />
            </div>
            <h3 className="font-bold text-base">Hướng Dẫn Đỗ Xe</h3>
            <ul className="space-y-3 text-xs text-blue-100 leading-relaxed list-none p-0">
              <li className="flex items-start gap-2">
                <span className="font-bold bg-blue-500/50 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <span>Di chuyển chậm vào cổng và dừng trước camera quét biển số.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold bg-blue-500/50 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <span>Quét mã QR (nếu có thẻ cá nhân) hoặc nhận vé từ máy cấp phát tự động.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold bg-blue-500/50 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <span>Di chuyển vào đúng tầng & phân khu được chỉ định cho loại xe của bạn.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
