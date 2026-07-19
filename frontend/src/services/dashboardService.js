import supportAxiosClient from "../api/supportAxiosClient";

export const dashboardService = {
  getDashboardSummary: async () => {
    const response = await supportAxiosClient.get("/dashboard");
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Không thể lấy số liệu thống kê.");
  }
};
