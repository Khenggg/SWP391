import React, { useState } from "react";
import { pricingService } from "../../services/pricingService";
import { parkingService } from "../../services/parkingService";

function formatVND(amount) { return Number(amount).toLocaleString("vi-VN") + "đ"; }

const STATUS_BADGE = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  INACTIVE: "bg-slate-100 text-slate-500 border border-slate-300",
};

function Toast({ message, type, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>{message}</div>;
}

const EMPTY_FORM = { vehicleTypeId: "", dayPrice: "", nightPrice: "", monthlyPrice: "", lostCardFee: "", effectiveFrom: "", status: "ACTIVE" };

export default function PricingManagementPage() {
  const [rules, setRules] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [filterVehicle, setFilterVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  React.useEffect(() => {
    const fetchPricing = async () => {
      try {
        const rulesData = await pricingService.getPricingRules();
        setRules(rulesData);
        setVehicleTypes(parkingService.getVehicleTypes());
      } catch (e) {
        console.error("Lỗi lấy cấu hình giá:", e);
      }
    };
    fetchPricing();
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });
  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  const filtered = rules.filter((r) => {
    const matchVehicle = filterVehicle === "ALL" || r.vehicleTypeName === filterVehicle;
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchVehicle && matchStatus;
  });

  const validate = (data) => {
    const errs = {};
    if (!data.vehicleTypeId) errs.vehicleTypeId = "Bắt buộc";
    if (!data.effectiveFrom) errs.effectiveFrom = "Bắt buộc";
    const fields = ["dayPrice", "nightPrice", "monthlyPrice", "lostCardFee"];
    fields.forEach((f) => {
      if (data[f] === "" || data[f] === undefined) { errs[f] = "Bắt buộc"; }
      else if (Number(data[f]) < 0) { errs[f] = "Phải >= 0"; }
    });
    return errs;
  };

  const openCreate = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      vehicleTypeId: String(rule.vehicleTypeId),
      dayPrice: String(rule.dayPrice),
      nightPrice: String(rule.nightPrice),
      monthlyPrice: String(rule.monthlyPrice),
      lostCardFee: String(rule.lostCardFee),
      effectiveFrom: rule.effectiveFrom,
      status: rule.status,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const vt = vehicleTypes.find((v) => String(v.id) === String(form.vehicleTypeId));
    const payload = {
      vehicleTypeId: Number(form.vehicleTypeId),
      vehicleTypeName: vt?.name || "",
      dayPrice: Number(form.dayPrice),
      nightPrice: Number(form.nightPrice),
      monthlyPrice: Number(form.monthlyPrice),
      lostCardFee: Number(form.lostCardFee),
      effectiveFrom: form.effectiveFrom,
      status: form.status,
    };
    try {
      if (editingRule) {
        await pricingService.updatePricingRule(editingRule.id, payload);
        showToast("Cập nhật bảng giá thành công!");
      } else {
        await pricingService.addPricingRule(payload);
        showToast("Tạo bảng giá thành công!");
      }
      const updatedRules = await pricingService.getPricingRules();
      setRules(updatedRules);
      setShowModal(false);
    } catch (e) {
      showToast(e.message || "Lưu bảng giá thất bại!", "error");
    }
  };

  const MoneyField = ({ label, name }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <input type="number" min="0" value={form[name] || ""} onChange={(e) => setField(name, e.target.value)}
          className={`w-full rounded-lg border px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${formErrors[name] ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">đ</span>
      </div>
      {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
      {form[name] && !formErrors[name] && <p className="text-slate-400 text-xs mt-1">{formatVND(Number(form[name]))}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Bảng Giá</h2>
          <p className="text-sm text-slate-500 mt-0.5">Cấu hình biểu phí gửi xe theo loại xe</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition">+ Tạo Bảng Giá</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <select value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả loại xe</option>
          {vehicleTypes.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} bảng giá</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Loại Xe</th>
              <th className="px-5 py-3 text-right">Giá Ban Ngày</th>
              <th className="px-5 py-3 text-right">Giá Ban Đêm</th>
              <th className="px-5 py-3 text-right">Vé Tháng</th>
              <th className="px-5 py-3 text-right">Phí Mất Thẻ</th>
              <th className="px-5 py-3 text-center">Hiệu Lực Từ</th>
              <th className="px-5 py-3 text-center">Trạng Thái</th>
              <th className="px-5 py-3 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-semibold">Chưa có bảng giá</td></tr>
            ) : filtered.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-bold text-slate-800">{rule.vehicleTypeName}</td>
                <td className="px-5 py-3 text-right font-semibold text-slate-700">{formatVND(rule.dayPrice)}</td>
                <td className="px-5 py-3 text-right font-semibold text-slate-700">{formatVND(rule.nightPrice)}</td>
                <td className="px-5 py-3 text-right font-bold text-emerald-700">{formatVND(rule.monthlyPrice)}</td>
                <td className="px-5 py-3 text-right font-semibold text-red-600">{formatVND(rule.lostCardFee)}</td>
                <td className="px-5 py-3 text-center text-slate-500">{rule.effectiveFrom}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black ${STATUS_BADGE[rule.status]}`}>{rule.status}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  <button onClick={() => openEdit(rule)} className="text-xs font-bold text-blue-600 hover:underline">Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 font-semibold">
        ⚠️ Phiên gửi xe đang hoạt động dùng bảng giá tại thời điểm xe vào (pricing snapshot). Thay đổi bảng giá không ảnh hưởng đến phiên đang chạy.
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
              <h3 className="font-black text-slate-800">{editingRule ? "Sửa Bảng Giá" : "Tạo Bảng Giá Mới"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 text-xl font-bold">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Loại Xe <span className="text-red-500">*</span></label>
                <select value={form.vehicleTypeId || ""} onChange={(e) => setField("vehicleTypeId", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${formErrors.vehicleTypeId ? "border-red-400" : "border-slate-300"}`}>
                  <option value="">-- Chọn loại xe --</option>
                  {vehicleTypes.map((v) => <option key={v.id} value={String(v.id)}>{v.name}</option>)}
                </select>
                {formErrors.vehicleTypeId && <p className="text-red-500 text-xs mt-1">{formErrors.vehicleTypeId}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MoneyField label="Giá Ban Ngày" name="dayPrice" />
                <MoneyField label="Giá Ban Đêm" name="nightPrice" />
                <MoneyField label="Vé Tháng" name="monthlyPrice" />
                <MoneyField label="Phí Mất Thẻ" name="lostCardFee" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Hiệu Lực Từ <span className="text-red-500">*</span></label>
                <input type="date" value={form.effectiveFrom || ""} onChange={(e) => setField("effectiveFrom", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${formErrors.effectiveFrom ? "border-red-400" : "border-slate-300"}`} />
                {formErrors.effectiveFrom && <p className="text-red-500 text-xs mt-1">{formErrors.effectiveFrom}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Trạng Thái</label>
                <div className="flex gap-4">
                  {["ACTIVE", "INACTIVE"].map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pricingStatus" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-blue-600" />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${STATUS_BADGE[s]}`}>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 sticky bottom-0">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-100">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">{editingRule ? "Cập Nhật" : "Tạo Bảng Giá"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
