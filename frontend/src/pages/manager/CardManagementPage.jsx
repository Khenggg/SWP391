import React, { useState, useEffect } from "react";
import { MOCK_CARDS } from "../../constants/mockData";

const CARD_STATUS_BADGE = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  IN_USE: "bg-blue-100 text-blue-700 border border-blue-300",
  LOST: "bg-red-100 text-red-700 border border-red-300",
  DAMAGED: "bg-amber-100 text-amber-700 border border-amber-300",
  INACTIVE: "bg-slate-100 text-slate-500 border border-slate-300",
};

const STATUSES = ["AVAILABLE", "IN_USE", "LOST", "DAMAGED", "INACTIVE"];

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {message}
    </div>
  );
}

function Modal({ title, onClose, onConfirm, confirmLabel = "Lưu", confirmClass = "bg-blue-600 hover:bg-blue-700", children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-100">Hủy</button>
          <button onClick={onConfirm} className={`px-5 py-2 rounded-lg text-sm font-bold text-white ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("vi-VN");
}

export default function CardManagementPage() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchCode, setSearchCode] = useState("");
  const [toast, setToast] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [form, setForm] = useState({ code: "", note: "" });
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setCards(MOCK_CARDS.map((c) => ({ ...c })));
      setIsLoading(false);
    }, 500);
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const filtered = cards.filter((c) => {
    const matchStatus = filterStatus === "ALL" || c.status === filterStatus;
    const matchSearch = !searchCode || c.code.toLowerCase().includes(searchCode.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCreate = () => {
    if (!form.code.trim()) { setFormErrors({ code: "Mã thẻ bắt buộc" }); return; }
    if (cards.find((c) => c.code === form.code.trim())) { setFormErrors({ code: "Mã thẻ đã tồn tại" }); return; }
    const newCard = { id: Date.now(), code: form.code.trim(), status: "AVAILABLE", note: form.note, updatedAt: new Date().toISOString(), activeSession: null };
    setCards((prev) => [...prev, newCard]);
    setShowCreate(false);
    setForm({ code: "", note: "" });
    setFormErrors({});
    showToast("Tạo thẻ thành công!");
  };

  const openStatusModal = (card) => {
    if (card.status === "IN_USE") {
      showToast("Không thể đổi trạng thái thẻ đang được sử dụng!", "error");
      return;
    }
    setSelectedCard(card);
    setNewStatus(card.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = () => {
    if (!window.confirm(`Xác nhận đổi trạng thái thẻ ${selectedCard.code} sang ${newStatus}?`)) return;
    setCards((prev) => prev.map((c) => c.id === selectedCard.id ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c));
    setShowStatusModal(false);
    showToast(`Đã cập nhật trạng thái thẻ ${selectedCard.code}`);
  };

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: cards.filter((c) => c.status === s).length }), {});

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Thẻ Xe</h2>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý danh sách thẻ NFC và trạng thái thẻ</p>
        </div>
        <button onClick={() => { setForm({ code: "", note: "" }); setFormErrors({}); setShowCreate(true); }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition">
          + Tạo thẻ mới
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className={`rounded-xl border p-3 text-center cursor-pointer transition-all ${filterStatus === s ? "ring-2 ring-blue-400" : ""} ${CARD_STATUS_BADGE[s].replace("text-", "border-").split(" ")[2]} bg-white`}
            onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}>
            <p className="text-2xl font-black text-slate-800">{counts[s] || 0}</p>
            <p className={`text-xs font-black ${CARD_STATUS_BADGE[s].split(" ")[1]}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <input type="text" placeholder="🔍 Tìm mã thẻ..." value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px]" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} thẻ</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400"><p className="text-4xl mb-3">💳</p><p className="font-semibold">Không có thẻ phù hợp</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Mã Thẻ</th>
                <th className="px-5 py-3 text-center">Trạng Thái</th>
                <th className="px-5 py-3 text-left">Phiên Hiện Tại</th>
                <th className="px-5 py-3 text-left">Ghi Chú</th>
                <th className="px-5 py-3 text-center">Cập Nhật</th>
                <th className="px-5 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((card) => (
                <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-800">{card.code}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${CARD_STATUS_BADGE[card.status]}`}>{card.status}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {card.activeSession ? (
                      <span className="text-xs"><span className="font-mono font-bold text-blue-700">{card.activeSession.plate}</span> • {card.activeSession.sessionCode}</span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{card.note || "—"}</td>
                  <td className="px-5 py-3 text-center text-slate-400 text-xs">{formatDate(card.updatedAt)}</td>
                  <td className="px-5 py-3 text-center">
                    <button onClick={() => openStatusModal(card)}
                      className={`text-xs font-bold hover:underline ${card.status === "IN_USE" ? "text-slate-300 cursor-not-allowed" : "text-amber-600"}`}>
                      Đổi Trạng Thái
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Tạo Thẻ Xe Mới" onClose={() => setShowCreate(false)} onConfirm={handleCreate} confirmLabel="Tạo Thẻ">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mã Thẻ <span className="text-red-500">*</span></label>
            <input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} placeholder="VD: CARD-0009"
              className={`w-full rounded-lg border px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 ${formErrors.code ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
            {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ghi Chú</label>
            <input value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder="Tùy chọn..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
            QR Token sẽ được backend tự động sinh khi tạo thẻ. Thẻ mới mặc định trạng thái AVAILABLE.
          </p>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedCard && (
        <Modal title={`Đổi Trạng Thái: ${selectedCard.code}`} onClose={() => setShowStatusModal(false)} onConfirm={handleStatusChange} confirmClass="bg-amber-600 hover:bg-amber-700" confirmLabel="Cập Nhật">
          <p className="text-sm text-slate-600">Trạng thái hiện tại: <span className={`px-2 py-0.5 rounded-full text-xs font-black ${CARD_STATUS_BADGE[selectedCard.status]}`}>{selectedCard.status}</span></p>
          <div className="space-y-2 mt-2">
            {STATUSES.filter((s) => s !== "IN_USE").map((s) => (
              <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200">
                <input type="radio" name="newStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-amber-600" />
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${CARD_STATUS_BADGE[s]}`}>{s}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Thẻ đang IN_USE không thể đổi trạng thái. Thao tác này sẽ được ghi vào audit log.
          </p>
        </Modal>
      )}
    </div>
  );
}
