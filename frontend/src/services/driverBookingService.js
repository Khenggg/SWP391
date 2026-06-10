import coreAxiosClient from "../api/coreAxiosClient";

export const driverBookingService = {
  getBookings: () => coreAxiosClient.get("/driver/bookings"),
  getHistory: () => coreAxiosClient.get("/driver/bookings/history"),
};
