import coreAxiosClient from "../api/coreAxiosClient";
import supportAxiosClient from "../api/supportAxiosClient";

const ACTIVE_RESERVATION_SESSION_KEY = "activeReservation";
const ACTIVE_RESERVATION_LOCAL_PREFIX = "activeReservation:";
const TERMINAL_RESERVATION_STATUSES = new Set(["CANCELLED", "EXPIRED", "COMPLETED"]);
const TERMINAL_PAYMENT_STATUSES = new Set(["CANCELLED", "FAILED", "NOT_REQUIRED"]);

const getStoredCurrentUser = () => {
  const raw = sessionStorage.getItem("currentUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getCurrentUsername = () => {
  const user = getStoredCurrentUser();
  return user?.username ? String(user.username).trim().toLowerCase() : "";
};

const getLocalStorageKey = (username = getCurrentUsername()) => {
  if (!username) return null;
  return `${ACTIVE_RESERVATION_LOCAL_PREFIX}${username}`;
};

const clearSessionReservation = () => {
  sessionStorage.removeItem(ACTIVE_RESERVATION_SESSION_KEY);
};

const clearStoredReservation = (username = getCurrentUsername()) => {
  clearSessionReservation();
  const localKey = getLocalStorageKey(username);
  if (localKey) {
    localStorage.removeItem(localKey);
  }
};

const parseReservation = (raw) => {
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistReservation = (reservation) => {
  if (!reservation) return null;

  const username = reservation.ownerUsername || getCurrentUsername();
  const normalized = {
    ...reservation,
    ownerUsername: username
  };

  sessionStorage.setItem(ACTIVE_RESERVATION_SESSION_KEY, JSON.stringify(normalized));

  const localKey = getLocalStorageKey(username);
  if (localKey) {
    localStorage.setItem(localKey, JSON.stringify(normalized));
  }

  return normalized;
};

const readCachedReservation = () => {
  const username = getCurrentUsername();
  if (!username) {
    clearSessionReservation();
    return null;
  }

  const sessionReservation = parseReservation(sessionStorage.getItem(ACTIVE_RESERVATION_SESSION_KEY));
  if (sessionReservation) {
    if (sessionReservation.ownerUsername && sessionReservation.ownerUsername !== username) {
      clearSessionReservation();
    } else {
      return persistReservation(sessionReservation);
    }
  }

  const localKey = getLocalStorageKey(username);
  const localReservation = parseReservation(localKey ? localStorage.getItem(localKey) : null);
  if (!localReservation) return null;

  return persistReservation(localReservation);
};

const isLocallyExpired = (reservation) => {
  if (!reservation?.reservationEndTime) return false;
  const expiresAt = new Date(reservation.reservationEndTime).getTime();
  if (Number.isNaN(expiresAt)) return false;
  return expiresAt <= Date.now();
};

const isTerminalReservation = (reservationStatus, paymentStatus) =>
  TERMINAL_RESERVATION_STATUSES.has(reservationStatus) || TERMINAL_PAYMENT_STATUSES.has(paymentStatus);

const mapReservationForCache = (reservation, payment, metadata = {}) => ({
  id: reservation.id,
  reservationCode: reservation.reservationCode,
  status: reservation.status,
  paymentStatus: reservation.paymentStatus,
  bookingAmount: reservation.bookingAmount,
  plateNumber: reservation.plateNumber,
  areaId: reservation.areaId,
  slotId: reservation.slotId,
  areaName: metadata.areaName || "Khu vực đã chọn",
  slotName: metadata.slotName || "Slot đã chọn",
  reservationEndTime: reservation.expiresAt || reservation.reservationEndTime,
  checkoutUrl: payment?.checkoutUrl,
  orderCode: payment?.orderCode,
  paymentId: payment?.paymentId,
  qrCode: payment?.qrCode,
  remainingSeconds: payment?.expiredAt
    ? Math.max(0, Math.floor((new Date(payment.expiredAt).getTime() - Date.now()) / 1000))
    : 600
});

const mapSupportReservationForCache = (reservation, cached = {}) => ({
  id: reservation.id,
  reservationCode: reservation.reservationCode,
  status: reservation.status,
  paymentStatus: reservation.paymentStatus,
  bookingAmount: reservation.bookingAmount,
  plateNumber: reservation.plateNumber,
  areaId: reservation.areaId,
  slotId: reservation.slotId,
  areaName: reservation.areaName || "Khu vực đã chọn",
  slotName: reservation.slotName || "Slot đã chọn",
  reservationEndTime: reservation.reservationEndTime,
  checkoutUrl: reservation.checkoutUrl || cached.checkoutUrl,
  orderCode: reservation.providerTransactionId,
  paymentId: reservation.paymentId,
  qrCode: reservation.qrCode || cached.qrCode,
  remainingSeconds: reservation.remainingSeconds ?? 0
});

const mapSupportHistoryItem = (item) => ({
  id: item.id,
  reservationCode: item.reservationCode,
  status: item.status,
  paymentStatus: item.paymentStatus,
  plateNumber: item.plateNumber,
  vehicleTypeId: item.vehicleTypeId,
  areaId: item.areaId,
  areaName: item.areaName || "Khu vực đã chọn",
  slotId: item.slotId,
  slotName: item.slotName || "",
  reservationStartTime: item.reservedAt || item.createdAt,
  reservationEndTime: item.reservationEndTime,
  createdAt: item.createdAt || item.reservedAt,
  bookingAmount: Number(item.bookingAmount ?? 0),
  totalAmount: Number(item.bookingAmount ?? 0),
  providerTransactionId: item.providerTransactionId,
  paymentId: item.paymentId
});

const fetchActiveReservationFromSupport = async () => {
  const response = await supportAxiosClient.get("/reservations/me/active");
  if (!response.success) {
    return null;
  }

  if (!response.data) {
    clearStoredReservation();
    return null;
  }

  const cached = readCachedReservation();
  return persistReservation(mapSupportReservationForCache(
    response.data,
    cached && String(cached.id) === String(response.data.id) ? cached : {}
  ));
};

export const reservationService = {
  getActiveReservation: async () => {
    try {
      const supportReservation = await fetchActiveReservationFromSupport();
      if (supportReservation) {
        return supportReservation;
      }
    } catch {
      // Fall back to cached/core reconciliation below when support API is unavailable.
    }

    const cached = readCachedReservation();
    if (!cached) {
      return fetchActiveReservationFromSupport().catch(() => null);
    }

    if (isTerminalReservation(cached.status, cached.paymentStatus)) {
      clearStoredReservation(cached.ownerUsername);
      return fetchActiveReservationFromSupport().catch(() => null);
    }

    try {
      const res = await coreAxiosClient.get(`/reservations/${cached.id}/payment-status`);
      if (res.success && res.data) {
        const latest = res.data;

        if (
          isTerminalReservation(latest.reservationStatus, latest.paymentStatus) ||
          latest.isExpired ||
          (latest.reservationStatus === "CONFIRMED" && latest.expiresAt && new Date(latest.expiresAt).getTime() <= Date.now())
        ) {
          clearStoredReservation(cached.ownerUsername);
          return fetchActiveReservationFromSupport().catch(() => null);
        }

        const updated = persistReservation({
          ...cached,
          reservationCode: latest.reservationCode || cached.reservationCode,
          status: latest.reservationStatus,
          paymentStatus: latest.paymentStatus,
          bookingAmount: latest.bookingAmount ?? cached.bookingAmount,
          checkoutUrl: latest.checkoutUrl,
          qrCode: latest.qrCode,
          paymentId: latest.paymentId ?? cached.paymentId,
          orderCode: latest.providerTransactionId ?? cached.orderCode,
          remainingSeconds: latest.remainingSeconds,
          reservationEndTime: latest.expiresAt || cached.reservationEndTime
        });

        return updated;
      }
    } catch {
      if (
        (cached.paymentStatus === "PENDING" && Number(cached.remainingSeconds) <= 0) ||
        (cached.status === "CONFIRMED" && isLocallyExpired(cached))
      ) {
        clearStoredReservation(cached.ownerUsername);
        return fetchActiveReservationFromSupport().catch(() => null);
      }

      return fetchActiveReservationFromSupport().catch(() => cached);
    }

    return cached;
  },

  getAvailableSlots: async (vehicleTypeId = 5) => {
    const vId = Number(vehicleTypeId);
    const res = await coreAxiosClient.get(`/reservations/available-locations?vehicleTypeId=${vId}`);
    if (!res.success || !res.data) return { slots: [], areas: [] };

    const slots = (res.data.availableSlots || []).map((s) => ({
      id: s.slotId,
      slotCode: s.slotCode,
      areaId: s.areaId,
      areaCode: s.areaCode,
      areaName: s.areaName,
      floorId: s.floorId,
      floorCode: s.floorCode,
      floorName: s.floorName,
      status: "AVAILABLE"
    }));

    const areas = (res.data.availableAreas || []).map((a) => ({
      id: a.areaId,
      code: a.areaCode,
      name: a.areaName,
      floorId: a.floorId,
      floorCode: a.floorCode,
      floorName: a.floorName,
      availableSlots: a.availableCapacity,
      totalSlots: a.totalCapacity,
      vehicleTypeName: vId === 5 ? "Ô Tô" : "Xe Máy",
      status: "ACTIVE"
    }));

    if (slots.length > 0) {
      const areaIds = new Set(areas.map(a => a.id));
      slots.forEach((s) => {
        if (!areaIds.has(s.areaId)) {
          areaIds.add(s.areaId);
          areas.push({
            id: s.areaId,
            code: s.areaCode,
            name: s.areaName,
            floorId: s.floorId,
            floorCode: s.floorCode,
            floorName: s.floorName,
            availableSlots: slots.filter((sl) => sl.areaId === s.areaId).length,
            totalSlots: slots.filter((sl) => sl.areaId === s.areaId).length,
            vehicleTypeName: "Ô Tô",
            status: "ACTIVE"
          });
        }
      });
    }

    return { slots, areas };
  },

  getHistory: async (_page = 0, limit = 5) => {
    const response = await supportAxiosClient.get(`/reservations/me/history?limit=${Number(limit) || 5}`);
    if (!response.success || !response.data) {
      return [];
    }

    const items = Array.isArray(response.data.items) ? response.data.items : [];
    return items
      .filter((item) => item.status !== "CANCELLED")
      .map(mapSupportHistoryItem);
  },

  createReservation: async (plateNumber, vehicleTypeId, floorId, areaId, durationHours, slotId, areaName, slotName) => {
    const res = await coreAxiosClient.post("/reservations", {
      plateNumber,
      vehicleTypeId,
      floorId,
      areaId,
      reservedDurationMinutes: durationHours * 60,
      slotId
    });

    if (res.success && res.data) {
      const flatReservation = mapReservationForCache(res.data.reservation, res.data.payment, {
        areaName,
        slotName
      });

      if (Number(flatReservation.bookingAmount || 0) > 0 && !flatReservation.qrCode && !flatReservation.checkoutUrl) {
        throw new Error("PayOS chua tra QR/link thanh toan. Vui long thu lai.");
      }

      return persistReservation(flatReservation);
    }

    throw new Error(res.message || "Đặt chỗ thất bại");
  },

  cancelReservation: async (id) => {
    const res = await coreAxiosClient.post(`/reservations/${id}/cancel`, { reason: "User cancelled from web UI" });
    if (res.success) {
      clearStoredReservation();
      return res.data;
    }
    throw new Error(res.message || "Hủy đặt chỗ thất bại");
  },

  payReservation: async (id) => {
    const res = await coreAxiosClient.get(`/reservations/${id}/payment-status`);
    if (res.success && res.data && res.data.paymentStatus === "PAID") {
      const cached = readCachedReservation();
      if (cached) {
        return persistReservation({
          ...cached,
          status: "CONFIRMED",
          paymentStatus: "PAID",
          reservationEndTime: res.data.expiresAt || cached.reservationEndTime,
          remainingSeconds: res.data.remainingSeconds ?? cached.remainingSeconds
        });
      }
      return res.data;
    }
    throw new Error("Giao dịch chưa được thanh toán trên PayOS. Vui lòng thanh toán trước.");
  },

  getReservationById: async (id) => {
    try {
      const active = await reservationService.getActiveReservation().catch(() => null);
      if (active && String(active.id) === String(id)) {
        return active;
      }
      const history = await reservationService.getHistory(0, 100);
      const found = history.find((item) => String(item.id) === String(id));
      if (found) {
        return found;
      }
    } catch (e) {
      console.error("Error in getReservationById:", e);
    }
    return null;
  },

  clearActiveReservationCache: () => {
    clearStoredReservation();
  }
};
