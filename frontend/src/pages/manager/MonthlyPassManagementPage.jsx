import React, { useState } from "react";
import { MOCK_MONTHLY_PASSES, MOCK_VEHICLE_TYPES } from "../../constants/mockData";

const STATUS_BADGE = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  EXPIRED: "bg-slate-100 text-slate-500 border border-slate-300",
  LOCKED: "bg-red-100 text-red-700 border border-red-300",
  CANCELLED: "bg-amber-100 text-amber-700 border border-amber-300",
};

const STATUSES = ["ACTIVE", "EXPIRED", "LOCKED", "CANCELLED"];

function Toast({ message, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>{message}</div>;
}

function Modal({ title, onClose, onConfirm, confirmLabel = "Lưu", confirmClass = "bg-blue-600 hover:bg-blue-700", children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h3 className="font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-100">Hủy</button>
          <button onClick={onConfirm} className={`px-5 py-2 rounded-lg text-sm font-bold text-white ${confirmClass}`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { ownerName: "", phone: "", plate: "", vehicleTypeId: "", startDate: "", endDate: "" };

export default function MonthlyPassManagementPage() {
  const [passes, setPasses] = useState(MOCK_MONTHLY_PASSES.map((p) => ({ ...p })));
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [renewDate, setRenewDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg, type = "success") => setToast({ message: msg, type });
  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filtered = passes.filter((p) => {
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchVehicle = filterVehicle === "ALL" || p.vehicleTypeName === filterVehicle;
    const matchSearch = !searchText || p.plate.toLowerCase().includes(searchText.toLowerCase()) || p.ownerName.toLowerCase().includes(searchText.toLowerCase());
    return matchStatus && matchVehicle && matchSearch;
  });

  const validate = (data) => {
    const errs = {};
    if (!data.ownerName?.trim()) errs.ownerName = "Bắt buộc";
    if (!data.plate?.trim()) errs.plate = "Bắt buộc";
    if (!data.vehicleTypeId) errs.vehicleTypeId = "Bắt buộc";
    if (!data.startDate) errs.startDate = "Bắt buộc";
    if (!data.endDate) errs.endDate = "Bắt buộc";
    if (data.startDate && data.endDate && data.endDate < data.startDate) errs.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    return errs;
  };

  const handleCreate = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const vt = MOCK_VEHICLE_TYPES.find((v) => String(v.id) === String(form.vehicleTypeId));
    const newPass = {
      id: Date.now(), ownerName: form.ownerName, phone: form.phone, plate: form.plate.toUpperCase(),
      vehicleTypeId: Number(form.vehicleTypeId), vehicleTypeName: vt?.name || "",
      startDate: form.startDate, endDate: form.endDate, status: "ACTIVE",
    };
    setPasses((prev) => [...prev, newPass]);
    setShowCreate(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
    showToast("Tạo vé tháng thành công!");
  };

  const openRenew = (pass) => { setSelectedPass(pass); setRenewDate(""); setShowRenew(true); };
  const handleRenew = () => {
    if (!renewDate) return;
    if (renewDate <= selectedPass.endDate) { showToast("Ngày gia hạn phải sau ngày kết thúc hiện tại!", "error"); return; }
    setPasses((prev) => prev.map((p) => p.id === selectedPass.id ? { ...p, endDate: renewDate, status: "ACTIVE" } : p));
    setShowRenew(false);
    showToast(`Gia hạn vé ${selectedPass.plate} đến ${renewDate}`);
  };

  const openStatus = (pass) => { setSelectedPass(pass); setNewStatus(pass.status); setShowStatusModal(true); };
  const handleStatus = () => {
    setPasses((prev) => prev.map((p) => p.id === selectedPass.id ? { ...p, status: newStatus } : p));
    setShowStatusModal(false);
    showToast("Cập nhật trạng thái thành công!");
  };

  // Summary counts
  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: passes.filter((p) => p.status === s).length }), {});

  const InputField = ({ label, name, type = "text", placeholder, required }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={type} value={form[name] || ""} onChange={(e) => setField(name, e.target.value)} placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${formErrors[name] ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
      {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Vé Tháng</h2>
          <p className="text-sm text-slate-500 mt-0.5">Đăng ký, gia hạn và quản lý vé tháng theo biển số xe</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowCreate(true); }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition">
          + Tạo Vé Tháng
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <div key={s} onClick={() => setFilterStatus(filterStatus === s ? "ALL" : s)}
            className={`rounded-xl border p-3 text-center cursor-pointer transition-all bg-white ${filterStatus === s ? "ring-2 ring-blue-400" : ""}`}>
            <p className="text-2xl font-black text-slate-800">{counts[s] || 0}</p>
            <p className={`text-xs font-black mt-1 ${STATUS_BADGE[s].split(" ")[1]}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <input type="text" placeholder="🔍 Biển số / Chủ xe..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[180px]" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả loại xe</option>
          {MOCK_VEHICLE_TYPES.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} vé</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400"><p className="text-4xl mb-3">📅</p><p className="font-semibold">Không có vé tháng phù hợp</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Chủ Xe</th>
                <th className="px-5 py-3 text-left">Biển Số</th>
                <th className="px-5 py-3 text-left">Loại Xe</th>
                <th className="px-5 py-3 text-center">Từ Ngày</th>
                <th className="px-5 py-3 text-center">Đến Ngày</th>
                <th className="px-5 py-3 text-center">Trạng Thái</th>
                <th className="px-5 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((pass) => {
                const isExpiring = pass.status === "ACTIVE" && pass.endDate <= new Date(Date.now() + 7*24*3600*1000).toISOString().split("T")[0];
                return (
                  <tr key={pass.id} className={`hover:bg-slate-50 transition-colors ${isExpiring ? "bg-amber-50" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-bold text-slate-800">{pass.ownerName}</p>
                      <p className="text-xs text-slate-400">{pass.phone}</p>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">{pass.plate}</td>
                    <td className="px-5 py-3 text-slate-600">{pass.vehicleTypeName}</td>
                    <td className="px-5 py-3 text-center text-slate-500">{pass.startDate}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-semibold ${isExpiring ? "text-amber-600" : "text-slate-500"}`}>{pass.endDate}</span>
                      {isExpiring && <span className="block text-xs text-amber-500 font-bold">Sắp hết hạn</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${STATUS_BADGE[pass.status]}`}>{pass.status}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openRenew(pass)} className="text-xs font-bold text-emerald-600 hover:underline">Gia Hạn</button>
                        <button onClick={() => openStatus(pass)} className="text-xs font-bold text-amber-600 hover:underline">Trạng Thái</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Tạo Vé Tháng Mới" onClose={() => setShowCreate(false)} onConfirm={handleCreate} confirmLabel="Tạo Vé Tháng">
          <InputField label="Họ Tên Chủ Xe" name="ownerName" placeholder="Nguyễn Văn A" required />
          <InputField label="Điện Thoại" name="phone" placeholder="09xxxxxxxx" />
          <InputField label="Biển Số Xe" name="plate" placeholder="51A-12345" required />
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Loại Xe <span className="text-red-500">*</span></label>
            <select value={form.vehicleTypeId || ""} onChange={(e) => setField("vehicleTypeId", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${formErrors.vehicleTypeId ? "border-red-400" : "border-slate-300"}`}>
              <option value="">-- Chọn loại xe --</option>
              {MOCK_VEHICLE_TYPES.map((v) => <option key={v.id} value={String(v.id)}>{v.name}</option>)}
            </select>
            {formErrors.vehicleTypeId && <p className="text-red-500 text-xs mt-1">{formErrors.vehicleTypeId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Từ Ngày" name="startDate" type="date" required />
            <InputField label="Đến Ngày" name="endDate" type="date" required />
          </div>
        </Modal>
      )}

      {/* Renew Modal */}
      {showRenew && selectedPass && (
        <Modal title={`Gia Hạn: ${selectedPass.plate}`} onClose={() => setShowRenew(false)} onConfirm={handleRenew} confirmLabel="Gia Hạn" confirmClass="bg-emerald-600 hover:bg-emerald-700">
          <p className="text-sm text-slate-600">Ngày hết hạn hiện tại: <strong className="text-red-600">{selectedPass.endDate}</strong></p>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ngày Hết Hạn Mới <span className="text-red-500">*</span></label>
            <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} min={selectedPass.endDate}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedPass && (
        <Modal title={`Đổi Trạng Thái: ${selectedPass.plate}`} onClose={() => setShowStatusModal(false)} onConfirm={handleStatus} confirmClass="bg-amber-600 hover:bg-amber-700" confirmLabel="Cập Nhật">
          {STATUSES.map((s) => (
            <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200">
              <input type="radio" name="passStatus" value={s} checked={newStatus === s} onChange={() => setNewStatus(s)} className="accent-amber-600" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${STATUS_BADGE[s]}`}>{s}</span>
            </label>
          ))}
        </Modal>
      )}
    </div>
  );
}
