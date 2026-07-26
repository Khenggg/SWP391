import { test, expect } from "@playwright/test";

test.skip(true, "Scaffold only - team se thay bang smoke test that.");

test("public app shell loads", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/login/);
});
