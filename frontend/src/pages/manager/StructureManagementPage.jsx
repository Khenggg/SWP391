import React, { useState, useEffect } from "react";
import { parkingService } from "../../services/parkingService";

const AREA_STATUS_BADGE = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  LOCKED: "bg-red-100 text-red-700 border border-red-300",
  MAINTENANCE: "bg-amber-100 text-amber-700 border border-amber-300",
};

const SLOT_STATUS_BADGE = {
  AVAILABLE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  OCCUPIED: "bg-blue-100 text-blue-700 border border-blue-300",
  MAINTENANCE: "bg-amber-100 text-amber-700 border border-amber-300",
  LOCKED: "bg-red-100 text-red-700 border border-red-300",
};

const GATE_TYPE_BADGE = {
  ENTRY: "bg-indigo-100 text-indigo-700 border border-indigo-300",
  EXIT: "bg-rose-100 text-rose-700 border border-rose-300",
};

function Modal({ title, onClose, onConfirm, confirmLabel = "Lưu", children }) {
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
          <button onClick={onConfirm} className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const TABS = ["Tầng (Floors)", "Khu Vực (Areas)", "Slot", "Cổng (Gates)"];

export default function StructureManagementPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [floors, setFloors] = useState([]);
  const [areas, setAreas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [gates, setGates] = useState([]);

  useEffect(() => {
    setFloors(parkingService.getFloors());
    setAreas(parkingService.getAreas());
    setSlots(parkingService.getSlots());
    setGates(parkingService.getGates());
  }, []);

  const [filterFloor, setFilterFloor] = useState("ALL");
  const [filterSlotStatus, setFilterSlotStatus] = useState("ALL");

  const [showFloorModal, setShowFloorModal] = useState(false);
  const [showSlotStatusModal, setShowSlotStatusModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState({});

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  // Floor actions
  const openCreateFloor = () => { setEditingFloor(null); setForm({ code: "", name: "", status: "ACTIVE" }); setShowFloorModal(true); };
  const openEditFloor = (floor) => { setEditingFloor(floor); setForm({ code: floor.code, name: floor.name, status: floor.status }); setShowFloorModal(true); };
  const handleFloorSave = () => {
    if (!form.code || !form.name) return;
    if (editingFloor) {
      setFloors((prev) => {
        const updated = prev.map((f) => f.id === editingFloor.id ? { ...f, ...form } : f);
        parkingService.saveFloors(updated);
        return updated;
      });
    } else {
      setFloors((prev) => {
        const updated = [...prev, { id: Date.now(), ...form, totalAreas: 0, totalSlots: 0 }];
        parkingService.saveFloors(updated);
        return updated;
      });
    }
    setShowFloorModal(false);
  };

  // Slot status
  const openSlotStatus = (slot) => { setEditingSlot(slot); setForm({ status: slot.status }); setShowSlotStatusModal(true); };
  const handleSlotStatus = () => {
    setSlots((prev) => {
      const updated = prev.map((s) => s.id === editingSlot.id ? { ...s, status: form.status } : s);
      parkingService.saveSlots(updated);
      return updated;
    });
    setShowSlotStatusModal(false);
  };

  // Filtered data
  const filteredAreas = filterFloor === "ALL" ? areas : areas.filter((a) => a.floorCode === filterFloor);
  const filteredSlots = slots.filter((s) => {
    const matchFloor = filterFloor === "ALL" || s.floorCode === filterFloor;
    const matchStatus = filterSlotStatus === "ALL" || s.status === filterSlotStatus;
    return matchFloor && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-800">Quản Lý Cấu Trúc Bãi Xe</h2>
        <p className="text-sm text-slate-500 mt-0.5">Quản lý tầng, khu vực, slot đỗ và cổng ra vào</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === idx ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Floors Tab */}
      {activeTab === 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={openCreateFloor} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow">+ Thêm Tầng</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Mã Tầng</th><th className="px-5 py-3 text-left">Tên</th>
                <th className="px-5 py-3 text-center">Số Khu</th><th className="px-5 py-3 text-center">Số Slot</th>
                <th className="px-5 py-3 text-center">Trạng Thái</th><th className="px-5 py-3 text-center">Thao Tác</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {floors.map((floor) => (
                  <tr key={floor.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">{floor.code}</td>
                    <td className="px-5 py-3 text-slate-700">{floor.name}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{floor.totalAreas}</td>
                    <td className="px-5 py-3 text-center text-slate-600">{floor.totalSlots}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${AREA_STATUS_BADGE[floor.status]}`}>{floor.status}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => openEditFloor(floor)} className="text-xs font-bold text-blue-600 hover:underline">Sửa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Areas Tab */}
      {activeTab === 1 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="ALL">Tất cả tầng</option>
              {floors.map((f) => <option key={f.id} value={f.code}>{f.code} - {f.name}</option>)}
            </select>
            <span className="text-xs text-slate-400 ml-auto">{filteredAreas.length} khu vực</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Mã Khu</th><th className="px-5 py-3 text-left">Tên</th>
                <th className="px-5 py-3 text-left">Tầng</th><th className="px-5 py-3 text-left">Loại Xe</th>
                <th className="px-5 py-3 text-center">Slot Trống/Tổng</th><th className="px-5 py-3 text-center">Trạng Thái</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">{area.code}</td>
                    <td className="px-5 py-3 text-slate-700">{area.name}</td>
                    <td className="px-5 py-3 text-slate-500">{area.floorCode}</td>
                    <td className="px-5 py-3 text-slate-600">{area.vehicleTypeName}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="font-bold text-emerald-700">{area.availableSlots}</span>
                      <span className="text-slate-400">/{area.totalSlots}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${AREA_STATUS_BADGE[area.status]}`}>{area.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slots Tab */}
      {activeTab === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="ALL">Tất cả tầng</option>
              {floors.map((f) => <option key={f.id} value={f.code}>{f.code}</option>)}
            </select>
            <select value={filterSlotStatus} onChange={(e) => setFilterSlotStatus(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="ALL">Tất cả trạng thái</option>
              {["AVAILABLE", "OCCUPIED", "MAINTENANCE", "LOCKED"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="text-xs text-slate-400 ml-auto">{filteredSlots.length} slot</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Mã Slot</th><th className="px-5 py-3 text-left">Tầng</th>
                <th className="px-5 py-3 text-left">Khu Vực</th><th className="px-5 py-3 text-left">Loại Xe</th>
                <th className="px-5 py-3 text-center">Phiên Hiện Tại</th>
                <th className="px-5 py-3 text-center">Trạng Thái</th><th className="px-5 py-3 text-center">Thao Tác</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono font-bold text-slate-800">{slot.code}</td>
                    <td className="px-5 py-3 text-slate-500">{slot.floorCode}</td>
                    <td className="px-5 py-3 text-slate-600">{slot.areaCode}</td>
                    <td className="px-5 py-3 text-slate-600">{slot.vehicleTypeName}</td>
                    <td className="px-5 py-3 text-center text-xs text-blue-700 font-mono">{slot.sessionCode || "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${SLOT_STATUS_BADGE[slot.status]}`}>{slot.status}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => openSlotStatus(slot)} className="text-xs font-bold text-amber-600 hover:underline">Đổi Trạng Thái</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gates Tab */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 text-left">Mã Cổng</th><th className="px-5 py-3 text-left">Tên</th>
              <th className="px-5 py-3 text-center">Loại</th><th className="px-5 py-3 text-center">Tầng</th>
              <th className="px-5 py-3 text-center">Trạng Thái</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {gates.map((gate) => (
                <tr key={gate.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono font-bold text-slate-800">{gate.code}</td>
                  <td className="px-5 py-3 text-slate-700">{gate.name}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${GATE_TYPE_BADGE[gate.type]}`}>{gate.type}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-slate-500">{gate.floorCode}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${gate.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700 border border-emerald-300" : "bg-slate-100 text-slate-500 border border-slate-300"}`}>{gate.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floor Modal */}
      {showFloorModal && (
        <Modal title={editingFloor ? `Sửa Tầng: ${editingFloor.code}` : "Thêm Tầng Mới"} onClose={() => setShowFloorModal(false)} onConfirm={handleFloorSave}>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Mã Tầng *</label>
            <input value={form.code || ""} onChange={(e) => setField("code", e.target.value)} placeholder="VD: F4"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tên Tầng *</label>
            <input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} placeholder="VD: Tầng 4"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </Modal>
      )}

      {/* Slot Status Modal */}
      {showSlotStatusModal && editingSlot && (
        <Modal title={`Đổi Trạng Thái: ${editingSlot.code}`} onClose={() => setShowSlotStatusModal(false)} onConfirm={handleSlotStatus} confirmLabel="Cập Nhật">
          {["AVAILABLE", "MAINTENANCE", "LOCKED"].map((s) => (
            <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 border border-transparent hover:border-slate-200">
              <input type="radio" name="slotStatus" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-blue-600" />
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${SLOT_STATUS_BADGE[s]}`}>{s}</span>
            </label>
          ))}
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">⚠️ Slot đang OCCUPIED chỉ có thể đổi sau khi phiên gửi hoàn tất.</p>
        </Modal>
      )}
    </div>
  );
}
