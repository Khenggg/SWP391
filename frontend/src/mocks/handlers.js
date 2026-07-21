import { authHandlers } from "./handlers/auth";
import { publicHandlers } from "./handlers/public";
import { driverHandlers } from "./handlers/driver";
import { managerHandlers } from "./handlers/manager";
import { staffHandlers } from "./handlers/staff";
import { adminHandlers } from "./handlers/admin";
import { reservationHandlers } from "./handlers/reservation";
import { exitHandlers } from "./handlers/exit";
import { notificationHandlers } from "./handlers/notification";

export const handlers = [
  ...authHandlers,
  ...publicHandlers,
  ...driverHandlers,
  ...managerHandlers,
  ...staffHandlers,
  ...adminHandlers,
  ...reservationHandlers,
  ...exitHandlers,
  ...notificationHandlers,
];
