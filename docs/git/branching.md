# Branching Workflow

File này tóm tắt nhanh cách dùng branch trong repo. Quy trình chi tiết hơn nằm ở `Git_Workflow.md`.

## Vai Trò Branch

- `main`: bản ổn định, chỉ merge khi đã test và sẵn sàng demo/release.
- `dev`: branch tích hợp chính cho team trong quá trình phát triển.
- `feature/*`: branch làm tính năng mới.
- `fix/*`: branch sửa lỗi.
- `docs/*`: branch cập nhật tài liệu.

## Luồng Làm Việc

1. Tạo branch mới từ `dev`.
2. Code hoặc cập nhật tài liệu trong branch riêng.
3. Mở Pull Request về `dev`.
4. Review, test, sửa lỗi nếu có.
5. Merge vào `dev` khi PR đạt checklist.
6. Merge `dev` vào `main` khi chuẩn bị demo/release.

## Nguyên Tắc

- Không commit trực tiếp vào `main`.
- Không tự ý sửa file không liên quan đến issue.
- Pull Request phải cập nhật docs/Postman nếu có thay đổi API, schema hoặc luồng nghiệp vụ.
