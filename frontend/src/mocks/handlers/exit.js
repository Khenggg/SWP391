import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, notFound, enabled } from "./helpers";
import { exitMockData } from "../data/exitData";
import { sessionDb } from "./sessionUtils";

export const exitHandlers = [
  ...enabled(
    MOCK_FLAGS.STAFF_SESSION_BY_PLATE,
    http.get(`${API_BASE_URLS.core}/parking-sessions/active/by-plate`, async ({ request }) => {
      await delay(300);
      const url = new URL(request.url);
      const plateNumber = url.searchParams.get("plateNumber");

      if (!plateNumber) return badRequest("Thieu bien so xe.");

      // Check against mock data, e.g. from exitMockData
      if (exitMockData.sessionMonthly.plateNumber.includes(plateNumber)) {
        return ok(exitMockData.sessionMonthly, "Tim kiem phien gui xe qua bien so thanh cong.");
      }

      // For any other plate, generate a generic mock session
      return ok({
        ...exitMockData.sessionCasual,
        plateNumber: plateNumber.toUpperCase(),
        sessionCode: `SS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        isCardLost: true, // Simulating a lost card for testing
      }, "Tim kiem phien gui xe qua bien so thanh cong.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.get(`${API_BASE_URLS.core}/parking-sessions/by-card-code/:cardCode`, async ({ params }) => {
      await delay(300);
      const { cardCode } = params;
      if (cardCode === exitMockData.sessionCasual.cardCode) {
        return ok(exitMockData.sessionCasual, "Tim kiem phien gui xe theo the vãng lai thanh cong.");
      }
      if (cardCode === exitMockData.sessionMonthly.cardCode) {
        return ok(exitMockData.sessionMonthly, "Tim kiem phien gui xe theo the vé tháng thanh cong.");
      }
      return badRequest("Khong tim thay phien hoat dong cho the nay.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/parking-sessions/:id/calculate-fee`, async () => {
      await delay(300);
      return ok(exitMockData.feeCalculation, "Tinh phi gui xe thanh cong.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/payments/cash`, async () => {
      await delay(300);
      return ok(exitMockData.cashPayment, "Cash payment recorded successfully.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/payments/online/exit-fee`, async () => {
      await delay(300);
      return ok(exitMockData.onlinePayment, "Online payment link created successfully.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/parking-sessions/:id/exit`, async () => {
      await delay(300);
      return ok(exitMockData.exitResponse, "Cho xe ra bai thanh cong (vãng lai).");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/parking-sessions/:id/monthly-pass-exit`, async () => {
      await delay(300);
      return ok(exitMockData.exitResponse, "Cho xe ra bai thanh cong (vé tháng).");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/parking-sessions/:id/mismatch-case`, async ({ params, request }) => {
      await delay(300);
      const { exitPlateNumber, reason } = await request.json();
      const sessionId = Number(params.id);
      const cases = sessionDb.getMismatch();
      const newCase = {
        id: Date.now(),
        caseCode: `MM-${Date.now()}`,
        sessionId,
        exitPlateNumber,
        reason,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      cases.unshift(newCase);
      sessionDb.saveMismatch(cases);
      return ok(newCase, "Đã tạo hồ sơ lệch biển số thành công.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.post(`${API_BASE_URLS.core}/plate-mismatches`, async ({ request }) => {
      await delay(300);
      const body = await request.json();
      const cases = sessionDb.getMismatch();
      const newCase = {
        id: Date.now(),
        caseCode: `MM-${Date.now()}`,
        sessionId: Number(body.sessionId),
        entryPlateNumber: body.entryPlateNumber || "51A-12345",
        exitPlateNumber: body.exitPlateNumber,
        reason: body.reason,
        exitPlateImageUrl: body.exitPlateImageUrl || null,
        exitVehicleImageUrl: body.exitVehicleImageUrl || null,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      cases.unshift(newCase);
      sessionDb.saveMismatch(cases);
      return ok(newCase, "Đã gửi yêu cầu báo cáo lệch biển số thành công.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.get(`${API_BASE_URLS.core}/plate-mismatches`, async ({ request }) => {
      await delay(250);
      const url = new URL(request.url);
      const status = url.searchParams.get("status");
      let cases = sessionDb.getMismatch();
      if (status) {
        cases = cases.filter((c) => c.status === status.toUpperCase());
      }
      return ok({ items: cases, page: 1, pageSize: 20 }, "Get plate mismatch cases successfully.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.get(`${API_BASE_URLS.core}/plate-mismatch-cases`, async () => {
      await delay(250);
      const cases = sessionDb.getMismatch();
      return ok(cases, "Get plate mismatch cases successfully.");
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.get(`${API_BASE_URLS.core}/plate-mismatches/session/:sessionId/status`, async ({ params }) => {
      await delay(200);
      const sessionId = Number(params.sessionId);
      const cases = sessionDb.getMismatch();
      const match = cases.find((c) => Number(c.sessionId) === sessionId);
      if (!match) {
        return ok({ status: "NONE", managerReason: null, rejectionReason: null });
      }
      return ok({
        id: match.id,
        sessionId: match.sessionId,
        status: match.status,
        entryPlateNumber: match.entryPlateNumber,
        exitPlateNumber: match.exitPlateNumber,
        managerReason: match.rejectionReason || match.managerReason || null,
        rejectionReason: match.rejectionReason || null,
      });
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.get(`${API_BASE_URLS.core}/plate-mismatches/:id`, async ({ params }) => {
      await delay(250);
      const id = Number(params.id);
      const cases = sessionDb.getMismatch();
      const match = cases.find((c) => Number(c.id) === id);
      if (!match) return notFound("Mismatch case not found.");

      const sessions = sessionDb.getSessions();
      const session = sessions.find((s) => Number(s.id) === Number(match.sessionId));

      return ok({
        ...match,
        entryPlateImageUrl: match.entryPlateImageUrl || session?.entryPlateImageDataUrl || null,
        entryVehicleImageUrl: match.entryVehicleImageUrl || session?.entryVehicleImageDataUrl || null,
        exitPlateImageUrl: match.exitPlateImageUrl || null,
        exitVehicleImageUrl: match.exitVehicleImageUrl || null,
      });
    })
  ),

  ...enabled(
    MOCK_FLAGS.STAFF_EXIT,
    http.patch(`${API_BASE_URLS.core}/plate-mismatches/:id/status`, async ({ params, request }) => {
      await delay(250);
      const id = Number(params.id);
      const body = await request.json();
      const cases = sessionDb.getMismatch();
      const match = cases.find((c) => Number(c.id) === id);
      if (!match) return notFound("Mismatch case not found.");

      match.status = body.status === "CONFIRMED" ? "CONFIRMED" : body.status;
      match.rejectionReason = body.rejectionReason || body.reason || null;
      match.confirmedAt = new Date().toISOString();
      sessionDb.saveMismatch(cases);
      return ok(match, "Plate mismatch case processed successfully.");
    })
  )
];
