import { http, delay } from "msw";
import { MOCK_FLAGS, API_BASE_URLS } from "../mockConfig";
import { enabled, ok, notFound } from "./helpers";
import { mockNotifications } from "../data/notificationData";

function filterNotificationsForUser(paramUserId) {
  const strVal = String(paramUserId || "").trim();
  const numVal = Number(paramUserId);

  return mockNotifications
    .filter((n) => {
      if (
        strVal === "2" ||
        strVal === "staff01" ||
        strVal === "STAFF" ||
        strVal === "" ||
        strVal === "undefined" ||
        strVal === "null"
      ) {
        return (
          n.userId === 2 ||
          n.userId === "staff01" ||
          n.staffUser === "staff01" ||
          n.targetRole === "STAFF"
        );
      }
      return String(n.userId) === strVal || n.userId === numVal;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export const notificationHandlers = [
  ...enabled(
    MOCK_FLAGS.NOTIFICATIONS,
    http.get(`${API_BASE_URLS.notifications}/:userId`, async ({ params }) => {
      await delay(200);
      const userNotifications = filterNotificationsForUser(params.userId);
      return ok(userNotifications);
    })
  ),

  ...enabled(
    MOCK_FLAGS.NOTIFICATIONS,
    http.get(`${API_BASE_URLS.notifications}/:userId/unread`, async ({ params }) => {
      await delay(200);
      const userNotifications = filterNotificationsForUser(params.userId);
      const unread = userNotifications.filter((n) => !n.isRead);
      return ok(unread);
    })
  ),

  ...enabled(
    MOCK_FLAGS.NOTIFICATIONS,
    http.patch(`${API_BASE_URLS.notifications}/:id/read`, async ({ params }) => {
      await delay(200);
      const id = Number(params.id);
      const notificationIndex = mockNotifications.findIndex((n) => n.id === id);

      if (notificationIndex === -1) {
        return notFound("Không tìm thấy thông báo.");
      }

      mockNotifications[notificationIndex].isRead = true;
      mockNotifications[notificationIndex].readAt = new Date().toISOString();
      return ok(null);
    })
  ),
];
