const SESSION_KEY = "currentUser";

export const authService = {
  login: (username, password) => {
    // Tài khoản Seed chạy offline (không cần backend)
    const seedUsers = {
      admin01: { username: "admin01", fullName: "Quản Trị Viên Hệ Thống", role: "ADMIN", email: "admin01@parking.vn", phone: "0901000001" },
      manager01: { username: "manager01", fullName: "Quản Lý Bãi Xe", role: "MANAGER", email: "manager01@parking.vn", phone: "0901000002" },
      staff01: { username: "staff01", fullName: "Nhân Viên Cổng Vận Hành", role: "STAFF", email: "staff01@parking.vn", phone: "0901000003" },
      driver01: { username: "driver01", fullName: "Nguyễn Văn A", role: "DRIVER", phone: "0912345678", email: "driver01@parking.vn" },
      driver02: { username: "driver02", fullName: "Trần Văn B", role: "DRIVER", phone: "0987654321", email: "driver02@booking.vn" },
    };

    const userKey = username.trim().toLowerCase();
    const user = seedUsers[userKey];
    
    // Ở chế độ giả lập offline, cho phép đăng nhập mọi mật khẩu nếu đúng username mẫu
    if (user && password === "password123") {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { token: `mock-token-for-${userKey}`, user };
    }
    
    throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("authToken");
  },

  getCurrentUser: () => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Lỗi đọc session user", e);
      }
    }
    return null;
  }
};
