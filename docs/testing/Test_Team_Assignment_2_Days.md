# Test Team Assignment - 2 Days

## Mục tiêu

Tài liệu này dùng để phân công chi tiết cho đội 5 người trong 2 ngày để hoàn thành toàn bộ hệ khung test usable cho dự án.

Đội hình:

- 1 Leader
- 4 Executor

Vì mỗi người đều có AI riêng, cách chia đúng không phải là chia cứng theo frontend/backend, mà là chia theo flow dọc của nghiệp vụ để đẩy nhanh tiến độ.

Nguyên tắc làm việc:

- Mỗi người dùng AI như một coding assistant, không giao toàn bộ quyền quyết định cho AI.
- Mỗi output từ AI phải được người phụ trách review lại.
- Mỗi người ôm trọn một lát nghiệp vụ, gồm UI + API + test + fixture nếu cần.
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

- Chốt owner từng flow
- Chốt flow nào là P1 blocking
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

## 2. EXECUTOR A - AUTH + PUBLIC

### Phạm vi phụ trách

- Login
- Route guard
- Public Parking Info
- Public Rules
- Public Pricing
- Available Slots

### File chính cần làm

- [frontend/tests/e2e/specs/smoke/app-shell.smoke.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/smoke/app-shell.smoke.spec.ts>)
- [frontend/tests/e2e/specs/p1/login-role-routing.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/login-role-routing.spec.ts>)
- [frontend/tests/e2e/specs/p1/public-pages.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/public-pages.spec.ts>)

### Deliverable ngày 1

- Chạy được smoke app shell
- Có login-role-routing thật
- Có public-pages thật

### Deliverable ngày 2

- Hoàn thiện Available Slots read path
- Hoàn thiện auth/public contract direction nếu cần thêm ghi chú
- Bàn giao helper login/public cho cả team

### Prompt AI đề xuất

```text
Bạn đang làm một flow test dọc cho SWP301.

Flow phụ trách:
- Auth + Public

Nhiệm vụ:
- Viết hoặc hoàn thiện test cho file: {TARGET_FILE}
- Bám theo acceptance criteria của login/public flow

Yêu cầu:
- Ưu tiên flow người dùng thật
- Assert hành vi nghiệp vụ, không assert DOM thừa
- Nếu thiếu selector ổn định, ghi chú rõ đề xuất thêm test id
- Nếu cần helper dùng chung, tạo helper theo kiến trúc test hiện tại

Trả về code hoàn chỉnh cho file đó.
```

---

## 3. EXECUTOR B - ADMIN CORE

### Phạm vi phụ trách

- User Management
- Pricing Management
- Structure Management
- Card Management

### File chính cần làm

- [frontend/tests/e2e/specs/p1/user-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/user-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/pricing-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/pricing-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/structure-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/structure-management.spec.ts>)
- [frontend/tests/e2e/specs/p1/card-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/card-management.spec.ts>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/UsersContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/UsersContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/PricingContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/PricingContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/StructureContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/StructureContractTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Contracts/CardsContractTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Contracts/CardsContractTests.cs>)

### Deliverable ngày 1

- User Management P1
- Pricing Management P1

### Deliverable ngày 2

- Structure Management P1
- Card Management P1
- Contract test khung cho 4 module trên

### Prompt AI đề xuất

```text
Bạn đang làm một flow test dọc cho SWP301.

Flow phụ trách:
- Admin Core

Module hiện tại:
- {MODULE_NAME}

File đích:
- {TARGET_FILE}

Yêu cầu:
- Nếu là E2E, phải cover happy path quản trị quan trọng
- Nếu là contract test, phải khóa status code, shape response, validation path
- Không viết test nương theo implementation detail

Trả về code hoàn chỉnh cho file đó.
```

---

## 4. EXECUTOR C - DRIVER + RESERVATION

### Phạm vi phụ trách

- Driver Profile
- Driver Vehicles
- Reservation suggest/create/cancel
- Monthly Pass Management / Application
- Session Administration phần liên quan driver/reservation

### File chính cần làm

- [frontend/tests/e2e/specs/p2/driver-profile.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p2/driver-profile.spec.ts>)
- [frontend/tests/e2e/specs/p2/driver-vehicles.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p2/driver-vehicles.spec.ts>)
- [frontend/tests/e2e/specs/p2/reservation-happy-path.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p2/reservation-happy-path.spec.ts>)
- [frontend/tests/e2e/specs/p2/reservation-cancel.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p2/reservation-cancel.spec.ts>)
- [frontend/tests/e2e/specs/p2/monthly-pass-management.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p2/monthly-pass-management.spec.ts>)
- [frontend/tests/e2e/specs/p2/session-administration.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p2/session-administration.spec.ts>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/ReservationFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/ReservationFlowTests.cs>)

### Deliverable ngày 1

- Driver profile scaffold rõ
- Driver vehicles scaffold rõ
- Reservation happy path scaffold rõ

### Deliverable ngày 2

- Reservation cancel
- Monthly pass scaffold
- Session administration scaffold
- Reservation flow integration base

### Prompt AI đề xuất

```text
Bạn đang làm một flow test dọc cho SWP301.

Flow phụ trách:
- Driver + Reservation

File đích:
- {TARGET_FILE}

Acceptance criteria:
- {AC_1}
- {AC_2}
- {AC_3}

Yêu cầu:
- Nếu là E2E, đi theo flow người dùng driver thật
- Nếu là integration, assert trạng thái reservation trước/sau
- Nếu flow đụng slot/area/payment thì ghi rõ dependency dữ liệu

Trả về code hoàn chỉnh cho file đó.
```

---

## 5. EXECUTOR D - PARKING CORE HARD FLOWS

### Phạm vi phụ trách

- Entry
- Exit
- Payment
- Lost Card
- Plate Mismatch
- Dashboard / Audit read-after-write

### File chính cần làm

- [frontend/tests/e2e/specs/p1/dashboard-read.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/dashboard-read.spec.ts>)
- [frontend/tests/e2e/specs/p1/audit-log-search.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p1/audit-log-search.spec.ts>)
- [frontend/tests/e2e/specs/p3/entry-casual.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/entry-casual.spec.ts>)
- [frontend/tests/e2e/specs/p3/entry-monthly.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/entry-monthly.spec.ts>)
- [frontend/tests/e2e/specs/p3/entry-reservation.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/entry-reservation.spec.ts>)
- [frontend/tests/e2e/specs/p3/exit-cash.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/exit-cash.spec.ts>)
- [frontend/tests/e2e/specs/p3/exit-online.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/exit-online.spec.ts>)
- [frontend/tests/e2e/specs/p3/lost-card.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/lost-card.spec.ts>)
- [frontend/tests/e2e/specs/p3/plate-mismatch.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/plate-mismatch.spec.ts>)
- [frontend/tests/e2e/specs/p3/payment-callback.spec.ts](</F:/Ky 5/SWP301/frontend/tests/e2e/specs/p3/payment-callback.spec.ts>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/EntryFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/EntryFlowTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/ExitFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/ExitFlowTests.cs>)
- [backend/ParkingBuilding.CoreApi.Tests/Flows/PaymentFlowTests.cs](</F:/Ky 5/SWP301/backend/ParkingBuilding.CoreApi.Tests/Flows/PaymentFlowTests.cs>)
- [backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/smoke/SmokeScaffoldTest.java](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/smoke/SmokeScaffoldTest.java>)
- [backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/contracts/ContractsScaffoldTest.java](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/contracts/ContractsScaffoldTest.java>)
- [backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/flows/FlowsScaffoldTest.java](</F:/Ky 5/SWP301/backend/parking-building-support-api/src/test/java/com/parkingbuilding/support/flows/FlowsScaffoldTest.java>)

### Deliverable ngày 1

- Dashboard/Audit scaffold rõ
- Entry/Exit/Payment skeleton rõ
- Spring smoke/contracts/flows scaffold rõ

### Deliverable ngày 2

- Lost Card scaffold
- Plate Mismatch scaffold
- Payment callback scaffold
- Entry/Exit integration direction rõ

### Prompt AI đề xuất

```text
Bạn đang làm một flow test dọc cho SWP301.

Flow phụ trách:
- Parking Core Hard Flows

File đích:
- {TARGET_FILE}

Yêu cầu:
- Nếu là E2E, bám critical business flow
- Nếu là integration, assert session/slot/card/payment/audit state trước-sau
- Nếu là support API test, khóa read-after-write expectation
- Không đơn giản hóa flow chỉ để test pass

Trả về code hoàn chỉnh cho file đó.
```

---

## Kế hoạch thời gian 2 ngày

## Ngày 1

### Buổi sáng

- Leader: chốt rule review + owner
- Executor A: auth/public base
- Executor B: admin core base
- Executor C: driver/reservation base
- Executor D: hard flow + support base

### Buổi chiều

- Executor A: smoke + login + public
- Executor B: user + pricing
- Executor C: driver profile + vehicles + reservation happy path
- Executor D: dashboard/audit + entry/exit/payment skeleton

## Ngày 2

### Buổi sáng

- Executor A: available slots + cleanup helper
- Executor B: structure + card + contract khung
- Executor C: reservation cancel + monthly pass + session admin
- Executor D: lost card + mismatch + support read/report scaffold

### Buổi chiều

- Executor A: review và ổn định flow auth/public
- Executor B: hoàn thiện contract test admin core
- Executor C: reservation flow integration base
- Executor D: payment callback + entry/exit integration direction
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
