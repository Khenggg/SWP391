import supportAxiosClient from "../api/supportAxiosClient";

export const auditService = {
  getAuditLogs: async (params) => {
    const response = await supportAxiosClient.get("/audit-logs", { params });
    if (response.success) {
      return response.data.items || [];
    }
    return [];
  },
  
  exportAuditLogs: async (params) => {
    const response = await supportAxiosClient.get("/audit-logs/export-excel", { params, responseType: 'blob' });
    return response; 
  }
};
