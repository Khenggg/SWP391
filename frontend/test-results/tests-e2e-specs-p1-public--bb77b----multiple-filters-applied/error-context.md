# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\e2e\specs\p1\public-pages.spec.ts >> Public Pages Acceptance Suite >> Available Slots >> 4.5 Combined Filters - multiple filters applied
- Location: tests\e2e\specs\p1\public-pages.spec.ts:208:5

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/slots?vehicleTypeId=2&floorId=2", waiting until "load"

```

# Test source

```ts
  109 |         });
  110 |       });
  111 |     });
  112 | 
  113 |     test("verify pricing table renders correctly", async ({ page }) => {
  114 |       await page.goto("/pricing");
  115 | 
  116 |       // Verify columns/headers exist
  117 |       await expect(page.getByRole("columnheader", { name: "Motorcycle" }).or(page.getByText("Motorcycle"))).toBeVisible();
  118 |       await expect(page.getByRole("columnheader", { name: "Car" }).or(page.getByText("Car"))).toBeVisible();
  119 | 
  120 |       // Look for pricing category headers without asserting exact mock prices
  121 |       await expect(page.getByText("Day", { exact: false }).or(page.getByText("Ngày", { exact: false }))).toBeVisible();
  122 |       await expect(page.getByText("Night", { exact: false }).or(page.getByText("Đêm", { exact: false }))).toBeVisible();
  123 |       await expect(page.getByText("Monthly", { exact: false }).or(page.getByText("Tháng", { exact: false }))).toBeVisible();
  124 |       await expect(page.getByText("Lost", { exact: false }).or(page.getByText("Mất", { exact: false }))).toBeVisible();
  125 |     });
  126 |   });
  127 | 
  128 |   test.describe("Available Slots", () => {
  129 |     
  130 |     test.beforeEach(async ({ page }) => {
  131 |       // Setup dynamic mock that responds differently based on query params
  132 |       await page.route("**/api/public/available-slots*", async (route) => {
  133 |         const url = new URL(route.request().url());
  134 |         const vehicleTypeId = url.searchParams.get("vehicleTypeId");
  135 |         const areaId = url.searchParams.get("areaId");
  136 |         const floorId = url.searchParams.get("floorId");
  137 | 
  138 |         let mockData = [];
  139 | 
  140 |         // Return empty state if floor 99 is queried (Simulating no slots)
  141 |         if (floorId === "99") {
  142 |           mockData = [];
  143 |         } 
  144 |         // Simulated combined filter result
  145 |         else if (vehicleTypeId === "2" && floorId === "2") {
  146 |           mockData = [{ id: 4, slotCode: "F2-CAR-01", areaId: 2, vehicleTypeId: 2 }];
  147 |         }
  148 |         // Vehicle Type filter
  149 |         else if (vehicleTypeId === "1") {
  150 |           mockData = [{ id: 1, slotCode: "A-01", areaId: 1, vehicleTypeId: 1 }];
  151 |         }
  152 |         // Area Filter
  153 |         else if (areaId === "1") {
  154 |           mockData = [{ id: 2, slotCode: "A-02", areaId: 1, vehicleTypeId: 1 }];
  155 |         }
  156 |         // Floor Filter
  157 |         else if (floorId === "1") {
  158 |           mockData = [{ id: 3, slotCode: "F1-01", areaId: 1, vehicleTypeId: 1 }];
  159 |         }
  160 |         // Default / No Filters
  161 |         else {
  162 |           mockData = [
  163 |             { id: 1, slotCode: "DEFAULT-A-01", areaId: 1, vehicleTypeId: 1 },
  164 |             { id: 2, slotCode: "DEFAULT-A-02", areaId: 1, vehicleTypeId: 1 }
  165 |           ];
  166 |         }
  167 | 
  168 |         await route.fulfill({
  169 |           status: 200,
  170 |           json: { success: true, data: mockData },
  171 |         });
  172 |       });
  173 |     });
  174 | 
  175 |     test("4.1 Default Slot Loading - verify list appears", async ({ page }) => {
  176 |       await page.goto("/slots");
  177 |       // Assert default slots rendered
  178 |       await expect(page.getByText("DEFAULT-A-01")).toBeVisible();
  179 |       await expect(page.getByText("DEFAULT-A-02")).toBeVisible();
  180 |     });
  181 | 
  182 |     test("4.2 Vehicle Type Filter - list updates", async ({ page }) => {
  183 |       await page.goto("/slots");
  184 |       // Find the vehicle filter select/combobox
  185 |       // Using generic roles that could match typical UI frameworks
  186 |       const vehicleFilter = page.getByRole("combobox", { name: /vehicle|phương tiện/i }).first();
  187 |       // Since UI might differ, we wait for mock update after a simulated user interaction.
  188 |       // Assuming interaction triggers the param vehicleTypeId=1
  189 |       // For E2E without POM, we must be generic. Wait for network response if we do explicit actions.
  190 |       
  191 |       // Given we don't know the exact UI selector without POM, we trigger navigation directly with query params for testing,
  192 |       // OR we just assume standard selectors. Let's assume URL driven for now, or fallback to clicking a select.
  193 |       await page.goto("/slots?vehicleTypeId=1");
  194 |       
  195 |       await expect(page.getByText("A-01")).toBeVisible();
  196 |     });
  197 | 
  198 |     test("4.3 Area Filter - list updates", async ({ page }) => {
  199 |       await page.goto("/slots?areaId=1");
  200 |       await expect(page.getByText("A-02")).toBeVisible();
  201 |     });
  202 | 
  203 |     test("4.4 Floor Filter - list updates", async ({ page }) => {
  204 |       await page.goto("/slots?floorId=1");
  205 |       await expect(page.getByText("F1-01")).toBeVisible();
  206 |     });
  207 | 
  208 |     test("4.5 Combined Filters - multiple filters applied", async ({ page }) => {
> 209 |       await page.goto("/slots?vehicleTypeId=2&floorId=2");
      |                  ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  210 |       await expect(page.getByText("F2-CAR-01")).toBeVisible();
  211 |     });
  212 | 
  213 |     test("4.6 Empty State - displays message when no slots match", async ({ page }) => {
  214 |       await page.goto("/slots?floorId=99");
  215 |       // Wait for empty state component
  216 |       await expect(
  217 |         page.getByText(/no available slots|không có|trống/i)
  218 |       ).toBeVisible();
  219 |     });
  220 |   });
  221 | 
  222 | });
  223 | 
```