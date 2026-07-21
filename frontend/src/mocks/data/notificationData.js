export const mockNotifications = [
  {
    id: 1,
    title: "Vé tháng sắp hết hạn",
    content: "Vé tháng cho xe 29A-12345 của bạn sẽ hết hạn vào ngày 30/11. Vui lòng gia hạn để không bị gián đoạn dịch vụ.",
    type: "MONTHLY_PASS",
    priority: "HIGH",
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    userId: 4, // driver01
    monthlyPassId: 101,
  },
  {
    id: 2,
    title: "Xác nhận đặt chỗ thành công",
    content: "Bạn đã đặt chỗ thành công tại khu vực A1. Mã đặt chỗ: RES-0012.",
    type: "RESERVATION",
    priority: "NORMAL",
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    userId: 4,
    reservationId: 201,
  },
  {
    id: 3,
    title: "Thanh toán cước phí thành công",
    content: "Đã thanh toán 50.000 VNĐ cho phiên đỗ xe PS-556.",
    type: "PAYMENT",
    priority: "NORMAL",
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    userId: 4,
    paymentId: 301,
  },
  {
    id: 4,
    title: "Cảnh báo đỗ sai vị trí",
    content: "Hệ thống phát hiện xe 29A-12345 đỗ sai vị trí quy định. Vui lòng di chuyển xe.",
    type: "PARKING",
    priority: "HIGH",
    isRead: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    userId: 4,
    parkingSessionId: 401,
  },
  {
    id: 5,
    title: "Hệ thống bảo trì định kỳ",
    content: "Bãi đỗ xe sẽ bảo trì hệ thống thanh toán từ 00:00 đến 02:00 ngày mai. Vui lòng thanh toán tiền mặt nếu xuất bến trong khoảng thời gian này.",
    type: "SYSTEM",
    priority: "LOW",
    isRead: false,
    readAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    userId: 4,
  }
];
