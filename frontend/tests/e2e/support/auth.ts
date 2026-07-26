import { Page, expect } from "@playwright/test";
import { USER_ROLES } from "../../../src/constants";

/**
 * Returns test credentials from environment variables or defaults to standard seeded users.
 */
export function getTestCredentials(role: string) {
  switch (role) {
    case USER_ROLES.ADMIN:
      return {
        username: process.env.TEST_ADMIN_USERNAME || "admin",
        password: process.env.TEST_ADMIN_PASSWORD || "admin123",
      };
    case USER_ROLES.MANAGER:
      return {
        username: process.env.TEST_MANAGER_USERNAME || "manager",
        password: process.env.TEST_MANAGER_PASSWORD || "manager123",
      };
    case USER_ROLES.STAFF:
      return {
        username: process.env.TEST_STAFF_USERNAME || "staff1",
        password: process.env.TEST_STAFF_PASSWORD || "staff123",
      };
    case USER_ROLES.DRIVER:
      return {
        username: process.env.TEST_DRIVER_USERNAME || "driver1",
        password: process.env.TEST_DRIVER_PASSWORD || "driver123",
      };
    default:
      throw new Error(`Unsupported test role: ${role}`);
  }
}

/**
 * Helper to perform login via the UI using provided credentials.
 */
export async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  
  // Prefer placeholder since data-testid is missing in LoginPage.jsx
  await page.getByPlaceholder("Tên đăng nhập / Email / Số điện thoại").fill(username);
  await page.getByPlaceholder("Mật khẩu").fill(password);
  
  // Submit login form
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

/**
 * Logs in as an Admin user.
 */
export async function loginAsAdmin(page: Page) {
  const credentials = getTestCredentials(USER_ROLES.ADMIN);
  await login(page, credentials.username, credentials.password);
}

/**
 * Logs in as a Manager user.
 */
export async function loginAsManager(page: Page) {
  const credentials = getTestCredentials(USER_ROLES.MANAGER);
  await login(page, credentials.username, credentials.password);
}

/**
 * Logs in as a Staff user.
 */
export async function loginAsStaff(page: Page) {
  const credentials = getTestCredentials(USER_ROLES.STAFF);
  await login(page, credentials.username, credentials.password);
}

/**
 * Logs in as a Driver user.
 */
export async function loginAsDriver(page: Page) {
  const credentials = getTestCredentials(USER_ROLES.DRIVER);
  await login(page, credentials.username, credentials.password);
}

/**
 * Logs out the current user via the UI.
 */
export async function logout(page: Page) {
  // Set up dialog handler to accept window.confirm before triggering the action
  page.once("dialog", dialog => dialog.accept());
  
  const logoutButton = page.getByRole("button", { name: "Đăng xuất" });
  await logoutButton.click();
}
