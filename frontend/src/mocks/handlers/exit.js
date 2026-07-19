import { delay, http } from "msw";
import { API_BASE_URLS, MOCK_FLAGS } from "../mockConfig";
import { ok, badRequest, enabled } from "./helpers";
import { exitMockData } from "../data/exitData";

export const exitHandlers = [
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
