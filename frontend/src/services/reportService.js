import supportAxiosClient from "../api/supportAxiosClient";

// Note: supportAxiosClient interceptor already unwraps response.data,
// so `response` here equals `{ success, message, data }` from the backend.
const unwrap = (response) => {
  if (response?.success) return response.data;
  throw new Error(response?.message || "Lỗi không xác định từ server");
};

export const reportService = {
  getRevenue: async (params) => {
    const response = await supportAxiosClient.get("/reports/revenue", { params });
    return unwrap(response);
  },

  getTraffic: async (params) => {
    const response = await supportAxiosClient.get("/reports/traffic", { params });
    return unwrap(response);
  },

  getOccupancy: async (params) => {
    const response = await supportAxiosClient.get("/reports/occupancy", { params });
    return unwrap(response);
  },

  getCardSessionReport: async (params) => {
    const response = await supportAxiosClient.get("/reports/card-session", { params });
    return unwrap(response);
  },

  exportExcel: async (params) => {
    const response = await supportAxiosClient.get("/reports/export-excel", {
      params,
      responseType: "blob",
    });
    return response;
  },
};
