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
  registerDriver: async (data) => {
    const response = await coreAxiosClient.post("/auth/register", data);
    if (response.success && response.data) {
      return response.data;
    }

    throw response;
  },

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
  },

  /**
   * Lấy danh sách lịch sử vào/ra xe (Entry-Exit History).
   * - Driver: chỉ thấy của mình
   * - Staff/Manager/Admin: thấy tất cả
   */
  getEntryExitHistory: async ({
    keyword = "",
    status = "",
    fromDate = null,
    toDate = null,
    page = 1,
    pageSize = 20,
  } = {}) => {
    const res = await supportAxiosClient.get("/driver/vehicles/entry-exit-history", {
      params: {
        keyword: keyword || undefined,
        status: status || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        pageSize,
      },
    });
    if (res.success && res.data) {
      return {
        items: res.data.items || [],
        page: res.data.page || page,
        pageSize: res.data.pageSize || pageSize,
        totalItems: res.data.totalItems ?? 0,
        totalPages: res.data.totalPages || 1,
      };
    }
    throw new Error(res.message || "Không thể tải lịch sử vào/ra xe.");
  },

  /**
   * Lấy chi tiết một bản ghi lịch sử vào/ra xe.
   * - Driver: chỉ được xem của mình (backend enforce)
   */
  getEntryExitHistoryDetail: async (id) => {
    const res = await supportAxiosClient.get(`/driver/vehicles/entry-exit-history/${id}`);
    if (res.success && res.data) return res.data;
    throw new Error(res.message || "Không thể tải chi tiết lịch sử.");
  },

  /**
   * Gửi đơn đăng ký vé tháng (Resident Driver).
   */
  submitMonthlyPassApplication: async (data) => {
    const res = await coreAxiosClient.post("/monthly-passes/applications", data);
    if (res.success && res.data) return res.data;
    throw new Error(res.message || "Gửi yêu cầu đăng ký vé tháng thất bại.");
  },

  /**
   * Lấy danh sách đơn đăng ký vé tháng.
   * - Driver: chỉ thấy của mình.
   * - Manager: thấy tất cả.
   */
  getMonthlyPassApplications: async ({ keyword = "", status = "", page = 1, pageSize = 20 } = {}) => {
    const res = await coreAxiosClient.get("/monthly-passes/applications", {
      params: {
        keyword: keyword || undefined,
        status: status || undefined,
        page,
        pageSize,
      },
    });
    if (res.success && res.data) {
      return {
        items: res.data.items || [],
        page: res.data.page || page,
        pageSize: res.data.pageSize || pageSize,
        totalItems: res.data.totalItems ?? 0,
        totalPages: res.data.totalPages || 1,
      };
    }
    throw new Error(res.message || "Không thể tải danh sách đơn đăng ký.");
  },

  /**
   * Lấy chi tiết đơn đăng ký vé tháng.
   */
  getMonthlyPassApplicationById: async (id) => {
    const res = await coreAxiosClient.get(`/monthly-passes/applications/${id}`);
    if (res.success && res.data) return res.data;
    throw new Error(res.message || "Không thể tải chi tiết đơn đăng ký.");
  },

  /**
   * Review phê duyệt đơn đăng ký (Manager/Admin).
   */
  reviewMonthlyPassApplication: async (id, status, reason) => {
    const res = await coreAxiosClient.patch(`/monthly-passes/applications/${id}/status`, {
      status,
      reason,
    });
    if (res.success && res.data) return res.data;
    throw new Error(res.message || "Không thể phê duyệt đơn đăng ký.");
  },

  /**
   * Xác nhận thanh toán phí đăng ký (Staff/Admin).
   */
  confirmApplicationPayment: async (id, paymentMethod, referenceNo) => {
    const res = await coreAxiosClient.patch(`/monthly-passes/applications/${id}/payment`, {
      paymentMethod,
      referenceNo,
    });
    if (res.success && res.data) return res.data;
    throw new Error(res.message || "Không thể xác nhận thanh toán.");
  },

  /**
   * Gán thẻ RFID vật lý và kích hoạt vé tháng (Staff/Admin).
   */
  assignRfidToApplication: async (id, rfidCardCode) => {
    const res = await coreAxiosClient.patch(`/monthly-passes/applications/${id}/assign-rfid`, {
      rfidCardCode,
    });
    if (res.success && res.data) return res.data;
    throw new Error(res.message || "Không thể gán thẻ RFID và kích hoạt.");
  },
};
