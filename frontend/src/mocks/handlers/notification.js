import { http, delay } from "msw";
import { MOCK_FLAGS, API_BASE_URLS } from "../mockConfig";
import { enabled, ok, notFound } from "./helpers";
import { mockNotifications } from "../data/notificationData";

export const notificationHandlers = [
  ...enabled(
    MOCK_FLAGS.NOTIFICATIONS,
    http.get(`${API_BASE_URLS.notifications}/:userId`, async ({ params }) => {
      await delay(300);
      const userId = Number(params.userId);
      const userNotifications = mockNotifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return ok(userNotifications);
    })
  ),

  ...enabled(
    MOCK_FLAGS.NOTIFICATIONS,
    http.get(`${API_BASE_URLS.notifications}/:userId/unread`, async ({ params }) => {
      await delay(300);
      const userId = Number(params.userId);
      const unreadNotifications = mockNotifications.filter(n => n.userId === userId && !n.isRead).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return ok(unreadNotifications);
    })
  ),

  ...enabled(
    MOCK_FLAGS.NOTIFICATIONS,
    http.patch(`${API_BASE_URLS.notifications}/:id/read`, async ({ params }) => {
      await delay(300);
      const id = Number(params.id);
      const notificationIndex = mockNotifications.findIndex(n => n.id === id);
      
      if (notificationIndex === -1) {
        return notFound("Không tìm thấy thông báo.");
      }

      mockNotifications[notificationIndex].isRead = true;
      mockNotifications[notificationIndex].readAt = new Date().toISOString();
      return ok(null);
    })
  ),
];
