import React, { useState, useEffect } from "react";
import { parkingService } from "@/services/parkingService";
import { List, Search, AlertTriangle, ChevronDown } from "lucide-react";

const iconMap = {
  entry:        "→",
  exit:         "←",
  lost_card:    "⚠",
  mismatch:     "✗",
  monthly_pass: "📋",
  payment:      "💳",
};

export default function RulesPage() {
  const [rules, setRules]           = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);
  const [openSection, setOpenSection] = useState("entry");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await parkingService.getRules();
        const mapped = data.map(r => ({
          id:    r.group,
          title: r.title,
          icon:  iconMap[r.group] || "ℹ",
          items: r.content || [],
        }));
        setRules(mapped);
        if (mapped.length > 0) setOpenSection(mapped[0].id);
      } catch {
        setError("Không tải được nội quy bãi xe. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredRules = rules
    .map(s => ({
      ...s,
      items: searchText.trim()
        ? s.items.filter(item => item.toLowerCase().includes(searchText.toLowerCase()))
        : s.items,
    }))
    .filter(s => !searchText.trim() || s.items.length > 0);

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <List size={20} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900">Nội Quy Bãi Xe</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Vui lòng tuân thủ các quy định dưới đây để đảm bảo an toàn và trật tự cho bãi đỗ xe.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm quy định..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center text-xs">✕</button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-semibold text-sm">{error}</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Search size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700">Không tìm thấy quy định</p>
            <p className="text-sm text-gray-400 mt-1">Thử sử dụng từ khóa ngắn gọn hơn.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRules.map((section) => {
              const isOpen = openSection === section.id || !!searchText;
              return (
                <div key={section.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isOpen ? "border-blue-200" : "border-gray-100"}`}>
                  <button
                    onClick={() => setOpenSection(isOpen && !searchText ? null : section.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black transition-colors ${isOpen ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                        {section.icon}
                      </div>
                      <div>
                        <span className={`font-bold text-sm ${isOpen ? "text-blue-700" : "text-gray-800"}`}>{section.title}</span>
                        <span className="block text-xs text-gray-400">{section.items.length} quy định</span>
                      </div>
                    </div>
                    {!searchText && (
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? "1000px" : "0px" }}>
                    <div className="border-t border-gray-100 px-5 py-4 bg-blue-50/30">
                      <ul className="space-y-3">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">{idx + 1}</span>
                            <span
                              className="text-sm text-gray-700 leading-relaxed mt-0.5"
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
        <div className="text-center pt-4 pb-4">
          <p className="text-xs text-gray-400">
            Nội quy có hiệu lực từ 01/01/2026. Liên hệ hotline <strong className="text-blue-600">1900 1234</strong> để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}
