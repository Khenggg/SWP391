import coreAxiosClient from "../api/coreAxiosClient";
import publicAxiosClient from "../api/publicAxiosClient";

export const pricingService = {
  // Public API cho guest/driver
  getPublicPricing: async () => {
    const response = await publicAxiosClient.get("/pricing");
    return response.success ? response.data : [];
  },

  getPricingRules: async (params = {}) => {
    const response = await coreAxiosClient.get("/pricing-rules", { params });
    return response.success ? response.data : [];
  },

  // API lấy chi tiết 1 rule
  getPricingRuleById: async (ruleId) => {
    const response = await coreAxiosClient.get(`/pricing-rules/${ruleId}`);
    if (response.success) return response.data;
    throw new Error(response.message || "Không thể lấy chi tiết bảng giá");
  },

  addPricingRule: async (ruleData) => {
    // Theo docs: POST /api/core/pricing-rules
    const response = await coreAxiosClient.post("/pricing-rules", ruleData);
    if (response.success) return response.data;
    throw new Error(response.message || "Thêm bảng giá thất bại");
  },

  updatePricingRule: async (ruleId, updatedData) => {
    // Theo docs: PUT /api/core/pricing-rules/{id}
    const response = await coreAxiosClient.put(`/pricing-rules/${ruleId}`, updatedData);
    if (response.success) return response.data;
    throw new Error(response.message || "Cập nhật bảng giá thất bại");
  }
};
