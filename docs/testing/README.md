# Testing Folder Guide

## Mục đích

Thư mục `docs/testing` là nơi tập trung tài liệu điều phối toàn bộ hoạt động test của dự án.

Mục tiêu của thư mục này là:

- giúp team hiểu chiến lược test
- biết module nào cần test gì
- biết ai đang phụ trách phần nào
- dùng AI đúng cách để tăng tốc triển khai test

---

## Cách đọc thư mục này

Nếu là người mới vào task, nên đọc theo thứ tự:

1. [Test_Architecture_Proposal.md](./Test_Architecture_Proposal.md)
2. [Test_Backlog_Matrix.md](./Test_Backlog_Matrix.md)
3. [Test_Team_Assignment_2_Days.md](./Test_Team_Assignment_2_Days.md)
4. [Test_Cases.md](./Test_Cases.md)
5. [Demo_Script.md](./Demo_Script.md)
6. [Postman_Guide.md](./Postman_Guide.md)

Nếu cần giao việc cho AI:

7. [templates/AI_Test_Task_Template.md](./templates/AI_Test_Task_Template.md)

---

## Ý nghĩa từng file

### 1. Test_Architecture_Proposal.md

Tài liệu kiến trúc test tổng thể.

Dùng để trả lời:

- vì sao dự án test theo hướng này
- nên ưu tiên smoke / contract / integration / E2E / component ra sao
- test đóng vai trò gì trong nghiệm thu

### 2. Test_Backlog_Matrix.md

Danh sách backlog test theo module.

Dùng để trả lời:

- module nào là P1 / P2 / P3
- module nào cần smoke, contract, integration hay E2E
- module nào có thể giao AI làm nhanh

### 3. Test_Team_Assignment_2_Days.md

Tài liệu phân công thực thi cho team.

Dùng để trả lời:

- mỗi người làm flow nào
- deliverable ngày 1 / ngày 2 là gì
- leader cần review gì

### 4. Test_Cases.md

Danh sách testcase nghiệp vụ.

Dùng làm nguồn tham chiếu khi viết test thật.

### 5. Demo_Script.md

Flow demo/nghiệm thu thủ công.

Dùng để đối chiếu với E2E acceptance.

### 6. Postman_Guide.md

Hướng dẫn test API bằng Postman/manual.

Dùng khi cần kiểm tra nhanh contract hoặc debug backend trước khi viết test tự động.

### 7. templates/AI_Test_Task_Template.md

Template giao việc cho AI.

Dùng khi cần copy prompt chuẩn cho AI viết test mà không phá kiến trúc chung.

---

## Quy tắc giữ thư mục gọn

- Chỉ giữ tài liệu còn được dùng để điều phối test.
- Không tạo nhiều file plan ngắn hạn trùng nhau.
- Nếu một file chỉ là bản phụ trợ cho AI, ưu tiên đặt trong `templates/`.
- Nếu nội dung đã bị thay thế bởi file khác rõ hơn, nên xóa hoặc gộp.

---

## Trạng thái hiện tại nên giữ

Các file nên giữ:

- `README.md`
- `Test_Architecture_Proposal.md`
- `Test_Backlog_Matrix.md`
- `Test_Team_Assignment_2_Days.md`
- `Test_Cases.md`
- `Demo_Script.md`
- `Postman_Guide.md`
- `templates/AI_Test_Task_Template.md`

Các file không nên giữ riêng nếu nội dung đã trùng:

- `Test_2_Day_AI_Delivery_Plan.md`

---

## Lưu ý

Mọi thay đổi lớn trong chiến lược test nên cập nhật ở:

- `Test_Architecture_Proposal.md`
- `Test_Backlog_Matrix.md`
- `Test_Team_Assignment_2_Days.md`

để tránh mỗi file nói một kiểu khác nhau.
