---
name: Backend Spring task
about: Support API task for public read, dashboard, report, or audit search
title: "[Spring] "
labels: backend-spring
---

## 🎯 Mục tiêu (Goal)
[Mô tả ngắn gọn về mục tiêu tính năng và lý do cần thực hiện]

## 🛠️ Scope công việc
- [ ] [Đầu việc 1]
- [ ] [Đầu việc 2]
- [ ] [Đầu việc 3]

## 📂 Các bảng Database liên quan
- [Tên các bảng DB sẽ đọc]

## ⚙️ Yêu cầu kỹ thuật & Kiến trúc
- Bắt buộc kế thừa từ `ReadOnlyRepository` (ngăn cấm hoàn toàn hành vi ghi).
- Đánh dấu `@Transactional(readOnly = true)`.
- Nhận cấu hình JWT và DB từ các biến môi trường của hệ thống.

## ✅ Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] Chạy `mvn clean test` thành công 100%.
- [ ] [Điều kiện nghiệm thu nghiệp vụ 1]
- [ ] [Điều kiện nghiệm thu nghiệp vụ 2]
- [ ] Đảm bảo không có dòng code nào thực hiện INSERT/UPDATE/DELETE.

---

## 💻 HƯỚNG DẪN KỸ THUẬT CHI TIẾT (Cheatsheet / Code mẫu)
[Phần này dành cho Tech Lead/AI điền hướng dẫn chi tiết từng bước, cấu trúc class, file cần sửa và code mẫu để các bạn sinh viên dễ dàng làm theo]
