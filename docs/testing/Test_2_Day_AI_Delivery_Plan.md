# Test 2-Day AI Delivery Plan

## Mục tiêu

Trong 2 ngày, team phải dựng được bộ khung test có thể mở rộng bằng AI mà không bị vỡ kiến trúc.

## Day 1

### Buổi 1 - Dựng khung

- Chốt test policy
- Cài dev dependency frontend cho Playwright + Vitest
- Chốt test folder structure
- Tạo env file cho E2E
- Chốt naming convention

### Buổi 2 - Khóa P1

- Smoke login/public shell
- User management P1
- Pricing management P1
- Structure management P1

## Day 2

### Buổi 1 - Khóa thêm acceptance

- Card management P1
- Dashboard read P1
- Audit log read/filter P1

### Buổi 2 - Mở rộng có kiểm soát

- Reservation P2 scaffold
- Entry/Exit P3 scaffold
- Backend integration smoke scaffold
- CI gate checklist

## Rule phân công với AI

- Mỗi task AI chỉ được giao 1 flow hoặc 1 component rõ ràng.
- AI phải viết test dựa trên acceptance criteria, không dựa trên DOM ngẫu nhiên.
- Mỗi output AI phải qua review tên file, assertion và test data.

## Definition of Done cho 2 ngày

- Folder structure đã dựng
- Script chạy cơ bản đã có
- Frontend đã có config Playwright/Vitest
- .NET đã có test project scaffold
- Spring đã có test resource scaffold
- Có ít nhất 3-5 P1 test case được team bắt đầu implement
