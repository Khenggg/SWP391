import React, { useState } from "react";
import { List, Search, ChevronDown, X, ShieldAlert, BadgeInfo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

// ─── STATIC RULES DATA ────────────────────────────────────────────────────────
const STATIC_RULES = [
  {
    id: "entry",
    title: "Quy Định Vào Bãi",
    icon: "→",
    items: [
      "Quý khách vui lòng dừng xe đúng vạch quy định để camera nhận dạng biển số.",
      "Nhận vé xe (thẻ từ) từ nhân viên hoặc máy phát tự động trước khi vào bãi.",
      "Tuyệt đối không mang chất cháy nổ, vũ khí hoặc hàng hóa cấm vào bãi gửi xe.",
      "Đối với xe ô tô, vui lòng hạ kính xe để nhân viên kiểm tra (nếu có yêu cầu).",
    ],
  },
  {
    id: "parking",
    title: "Quy Định Đỗ Xe",
    icon: "🅿️",
    items: [
      "Đỗ xe đúng trong vạch kẻ quy định của từng ô đỗ, không lấn vạch.",
      "Đỗ đúng khu vực dành riêng cho từng loại xe (xe máy, ô tô, xe điện).",
      "Tắt máy, khóa xe cẩn thận và tự bảo quản tư trang, tài sản cá nhân có giá trị.",
      "Nghiêm cấm vứt rác bừa bãi, hút thuốc hoặc gây mất vệ sinh khu vực bãi xe.",
    ],
  },
  {
    id: "exit",
    title: "Quy Định Ra Bãi",
    icon: "←",
    items: [
      "Giao lại vé xe (thẻ từ) cho nhân viên soát vé tại cổng ra.",
      "Thanh toán đầy đủ phí gửi xe theo bảng giá quy định trước khi rời đi.",
      "Biển số xe ra phải trùng khớp hoàn toàn với biển số xe lúc vào.",
      "Trong trường hợp hệ thống không nhận diện được, quý khách vui lòng hợp tác với nhân viên kiểm tra.",
    ],
  },
  {
    id: "lost_card",
    title: "Mất Thẻ & Sự Cố",
    icon: "⚠",
    items: [
      "Nếu làm mất thẻ/vé, quý khách phải lập tức thông báo cho ban quản lý bãi xe.",
      "Cần xuất trình Giấy đăng ký xe (Cà vẹt) và CCCD/CMND để xác minh sở hữu xe.",
      "Phí làm mất thẻ/vé sẽ được thu theo quy định hiện hành của bãi xe.",
      "Thời gian giải quyết xe mất thẻ có thể kéo dài để đảm bảo an ninh, mong quý khách thông cảm.",
    ],
  },
  {
    id: "monthly_pass",
    title: "Khách Hàng Vé Tháng",
    icon: "📋",
    items: [
      "Thẻ vé tháng chỉ có giá trị sử dụng cho đúng 01 xe đã đăng ký biển số.",
      "Vui lòng đóng phí gia hạn trước ngày mùng 5 hàng tháng để thẻ không bị khóa.",
      "Không tự ý cho mượn thẻ vé tháng dưới bất kỳ hình thức nào.",
    ],
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RulesPage() {
  const [openSection, setOpenSection] = useState("entry");
  const [searchText, setSearchText]   = useState("");

  const filteredRules = STATIC_RULES
    .map(s => ({
      ...s,
      items: searchText.trim()
        ? s.items.filter(item => item.toLowerCase().includes(searchText.toLowerCase()))
        : s.items,
    }))
    .filter(s => !searchText.trim() || s.items.length > 0);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-16">
      {/* Page Header with Dark Radial Gradient */}
      <div className="bg-slate-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 z-0" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-3 px-3 py-1 font-semibold rounded-full">
            Nội quy & quy định
          </Badge>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">NỘI QUY BÃI XE</h1>
          </div>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Vui lòng tuân thủ các quy định để đảm bảo an toàn, an ninh và phòng chống cháy nổ cho toàn bộ khuôn viên bãi đỗ.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 z-10">
            <Search size={16} />
          </span>
          <Input
            type="text"
            placeholder="Tìm kiếm quy định..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-11 pr-10 py-6 rounded-2xl border-slate-100 bg-white text-sm text-slate-700 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-600 shadow-sm"
          />
          {searchText && (
            <button 
              onClick={() => setSearchText("")} 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-6 h-6 flex items-center justify-center text-xs z-10"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        {filteredRules.length === 0 ? (
          <EmptyState 
            icon={<Search size={36} className="text-slate-350" />} 
            title="Không tìm thấy quy định" 
            description="Thử sử dụng từ khóa ngắn gọn hơn." 
            className="bg-white border-slate-100 rounded-2xl p-12"
          />
        ) : (
          <div className="space-y-4">
            {filteredRules.map((section) => {
              const isOpen = openSection === section.id || !!searchText;
              return (
                <div 
                  key={section.id} 
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-blue-200/80 shadow-blue-500/5" : "border-slate-100/90"
                  }`}
                >
                  <button
                    onClick={() => setOpenSection(isOpen && !searchText ? null : section.id)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-base font-extrabold transition-colors ${
                        isOpen ? "bg-slate-900 text-white" : "bg-blue-50 text-blue-600"
                      }`}>
                        {section.icon}
                      </div>
                      <div>
                        <span className={`font-extrabold text-sm ${isOpen ? "text-slate-900" : "text-slate-700"}`}>{section.title}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{section.items.length} quy định cụ thể</span>
                      </div>
                    </div>
                    {!searchText && (
                      <ChevronDown size={18} className={`text-slate-450 transition-transform duration-300 ${isOpen ? "rotate-180 text-slate-800" : ""}`} />
                    )}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[1000px] border-t border-slate-50" : "max-h-0"}`}>
                    <div className="px-6 py-5 bg-slate-50/30">
                      <ul className="space-y-4 m-0 p-0 list-none">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100/80 text-blue-700 text-xs font-black flex items-center justify-center mt-0.5">{idx + 1}</span>
                            <span
                              className="text-sm text-slate-650 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: searchText
                                  ? item.replace(new RegExp(`(${searchText})`, "gi"), '<mark class="bg-yellow-200 text-yellow-900 rounded px-0.5">$1</mark>')
                                  : item,
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="text-center pt-6">
          <p className="text-xs text-slate-400">
            Nội quy chính thức được ban hành bởi Ban quản lý tòa nhà SWP Building. <br />
            Mọi thắc mắc xin vui lòng liên hệ hotline bộ phận CSKH <strong className="text-blue-600">1900 1234</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
