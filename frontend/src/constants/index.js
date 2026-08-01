/**
 * constants/index.js - Các hằng số dùng chung trong toàn bộ hệ thống Frontend
 */

// Định nghĩa các vai trò người dùng trong hệ thống (khớp với Backend)
export const USER_ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
  DRIVER: "DRIVER",
};

// Định nghĩa các trạng thái của Lượt Đặt Chỗ / Phiên đỗ xe (khớp với Backend)
export const BOOKING_STATUS = {
  PENDING: "PENDING_PAYMENT",
  PAID: "PAID",
  CHECKED_IN: "CHECKED_IN",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXPIRED_TIMEOUT: "EXPIRED_TIMEOUT",
  EXPIRED_CHECKIN: "EXPIRED_CHECKIN",
};

// Từ điển hiển thị trạng thái đặt chỗ sang tiếng Việt
export const BOOKING_STATUS_TEXT = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán (Chờ vào cổng)",
  CHECKED_IN: "Đang đỗ xe",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
  EXPIRED_TIMEOUT: "Hết hạn thanh toán",
  EXPIRED_CHECKIN: "Hết hạn check-in",
};

// Trạng thái thẻ RFID (Card Status)
export const CARD_STATUS = {
  AVAILABLE: "AVAILABLE",
  IN_USE: "IN_USE",
  LOST: "LOST",
  DAMAGED: "DAMAGED",
  INACTIVE: "INACTIVE",
};

// Trạng thái slot đỗ xe (Slot Status)
export const SLOT_STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  MAINTENANCE: "MAINTENANCE",
  LOCKED: "LOCKED",
};

// Màu sắc tương ứng với trạng thái slot
export const SLOT_STATUS_COLORS = {
  AVAILABLE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  OCCUPIED: "border-blue-300 bg-blue-50 text-blue-700",
  RESERVED: "border-purple-300 bg-purple-50 text-purple-700",
  LOCKED: "border-red-200 bg-red-50 text-red-700",
  MAINTENANCE: "border-amber-200 bg-amber-50 text-amber-700",
};

// Nhãn hiển thị trạng thái slot
export const STATUS_LABELS = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  MAINTENANCE: "MAINTENANCE",
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
};

// Trạng thái vé tháng cư dân (Monthly Pass Status)
export const PASS_STATUS = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  LOCKED: "LOCKED",
  CANCELLED: "CANCELLED",
};

// Trạng thái chung (Cấu hình giá, cổng xe, cảm biến, tầng bãi đỗ...)
export const COMMON_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};

// Trạng thái tài khoản người dùng (User Status)
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  INACTIVE: "INACTIVE",
};
