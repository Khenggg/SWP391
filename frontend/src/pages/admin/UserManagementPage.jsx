import React, { useState, useEffect } from "react";
import { userService } from "../../services/userService";

const ROLE_BADGE = {
  ADMIN: "bg-red-100 text-red-700 border border-red-300",
  MANAGER: "bg-purple-100 text-purple-700 border border-purple-300",
  STAFF: "bg-blue-100 text-blue-700 border border-blue-300",
  DRIVER: "bg-slate-100 text-slate-600 border border-slate-300",
};

const STATUS_BADGE = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border border-emerald-300",
  LOCKED: "bg-red-100 text-red-700 border border-red-300",
  INACTIVE: "bg-slate-100 text-slate-500 border border-slate-300",
};

const ROLES = ["ADMIN", "MANAGER", "STAFF", "DRIVER"];
const STATUSES = ["ACTIVE", "LOCKED", "INACTIVE"];

const EMPTY_FORM = { username: "", fullName: "", email: "", phone: "", role: "STAFF", password: "" };

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      {message}
    </div>
  );
}

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [toast, setToast] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const showToast = (message, type = "success") => setToast({ message, type });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      showToast(err.message || "Không thể tải danh sách người dùng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    const matchStatus = filterStatus === "ALL" || u.status === filterStatus;
    const matchSearch = !searchText || u.username.includes(searchText) || u.fullName.toLowerCase().includes(searchText.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  // Validate
  const validate = (data, isCreate) => {
    const errs = {};
    if (!data.fullName?.trim()) errs.fullName = "Bắt buộc";
    if (isCreate && !data.username?.trim()) errs.username = "Bắt buộc";
    if (isCreate && !data.password?.trim()) errs.password = "Bắt buộc";
    if (!data.role) errs.role = "Bắt buộc";
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errs.email = "Email không hợp lệ";
    return errs;
  };

  // Create
  const handleCreate = async () => {
    const errs = validate(form, true);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    try {
      const newUser = await userService.addUser(form);
      setUsers((prev) => [...prev, newUser]);
      setShowCreateModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      showToast("Tạo người dùng thành công!");
    } catch (err) {
      showToast(err.message || "Tạo người dùng thất bại", "error");
    }
  };

  // Edit
  const openEdit = (user) => { setSelectedUser(user); setForm({ fullName: user.fullName, email: user.email, phone: user.phone }); setFormErrors({}); setShowEditModal(true); };
  const handleEdit = async () => {
    const errs = validate(form, false);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    try {
      const updated = await userService.updateUser(selectedUser.id, form);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      setShowEditModal(false);
      showToast("Cập nhật thông tin thành công!");
    } catch (err) {
      showToast(err.message || "Cập nhật thất bại", "error");
    }
  };

  // Change role
  const openRole = (user) => { setSelectedUser(user); setForm({ role: user.role }); setFormErrors({}); setShowRoleModal(true); };
  const handleRole = async () => {
    try {
      const updated = await userService.updateUserRole(selectedUser.id, form.role);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      setShowRoleModal(false);
      showToast(`Đã đổi vai trò thành ${form.role}`);
    } catch (err) {
      showToast(err.message || "Đổi vai trò thất bại", "error");
    }
  };

  // Change status
  const openStatus = (user) => { setSelectedUser(user); setForm({ status: user.status }); setShowStatusModal(true); };
  const handleStatus = async () => {
    try {
      const updated = await userService.updateUserStatus(selectedUser.id, form.status);
      setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? updated : u));
      setShowStatusModal(false);
      showToast(`Đã cập nhật trạng thái thành ${form.status}`);
    } catch (err) {
      showToast(err.message || "Cập nhật trạng thái thất bại", "error");
    }
  };

  const Field = ({ label, name, type = "text", placeholder, required, value, onChange, error }) => (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(name, e.target.value)} placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 ${error ? "border-red-400 bg-red-50" : "border-slate-300"}`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const Modal = ({ title, onClose, onConfirm, confirmLabel = "Lưu", confirmClass = "bg-blue-600 hover:bg-blue-700", children }) => (
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

  const setField = (name, value) => setForm((p) => ({ ...p, [name]: value }));

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Quản Lý Người Dùng</h2>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý tài khoản nội bộ: Admin, Manager, Staff</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowCreateModal(true); }}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition">
          + Tạo người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl border border-slate-200 px-5 py-3 shadow-sm">
        <input type="text" placeholder="🔍 Tìm username, họ tên..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-[200px]" />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả vai trò</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="ALL">Tất cả trạng thái</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} người dùng</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400"><p className="text-4xl mb-3">👤</p><p className="font-semibold">Không có người dùng phù hợp</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left">Username</th>
                <th className="px-5 py-3 text-left">Họ & Tên</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Điện Thoại</th>
                <th className="px-5 py-3 text-center">Vai Trò</th>
                <th className="px-5 py-3 text-center">Trạng Thái</th>
                <th className="px-5 py-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono font-bold text-slate-800">{user.username}</td>
                  <td className="px-5 py-3 font-semibold text-slate-700">{user.fullName}</td>
                  <td className="px-5 py-3 text-slate-500">{user.email || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{user.phone || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${ROLE_BADGE[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${STATUS_BADGE[user.status]}`}>{user.status}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(user)} className="text-xs font-bold text-blue-600 hover:underline">Sửa</button>
                      <button onClick={() => openRole(user)} className="text-xs font-bold text-purple-600 hover:underline">Vai Trò</button>
                      <button onClick={() => openStatus(user)} className="text-xs font-bold text-amber-600 hover:underline">Trạng Thái</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal title="Tạo Người Dùng Mới" onClose={() => setShowCreateModal(false)} onConfirm={handleCreate} confirmLabel="Tạo Tài Khoản" confirmClass="bg-blue-600 hover:bg-blue-700">
          <Field label="Username" name="username" placeholder="vd: staff03" required value={form.username || ""} onChange={setField} error={formErrors.username} />
          <Field label="Họ & Tên" name="fullName" placeholder="Nguyễn Văn A" required value={form.fullName || ""} onChange={setField} error={formErrors.fullName} />
          <Field label="Email" name="email" type="email" placeholder="abc@parking.vn" value={form.email || ""} onChange={setField} error={formErrors.email} />
          <Field label="Điện Thoại" name="phone" placeholder="09xxxxxxxx" value={form.phone || ""} onChange={setField} />
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Vai Trò <span className="text-red-500">*</span></label>
            <select value={form.role || "STAFF"} onChange={(e) => setField("role", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <Field label="Mật Khẩu" name="password" type="password" placeholder="••••••••" required value={form.password || ""} onChange={setField} error={formErrors.password} />
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <Modal title={`Sửa Thông Tin: ${selectedUser.username}`} onClose={() => setShowEditModal(false)} onConfirm={handleEdit}>
          <Field label="Họ & Tên" name="fullName" required value={form.fullName || ""} onChange={setField} error={formErrors.fullName} />
          <Field label="Email" name="email" type="email" value={form.email || ""} onChange={setField} error={formErrors.email} />
          <Field label="Điện Thoại" name="phone" value={form.phone || ""} onChange={setField} />
        </Modal>
      )}

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <Modal title={`Đổi Vai Trò: ${selectedUser.username}`} onClose={() => setShowRoleModal(false)} onConfirm={handleRole} confirmClass="bg-purple-600 hover:bg-purple-700">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Vai Trò Mới</label>
            {ROLES.map((r) => (
              <label key={r} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 mb-1">
                <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setField("role", r)} className="accent-purple-600"/>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${ROLE_BADGE[r]}`}>{r}</span>
              </label>
            ))}
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedUser && (
        <Modal title={`Đổi Trạng Thái: ${selectedUser.username}`} onClose={() => setShowStatusModal(false)} onConfirm={handleStatus} confirmClass="bg-amber-600 hover:bg-amber-700" confirmLabel="Cập nhật">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Trạng Thái Mới</label>
            {STATUSES.map((s) => (
              <label key={s} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 mb-1">
                <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => setField("status", s)} className="accent-amber-600"/>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${STATUS_BADGE[s]}`}>{s}</span>
              </label>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
