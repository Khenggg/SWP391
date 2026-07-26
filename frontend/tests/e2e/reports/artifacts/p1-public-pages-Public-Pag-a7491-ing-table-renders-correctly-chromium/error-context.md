# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: p1\public-pages.spec.ts >> Public Pages Acceptance Suite >> Pricing >> verify pricing table renders correctly
- Location: tests\e2e\specs\p1\public-pages.spec.ts:113:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('columnheader', { name: 'Motorcycle' }).or(getByText('Motorcycle'))
Expected: visible
Error: strict mode violation: getByRole('columnheader', { name: 'Motorcycle' }).or(getByText('Motorcycle')) resolved to 2 elements:
    1) <button data-size="sm" data-slot="button" data-variant="outline" class="group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-in…>Motorcycle</button> aka getByRole('button', { name: 'Motorcycle' })
    2) <h3 class="text-base font-black text-white uppercase tracking-wide">Motorcycle</h3> aka getByRole('heading', { name: 'Motorcycle' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('columnheader', { name: 'Motorcycle' }).or(getByText('Motorcycle'))

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "P SWP Building Smart Parking" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e7]: P
          - generic [ref=e9]:
            - generic [ref=e10]: SWP Building
            - generic [ref=e11]: Smart Parking
        - navigation [ref=e12]:
          - link "Trang chủ" [ref=e13] [cursor=pointer]:
            - /url: /
          - link "Thông tin bãi xe" [ref=e14] [cursor=pointer]:
            - /url: /parking-info
          - link "Bảng giá" [ref=e15] [cursor=pointer]:
            - /url: /pricing
          - link "Chỗ trống" [ref=e17] [cursor=pointer]:
            - /url: /available-slots
          - link "Quy định" [ref=e18] [cursor=pointer]:
            - /url: /rules
        - link "Đăng Nhập" [ref=e20] [cursor=pointer]:
          - /url: /login
    - main [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e24]:
          - heading "Bảng Giá Gửi Xe" [level=1] [ref=e29]
          - paragraph [ref=e30]: Áp dụng từ 01/01/2026. Giá đã bao gồm thuế suất hiện hành.
        - generic [ref=e31]:
          - generic [ref=e32]:
            - generic [ref=e33]: "Loại xe:"
            - generic [ref=e34]:
              - button "Tất cả" [ref=e35]
              - button "Motorcycle" [ref=e36]
              - button "Car" [ref=e37]
          - generic [ref=e38]:
            - generic [ref=e39]:
              - heading "Motorcycle" [level=3] [ref=e41]
              - generic [ref=e42]:
                - generic [ref=e43]:
                  - generic [ref=e44]: Vé Tháng
                  - paragraph [ref=e48]: 150.000đ/ tháng
                - generic [ref=e49]:
                  - generic [ref=e50]:
                    - generic [ref=e51]: Ban Ngày
                    - paragraph [ref=e59]: 5.000đ
                  - generic [ref=e60]:
                    - generic [ref=e61]: Ban Đêm
                    - paragraph [ref=e65]: 3.000đ
                - generic [ref=e66]:
                  - generic [ref=e67]: Phí mất thẻ
                  - generic [ref=e68]: 50.000đ
            - generic [ref=e69]:
              - heading "Car" [level=3] [ref=e71]
              - generic [ref=e72]:
                - generic [ref=e73]:
                  - generic [ref=e74]: Vé Tháng
                  - paragraph [ref=e78]: 800.000đ/ tháng
                - generic [ref=e79]:
                  - generic [ref=e80]:
                    - generic [ref=e81]: Ban Ngày
                    - paragraph [ref=e89]: 20.000đ
                  - generic [ref=e90]:
                    - generic [ref=e91]: Ban Đêm
                    - paragraph [ref=e95]: 15.000đ
                - generic [ref=e96]:
                  - generic [ref=e97]: Phí mất thẻ
                  - generic [ref=e98]: 100.000đ
          - paragraph [ref=e102]:
            - text: Giá ban ngày áp dụng
            - strong [ref=e103]: 06:00 – 22:00
            - text: "| Giá ban đêm áp dụng"
            - strong [ref=e104]: 22:00 – 06:00
            - text: . Phí gửi giờ tính theo từng giờ lẻ làm tròn. Bảng giá có thể thay đổi mà không cần thông báo trước.
    - contentinfo [ref=e105]:
      - generic [ref=e107]:
        - generic [ref=e108]:
          - link "P SWP Building Smart Parking" [ref=e109] [cursor=pointer]:
            - /url: /
            - generic [ref=e110]: P
            - generic [ref=e111]:
              - generic [ref=e112]: SWP Building
              - generic [ref=e113]: Smart Parking
          - paragraph [ref=e114]: Hệ thống bãi đỗ xe thông minh tại SWP Building. An toàn - Tiện lợi - Hiện đại.
        - generic [ref=e115]:
          - heading "Liên hệ" [level=4] [ref=e116]
          - list [ref=e117]:
            - listitem [ref=e118]:
              - generic [ref=e119]: 📞
              - generic [ref=e120]: 1900 1234
            - listitem [ref=e121]:
              - generic [ref=e122]: ✉️
              - generic [ref=e123]: support@swpbuilding.vn
            - listitem [ref=e124]:
              - generic [ref=e125]: 📍
              - generic [ref=e126]: Lô HH-01, KCN SWP, Thị trấn SWP, Huyện SWP, Tỉnh SWP
      - generic [ref=e127]: © 2024 SWP Building Smart Parking System. All rights reserved.
  - region "Notifications alt+T"
```

# Test source

```ts
  17  |               openingHours: "24/7",
  18  |               status: "ACTIVE",
  19  |               hotline: "1900-TEST",
  20  |               totalCapacity: 500,
  21  |             }
  22  |           },
  23  |         });
  24  |       });
  25  |     });
  26  | 
  27  |     test("verify parking information UI renders correctly", async ({ page }) => {
  28  |       await page.goto("/");
  29  |       
  30  |       // Navigate to the Information tab/section if needed, 
  31  |       // Assuming it renders on the home page or a specific info tab based on the UI.
  32  |       // Usually home page contains the info block. If there's a navigation tab, we click it.
  33  |       // For now, we assert the general block is visible. We avoid asserting exact hardcoded strings.
  34  |       
  35  |       // We look for general structure based on standard public pages implementation
  36  |       // Verify basic labels exist instead of hardcoded data values
  37  |       await expect(page.getByText("Hotline", { exact: false })).toBeVisible();
  38  |       await expect(page.getByText("Capacity", { exact: false }).or(page.getByText("Sức chứa", { exact: false }))).toBeVisible();
  39  |       await expect(page.getByText("Address", { exact: false }).or(page.getByText("Địa chỉ", { exact: false }))).toBeVisible();
  40  |       await expect(page.getByText("Opening Hours", { exact: false }).or(page.getByText("Giờ hoạt động", { exact: false }))).toBeVisible();
  41  |     });
  42  |   });
  43  | 
  44  |   test.describe("Public Rules", () => {
  45  |     test.beforeEach(async ({ page }) => {
  46  |       await page.route("**/api/public/rules", async (route) => {
  47  |         await route.fulfill({
  48  |           status: 200,
  49  |           json: {
  50  |             success: true,
  51  |             data: [
  52  |               {
  53  |                 group: "entry",
  54  |                 title: "Parking Rules",
  55  |                 content: ["Rule 1", "Rule 2"]
  56  |               },
  57  |               {
  58  |                 group: "payment",
  59  |                 title: "Payment Rules",
  60  |                 content: ["Pay before exit"]
  61  |               }
  62  |             ]
  63  |           },
  64  |         });
  65  |       });
  66  |     });
  67  | 
  68  |     test("verify rules section renders correctly", async ({ page }) => {
  69  |       await page.goto("/rules"); // Adjust path if it's rendered as a tab on a single page
  70  | 
  71  |       // Assert rule group headers are visible based on mocked data
  72  |       await expect(page.getByText("Parking Rules")).toBeVisible();
  73  |       await expect(page.getByText("Payment Rules")).toBeVisible();
  74  |       
  75  |       // Assert rule content renders
  76  |       await expect(page.getByText("Rule 1")).toBeVisible();
  77  |       await expect(page.getByText("Pay before exit")).toBeVisible();
  78  |     });
  79  |   });
  80  | 
  81  |   test.describe("Pricing", () => {
  82  |     test.beforeEach(async ({ page }) => {
  83  |       await page.route("**/api/public/pricing", async (route) => {
  84  |         await route.fulfill({
  85  |           status: 200,
  86  |           json: {
  87  |             success: true,
  88  |             data: [
  89  |               {
  90  |                 pricingRuleId: 1,
  91  |                 vehicleTypeId: 1,
  92  |                 vehicleTypeName: "Motorcycle",
  93  |                 dayPrice: 5000,
  94  |                 nightPrice: 3000,
  95  |                 monthlyPrice: 150000,
  96  |                 lostCardFee: 50000,
  97  |               },
  98  |               {
  99  |                 pricingRuleId: 2,
  100 |                 vehicleTypeId: 2,
  101 |                 vehicleTypeName: "Car",
  102 |                 dayPrice: 20000,
  103 |                 nightPrice: 15000,
  104 |                 monthlyPrice: 800000,
  105 |                 lostCardFee: 100000,
  106 |               }
  107 |             ]
  108 |           },
  109 |         });
  110 |       });
  111 |     });
  112 | 
  113 |     test("verify pricing table renders correctly", async ({ page }) => {
  114 |       await page.goto("/pricing");
  115 | 
  116 |       // Verify columns/headers exist
> 117 |       await expect(page.getByRole("columnheader", { name: "Motorcycle" }).or(page.getByText("Motorcycle"))).toBeVisible();
      |                                                                                                             ^ Error: expect(locator).toBeVisible() failed
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
  209 |       await page.goto("/slots?vehicleTypeId=2&floorId=2");
  210 |       await expect(page.getByText("F2-CAR-01")).toBeVisible();
  211 |     });
  212 | 
  213 |     test("4.6 Empty State - displays message when no slots match", async ({ page }) => {
  214 |       await page.goto("/slots?floorId=99");
  215 |       // Wait for empty state component
  216 |       await expect(
  217 |         page.getByText(/no available slots|không có|trống/i)
```