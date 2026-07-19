import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, enabled } from "./helpers";
import { db } from "./db";
import { sessionDb } from "./sessionUtils";

const ACTIVE_DEMO_BOOKING_ID = "BK-100001";
const EXPIRED_DEMO_BOOKING_ID = "BK-100099";
const MONTHLY_CARD_PASS_MAP = {
  "CARD-0006": 1,
  "CARD-0003": 2,
};

const getSimTime = () =>
  localStorage.getItem("driver_sim_time") || new Date().toISOString();

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeCode(value) {
  return normalizeText(value).toUpperCase();
}

function parseId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function encodeToken(payload) {
  return btoa(JSON.stringify(payload));
}

function decodeToken(token) {
  try {
    return JSON.parse(atob(token));
  } catch {
    throw new Error("Token xac minh khong hop le.");
  }
}

function ensureTokenNotExpired(tokenPayload, message) {
  const expiresAt = tokenPayload?.expiresAt ? new Date(tokenPayload.expiresAt) : null;
  if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt < new Date()) {
    throw new Error(message);
  }
}

function getVehicleMeta(vehicleTypeId) {
  const id = Number(vehicleTypeId);

  if (id === 1) {
    return { id: 1, name: "Xe May", requiresSlot: false };
  }

  if (id === 2) {
    return { id: 2, name: "O To", requiresSlot: true };
  }

  if (id === 3) {
    return { id: 3, name: "Xe Van Chuyen", requiresSlot: false };
  }

  throw new Error("VehicleTypeId khong hop le.");
}

function getBookingVehicleTypeId(booking) {
  return normalizeCode(booking?.vehicleTypeName).includes("TO") ? 2 : 1;
}

function createDemoBooking(bookingId = ACTIVE_DEMO_BOOKING_ID) {
  const now = new Date(getSimTime());
  const safeNow = Number.isNaN(now.getTime()) ? new Date() : now;
  const isExpiredDemo = normalizeCode(bookingId) === EXPIRED_DEMO_BOOKING_ID;
  const paidAt = isExpiredDemo
    ? new Date(safeNow.getTime() - 4 * 60 * 60 * 1000).toISOString()
    : safeNow.toISOString();

  return {
    id: bookingId,
    username: isExpiredDemo ? "driver-expired" : "driver02",
    areaCode: "B2-A",
    areaName: "Khu A - Tang B2",
    floorCode: "B2",
    vehicleTypeName: "O To",
    hours: isExpiredDemo ? 1 : 3,
    reservationFee: isExpiredDemo ? 20000 : 60000,
    fee: isExpiredDemo ? 20000 : 60000,
    actualParkingFee: 0,
    actualHours: 0,
    status: isExpiredDemo ? "EXPIRED" : "CONFIRMED",
    paymentStatus: "PAID",
    createdAt: paidAt,
    paidAt,
    checkInTime: null,
    checkOutTime: null,
    plate: null,
    internalSlotId: isExpiredDemo ? 19 : 12,
    internalSlotCode: isExpiredDemo ? "B2-A-019" : "B2-A-012",
  };
}

function ensureDemoBookings() {
  let bookings = db.getBookings();
  const hasActive = bookings.some(
    (booking) => normalizeCode(booking.id) === ACTIVE_DEMO_BOOKING_ID
  );
  const hasExpired = bookings.some(
    (booking) => normalizeCode(booking.id) === EXPIRED_DEMO_BOOKING_ID
  );

  if (!hasActive || !hasExpired) {
    bookings = [
      ...(!hasActive ? [createDemoBooking(ACTIVE_DEMO_BOOKING_ID)] : []),
      ...(!hasExpired ? [createDemoBooking(EXPIRED_DEMO_BOOKING_ID)] : []),
      ...bookings,
    ];
  }

  bookings = bookings.map((booking) => {
    const code = normalizeCode(booking.id);

    if (code === ACTIVE_DEMO_BOOKING_ID) {
      return {
        ...booking,
        areaCode: "B2-A",
        areaName: "Khu A - Tang B2",
        floorCode: "B2",
        vehicleTypeName: "O To",
        internalSlotId: 12,
        internalSlotCode: "B2-A-012",
      };
    }

    if (code === EXPIRED_DEMO_BOOKING_ID) {
      return {
        ...booking,
        areaCode: "B2-A",
        areaName: "Khu A - Tang B2",
        floorCode: "B2",
        vehicleTypeName: "O To",
        internalSlotId: 19,
        internalSlotCode: "B2-A-019",
      };
    }

    return booking;
  });

  db.saveBookings(bookings);
  return bookings;
}

function getGateOrThrow(entryGateId) {
  const gate = db.getGates().find(
    (item) => item.id === Number(entryGateId) && item.type === "ENTRY"
  );

  if (!gate) {
    throw new Error("Khong tim thay cong vao phu hop.");
  }

  return gate;
}

function getAreaById(areaId) {
  return db.getAreas().find((area) => area.id === Number(areaId)) || null;
}

function getAreaByCode(areaCode) {
  return db.getAreas().find((area) => area.code === areaCode) || null;
}

function getSlotById(slotId) {
  return db.getSlots().find((slot) => slot.id === Number(slotId)) || null;
}

function getSlotByCode(slotCode) {
  return db.getSlots().find((slot) => slot.code === slotCode) || null;
}

function getAvailableAreaForVehicle(vehicleMeta, gate) {
  const areaByGate = db.getAreas().find(
    (area) =>
      area.floorCode === gate.floorCode &&
      normalizeCode(area.vehicleTypeName).includes(
        normalizeCode(vehicleMeta.name).split(" ")[0]
      ) &&
      area.status === "ACTIVE"
  );

  if (areaByGate) {
    return areaByGate;
  }

  return (
    db.getAreas().find(
      (area) =>
        normalizeCode(area.vehicleTypeName).includes(
          normalizeCode(vehicleMeta.name).split(" ")[0]
        ) && area.status === "ACTIVE"
    ) || null
  );
}

function getAvailableSlotForCode(areaCode, vehicleMeta, preferredSlotCode = null) {
  const slots = db.getSlots();

  if (preferredSlotCode) {
    const preferred = slots.find(
      (slot) => slot.code === preferredSlotCode && slot.status === "AVAILABLE"
    );
    if (preferred) {
      return preferred;
    }
  }

  const areaSlot = slots.find(
    (slot) =>
      slot.areaCode === areaCode &&
      slot.status === "AVAILABLE" &&
      normalizeCode(slot.vehicleTypeName).includes(
        normalizeCode(vehicleMeta.name).split(" ")[0]
      )
  );

  if (areaSlot) {
    return areaSlot;
  }

  return (
    slots.find(
      (slot) =>
        slot.status === "AVAILABLE" &&
        normalizeCode(slot.vehicleTypeName).includes(
          normalizeCode(vehicleMeta.name).split(" ")[0]
        )
    ) || null
  );
}

function getCardOrThrow(cardCode) {
  const card = db
    .getCards()
    .find((item) => normalizeCode(item.code) === normalizeCode(cardCode));

  if (!card) {
    throw new Error("Khong tim thay the.");
  }

  return card;
}

function ensureCardAvailable(cardCode) {
  const cards = db.getCards();
  const card = cards.find(
    (item) => normalizeCode(item.code) === normalizeCode(cardCode)
  );

  if (!card) {
    throw new Error("Khong tim thay the.");
  }

  if (card.status !== "AVAILABLE") {
    throw new Error(
      `The ${normalizeCode(card.code)} dang o trang thai ${card.status}.`
    );
  }

  const hasActiveSession = sessionDb.getSessions().some(
    (session) =>
      session.status === "ACTIVE" &&
      normalizeCode(session.cardCode) === normalizeCode(card.code)
  );

  if (hasActiveSession) {
    throw new Error(`The ${normalizeCode(card.code)} dang co phien hoat dong.`);
  }

  return { cards, card };
}

function getActiveMonthlyPassByCard(cardCode) {
  const now = new Date(getSimTime());
  const today = Number.isNaN(now.getTime()) ? new Date() : now;
  const mappedPassId = MONTHLY_CARD_PASS_MAP[normalizeCode(cardCode)];

  return (
    db.getMonthlyPasses().find((pass) => {
      const endDate = new Date(`${pass.endDate}T23:59:59`);
      if (
        pass.status !== "ACTIVE" ||
        Number.isNaN(endDate.getTime()) ||
        endDate < today
      ) {
        return false;
      }

      return mappedPassId != null && Number(pass.id) === Number(mappedPassId);
    }) || null
  );
}

function getBookingByCode(reservationCode) {
  return ensureDemoBookings().find(
    (booking) => normalizeCode(booking.id) === normalizeCode(reservationCode)
  );
}

function buildSuggestion(vehicleTypeId, entryGateId) {
  const gate = getGateOrThrow(entryGateId);
  const vehicleMeta = getVehicleMeta(vehicleTypeId);

  if (vehicleMeta.requiresSlot) {
    const slot = getAvailableSlotForCode("B2-A", vehicleMeta);
    if (!slot) {
      throw new Error("Khong con slot trong phu hop.");
    }

    const area = getAreaByCode(slot.areaCode);
    if (!area) {
      throw new Error("Khong xac dinh duoc khu vuc do xe.");
    }

    return {
      suggestionType: "SLOT",
      vehicleTypeId: vehicleMeta.id,
      entryGateId: Number(entryGateId),
      suggestedFloorId: area.floorId,
      suggestedFloorCode: slot.floorCode,
      suggestedAreaId: area.id,
      suggestedAreaCode: area.code,
      suggestedSlotId: slot.id,
      suggestedSlotCode: slot.code,
      availableCapacity: 1,
      totalCapacity: 1,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      suggestionToken: encodeToken({
        suggestionType: "SLOT",
        entryGateId: Number(entryGateId),
        vehicleTypeId: vehicleMeta.id,
        suggestedFloorId: area.floorId,
        suggestedAreaId: area.id,
        suggestedSlotId: slot.id,
        issuedToStaffId: 1,
        issuedAt: getSimTime(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      }),
    };
  }

  const area = getAvailableAreaForVehicle(vehicleMeta, gate);
  if (!area) {
    throw new Error("Khong con khu vuc trong phu hop.");
  }

  return {
    suggestionType: "AREA",
    vehicleTypeId: vehicleMeta.id,
    entryGateId: Number(entryGateId),
    suggestedFloorId: area.floorId,
    suggestedFloorCode: area.floorCode,
    suggestedAreaId: area.id,
    suggestedAreaCode: area.code,
    suggestedSlotId: null,
    suggestedSlotCode: null,
    availableCapacity: null,
    totalCapacity: null,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    suggestionToken: encodeToken({
      suggestionType: "AREA",
      entryGateId: Number(entryGateId),
      vehicleTypeId: vehicleMeta.id,
      suggestedFloorId: area.floorId,
      suggestedAreaId: area.id,
      suggestedSlotId: null,
      issuedToStaffId: 1,
      issuedAt: getSimTime(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    }),
  };
}

function assignFromPayload(payload) {
  const area = payload.selectedAreaId ? getAreaById(payload.selectedAreaId) : null;
  const slot = payload.selectedSlotId ? getSlotById(payload.selectedSlotId) : null;
  const resolvedArea = area || (slot ? getAreaByCode(slot.areaCode) : null);

  if (!resolvedArea) {
    throw new Error("Khong xac dinh duoc vi tri do xe.");
  }

  return {
    floorCode: slot?.floorCode || resolvedArea.floorCode,
    areaCode: resolvedArea.code,
    slotCode: slot?.code || resolvedArea.code,
    slotId: slot?.id || null,
  };
}

function reserveSlotForSession(slotId, sessionCode) {
  if (!slotId) {
    return null;
  }

  const slots = db.getSlots();
  const slot = slots.find((item) => item.id === Number(slotId));

  if (!slot) {
    throw new Error("Khong tim thay slot duoc chon.");
  }

  if (slot.status !== "AVAILABLE") {
    throw new Error(`Slot ${slot.code} khong san sang cho entry.`);
  }

  slot.status = "OCCUPIED";
  slot.sessionCode = sessionCode;
  db.saveSlots(slots);
  return slot;
}

function createEntrySession(payload, assignment, customerType) {
  const sessions = sessionDb.getSessions();
  const sessionCode = `SE-${new Date(getSimTime())
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")}-${String(sessions.length + 1).padStart(3, "0")}`;

  const plateNumber =
    normalizeText(payload.licensePlate) ||
    normalizeText(payload.detectedPlateNumber) ||
    (payload.noPlate ? "NO-PLATE" : "");

  const vehicleMeta = getVehicleMeta(payload.vehicleTypeId);
  const reservedSlot = reserveSlotForSession(assignment.slotId, sessionCode);

  const session = {
    id: Date.now(),
    sessionCode,
    plateNumber,
    cardCode: normalizeCode(payload.cardCode),
    qrToken: `qr-${normalizeCode(payload.cardCode).toLowerCase()}`,
    vehicleTypeName: vehicleMeta.name,
    customerType,
    entryTime: getSimTime(),
    exitTime: null,
    floorCode: reservedSlot?.floorCode || assignment.floorCode,
    areaCode: reservedSlot?.areaCode || assignment.areaCode,
    slotCode: reservedSlot?.code || assignment.slotCode,
    paymentStatus: customerType === "CASUAL" ? "UNPAID" : "PAID",
    status: "ACTIVE",
    entryGateCode: getGateOrThrow(payload.entryGateId).code,
    exitGateCode: null,
    monthlyPassId: payload.monthlyPassId || null,
    entryPlateImageDataUrl: payload.entryPlateImageUrl || null,
    entryVehicleImageDataUrl: payload.entryVehicleImageUrl || null,
  };

  sessions.push(session);
  sessionDb.saveSessions(sessions);
  return session;
}

function handleCreateEntry(payload) {
  const { cards, card } = ensureCardAvailable(payload.cardCode);
  getGateOrThrow(payload.entryGateId);
  getVehicleMeta(payload.vehicleTypeId);

  let customerType = "CASUAL";
  let assignment = null;

  if (payload.entryMode === "CASUAL") {
    const suggestion = decodeToken(payload.suggestionToken);
    ensureTokenNotExpired(suggestion, "Suggestion token da het han.");
    if (
      Number(suggestion.entryGateId) !== Number(payload.entryGateId) ||
      Number(suggestion.vehicleTypeId) !== Number(payload.vehicleTypeId)
    ) {
      throw new Error("Suggestion token khong khop cong vao.");
    }
    if (
      Number(suggestion.suggestedAreaId ?? 0) !== Number(payload.selectedAreaId ?? 0)
    ) {
      throw new Error("Suggestion token khong khop khu vuc duoc chon.");
    }
    if (
      Number(suggestion.suggestedSlotId ?? 0) !== Number(payload.selectedSlotId ?? 0)
    ) {
      throw new Error("Suggestion token khong khop vi tri slot duoc chon.");
    }
    assignment = assignFromPayload(payload);
  } else if (payload.entryMode === "MONTHLY") {
    const monthlyPass = getActiveMonthlyPassByCard(payload.cardCode);
    if (!monthlyPass || Number(monthlyPass.id) !== Number(payload.monthlyPassId)) {
      throw new Error("Khong xac minh duoc ve thang cho the nay.");
    }

    const token = decodeToken(payload.monthlyEntryToken);
    ensureTokenNotExpired(token, "Monthly entry token da het han.");
    if (
      Number(token.monthlyPassId) !== Number(monthlyPass.id) ||
      Number(token.entryGateId) !== Number(payload.entryGateId) ||
      Number(token.vehicleTypeId) !== Number(payload.vehicleTypeId) ||
      Number(token.fixedAreaId ?? 0) !== Number(payload.selectedAreaId ?? 0) ||
      Number(token.fixedSlotId ?? 0) !== Number(payload.selectedSlotId ?? 0)
    ) {
      throw new Error("Monthly entry token khong hop le.");
    }

    customerType = "MONTHLY";
    assignment = assignFromPayload(payload);
  } else if (payload.entryMode === "RESERVATION") {
    const token = decodeToken(payload.reservationEntryToken);
    ensureTokenNotExpired(token, "Reservation entry token da het han.");
    const booking = getBookingByCode(token.reservationCode);
    if (
      !booking ||
      booking.status !== "CONFIRMED" ||
      Number(token.entryGateId) !== Number(payload.entryGateId) ||
      Number(token.vehicleTypeId) !== Number(payload.vehicleTypeId) ||
      Number(token.reservedAreaId ?? 0) !== Number(payload.selectedAreaId ?? 0) ||
      Number(token.reservedSlotId ?? 0) !== Number(payload.selectedSlotId ?? 0)
    ) {
      throw new Error("Reservation khong con hop le de check-in.");
    }

    customerType = "RESERVATION";
    assignment = assignFromPayload(payload);

    const bookings = ensureDemoBookings();
    const target = bookings.find(
      (item) => normalizeCode(item.id) === normalizeCode(token.reservationCode)
    );
    if (target) {
      target.status = "CHECKED_IN";
      target.checkInTime = getSimTime();
      target.cardCode = normalizeCode(payload.cardCode);
      target.plate = normalizeText(payload.licensePlate) || target.plate;
      db.saveBookings(bookings);
    }
  } else {
    throw new Error("Entry mode khong duoc ho tro.");
  }

  const session = createEntrySession(payload, assignment, customerType);
  card.status = "IN_USE";
  card.updatedAt = getSimTime();
  card.activeSession = {
    sessionCode: session.sessionCode,
    plate: session.plateNumber,
  };
  db.saveCards(cards);

  sessionDb.addAuditLog(
    "staff01",
    "PARKING_SESSION_ENTRY_CREATED",
    `Tao phien ${session.sessionCode} cho xe ${session.plateNumber}`,
    "INFO",
    "STAFF"
  );

  return session;
}

export const staffHandlers = [
  ...enabled(
    MOCK_FLAGS.STAFF_ENTRY,
    http.get(
      `${API_BASE_URLS.core}/cards/:cardCode/entry-check`,
      async ({ params, request }) => {
        await delay(200);

        try {
          const entryGateId = new URL(request.url).searchParams.get("entryGateId");
          getGateOrThrow(entryGateId);
          const card = getCardOrThrow(params.cardCode);

          if (card.status !== "AVAILABLE") {
            return badRequest(
              `The ${normalizeCode(card.code)} dang o trang thai ${card.status}.`
            );
          }

          const monthlyPass = getActiveMonthlyPassByCard(card.code);

          if (!monthlyPass) {
            return ok({
              cardId: card.id,
              cardCode: card.code,
              entryCardType: "CASUAL",
              monthlyPassId: null,
              monthlyEntryToken: null,
              plateNumber: null,
              vehicleTypeId: null,
              fixedAreaId: null,
              fixedAreaCode: null,
              fixedSlotId: null,
              fixedSlotCode: null,
            });
          }

          const fixedArea = monthlyPass.areaId ? getAreaById(monthlyPass.areaId) : null;
          const fixedSlot = monthlyPass.slotId ? getSlotById(monthlyPass.slotId) : null;

          return ok({
            cardId: card.id,
            cardCode: card.code,
            entryCardType: "MONTHLY",
            monthlyPassId: monthlyPass.id,
            monthlyEntryToken: encodeToken({
              monthlyPassId: monthlyPass.id,
              cardId: card.id,
              cardCode: card.code,
              entryGateId: Number(entryGateId),
              vehicleTypeId: monthlyPass.vehicleTypeId,
              fixedFloorId: fixedArea?.floorId || null,
              fixedAreaId: fixedArea?.id || null,
              fixedSlotId: fixedSlot?.id || null,
              issuedToStaffId: 1,
              issuedAt: getSimTime(),
              expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            }),
            plateNumber: monthlyPass.plate,
            vehicleTypeId: monthlyPass.vehicleTypeId,
            vehicleTypeName: monthlyPass.vehicleTypeName,
            fixedAreaId: fixedArea?.id || null,
            fixedAreaCode: fixedArea?.code || null,
            fixedSlotId: fixedSlot?.id || null,
            fixedSlotCode: fixedSlot?.code || null,
          });
        } catch (error) {
          return badRequest(error.message || "Khong the kiem tra the.");
        }
      }
    )
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_ENTRY,
    http.get(
      `${API_BASE_URLS.core}/reservations/:reservationCode/entry-check`,
      async ({ params, request }) => {
        await delay(200);

        try {
          const entryGateId = new URL(request.url).searchParams.get("entryGateId");
          getGateOrThrow(entryGateId);
          const booking = getBookingByCode(params.reservationCode);
          const normalizedReservationCode = normalizeCode(params.reservationCode);

          if (!booking) {
            return ok({
              status: "NOT_FOUND",
              reservationId: null,
              reservationCode: normalizedReservationCode,
              reservationEntryToken: null,
              canConvertToCasual: false,
              vehicleTypeId: null,
              requiresSlot: false,
              plateNumber: null,
              normalizedPlateNumber: null,
              plateRequiredAtEntry: false,
              reservedFloorId: null,
              reservedFloorCode: null,
              reservedAreaId: null,
              reservedAreaCode: null,
              reservedSlotId: null,
              reservedSlotCode: null,
              expiresAt: null,
            });
          }

          const vehicleMeta = getVehicleMeta(getBookingVehicleTypeId(booking));
          const area = getAreaByCode(booking.areaCode);
          const slot =
            getSlotByCode(booking.internalSlotCode) ||
            getAvailableSlotForCode(booking.areaCode, vehicleMeta);
          const reservationId =
            parseId(String(booking.id).replace(/\D/g, "")) || Date.now();

          const commonPayload = {
            reservationId,
            reservationCode: booking.id,
            canConvertToCasual: false,
            plateNumber: booking.plate,
            normalizedPlateNumber: booking.plate
              ? normalizeCode(booking.plate).replace(/[^A-Z0-9]/g, "")
              : null,
            vehicleTypeId: vehicleMeta.id,
            vehicleTypeName: booking.vehicleTypeName,
            requiresSlot: vehicleMeta.requiresSlot,
            plateRequiredAtEntry: vehicleMeta.requiresSlot || Boolean(booking.plate),
            reservedFloorId: area?.floorId || null,
            reservedFloorCode: area?.floorCode || null,
            reservedAreaId: area?.id || null,
            reservedAreaCode: area?.code || booking.areaCode || null,
            reservedSlotId: slot?.id || null,
            reservedSlotCode: slot?.code || booking.internalSlotCode || null,
          };

          if (booking.status === "CHECKED_IN") {
            return ok({
              ...commonPayload,
              status: "ALREADY_CHECKED_IN",
              reservationEntryToken: null,
              expiresAt: null,
            });
          }

          if (booking.status === "EXPIRED") {
            return ok({
              ...commonPayload,
              status: "EXPIRED",
              canConvertToCasual: true,
              reservationEntryToken: null,
              expiresAt: booking.paidAt || null,
            });
          }

          if (booking.status !== "CONFIRMED") {
            return ok({
              ...commonPayload,
              status: "PAYMENT_PENDING",
              reservationEntryToken: null,
              expiresAt: null,
            });
          }

          return ok({
            ...commonPayload,
            status: "VALID",
            expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
            reservationEntryToken: encodeToken({
              reservationCode: booking.id,
              reservationId,
              entryGateId: Number(entryGateId),
              vehicleTypeId: vehicleMeta.id,
              reservedFloorId: area?.floorId || null,
              reservedAreaId: area?.id || null,
              reservedSlotId: slot?.id || null,
              issuedToStaffId: 1,
              issuedAt: getSimTime(),
              expiresAt: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
            }),
          });
        } catch (error) {
          return badRequest(error.message || "Khong the kiem tra reservation.");
        }
      }
    )
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_ENTRY,
    http.get(
      `${API_BASE_URLS.core}/parking-sessions/location-suggestion`,
      async ({ request }) => {
        await delay(200);

        try {
          const url = new URL(request.url);
          const vehicleTypeId = url.searchParams.get("vehicleTypeId");
          const entryGateId = url.searchParams.get("entryGateId");
          return ok(buildSuggestion(vehicleTypeId, entryGateId));
        } catch (error) {
          return badRequest(error.message || "Khong the lay goi y vi tri.");
        }
      }
    )
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_ENTRY,
    http.post(`${API_BASE_URLS.core}/parking-sessions/entry`, async ({ request }) => {
      await delay(200);

      try {
        const payload = await request.json();
        const session = handleCreateEntry(payload);
        return ok(session, "Tao phien vao bai thanh cong.");
      } catch (error) {
        return badRequest(error.message || "Khong the tao phien vao bai.");
      }
    })
  ),

];
