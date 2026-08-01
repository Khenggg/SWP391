import { test, expect } from "@playwright/test";

test.describe("Public pages against real APIs", () => {
  test("home page renders", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /SWP BUILDING/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Xem Chỗ Trống Ngay/i })).toBeVisible();
  });

  test("parking information page renders", async ({ page }) => {
    await page.goto("/parking-info");

    await expect(page.getByRole("heading", { name: "THÔNG TIN BÃI XE" })).toBeVisible();
  });

  test("rules page renders", async ({ page }) => {
    await page.goto("/rules");

    await expect(page.getByRole("heading", { name: "NỘI QUY BÃI XE" })).toBeVisible();
  });

  test("pricing page renders", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { name: "BẢNG GIÁ GỬI XE" })).toBeVisible();
  });

  test("available slots page renders", async ({ page }) => {
    await page.goto("/available-slots");

    await expect(page.getByRole("heading", { name: "CHỖ TRỐNG HIỆN TẠI" })).toBeVisible();
  });
});
