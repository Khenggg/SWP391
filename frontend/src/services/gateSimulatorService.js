import coreAxiosClient from "../api/coreAxiosClient";

export const gateSimulatorService = {
  async getFixtures() {
    const response = await coreAxiosClient.get("/gate-simulator/fixtures");
    if (response?.success) return response.data;
    throw new Error(response?.message || "Không thể tải dữ liệu giả lập cổng.");
  },
};
