import coreAxiosClient from "../api/coreAxiosClient";

export const licensePlateMismatchService = {
  getDetails: async (parkingSessionId) => {
    const response = await coreAxiosClient.get(`/staff/license-plate-mismatch/${parkingSessionId}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể tải thông tin phiên.");
  },

  submitMismatch: async (data) => {
    const response = await coreAxiosClient.post("/staff/license-plate-mismatch", data);
    if (response.success) return response.data;
    throw new Error(response.message || "Gửi yêu cầu thất bại.");
  },
};
