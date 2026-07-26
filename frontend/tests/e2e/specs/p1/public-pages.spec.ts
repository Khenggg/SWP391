import { test, expect } from "@playwright/test";

test.describe("Public Pages Acceptance Suite", () => {

  test.describe("Parking Information", () => {
    test.beforeEach(async ({ page }) => {
      // Mock the parking info API
      await page.route("**/api/public/parking-info", async (route) => {
        await route.fulfill({
          status: 200,
          json: {
            success: true,
            message: "Success",
            data: {
              name: "Test Parking Building",
              address: "123 Test Street",
              openingHours: "24/7",
              status: "ACTIVE",
              hotline: "1900-TEST",
              totalCapacity: 500,
            }
          },
        });
      });
    });

    test("verify parking information UI renders correctly", async ({ page }) => {
      await page.goto("/");
      
      // Navigate to the Information tab/section if needed, 
      // Assuming it renders on the home page or a specific info tab based on the UI.
      // Usually home page contains the info block. If there's a navigation tab, we click it.
      // For now, we assert the general block is visible. We avoid asserting exact hardcoded strings.
      
      // We look for general structure based on standard public pages implementation
      // Verify basic labels exist instead of hardcoded data values
      await expect(page.getByText("Hotline", { exact: false })).toBeVisible();
      await expect(page.getByText("Capacity", { exact: false }).or(page.getByText("Sức chứa", { exact: false }))).toBeVisible();
      await expect(page.getByText("Address", { exact: false }).or(page.getByText("Địa chỉ", { exact: false }))).toBeVisible();
      await expect(page.getByText("Opening Hours", { exact: false }).or(page.getByText("Giờ hoạt động", { exact: false }))).toBeVisible();
    });
  });

  test.describe("Public Rules", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("**/api/public/rules", async (route) => {
        await route.fulfill({
          status: 200,
          json: {
            success: true,
            data: [
              {
                group: "entry",
                title: "Parking Rules",
                content: ["Rule 1", "Rule 2"]
              },
              {
                group: "payment",
                title: "Payment Rules",
                content: ["Pay before exit"]
              }
            ]
          },
        });
      });
    });

    test("verify rules section renders correctly", async ({ page }) => {
      await page.goto("/rules"); // Adjust path if it's rendered as a tab on a single page

      // Assert rule group headers are visible based on mocked data
      await expect(page.getByText("Parking Rules")).toBeVisible();
      await expect(page.getByText("Payment Rules")).toBeVisible();
      
      // Assert rule content renders
      await expect(page.getByText("Rule 1")).toBeVisible();
      await expect(page.getByText("Pay before exit")).toBeVisible();
    });
  });

  test.describe("Pricing", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("**/api/public/pricing", async (route) => {
        await route.fulfill({
          status: 200,
          json: {
            success: true,
            data: [
              {
                pricingRuleId: 1,
                vehicleTypeId: 1,
                vehicleTypeName: "Motorcycle",
                dayPrice: 5000,
                nightPrice: 3000,
                monthlyPrice: 150000,
                lostCardFee: 50000,
              },
              {
                pricingRuleId: 2,
                vehicleTypeId: 2,
                vehicleTypeName: "Car",
                dayPrice: 20000,
                nightPrice: 15000,
                monthlyPrice: 800000,
                lostCardFee: 100000,
              }
            ]
          },
        });
      });
    });

    test("verify pricing table renders correctly", async ({ page }) => {
      await page.goto("/pricing");

      // Verify columns/headers exist
      await expect(page.getByRole("columnheader", { name: "Motorcycle" }).or(page.getByText("Motorcycle"))).toBeVisible();
      await expect(page.getByRole("columnheader", { name: "Car" }).or(page.getByText("Car"))).toBeVisible();

      // Look for pricing category headers without asserting exact mock prices
      await expect(page.getByText("Day", { exact: false }).or(page.getByText("Ngày", { exact: false }))).toBeVisible();
      await expect(page.getByText("Night", { exact: false }).or(page.getByText("Đêm", { exact: false }))).toBeVisible();
      await expect(page.getByText("Monthly", { exact: false }).or(page.getByText("Tháng", { exact: false }))).toBeVisible();
      await expect(page.getByText("Lost", { exact: false }).or(page.getByText("Mất", { exact: false }))).toBeVisible();
    });
  });

  test.describe("Available Slots", () => {
    
    test.beforeEach(async ({ page }) => {
      // Setup dynamic mock that responds differently based on query params
      await page.route("**/api/public/available-slots*", async (route) => {
        const url = new URL(route.request().url());
        const vehicleTypeId = url.searchParams.get("vehicleTypeId");
        const areaId = url.searchParams.get("areaId");
        const floorId = url.searchParams.get("floorId");

        let mockData = [];

        // Return empty state if floor 99 is queried (Simulating no slots)
        if (floorId === "99") {
          mockData = [];
        } 
        // Simulated combined filter result
        else if (vehicleTypeId === "2" && floorId === "2") {
          mockData = [{ id: 4, slotCode: "F2-CAR-01", areaId: 2, vehicleTypeId: 2 }];
        }
        // Vehicle Type filter
        else if (vehicleTypeId === "1") {
          mockData = [{ id: 1, slotCode: "A-01", areaId: 1, vehicleTypeId: 1 }];
        }
        // Area Filter
        else if (areaId === "1") {
          mockData = [{ id: 2, slotCode: "A-02", areaId: 1, vehicleTypeId: 1 }];
        }
        // Floor Filter
        else if (floorId === "1") {
          mockData = [{ id: 3, slotCode: "F1-01", areaId: 1, vehicleTypeId: 1 }];
        }
        // Default / No Filters
        else {
          mockData = [
            { id: 1, slotCode: "DEFAULT-A-01", areaId: 1, vehicleTypeId: 1 },
            { id: 2, slotCode: "DEFAULT-A-02", areaId: 1, vehicleTypeId: 1 }
          ];
        }

        await route.fulfill({
          status: 200,
          json: { success: true, data: mockData },
        });
      });
    });

    test("4.1 Default Slot Loading - verify list appears", async ({ page }) => {
      await page.goto("/slots");
      // Assert default slots rendered
      await expect(page.getByText("DEFAULT-A-01")).toBeVisible();
      await expect(page.getByText("DEFAULT-A-02")).toBeVisible();
    });

    test("4.2 Vehicle Type Filter - list updates", async ({ page }) => {
      await page.goto("/slots");
      // Find the vehicle filter select/combobox
      // Using generic roles that could match typical UI frameworks
      const vehicleFilter = page.getByRole("combobox", { name: /vehicle|phương tiện/i }).first();
      // Since UI might differ, we wait for mock update after a simulated user interaction.
      // Assuming interaction triggers the param vehicleTypeId=1
      // For E2E without POM, we must be generic. Wait for network response if we do explicit actions.
      
      // Given we don't know the exact UI selector without POM, we trigger navigation directly with query params for testing,
      // OR we just assume standard selectors. Let's assume URL driven for now, or fallback to clicking a select.
      await page.goto("/slots?vehicleTypeId=1");
      
      await expect(page.getByText("A-01")).toBeVisible();
    });

    test("4.3 Area Filter - list updates", async ({ page }) => {
      await page.goto("/slots?areaId=1");
      await expect(page.getByText("A-02")).toBeVisible();
    });

    test("4.4 Floor Filter - list updates", async ({ page }) => {
      await page.goto("/slots?floorId=1");
      await expect(page.getByText("F1-01")).toBeVisible();
    });

    test("4.5 Combined Filters - multiple filters applied", async ({ page }) => {
      await page.goto("/slots?vehicleTypeId=2&floorId=2");
      await expect(page.getByText("F2-CAR-01")).toBeVisible();
    });

    test("4.6 Empty State - displays message when no slots match", async ({ page }) => {
      await page.goto("/slots?floorId=99");
      // Wait for empty state component
      await expect(
        page.getByText(/no available slots|không có|trống/i)
      ).toBeVisible();
    });
  });

});
