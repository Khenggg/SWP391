import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldAlert, Users, Car, CalendarCheck, Shield, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";
import { driverService } from "@/services/driverService";
import { toast } from "sonner";

const REGISTER_FEATURES = [
  {
    icon: <Car size={20} />,
    title: "Tìm chỗ đỗ nhanh chóng",
    description: "Xem vị trí trống theo thời gian thực."
  },
  {
    icon: "P",
    title: "Đặt chỗ tiện lợi",
    description: "Đặt trước và giữ chỗ dễ dàng."
  },
  {
    icon: <Shield size={20} />,
    title: "An toàn & bảo mật",
    description: "Hệ thống giám sát 24/7."
  },
  {
    icon: <Receipt size={20} />,
    title: "Thanh toán linh hoạt",
    description: "Nhiều phương thức thanh toán."
  }
];

const USERNAME_PATTERN = /^(?=.{6,30}$)(?!.*[_-]{2})[A-Za-z][A-Za-z0-9_-]*[A-Za-z0-9]$/;
const PHONE_PATTERN = /^(?:0(?:3|5|7|8|9)\d{8}|\+?84(?:3|5|7|8|9)\d{8})$/;
const FieldError = ({ message }) => message ? (
  <p className="mt-1 text-xs font-medium text-red-600">{message}</p>
) : null;

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    const fullName = formData.fullName.trim();
    const username = formData.username.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!fullName || fullName.length > 150) errors.fullName = "Họ và tên là bắt buộc, tối đa 150 ký tự.";
    if (!username) errors.username = "Username là bắt buộc.";
    else if (!USERNAME_PATTERN.test(username)) {
      errors.username = "Username dài 6-30 ký tự, bắt đầu bằng chữ cái, chỉ dùng chữ/số/_/-, không có dấu phân cách liên tiếp hoặc ở đầu/cuối.";
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Email không hợp lệ.";
    if (!phone || !PHONE_PATTERN.test(phone.replace(/[\s().-]/g, ""))) errors.phone = "Số điện thoại Việt Nam không hợp lệ.";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,100}$/.test(formData.password)) {
      errors.password = "Mật khẩu cần tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số.";
    }
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setFieldErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!agreeTerms) {
      setError("Bạn cần đồng ý với điều khoản sử dụng.");
      return;
    }

    setIsLoading(true);

    try {
      await driverService.registerDriver({
        fullName: formData.fullName,
        username: formData.username.trim(),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      setInfoMessage("Đăng ký thành công! Đang chuyển tới trang đăng nhập...");
      toast.success("Đăng ký tài khoản thành công!");
      await new Promise(resolve => setTimeout(resolve, 2000));
      navigate("/login");
    } catch (err) {
      const fieldErrorMap = {};
      const serverErrors = Array.isArray(err?.errors) ? err.errors : [];
      serverErrors.forEach((item) => {
        const separator = item.indexOf(":");
        if (separator > 0) {
          fieldErrorMap[item.slice(0, separator).trim()] = item.slice(separator + 1).trim();
        }
      });

      if (err?.errorCode === "USERNAME_ALREADY_EXISTS") fieldErrorMap.username = "Username đã tồn tại.";
      if (err?.errorCode === "EMAIL_ALREADY_EXISTS") fieldErrorMap.email = "Email đã tồn tại.";
      if (err?.errorCode === "PHONE_ALREADY_EXISTS") fieldErrorMap.phone = "Số điện thoại đã tồn tại.";
      if (err?.errorCode === "PASSWORD_CONFIRMATION_NOT_MATCH") fieldErrorMap.confirmPassword = "Mật khẩu xác nhận không khớp.";

      setFieldErrors(fieldErrorMap);
      setError(err?.errorCode === "RATE_LIMIT_EXCEEDED"
        ? "Bạn đã thử đăng ký quá nhiều lần. Vui lòng thử lại sau một phút."
        : (Object.keys(fieldErrorMap).length > 0 ? "Vui lòng kiểm tra lại thông tin đăng ký." : (err?.message || "Đăng ký thất bại. Vui lòng thử lại.")));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout
      title="Đăng ký để trải nghiệm"
      heroDescription="Giải pháp bãi đỗ xe thông minh, hiện đại và an toàn mang đến trải nghiệm tiện lợi cho mọi khách hàng."
      featureItems={REGISTER_FEATURES}
    >
      <div className="flex flex-col mb-6">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Đăng ký tài khoản</h2>
        <p className="text-sm text-gray-500">
          Tạo tài khoản để sử dụng các tính năng của<br />SWP Building Smart Parking.
        </p>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6 flex items-center gap-3">
        <Users size={20} className="text-blue-600 flex-shrink-0" />
        <p className="text-xs font-medium text-blue-900/80">
          Dành cho người dùng/ tài xế cá nhân sử dụng dịch vụ.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}

      {infoMessage && (
        <Alert variant="default">{infoMessage}</Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <User size={18} />
          </span>
          <Input
            type="text"
            name="fullName"
            required
            disabled={isLoading}
            value={formData.fullName}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.fullName)}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Họ và tên"
          />
          <FieldError message={fieldErrors.fullName} />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <User size={18} />
          </span>
          <Input
            type="text"
            name="username"
            required
            disabled={isLoading}
            value={formData.username}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.username)}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Ví dụ: HungTran123"
          />
          <FieldError message={fieldErrors.username} />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Mail size={18} />
          </span>
          <Input
            type="email"
            name="email"
            required
            disabled={isLoading}
            value={formData.email}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.email)}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Email"
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Phone size={18} />
          </span>
          <Input
            type="tel"
            name="phone"
            required
            disabled={isLoading}
            value={formData.phone}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.phone)}
            className="pl-11 pr-4 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Số điện thoại"
          />
          <FieldError message={fieldErrors.phone} />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Lock size={18} />
          </span>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            disabled={isLoading}
            value={formData.password}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.password)}
            className="pl-11 pr-11 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Mật khẩu"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 pl-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10 bg-transparent hover:bg-transparent"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <FieldError message={fieldErrors.password} />
        </div>

        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
            <Lock size={18} />
          </span>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            disabled={isLoading}
            value={formData.confirmPassword}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className="pl-11 pr-11 py-5 text-sm text-gray-900 placeholder-gray-400 bg-white border-gray-200 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:border-blue-600 shadow-sm"
            placeholder="Xác nhận mật khẩu"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isLoading}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 pl-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-10 bg-transparent hover:bg-transparent"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
          <FieldError message={fieldErrors.confirmPassword} />
        </div>

        <div className="pt-2 pb-3">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <Checkbox disabled={isLoading} checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5" />
            <span className="text-xs text-gray-600 leading-relaxed">
              Tôi đồng ý với <a href="#" className="text-blue-600 font-medium hover:underline">điều khoản sử dụng</a> và <a href="#" className="text-blue-600 font-medium hover:underline">chính sách bảo mật</a>
            </span>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 text-base font-bold shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Đang xử lý...</span>
            </div>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </form>

      <div className="text-center">
        <span className="text-sm text-gray-600">Đã có tài khoản? </span>
        <Link to="/login" className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
          Đăng nhập
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
