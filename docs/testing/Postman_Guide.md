# Postman Guide

Sử dụng các file trong thư mục `../../postman/` để test API thủ công và chạy demo flow.

## File Cần Dùng

- `ParkingBuilding.postman_collection.json`: collection API của dự án.
- `ParkingBuilding.local_environment.example.json`: environment mẫu cho local/dev.

## Cách Dùng

1. Import collection vào Postman.
2. Import environment mẫu.
3. Tạo bản copy environment local của mỗi người.
4. Điền base URL cho `.NET Core API`, Spring Support API và Public API.
5. Login để lấy JWT, sau đó dùng token cho các request cần auth.

## Lưu Ý Bảo Mật

- Không commit token thật.
- Không commit password thật.
- Không commit production URL hoặc secret Supabase.
- Nếu API đổi path, payload hoặc response, cập nhật collection cùng PR.
