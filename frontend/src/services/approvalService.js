import coreAxiosClient from "../api/coreAxiosClient";

function getDataOrThrow(response, fallbackMessage) {
  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || fallbackMessage);
}

export const approvalService = {
  getLostCardCases: async () => {
    const response = await coreAxiosClient.get("/lost-cards");
    if (!response.success) return [];
    // BE /lost-cards trả { items, page, pageSize, totalItems, totalPages }
    // Unwrap .items; fallback nếu BE trả array trực tiếp
    const data = response.data;
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  getLostCardCaseById: async (caseId) => {
    const response = await coreAxiosClient.get(`/lost-cards/${caseId}`);
    return getDataOrThrow(response, "Khong the tai chi tiet ho so mat the.");
  },

  approveLostCardCase: async (caseId, { reason }) => {
    const response = await coreAxiosClient.put(`/lost-cards/${caseId}/process`, { status: "APPROVED", reason, rejectionReason: reason });
    return getDataOrThrow(response, "Phe duyet ho so mat the that bai.");
  },

  rejectLostCardCase: async (caseId, { reason }) => {
    const response = await coreAxiosClient.put(`/lost-cards/${caseId}/process`, { status: "REJECTED", reason, rejectionReason: reason });
    return getDataOrThrow(response, "Tu choi ho so mat the that bai.");
  },

  getMismatchCases: async () => {
    const response = await coreAxiosClient.get("/plate-mismatch-cases");
    return response.success ? response.data : [];
  },

  confirmMismatchCase: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/mismatch/confirm`, { reason });
    return getDataOrThrow(response, "Phe duyet lech bien so that bai.");
  },

  rejectMismatchCase: async (sessionId, { reason }) => {
    const response = await coreAxiosClient.post(`/parking-sessions/${sessionId}/mismatch/reject`, { reason });
    return getDataOrThrow(response, "Tu choi lech bien so that bai.");
  },
};
