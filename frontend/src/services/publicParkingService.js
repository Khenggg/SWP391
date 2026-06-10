import publicAxiosClient from "../api/publicAxiosClient";

export const publicParkingService = {
  getParkingInfo: () => publicAxiosClient.get("/parking-info"),
  getPricing: () => publicAxiosClient.get("/pricing"),
  getAvailableSlots: () => publicAxiosClient.get("/available-slots"),
};
