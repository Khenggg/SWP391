import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { parkingService } from "@/services/parkingService";
import { 
  CarFront, 
  Clock, 
  Shield, 
  MapPin, 
  Phone, 
  Zap, 
  QrCode, 
  CreditCard, 
  ChevronRight, 
  Award,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_CONFIG = {
  OPEN:        { label: "Đang mở cửa",  dot: "bg-green-500",  badge: "bg-green-100 text-green-700 border-green-200" },
  CLOSED:      { label: "Đã đóng cửa", dot: "bg-red-500",    badge: "bg-red-100 text-red-700 border-red-200" },
  MAINTENANCE: { label: "Bảo trì",      dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

const FEATURES = [
  {
    icon: <QrCode className="w-6 h-6 text-blue-600" />,
    title: "Vào Ra Bằng Mã QR",
    desc: "Không lo mất thẻ hay chờ đợi. Quét mã QR nhanh chóng tại các cổng kiểm soát thông minh."
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    title: "Trạm Sạc Xe Điện",
    desc: "Hệ thống trạm sạc điện hiện đại tại tầng hầm B1, an toàn và sẵn sàng phục vụ phương tiện của bạn."
  },
  {
    icon: <CreditCard className="w-6 h-6 text-emerald-500" />,
    title: "Thanh Toán Đa Dạng",
    desc: "Hỗ trợ thanh toán tiện lợi qua ví điện tử, chuyển khoản ngân hàng hoặc thẻ trả trước."
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-500" />,
    title: "Bảo Mật Tuyệt Đối",
    desc: "Hệ thống camera giám sát thông minh AI cùng đội ngũ bảo vệ chuyên nghiệp tuần tra 24/7."
  }
];

const FAQS = [
  {
    q: "Làm thế nào để đăng ký gửi xe tháng?",
    a: "Bạn có thể đăng ký trực tuyến bằng cách đăng nhập vào tài khoản cá nhân trên hệ thống, chọn mục 'Đăng ký thẻ tháng' và điền thông tin xe. Sau đó thực hiện thanh toán online để kích hoạt thẻ."
  },
  {
    q: "Bãi xe hỗ trợ các loại phương tiện nào?",
    a: "Hệ thống bãi xe SWP Building hỗ trợ đỗ cả xe máy (tại Tầng trệt và tầng hầm B1) và ô tô (tại tầng hầm B1, B2)."
  },
  {
    q: "Tôi có thể thanh toán phí gửi xe bằng phương thức nào?",
    a: "Bạn có thể thanh toán trực tiếp qua ví điện tử, mã QR ngân hàng hoặc sử dụng số dư tài khoản trả trước đã liên kết trên ứng dụng."
  }
];

export default function HomePage() {
  const [info, setInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const fetchInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, slotsData] = await Promise.all([
        parkingService.getParkingInfo(),
        parkingService.getAvailableSlots().catch(() => null),
      ]);

      const activeSlotsCount = Array.isArray(slotsData?.slots)
        ? slotsData.slots.length
        : (data?.availableSlots ?? null);

      setInfo({
        ...data,
        availableSlots: activeSlotsCount ?? data?.availableSlots ?? 0,
      });
    } catch {
      setError("Không tải được thông tin bãi xe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const statusCfg = info ? (STATUS_CONFIG[info.status] || STATUS_CONFIG["CLOSED"]) : STATUS_CONFIG["CLOSED"];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      {/* ===== HERO SECTION WITH MODERN OVERLAY & GRADIENT ===== */}
      <section className="relative min-h-[500px] flex items-center bg-slate-900 text-white overflow-hidden py-16">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/parking-hero.jpg"
            alt="SWP Smart Parking Hero"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-full">
              Hệ Thống Quản Lý Bãi Xe Số 1
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              SWP BUILDING <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                SMART PARKING
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
              Trải nghiệm đỗ xe thông minh hàng đầu với công nghệ kiểm soát QR hiện đại, cập nhật chỗ trống thời gian thực và thanh toán tự động không chạm.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/available-slots">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                  <CarFront size={18} />
                  Xem Chỗ Trống Ngay
                </Button>
              </Link>
              <Link to="/parking-info">
                <Button variant="outline" className="border-slate-700 text-white bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 font-semibold h-12 px-6 rounded-xl transition-all hover:-translate-y-0.5">
                  Tìm hiểu bãi xe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REALTIME STATUS STRIP / STATS ===== */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 -mt-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white/80 backdrop-blur rounded-2xl border border-slate-100 shadow-md animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-50/90 backdrop-blur border border-red-200 p-6 text-center shadow-lg rounded-2xl">
            <p className="text-red-600 text-sm font-semibold mb-3">{error}</p>
            <Button variant="outline" onClick={fetchInfo} className="h-9 text-xs text-blue-600 font-semibold hover:bg-white border-blue-200">Thử lại</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                <CarFront className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Tổng sức chứa</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{info?.totalCapacity?.toLocaleString("vi-VN") || "–"}</p>
                <p className="text-xs text-slate-400 mt-1">Toàn bộ tòa nhà</p>
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <span className="text-xl font-black">P</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Chỗ Trống Hiện Tại</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{info?.availableSlots?.toLocaleString("vi-VN") || "–"}</p>
                <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                  Cập nhật liên tục
                </p>
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Giờ Hoạt Động</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{info?.openingHours || "–"}</p>
                <p className="text-xs text-slate-400 mt-1">Tất cả các ngày trong tuần</p>
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur-md border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Trạng thái bãi xe</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                  <span className="text-sm font-bold text-slate-800">{statusCfg.label}</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* ===== INFO STRIP ===== */}
      {!isLoading && !error && info && (
        <section className="max-w-7xl mx-auto px-6 mt-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap gap-6 items-center shadow-sm text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-500 flex-shrink-0" />
              <span className="font-medium text-slate-700">{info.address}</span>
            </div>
            <div className="w-px h-4 bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-blue-500 flex-shrink-0" />
              <span className="font-medium text-slate-700">Hotline: {info.hotline}</span>
            </div>
          </div>
        </section>
      )}

      {/* ===== WHY CHOOSE US / FEATURES ===== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-none font-bold rounded-full">Tiện ích vượt trội</Badge>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Giải Pháp Đỗ Xe Thế Hệ Mới</h2>
          <p className="text-slate-500">Chúng tôi ứng dụng các giải pháp phần mềm và quản lý tiên tiến nhất để mang lại sự tiện lợi tối đa cho khách hàng.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => (
            <Card key={i} className="bg-white border-slate-100/80 hover:shadow-xl hover:border-blue-100 transition-all duration-300 p-6 flex flex-col justify-between group rounded-2xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ===== FAQ ACCORDION SECTION ===== */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10 space-y-2">
            <HelpCircle className="w-8 h-8 text-blue-500 mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Câu Hỏi Thường Gặp</h2>
            <p className="text-slate-500">Giải đáp nhanh các thắc mắc về quy trình gửi xe và thanh toán</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-40 border-t border-slate-100" : "max-h-0"}`}>
                    <p className="p-6 text-sm text-slate-600 leading-relaxed bg-white">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== DYNAMIC SERVICES STRIP ===== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-blue-600/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold">Bắt đầu trải nghiệm ngay hôm nay!</h3>
            <p className="text-blue-100 text-sm md:text-base">Đăng ký tài khoản lái xe để mua vé tháng trực tuyến, theo dõi lịch sử đỗ xe và nhận thông báo tức thời.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/register">
              <Button className="bg-white hover:bg-blue-50 text-blue-700 font-bold px-6 py-6 h-auto rounded-xl transition-all hover:scale-105">
                Đăng ký tài khoản
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-bold px-6 py-6 h-auto rounded-xl transition-all">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
