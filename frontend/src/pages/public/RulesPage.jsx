import React, { useState } from "react";
import { STATIC_RULES } from "@/mocks/mockData";
import { Badge } from "@/components/ui/badge";

export default function RulesPage() {
  const [openSection, setOpenSection] = useState("entry");
  const [searchText, setSearchText] = useState("");

  const filteredRules = STATIC_RULES.map((section) => ({
    ...section,
    items: searchText.trim()
      ? section.items.filter((item) =>
          item.toLowerCase().includes(searchText.toLowerCase())
        )
      : section.items,
  })).filter((section) => !searchText.trim() || section.items.length > 0);

  return (
    <div className="flex-grow bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4c0519] via-slate-950 to-[#020617]">
      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-2xl font-black text-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                !
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Nội Quy <span className="text-rose-400 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">Bãi Xe</span>
              </h1>
            </div>
            <p className="text-rose-500/70 text-sm max-w-2xl font-medium pl-16">
              Vui lòng tuân thủ các quy định dưới đây để đảm bảo an toàn và trật tự cho bãi đỗ xe.
            </p>
          </div>
          
          {/* Right: Illustration */}
          <div className="relative mt-12 lg:mt-0 w-full flex justify-center">
             {/* Background neon glow */}
            <div className="absolute inset-0 bg-rose-600/10 blur-[100px] rounded-full pointer-events-none" />
            <img 
              src="/images/isometric-parking.png" 
              alt="Smart Parking Concept" 
              className="relative w-full max-w-[320px] md:max-w-[400px] lg:max-w-[500px] object-cover opacity-90 mix-blend-screen pointer-events-none transform lg:scale-110 lg:translate-x-4"
              style={{
                maskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 70%)"
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
        {/* Search */}
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500/50 text-sm select-none transition-colors group-focus-within:text-rose-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm quy định..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-white/10 bg-white/[0.02] text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50 focus:bg-[#1a060e] transition-all shadow-inner"
          />
          {searchText && (
            <button
              onClick={() => setSearchText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Accordion List */}
        {filteredRules.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-16 text-center text-slate-400">
            <span className="text-4xl block mb-4 opacity-50">🔍</span>
            <p className="font-bold text-lg text-white">Không tìm thấy quy định</p>
            <p className="text-sm mt-1">Thử sử dụng một từ khóa khác ngắn gọn hơn.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRules.map((section) => {
              const isOpen = openSection === section.id || !!searchText;
              return (
                <div
                  key={section.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-[#1a060e]/80 border-rose-500/30 shadow-[0_0_20px_rgba(225,29,72,0.1)] backdrop-blur-md' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
                >
                  <button
                    onClick={() => setOpenSection(isOpen && !searchText ? null : section.id)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${isOpen ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(225,29,72,0.3)]' : 'bg-white/5 text-slate-400'}`}>
                        {section.icon}
                      </div>
                      <div>
                        <span className={`block font-bold text-sm tracking-wide mb-0.5 transition-colors ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                          {section.title}
                        </span>
                        <Badge variant="outline" className={`text-[10px] uppercase font-black px-2 py-0.5 border-transparent ${isOpen ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-500'}`}>
                          {section.items.length} quy định
                        </Badge>
                      </div>
                    </div>
                    {!searchText && (
                      <span className={`text-slate-500 text-lg transition-transform duration-300 ${isOpen ? "rotate-180 text-rose-400" : ""}`}>
                        ▾
                      </span>
                    )}
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out origin-top overflow-hidden`}
                    style={{ maxHeight: isOpen ? '1000px' : '0px', opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="border-t border-rose-500/10 px-6 py-5 bg-[#120308]/50">
                      <ul className="space-y-4">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex gap-4 group">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black shrink-0 shadow-[0_0_8px_rgba(225,29,72,0.1)] group-hover:shadow-[0_0_12px_rgba(225,29,72,0.3)] transition-shadow">
                              {idx + 1}
                            </span>
                            <span
                              className="text-sm text-slate-300 leading-relaxed mt-0.5"
                              dangerouslySetInnerHTML={{
                                __html: searchText
                                  ? item.replace(
                                      new RegExp(`(${searchText})`, "gi"),
                                      '<mark class="bg-rose-500/30 text-rose-200 rounded px-1 shadow-[0_0_5px_rgba(225,29,72,0.5)]">$1</mark>'
                                    )
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
        <div className="text-center pt-8">
          <p className="text-xs text-slate-500">
            Nội quy có hiệu lực từ 01/01/2026. <br className="md:hidden" />
            Liên hệ hotline <strong className="text-rose-400 font-bold drop-shadow-[0_0_5px_rgba(225,29,72,0.5)]">1800 1234</strong> để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
}
