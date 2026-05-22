# Demo Script

Đây là thứ tự demo tối thiểu cho bản MVP. Mục tiêu là chứng minh luồng chính chạy xuyên suốt từ frontend tới 2 backend và database.

## Luồng Demo Chính

1. Staff login qua `.NET Core API`.
2. Staff tạo lượt xe vào qua `.NET Core API`.
3. Public QR lookup đọc session qua Spring Public API.
4. Staff tìm session bằng card code.
5. `.NET Core API` tính phí, thanh toán cash, tạo receipt và hoàn tất exit.
6. Spring Support API hiển thị dashboard summary.
7. Spring Support API tìm audit log của các action vừa làm.

## Điều Kiện Pass

- JWT dùng được cho cả `.NET` và Spring.
- Entry tạo session `ACTIVE`.
- Card chuyển `IN_USE`.
- Slot chuyển `OCCUPIED`.
- Exit giải phóng card/slot.
- Receipt có dữ liệu thanh toán.
- Dashboard/report/audit đọc được dữ liệu mới.

## Không Demo Nếu Chưa Ổn Định

- Excel export.
- Biểu đồ nâng cao.
- UI polish không ảnh hưởng core flow.
