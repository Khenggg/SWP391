# ERD

File này dùng để ghi chú quan hệ bảng và hỗ trợ đọc schema. Đây không phải nguồn tạo database chính thức.

## Nguyên Tắc Chính

- PostgreSQL là database chung cho `.NET Core API` và `Spring Boot Support API`.
- `.NET Core API` là owner schema và tạo migration chính bằng EF Core.
- Spring Boot chỉ mapping/read schema và phải giữ chế độ validate, không tự update schema.
- Enum trong database nên lưu dạng string để `.NET` và Java đọc thống nhất.

## Nhóm Bảng Chính

- Auth/User: `users`, driver profile/vehicle nếu làm phần driver.
- Master data: `vehicle_types`, `parking_cards`, `floors`, `areas`, `slots`, `gates`, `pricing_rules`.
- Core transaction: `parking_sessions`, `payments`, `receipts`.
- Exception/MVP: `monthly_passes`, `lost_card_cases`, `plate_mismatch_cases`.
- Support/read: `audit_logs` và các view/query phục vụ dashboard/report.

## Ghi Chú Khi Cập Nhật

- Nếu thay đổi quan hệ bảng, cập nhật tài liệu triển khai và migration `.NET` trước.
- Nếu chỉ thêm ghi chú hoặc sơ đồ minh họa, cập nhật file này.
- Không xem nội dung file này là thay thế cho EF Core migration.
