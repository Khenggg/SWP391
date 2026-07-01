import coreAxiosClient from "../api/coreAxiosClient";

export const vehicleService = {
  getMonthlyPasses: async () => {
    const response = await coreAxiosClient.get("/monthly-passes");
    return response.success ? response.data : [];
  },

  getVehiclesByOwner: async () => {
    // Current logged in driver's vehicles
    const response = await coreAxiosClient.get("/driver/vehicles");
    return response.success ? response.data : [];
  },

  createVehicle: async (vehicleData) => {
    const response = await coreAxiosClient.post("/driver/vehicles", vehicleData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm phương tiện thất bại");
  },

  addMonthlyPass: async (passData) => {
    const response = await coreAxiosClient.post("/monthly-passes", passData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm vé tháng thất bại");
  },

  updateMonthlyPassStatus: async (passId, newStatus) => {
    const response = await coreAxiosClient.patch(`/monthly-passes/${passId}/status`, `"${newStatus}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật trạng thái vé tháng thất bại");
  },

  renewMonthlyPass: async (passId, newEndDate) => {
    const response = await coreAxiosClient.post(`/monthly-passes/${passId}/renew`, { newEndDate: newEndDate });
    if (response.success) return response.data;
    throw new Error(response.message || "Gia hạn vé tháng thất bại");
  }
};
