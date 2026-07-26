# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: p1\public-pages.spec.ts >> Public Pages Acceptance Suite >> Public Rules >> verify rules section renders correctly
- Location: tests\e2e\specs\p1\public-pages.spec.ts:68:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Parking Rules')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Parking Rules')

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
  - img
  - heading "Nội Quy Bãi Xe" [level=1]
  - paragraph: Vui lòng tuân thủ các quy định dưới đây để đảm bảo an toàn và trật tự cho bãi đỗ xe.
  - img
  - textbox "Tìm kiếm quy định..."
  - button "→ Quy Định Vào Bãi 4 quy định":
    - text: → Quy Định Vào Bãi 4 quy định
    - img
  - list:
    - listitem: 1 Quý khách vui lòng dừng xe đúng vạch quy định để camera nhận dạng biển số.
    - listitem: 2 Nhận vé xe (thẻ từ) từ nhân viên hoặc máy phát tự động trước khi vào bãi.
    - listitem: 3 Tuyệt đối không mang chất cháy nổ, vũ khí hoặc hàng hóa cấm vào bãi gửi xe.
    - listitem: 4 Đối với xe ô tô, vui lòng hạ kính xe để nhân viên kiểm tra (nếu có yêu cầu).
  - button "🅿️ Quy Định Đỗ Xe 4 quy định":
    - text: 🅿️ Quy Định Đỗ Xe 4 quy định
    - img
  - list:
    - listitem: 1 Đỗ xe đúng trong vạch kẻ quy định của từng ô đỗ, không lấn vạch.
    - listitem: 2 Đỗ đúng khu vực dành riêng cho từng loại xe (xe máy, ô tô, xe điện).
    - listitem: 3 Tắt máy, khóa xe cẩn thận và tự bảo quản tư trang, tài sản cá nhân có giá trị.
    - listitem: 4 Nghiêm cấm vứt rác bừa bãi, hút thuốc hoặc gây mất vệ sinh khu vực bãi xe.
  - button "← Quy Định Ra Bãi 4 quy định":
    - text: ← Quy Định Ra Bãi 4 quy định
    - img
  - list:
    - listitem: 1 Giao lại vé xe (thẻ từ) cho nhân viên soát vé tại cổng ra.
    - listitem: 2 Thanh toán đầy đủ phí gửi xe theo bảng giá quy định trước khi rời đi.
    - listitem: 3 Biển số xe ra phải trùng khớp hoàn toàn với biển số xe lúc vào.
    - listitem: 4 Trong trường hợp hệ thống không nhận diện được, quý khách vui lòng hợp tác với nhân viên kiểm tra.
  - button "⚠ Mất Thẻ & Sự Cố 4 quy định":
    - text: ⚠ Mất Thẻ & Sự Cố 4 quy định
    - img
  - list:
    - listitem: 1 Nếu làm mất thẻ/vé, quý khách phải lập tức thông báo cho ban quản lý bãi xe.
    - listitem: 2 Cần xuất trình Giấy đăng ký xe (Cà vẹt) và CCCD/CMND để xác minh sở hữu xe.
    - listitem: 3 Phí làm mất thẻ/vé sẽ được thu theo quy định hiện hành của bãi xe.
    - listitem: 4 Thời gian giải quyết xe mất thẻ có thể kéo dài để đảm bảo an ninh, mong quý khách thông cảm.
  - button "📋 Khách Hàng Vé Tháng 3 quy định":
    - text: 📋 Khách Hàng Vé Tháng 3 quy định
    - img
  - list:
    - listitem: 1 Thẻ vé tháng chỉ có giá trị sử dụng cho đúng 01 xe đã đăng ký biển số.
    - listitem: 2 Vui lòng đóng phí gia hạn trước ngày mùng 5 hàng tháng để thẻ không bị khóa.
    - listitem: 3 Không tự ý cho mượn thẻ vé tháng dưới bất kỳ hình thức nào.
  - paragraph:
    - text: Nội quy có hiệu lực từ 01/01/2026. Liên hệ hotline
    - strong: 1900 1234
    - text: để được hỗ trợ.
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
> 72  |       await expect(page.getByText("Parking Rules")).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
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
```