import React, { useState, useEffect } from "react";
import { Car, Info, Calendar, ShieldCheck, ShieldAlert, Award } from "lucide-react";
import { MOCK_MONTHLY_PASSES } from "../../constants/mockData";

export default function DriverVehiclesPage() {
  const [driver, setDriver] = useState({
    fullName: "Nguyễn Văn A",
    phone: "0912345678",
  });
  const [myVehicles, setMyVehicles] = useState([]);

  useEffect(() => {
    // 1. Lấy thông tin tài khoản từ sessionStorage
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setDriver({
          fullName: parsed.fullName || "Nguyễn Văn A",
          phone: parsed.phone || "0912345678",
        });
      } catch (e) {
        console.error("Lỗi đọc thông tin user", e);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Tìm các xe thuộc sở hữu của tài xế này trong MOCK_MONTHLY_PASSES
    const vehicles = MOCK_MONTHLY_PASSES.filter(
      (pass) => pass.ownerName === driver.fullName || pass.phone === driver.phone
    );
    setMyVehicles(vehicles);
  }, [driver]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-wide">
            Phương Tiện Đăng Ký Vé Tháng
          </h2>
          <p className="text-slate-500 text-sm font-semibold">
            Quản lý thông tin xe có vé tháng (Active & Expired) thuộc sở hữu của bạn
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100">
          <Award className="w-4 h-4 shrink-0" />
          <span>{driver.fullName === "Nguyễn Văn A" ? "Tài khoản Cư dân" : "Tài khoản Đặt trước"}</span>
        </div>
      </div>

      {/* Thông tin cảnh báo nghiệp vụ */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 flex gap-3 text-xs text-slate-600 font-medium">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-slate-800">Thông báo về việc Quản lý Phương tiện:</p>
          <p>
            Tài xế **không thể** tự thêm hoặc xóa xe. Danh sách này được đồng bộ và cập nhật tự động bởi **Quản lý bãi xe (Manager)** dựa trên hồ sơ đăng ký vé tháng của bạn.
          </p>
          <p>
            Nếu có thay đổi về biển số xe hoặc gia hạn vé tháng, vui lòng liên hệ Ban Quản Lý tại quầy hỗ trợ Tầng B1.
          </p>
        </div>
      </div>

      {/* Danh sách xe */}
      {myVehicles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            🚗
          </div>
          <p className="text-slate-800 font-bold">
            {driver.fullName === "Nguyễn Văn A" 
              ? "Chưa tìm thấy xe nào đăng ký vé tháng" 
              : "Không có xe vé tháng cố định"}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            {driver.fullName === "Nguyễn Văn A" 
              ? "Vui lòng liên hệ Manager để khai báo vé tháng cho biển số xe của bạn." 
              : "Tài khoản của bạn thuộc nhóm Tài Xế Đặt Trước (không phải cư dân). Bạn hãy sử dụng mục Đặt Chỗ Trước và khai báo biển số xe khi check-in."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myVehicles.map((vehicle) => {
            const isActive = vehicle.status === "ACTIVE";
            return (
              <div 
                key={vehicle.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition duration-200 flex flex-col justify-between"
              >
                {/* Plate Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{vehicle.vehicleTypeName === "Ô Tô" ? "🚗" : "🏍️"}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Biển số xe
                      </span>
                      {/* Real License Plate Design */}
                      <span className="font-black text-slate-800 text-lg font-mono tracking-wider border-2 border-slate-800 bg-white px-2.5 py-0.5 rounded shadow-sm inline-block min-w-[120px] text-center mt-1">
                        {vehicle.plate}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isActive ? (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5" /> Vé Tháng Còn Hạn
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-amber-100">
                      <ShieldAlert className="w-3.5 h-3.5" /> Vé Tháng Hết Hạn
                    </span>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-6 space-y-4 flex-grow">
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div>
                      <p className="text-slate-400 mb-1">Loại phương tiện</p>
                      <p className="text-slate-700 font-extrabold">{vehicle.vehicleTypeName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Chủ phương tiện</p>
                      <p className="text-slate-700 font-extrabold">{vehicle.ownerName}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>Thời hạn vé tháng:</span>
                    </div>
                    <span className="text-slate-800 font-bold">
                      {vehicle.startDate} → {vehicle.endDate}
                    </span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] font-bold text-slate-500">
                  {isActive 
                    ? "🟢 Vé tháng đang có hiệu lực. Phương tiện được phép ra vào đỗ xe trực tiếp." 
                    : "🔴 Vé tháng đã hết hạn. Hãy thực hiện đặt chỗ trước (Booking) nếu muốn gửi xe."
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
