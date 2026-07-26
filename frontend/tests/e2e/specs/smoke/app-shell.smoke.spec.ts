import { test, expect } from "@playwright/test";

test.describe("Epic 1: Smoke Tests", () => {
  test("application starts and public layout renders without errors", async ({ page }) => {
    // Navigate to the public root page
    await page.goto("/");
    
    // Verify the page title (assuming a standard title format)
    await expect(page).toHaveTitle(/Parking Building/i);

    // Verify header/navbar element exists on public page
    // Using an assertion on a common structural element
    const mainElement = page.getByRole('main');
    await expect(mainElement).toBeVisible();

    // Verify no blank page (body should have content)
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test("login page loads correctly", async ({ page }) => {
    await page.goto("/login");
    
    // Verify we are on the login page
    await expect(page).toHaveURL(/.*\/login/);

    // Verify key elements render
    await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder("Tên đăng nhập / Email / Số điện thoại")).toBeVisible();
    await expect(page.getByPlaceholder("Mật khẩu")).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng nhập" })).toBeVisible();
  });
});
