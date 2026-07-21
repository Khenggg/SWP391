import coreAxiosClient from "../api/coreAxiosClient";
import {
  clearAuthStorage,
  revokeRemoteSession,
  saveAccessToken,
} from "./sessionService";

const SESSION_KEY = "currentUser";

export const authService = {
  login: async (username, password) => {
    try {
      const response = await coreAxiosClient.post("/auth/login", { username, password });
      if (response.success && response.data) {
        saveAccessToken(response.data.accessToken, response.data.refreshToken);
        return response.data; // contains { accessToken, user }
      }
      throw new Error(response.message || "Tên đăng nhập hoặc mật khẩu không chính xác.");
    } catch (err) {
      // Bất kể Backend (.NET) trả về tiếng Anh ("Login failed", "Incorrect username or password."),
      // ta chủ động đè lại bằng tiếng Việt để giao diện thân thiện với người dùng.
      throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
  },

  logout: async () => {
    try {
      await revokeRemoteSession();
    } catch (error) {
      // Logout is intentionally idempotent on the client.
      console.warn("Remote logout failed; clearing local session anyway.");
    } finally {
      clearAuthStorage();
    }
  },

  getCurrentProfile: async () => {
    const response = await coreAxiosClient.get("/auth/me");
    if (response?.success && response.data) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(response.data));
      return response.data;
    }

    throw new Error(response?.message || "Unable to load current user profile.");
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
