import coreAxiosClient from "../api/coreAxiosClient";
import supportAxiosClient from "../api/supportAxiosClient";

const getStoredCurrentUser = () => {
  const raw = sessionStorage.getItem("currentUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const driverService = {
  getDriverProfile: async () => {
    try {
      const res = await supportAxiosClient.get("/driver/me");
      if (res.success && res.data) {
        return res.data;
      }
    } catch (supportError) {
      try {
        const fallbackResponse = await coreAxiosClient.get("/auth/me");
        if (fallbackResponse.success && fallbackResponse.data) {
          const storedUser = getStoredCurrentUser();
          return {
            fullName: fallbackResponse.data.fullName || storedUser?.fullName || "",
            phone: storedUser?.phone || "",
            email: fallbackResponse.data.email || storedUser?.email || "",
            createdAt: storedUser?.createdAt || null,
            driverType: storedUser?.driverType || null,
            username: fallbackResponse.data.username || storedUser?.username || ""
          };
        }
      } catch {
        throw supportError;
      }
    }

    throw new Error("Không thể tải thông tin cá nhân");
  },

  updateDriverProfile: async (data) => {
    const res = await coreAxiosClient.put("/driver/me", data);
    if (res.success) return res.data;
    throw new Error(res.message || "Cập nhật thông tin thất bại");
  }
};
