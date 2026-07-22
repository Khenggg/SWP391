import coreAxiosClient from "../api/coreAxiosClient";

function unwrap(response, fallback) {
  if (response?.success) return response.data;
  throw new Error(response?.message || fallback);
}

export const licensePlateMismatchService = {
  // Staff: get mismatch status for a parking session
  getMismatchStatus: async (parkingSessionId) => {
    try {
      const response = await coreAxiosClient.get(
        `/plate-mismatches/session/${parkingSessionId}/status`
      );
      if (response?.success && response.data) {
        const data = { ...response.data };
        data.managerReason = data.rejectionReason || data.decisionReason || null;
        if (data.status === "CONFIRMED") {
          data.status = "APPROVED";
        }
        return data;
      }
      return null; // không có mismatch case
    } catch (err) {
      // 404 = không có mismatch case cho session này - đây là trạng thái bình thường
      if (err?.httpStatus === 404) return null;
      throw new Error(err?.message || "Không thể kiểm tra trạng thái lệch biển số.");
    }
  },

  // Staff: submit new mismatch report
  submitMismatch: async (data) => {
    let payload = data;
    let config = {};
    if (data instanceof FormData) {
      config = { headers: { "Content-Type": undefined } };
    }
    const response = await coreAxiosClient.post("/plate-mismatches", payload, config);
    return unwrap(response, "Gửi yêu cầu thất bại.");
  },

  // Manager: get all mismatch cases (list)
  // Core API trả về { items: [...], page, pageSize }
  getMismatchCases: async (params) => {
    const response = await coreAxiosClient.get("/plate-mismatches", { params });
    if (response?.success) {
      // Handle both array response and paginated { items } response
      const data = response.data;
      let rawItems = [];
      if (Array.isArray(data)) rawItems = data;
      else if (data?.items && Array.isArray(data.items)) rawItems = data.items;

      return rawItems.map((item) => ({
        ...item,
        status: item.status === "CONFIRMED" ? "APPROVED" : item.status,
        submittedBy: item.reporterName || item.createdBy,
      }));
    }
    return [];
  },

  // Manager: get detail of one mismatch case
  getMismatchCaseDetail: async (id) => {
    const response = await coreAxiosClient.get(`/plate-mismatches/${id}`);
    const data = unwrap(response, "Không thể tải chi tiết hồ sơ.");
    if (data) {
      data.managerReason = data.rejectionReason || data.decisionReason || null;
      if (data.status === "CONFIRMED") {
        data.status = "APPROVED";
      }
      data.submittedBy = data.reporterName || data.createdBy;
    }
    return data;
  },

  // Manager: approve a mismatch case
  // Core API: PATCH /plate-mismatches/{caseId}/status  { Status: "CONFIRMED" }
  approveMismatch: async ({ requestId, managerReason }) => {
    const response = await coreAxiosClient.patch(
      `/plate-mismatches/${requestId}/status`,
      { status: "CONFIRMED", reason: managerReason || null, rejectionReason: managerReason || null }
    );
    return unwrap(response, "Phê duyệt thất bại.");
  },

  // Manager: reject a mismatch case
  // Core API: PATCH /plate-mismatches/{caseId}/status  { Status: "REJECTED", RejectionReason }
  rejectMismatch: async ({ requestId, managerReason }) => {
    const response = await coreAxiosClient.patch(
      `/plate-mismatches/${requestId}/status`,
      { status: "REJECTED", reason: managerReason, rejectionReason: managerReason }
    );
    return unwrap(response, "Từ chối thất bại.");
  },
};
