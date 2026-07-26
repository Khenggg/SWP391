# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: p1\public-pages.spec.ts >> Public Pages Acceptance Suite >> Parking Information >> verify parking information UI renders correctly
- Location: tests\e2e\specs\p1\public-pages.spec.ts:27:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Hotline')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Hotline')

```

```yaml
- banner:
  - link "P SWP Building Smart Parking":
    - /url: /
  - navigation:
    - link "Trang chủ":
      - /url: /
    - link "Thông tin bãi xe":
      - /url: /parking-info
    - link "Bảng giá":
      - /url: /pricing
    - link "Chỗ trống":
      - /url: /available-slots
    - link "Quy định":
      - /url: /rules
  - link "Đăng Nhập":
    - /url: /login
- main:
  - img "SWP Building Parking"
  - paragraph: Chào mừng đến với
  - heading "SWP BUILDING" [level=1]
  - paragraph: SMART PARKING
  - paragraph: Giải pháp bãi đỗ xe thông minh, hiện đại và an toàn trải nghiệm tiện lợi cho mọi khách hàng
  - link "Xem chỗ trống":
    - /url: /available-slots
    - button "Xem chỗ trống":
      - img
      - text: Xem chỗ trống
  - img
  - paragraph: Tổng chỗ đỗ xe
  - paragraph: "500"
  - paragraph: Toàn bộ tòa nhà
  - text: P
  - paragraph: Chỗ trống hiện tại
  - paragraph: –
  - paragraph: Cập nhật 1 phút trước
  - img
  - paragraph: Giờ hoạt động
  - paragraph: 24/7
  - paragraph: Tất cả các ngày
  - img
  - paragraph: An toàn & Bảo mật
  - paragraph: 24/7
  - paragraph: Hệ thống giám sát
  - img
  - text: 123 Test Street
  - img
  - text: 1900-TEST
  - img
  - text: "Mở cửa: 24/7 Đã đóng cửa"
  - heading "Khám phá dịch vụ" [level=2]
  - link "Thông tin bãi xe Tìm hiểu về vị trí, tiện ích và hướng dẫn di chuyển →":
    - /url: /parking-info
    - img
    - paragraph: Thông tin bãi xe
    - paragraph: Tìm hiểu về vị trí, tiện ích và hướng dẫn di chuyển
    - text: →
  - link "Bảng giá Xem bảng giá gửi xe theo giờ và theo tháng →":
    - /url: /pricing
    - img
    - paragraph: Bảng giá
    - paragraph: Xem bảng giá gửi xe theo giờ và theo tháng
    - text: →
  - link "Chỗ trống Xem số lượng chỗ trống theo tầng thời gian thực →":
    - /url: /available-slots
    - img
    - paragraph: Chỗ trống
    - paragraph: Xem số lượng chỗ trống theo tầng thời gian thực
    - text: →
  - link "Quy định Xem quy định gửi xe và các lưu ý quan trọng →":
    - /url: /rules
    - img
    - paragraph: Quy định
    - paragraph: Xem quy định gửi xe và các lưu ý quan trọng
    - text: →
- contentinfo:
  - link "P SWP Building Smart Parking":
    - /url: /
  - paragraph: Hệ thống bãi đỗ xe thông minh tại SWP Building. An toàn - Tiện lợi - Hiện đại.
  - heading "Liên hệ" [level=4]
  - list:
    - listitem: 📞 1900 1234
    - listitem: ✉️ support@swpbuilding.vn
    - listitem: 📍 Lô HH-01, KCN SWP, Thị trấn SWP, Huyện SWP, Tỉnh SWP
  - text: © 2024 SWP Building Smart Parking System. All rights reserved.
- region "Notifications alt+T"
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Public Pages Acceptance Suite", () => {
  4   | 
  5   |   test.describe("Parking Information", () => {
  6   |     test.beforeEach(async ({ page }) => {
  7   |       // Mock the parking info API
  8   |       await page.route("**/api/public/parking-info", async (route) => {
  9   |         await route.fulfill({
  10  |           status: 200,
  11  |           json: {
  12  |             success: true,
  13  |             message: "Success",
  14  |             data: {
  15  |               name: "Test Parking Building",
  16  |               address: "123 Test Street",
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
> 37  |       await expect(page.getByText("Hotline", { exact: false })).toBeVisible();
      |                                                                 ^ Error: expect(locator).toBeVisible() failed
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
```