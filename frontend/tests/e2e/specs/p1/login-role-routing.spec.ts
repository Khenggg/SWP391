import { test, expect } from "@playwright/test";
import {
  login,
  loginAsAdmin,
  loginAsManager,
  loginAsStaff,
  loginAsDriver,
  logout,
  getTestCredentials,
} from "../../support/auth";
import { USER_ROLES } from "../../../../src/constants";

test.describe("Epic 1: Authentication & Role Routing", () => {
  test.describe("Authentication Flows (Negative Cases)", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("shows error with invalid credentials", async ({ page }) => {
      await login(page, "invalid_user_123", "wrongpassword");
      
      // Verify error alert appears
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      await expect(alert).toContainText("Tên đăng nhập hoặc mật khẩu không chính xác");
    });

    test("enforces required fields validation", async ({ page }) => {
      const loginButton = page.getByRole("button", { name: "Đăng nhập" });
      const usernameInput = page.getByPlaceholder("Tên đăng nhập / Email / Số điện thoại");
      const passwordInput = page.getByPlaceholder("Mật khẩu");

      // Try submitting empty form
      await loginButton.click();
      
      // The browser prevents submission and sets the field to invalid
      // We can evaluate the validity state
      const isUsernameValid = await usernameInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isUsernameValid).toBeFalsy();

      // Fill username, leave password empty
      await usernameInput.fill("testuser");
      await loginButton.click();

      const isPasswordValid = await passwordInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(isPasswordValid).toBeFalsy();
    });
  });

  test.describe("Role Routing (Happy Path)", () => {
    test("redirects Admin to user management", async ({ page }) => {
      await loginAsAdmin(page);
      await expect(page).toHaveURL(/.*\/admin\/users/);
    });

    test("redirects Manager to dashboard", async ({ page }) => {
      await loginAsManager(page);
      await expect(page).toHaveURL(/.*\/manager\/dashboard/);
    });

    test("redirects Staff to entry page", async ({ page }) => {
      await loginAsStaff(page);
      await expect(page).toHaveURL(/.*\/staff\/entry/);
    });

    test("redirects Driver to profile", async ({ page }) => {
      await loginAsDriver(page);
      await expect(page).toHaveURL(/.*\/driver\/profile/);
    });
  });

  test.describe("Session Persistence & Logout", () => {
    test("persists session after reload and successfully logs out", async ({ page }) => {
      await loginAsStaff(page);
      await expect(page).toHaveURL(/.*\/staff\/entry/);

      // Reload page to verify session persistence
      await page.reload();
      await expect(page).toHaveURL(/.*\/staff\/entry/);

      // Log out
      await logout(page);
      
      // Verify redirected to login
      await expect(page).toHaveURL(/.*\/login/);

      // Try going back to protected route, should redirect to login
      await page.goto("/staff/entry");
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe("Route Guards", () => {
    test("redirects guest trying to access protected routes to login", async ({ page }) => {
      await page.goto("/manager/dashboard");
      await expect(page).toHaveURL(/.*\/login/);

      await page.goto("/admin/users");
      await expect(page).toHaveURL(/.*\/login/);
    });

    test("redirects unauthorized roles trying to access restricted routes to unauthorized page", async ({ page }) => {
      // Login as Staff (should not have Admin or Manager access)
      await loginAsStaff(page);
      await expect(page).toHaveURL(/.*\/staff\/entry/);

      // Attempt to access Admin page
      await page.goto("/admin/users");
      await expect(page).toHaveURL(/.*\/unauthorized/);

      // Attempt to access Manager dashboard
      await page.goto("/manager/dashboard");
      await expect(page).toHaveURL(/.*\/unauthorized/);
    });
  });
});
