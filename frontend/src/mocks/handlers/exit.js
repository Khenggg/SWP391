import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, enabled } from "./helpers";
import { exitMockData } from "../data/exitData";

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
    http.post(`${API_BASE_URLS.core}/parking-sessions/:id/mismatch-case`, async () => {
      await delay(300);
      return ok({ id: 999, status: "PENDING" }, "Đã tạo hồ sơ lệch biển số thành công.");
    })
  )
];
