import coreAxiosClient from "../api/coreAxiosClient";

function unwrap(response, fallbackMessage) {
  if (response?.success) {
    return response.data;
  }

  throw new Error(response?.message || fallbackMessage);
}

export const entryService = {
  async checkCardEntry({ cardCode, entryGateId }) {
    const response = await coreAxiosClient.get(
      `/cards/${encodeURIComponent(cardCode)}/entry-check`,
      {
        params: { entryGateId },
      }
    );

    return unwrap(response, "Khong the kiem tra the vao bai.");
  },

  async checkReservationEntry({ reservationCode, entryGateId }) {
    const response = await coreAxiosClient.get(
      `/reservations/${encodeURIComponent(reservationCode)}/entry-check`,
      {
        params: { entryGateId },
      }
    );

    return unwrap(response, "Khong the kiem tra reservation vao bai.");
  },

  async getLocationSuggestion({ vehicleTypeId, entryGateId }) {
    const response = await coreAxiosClient.get(
      "/parking-sessions/location-suggestion",
      {
        params: { vehicleTypeId, entryGateId },
      }
    );

    return unwrap(response, "Khong the lay goi y vi tri do xe.");
  },

  async createEntry(payload) {
    const response = await coreAxiosClient.post(
      "/parking-sessions/entry",
      payload
    );

    return unwrap(response, "Khong the tao phien vao bai.");
  },
};
