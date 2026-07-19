import { Car, Shield, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AccountTypeBlock({ isResident }) {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Loại tài khoản</h3>
      <p className="text-sm text-slate-500 mb-4">Tài khoản của bạn đã được phân loại để áp dụng chính sách và giá dịch vụ phù hợp.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Vãng Lai */}
        <div className={`p-5 rounded-xl border-2 transition-all flex items-center justify-between ${!isResident ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white opacity-60'}`}>
          <div className="flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!isResident ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`font-bold ${!isResident ? 'text-blue-900' : 'text-slate-700'}`}>Driver vãng lai</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Sử dụng theo lượt, thanh toán theo thời gian thực tế.</p>
              {!isResident && (
                <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 mt-2 border-0 shadow-none font-bold">
                  Đang hoạt động <Check className="w-3 h-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
          {!isResident && (
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Card Cư Dân */}
        <div className={`p-5 rounded-xl border-2 transition-all flex items-center justify-between ${isResident ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white opacity-60'}`}>
          <div className="flex gap-4 items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isResident ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`font-bold ${isResident ? 'text-emerald-900' : 'text-slate-700'}`}>Driver cư dân</h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Sử dụng thẻ tháng cư dân với ưu đãi theo quy định.</p>
              {isResident ? (
                <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-700 mt-2 border-0 shadow-none font-bold">
                  Đã xác minh <Check className="w-3 h-3 ml-1" />
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs font-semibold h-7 px-3 text-blue-600 border-blue-200"
                  onClick={() => navigate("/driver/vehicles")}
                >
                  Xem chi tiết thẻ tháng
                </Button>
              )}
            </div>
          </div>
          {isResident && (
            <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2 bg-blue-50/50 text-blue-700 p-3 rounded-lg text-xs font-medium border border-blue-100">
        <div className="shrink-0 w-4 h-4 rounded-full border border-blue-300 flex items-center justify-center text-[10px] font-bold bg-white">i</div>
        <p>Hệ thống sẽ ưu tiên áp dụng thẻ tháng hợp lệ khi gửi xe. Bạn có thể là Cư dân nhưng vẫn có thể đặt chỗ cho phương tiện khác chưa đăng ký vé tháng.</p>
      </div>
    </div>
  );
}
