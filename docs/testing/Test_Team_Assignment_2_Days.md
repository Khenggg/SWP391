# Test Team Assignment - 2 Days

## Mục tiêu

Tài liệu này dùng để phân công chi tiết cho đội 5 người trong 2 ngày để hoàn thành toàn bộ hệ khung test usable cho dự án.

Đội hình:

- 1 Leader
- 1 Frontend
- 3 Backend

Nguyên tắc làm việc:

- Mỗi người dùng AI như một coding assistant, không giao toàn bộ quyền quyết định cho AI.
- Mỗi output từ AI phải được người phụ trách review lại.
- Chỉ cần báo cáo kết quả cuối mỗi block công việc, không cần thảo luận lại kiến trúc.

---

## Tài liệu bắt buộc cả team phải đọc trước khi làm

- [Test_Architecture_Proposal.md](</F:/Ky 5/SWP301/docs/testing/Test_Architecture_Proposal.md>)
- [Test_2_Day_AI_Delivery_Plan.md](</F:/Ky 5/SWP301/docs/testing/Test_2_Day_AI_Delivery_Plan.md>)
- [Test_Backlog_Matrix.md](</F:/Ky 5/SWP301/docs/testing/Test_Backlog_Matrix.md>)
- [AI_Test_Task_Template.md](</F:/Ky 5/SWP301/docs/testing/AI_Test_Task_Template.md>)

---

## 1. LEADER

### Vai trò

- Giữ chuẩn kiến trúc test
- Chia acceptance criteria cho đúng
- Review output của AI và của team
- Chốt test nào là merge gate
- Tổng hợp báo cáo cuối ngày

### File phải theo dõi

- [Test_Architecture_Proposal.md](</F:/Ky 5/SWP301/docs/testing/Test_Architecture_Proposal.md>)
- [Test_Backlog_Matrix.md](</F:/Ky 5/SWP301/docs/testing/Test_Backlog_Matrix.md>)
- [Test_Team_Assignment_2_Days.md](</F:/Ky 5/SWP301/docs/testing/Test_Team_Assignment_2_Days.md>)

### Deliverable ngày 1

- Chốt owner từng module
- Chốt module nào là P1 blocking
- Chốt rule review output của AI

### Deliverable ngày 2

- Danh sách test đã scaffold xong
- Danh sách test chạy được thật
- Danh sách phần còn thiếu và owner tiếp theo

### Checklist review

- Tên file test đúng chưa
- Có bám acceptance criteria không
- Có assert đúng nghiệp vụ không
- Có đang nương theo code không
- Có dùng selector mong manh không
- Có phụ thuộc dữ liệu ngẫu nhiên không

### Prompt AI đề xuất cho Leader

```text
Bạn là reviewer kỹ thuật cho bộ test SWP301.

Hãy review phần test mới được tạo theo các tiêu chí:
- Có bám đúng acceptance criteria không
- Có đang test implementation detail không
- Có thiếu assert nghiệp vụ quan trọng không
- Có nguy cơ flaky không
- Có vi phạm kiến trúc test hiện tại không

Chỉ trả về:
1. Lỗi nghiêm trọng cần sửa
2. Điểm nên cải thiện
3. Kết luận: Accept / Revise
```

---

## 2. FRONTEND

### Vai trò

Phụ trách toàn bộ:

- Playwright E2E
- Vitest component test
- frontend test utilities

### File phải làm

- [frontend/vitest.config.ts](</F:/Ky 5/SWP301/frontend/vitest.config.ts>)
- [frontend/src/test/README.md](</F:/Ky 5/SWP301/frontend/src/test/README.md>)
- [frontend/tests/e2e/playwright.config.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/playwright.config.ts>)
- [frontend/tests/e2e/README.md](</F:/Ky 5/SWP301/frontend/tests/e2e/README.md>)

### File E2E phải hoàn thiện trước

- [frontend/tests/e2e/specs/smoke/app-shell.smoke.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/smoke/app-shell.smoke.spec.ts>)
- [frontend/tests/e2e/specs/p1/login-role-routing.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/login-role-routing.spec.ts>)
- [frontend/tests/e2e/specs/p1/public-pages.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/public-pages.spec.ts>)
- [frontend/tests/e2e/specs/p1/user-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/user-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/pricing-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/pricing-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/structure-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/structure-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/card-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/card-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/dashboard-read.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/dashboard-read.spec.ts>)
- [frontend/tests/e2e/specs/p1/audit-log-search.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/audit-log-search.spec.ts>)

### Deliverable ngày 1

- Chạy được Playwright config
- Có smoke test thật
- Có login-role-routing thật
- Có public-pages thật
- Có user-management scaffold rõ ràng

### Deliverable ngày 2

- Hoàn thiện P1 E2E còn lại
- Có ít nhất 1-2 component test đầu tiên cho modal/filter quan trọng

### Prompt AI đề xuất

```text
Bạn đang làm frontend test cho SWP301.

Nhiệm vụ:
- Viết test Playwright cho file: {TARGET_FILE}
- Module: {MODULE_NAME}
- Priority: {P_LEVEL}

Acceptance criteria:
- {AC_1}
- {AC_2}
- {AC_3}

Yêu cầu:
- Không dùng selector mong manh theo text ngẫu nhiên nếu có thể tránh
- Ưu tiên flow người dùng thật
- Assert hành vi nghiệp vụ, không assert DOM thừa
- Nếu thiếu selector ổn định, ghi chú rõ đề xuất thêm test id

Trả về code hoàn chỉnh cho file đó.
```

---

## 3. BACKEND 1 - .NET CONTRACT + SMOKE

### Vai trò

Phụ trách .NET Core:

- smoke
- contract
- auth/users/pricing/structure/cards

### File phải làm

- [backend/ParkingBuilding.CoreApi.Tests/Smoke/HealthEndpointsTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Smoke/HealthEndpointsTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/AuthContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/AuthContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/UsersContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/UsersContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/PricingContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/PricingContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/StructureContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/StructureContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/CardsContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/CardsContractTests.cs>)

### Deliverable ngày 1

- Health smoke chạy được
- Auth contract có thật
- Users contract có thật

### Deliverable ngày 2

- Pricing contract
- Structure contract
- Cards contract

### Prompt AI đề xuất

```text
Bạn đang viết .NET contract test cho SWP301 Core API.

File đích: {TARGET_FILE}
Module: {MODULE_NAME}

Yêu cầu:
- Dùng test như tiêu chí nghiệm thu
- Assert status code, shape response, field bắt buộc, auth rule
- Không chỉ test endpoint trả 200
- Nếu là mutation thì kiểm tra error/validation path tối thiểu

Output:
- code hoàn chỉnh cho test file
- ghi chú setup cần thiết nếu có
```

---

## 4. BACKEND 2 - .NET FLOW / INTEGRATION

### Vai trò

Phụ trách .NET Core flow:

- Reservation
- Entry
- Exit
- Payment

### File phải làm

- [backend/ParkingBuilding.CoreApi.Tests/Flows/ReservationFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/ReservationFlowTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/EntryFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/EntryFlowTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/ExitFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/ExitFlowTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/PaymentFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/PaymentFlowTests.cs>)

### Deliverable ngày 1

- Reservation flow scaffold rõ
- Test data/fixture direction rõ
- Ít nhất 1 flow integration đầu tiên có assert trạng thái

### Deliverable ngày 2

- Entry scaffold hoàn chỉnh
- Exit scaffold hoàn chỉnh
- Payment scaffold hoàn chỉnh

### Prompt AI đề xuất

```text
Bạn đang viết integration test cho SWP301 .NET Core.

File đích: {TARGET_FILE}
Flow: {FLOW_NAME}

Acceptance criteria:
- {AC_1}
- {AC_2}
- {AC_3}

Yêu cầu:
- Assert trạng thái trước và sau transaction
- Khóa đúng hậu quả nghiệp vụ: session, slot, card, payment, audit
- Không viết test chỉ để pass giả tạo
- Nếu thiếu fixture/reset data, ghi rõ helper cần tạo

Trả về code test có cấu trúc rõ ràng.
```

---

## 5. BACKEND 3 - SPRING BOOT SUPPORT API

### Vai trò

Phụ trách Spring Boot:

- public API
- dashboard
- reports
- audit log
- driver read / reservation read

### File phải làm

- [backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/smoke/SmokeScaffoldTest.java](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/smoke/SmokeScaffoldTest.java>)
- [backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/contracts/ContractsScaffoldTest.java](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/contracts/ContractsScaffoldTest.java>)
- [backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/flows/FlowsScaffoldTest.java](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/flows/FlowsScaffoldTest.java>)
- [backend/parking-building-support-api/src/test/resources/application-test.yml](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/resources/application-test.yml>)

### Deliverable ngày 1

- Spring smoke test base
- Public API contract scaffold
- Dashboard/audit/report direction rõ

### Deliverable ngày 2

- Contract test ban đầu cho public API
- Contract hoặc flow test ban đầu cho dashboard/audit/report
- Driver read/reservation read scaffold

### Prompt AI đề xuất

```text
Bạn đang viết test cho Spring Boot Support API của SWP301.

Module: {MODULE_NAME}
File đích: {TARGET_FILE}

Yêu cầu:
- Khóa response shape và filter logic nghiệp vụ
- Nếu là read/report flow thì assert dữ liệu đúng theo expectation
- Không chỉ test startup framework
- Nêu rõ dependency dữ liệu nếu cần seed trước

Trả về code test hoàn chỉnh.
```

---

## Kế hoạch thời gian 2 ngày

## Ngày 1

### Buổi sáng

- Leader: chốt rule review + owner
- Frontend: chạy được Playwright/Vitest config
- Backend 1: health + auth/users contract base
- Backend 2: reservation integration base
- Backend 3: spring smoke/public contract base

### Buổi chiều

- Frontend: smoke + login + public pages
- Backend 1: auth/users contract thật
- Backend 2: reservation flow thật bước đầu
- Backend 3: public API scaffold thật

## Ngày 2

### Buổi sáng

- Frontend: user/pricing/structure/card
- Backend 1: pricing/structure/cards
- Backend 2: entry/exit scaffold
- Backend 3: dashboard/audit/report scaffold

### Buổi chiều

- Frontend: dashboard + audit
- Backend 2: payment scaffold
- Backend 3: driver read/reservation read scaffold
- Leader: review và chốt báo cáo cuối

---

## Mẫu báo cáo cuối ngày cho từng người

```text
[Tên người]
- Việc đã xong:
  - ...
  - ...
- File đã cập nhật:
  - ...
  - ...
- Test đã chạy được:
  - ...
- Vấn đề còn vướng:
  - ...
- Đề xuất cho block tiếp theo:
  - ...
```

---

## Kết quả leader cần thu về cuối ngày 2

- Danh sách file test đã scaffold
- Danh sách test đã chạy thật
- Danh sách phần chưa đủ dữ liệu để test
- Danh sách selector/fixture/helper còn thiếu
- Danh sách việc chuyển sang vòng tiếp theo
