# AI Test Task Template

## Mục tiêu

Template này dùng để giao việc cho AI sao cho output nhất quán và không phá kiến trúc test.

---

## Template giao task

Bạn đang làm việc trong dự án SWP301.

Nhiệm vụ của bạn:

- Viết test cho module: `{MODULE_NAME}`
- Loại test: `{TEST_TYPE}`
- File đích: `{TARGET_FILE}`
- Acceptance criteria:
  - `{AC_1}`
  - `{AC_2}`
  - `{AC_3}`

Yêu cầu bắt buộc:

- Không viết test nương theo implementation detail.
- Chỉ assert hành vi nghiệp vụ quan trọng.
- Nếu là E2E, ưu tiên flow người dùng và selector ổn định.
- Nếu là integration, phải assert trạng thái trước/sau.
- Nếu là component test, ưu tiên user interaction thay vì internal state.
- Không tự ý đổi kiến trúc thư mục test.

Output mong muốn:

- test code hoàn chỉnh
- ghi ngắn gọn những giả định đã dùng
- nếu thiếu dữ liệu/selector/contract, nêu rõ chỗ thiếu

---

## Ví dụ dùng

- MODULE_NAME: User Management
- TEST_TYPE: E2E P1
- TARGET_FILE: frontend/tests/e2e/specs/p1/user-management.spec.ts

Acceptance criteria:

- Admin đăng nhập được và vào trang user management
- Tạo user mới thành công khi nhập dữ liệu hợp lệ
- Hiển thị lỗi khi thiếu trường bắt buộc
