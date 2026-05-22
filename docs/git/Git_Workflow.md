# Git Workflow

Tài liệu này hướng dẫn quy trình Git chung cho team.

## Branch Chính

```text
main
dev
feature/<area>-<short-name>
fix/<area>-<short-name>
docs/<short-name>
test/<area>-<short-name>
```

## Quy Trình Pull Request

1. Kéo code mới nhất từ `dev`.
2. Tạo branch theo quy tắc trong `Branch_Naming.md`.
3. Làm đúng phạm vi issue.
4. Chạy test/check liên quan trước khi mở PR.
5. Mở PR về `dev`.
6. Điền checklist trong `.github/pull_request_template.md`.
7. Chỉ merge khi đã review và không còn lỗi P0/P1.

## Khi Nào Cần Cập Nhật Tài Liệu

- Đổi endpoint, request, response hoặc prefix API.
- Đổi schema, enum, trạng thái nghiệp vụ hoặc ownership backend.
- Đổi cách chạy local, biến môi trường, seed data hoặc Postman flow.
- Đổi demo script hoặc test case bắt buộc.

## Xem Thêm

- `branching.md`: tóm tắt nhanh luồng branch.
- `../planning/GitHub_Project_Guide.md`: cách quản lý issue/sprint trên GitHub Project.
- `Branch_Naming.md`: quy tắc đặt tên branch.
