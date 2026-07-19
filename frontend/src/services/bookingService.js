import coreAxiosClient from "../api/coreAxiosClient";

export const bookingService = {
  getActiveBooking: async () => {
    const res = await coreAxiosClient.get("/driver/bookings");
    return res.success ? res.data : null;
  },

  createBooking: async (areaCode, durationHours, simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings", {
      areaCode,
      durationHours,
      simTime,
    });
    if (res.success) return res.data;
    throw new Error(res.message || "Dat cho that bai");
  },

  payBooking: async (simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/pay", { simTime });
    if (res.success) return res.data;
    throw new Error(res.message || "Thanh toan that bai");
  },

  checkIn: async (plate, simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/check-in", {
      plate,
      simTime,
    });
    if (res.success) return res.data;
    throw new Error(res.message || "Check-in that bai");
  },

  checkOut: async (simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/check-out", {
      simTime,
    });
    if (res.success) return res.data;
    throw new Error(res.message || "Check-out that bai");
  },

  cancelBooking: async (simTime) => {
    const res = await coreAxiosClient.post("/driver/bookings/cancel", {
      simTime,
    });
    if (res.success) return res.data;
    throw new Error(res.message || "Huy dat cho that bai");
  },

  expireBooking: async (status) => {
    const res = await coreAxiosClient.post("/driver/bookings/expire", {
      status,
    });
    if (res.success) return res.data;
    throw new Error(res.message || "Cap nhat het han dat cho that bai");
  },

  getHistory: async () => {
    const res = await coreAxiosClient.get("/driver/bookings/history");
    return res.success ? res.data : [];
  },

  clearHistory: async () => {
    const res = await coreAxiosClient.delete("/driver/bookings/history");
    if (res.success) return res.data;
    throw new Error(res.message || "Xoa lich su that bai");
  },
};
