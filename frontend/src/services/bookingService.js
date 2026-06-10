const getActiveBookingKey = (username) => `driver_active_booking_${username}`;
const getHistoryKey = (username) => `driver_history_${username}`;

export const bookingService = {
  getActiveBooking: (username) => {
    const stored = localStorage.getItem(getActiveBookingKey(username));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Lỗi đọc thông tin đặt chỗ hoạt động", e);
      }
    }
    return null;
  },

  setActiveBooking: (username, booking) => {
    localStorage.setItem(getActiveBookingKey(username), JSON.stringify(booking));
  },

  deleteActiveBooking: (username) => {
    localStorage.removeItem(getActiveBookingKey(username));
  },

  getHistory: (username) => {
    const stored = localStorage.getItem(getHistoryKey(username));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Lỗi đọc lịch sử gửi xe", e);
      }
    }
    return [];
  },

  saveToHistory: (username, booking) => {
    if (["EXPIRED_TIMEOUT", "EXPIRED_CHECKIN", "CANCELLED", "COMPLETED"].includes(booking.status)) {
      const enrichedBooking = {
        ...booking,
        reservationFee: booking.reservationFee !== undefined ? booking.reservationFee : (booking.fee || 0),
        actualParkingFee: booking.actualParkingFee !== undefined ? booking.actualParkingFee : 0,
        actualHours: booking.actualHours !== undefined ? booking.actualHours : 0
      };
      const historyKey = getHistoryKey(username);
      const history = bookingService.getHistory(username);
      if (!history.find(h => h.id === enrichedBooking.id)) {
        history.unshift(enrichedBooking);
        localStorage.setItem(historyKey, JSON.stringify(history));
      }
      bookingService.deleteActiveBooking(username);
    }
  },

  clearHistory: (username) => {
    localStorage.removeItem(getHistoryKey(username));
  }
};
