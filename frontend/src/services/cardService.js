import coreAxiosClient from "../api/coreAxiosClient";

const extractErrorMessage = (error, defaultMsg) => {
  if (error?.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    const firstErr = error.errors[0];
    if (firstErr === "Card number already exists.") {
      return "Mã thẻ đã tồn tại trong hệ thống.";
    }
    return firstErr;
  }
  if (error?.message) {
    if (error.message === "Conflict") {
      return "Mã thẻ đã tồn tại trong hệ thống.";
    }
    return error.message;
  }
  return defaultMsg;
};

export const cardService = {
  getCards: async (status = "", search = "") => {
    const params = {};
    if (status && status !== "ALL") params.status = status;
    if (search) params.search = search;
    const response = await coreAxiosClient.get("/cards", { params });
    if (response.success) {
      return response.data;
    }
    return [];
  },

  addCard: async (cardNumber, note = "") => {
    try {
      const response = await coreAxiosClient.post("/cards", { cardNumber, note });
      if (response.success) {
        return response.data;
      }
      throw new Error(extractErrorMessage(response, "Tạo thẻ xe thất bại"));
    } catch (e) {
      throw new Error(extractErrorMessage(e, "Tạo thẻ xe thất bại"));
    }
  },

  updateCardStatus: async (cardId, newStatus) => {
    try {
      // Backend expects [FromBody] string status, which is a JSON string
      const response = await coreAxiosClient.patch(`/cards/${cardId}/status`, `"${newStatus}"`, {
        headers: { "Content-Type": "application/json" }
      });
      if (response.success) {
        return response.data;
      }
      throw new Error(extractErrorMessage(response, "Cập nhật trạng thái thẻ thất bại"));
    } catch (e) {
      throw new Error(extractErrorMessage(e, "Cập nhật trạng thái thẻ thất bại"));
    }
  },

  getAvailableCards: async () => {
    const response = await coreAxiosClient.get("/cards/available");
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }
};

