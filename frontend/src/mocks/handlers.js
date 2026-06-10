import { delay, http, HttpResponse } from "msw";
import { API_BASE_URLS, isMockEnabled, MOCK_FLAGS } from "./mockConfig";
import { areas, parkingInfo, pricingRules, slots } from "./data/parkingData";
import { driverBookings, driverHistory } from "./data/driverData";

const ok = (data, message = "OK") => HttpResponse.json({ success: true, message, data });

const enabled = (flagName, handler) => (isMockEnabled(flagName) ? [handler] : []);

export const handlers = [
  ...enabled(
    MOCK_FLAGS.PUBLIC_PARKING_INFO,
    http.get(`${API_BASE_URLS.public}/parking-info`, async () => {
      await delay(250);
      return ok(parkingInfo);
    })
  ),

  ...enabled(
    MOCK_FLAGS.PUBLIC_PRICING,
    http.get(`${API_BASE_URLS.public}/pricing`, async () => {
      await delay(250);
      return ok(pricingRules);
    })
  ),

  ...enabled(
    MOCK_FLAGS.PUBLIC_AVAILABLE_SLOTS,
    http.get(`${API_BASE_URLS.public}/available-slots`, async () => {
      await delay(250);
      return ok({ areas, slots });
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_BOOKINGS,
    http.get(`${API_BASE_URLS.core}/driver/bookings`, async () => {
      await delay(250);
      return ok(driverBookings);
    })
  ),

  ...enabled(
    MOCK_FLAGS.DRIVER_HISTORY,
    http.get(`${API_BASE_URLS.core}/driver/bookings/history`, async () => {
      await delay(250);
      return ok(driverHistory);
    })
  ),
];
