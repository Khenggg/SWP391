# Test Cases

File này dùng để theo dõi test thủ công và test tự động cho MVP/demo.

## Nhóm Test P0

- Auth login thành công/thất bại.
- JWT do `.NET` phát hành được Spring verify.
- Spring giữ `ddl-auto=validate` và không tự sửa schema.
- Vehicle type, card, slot, gate, pricing có dữ liệu hợp lệ.
- Entry transaction tạo session, cập nhật card/slot và ghi audit log.
- Chặn duplicate card, duplicate plate và slot không hợp lệ.
- Fee/payment/exit/receipt chạy hết luồng và giải phóng card/slot.

## Nhóm Test P1

- Public QR lookup không lộ dữ liệu nhạy cảm.
- Monthly pass exit không thu tiền hoặc payment waived/not required.
- Lost card create/approve/reject.
- Plate mismatch pending/confirm/reject.
- Cancel session giải phóng trạng thái đúng.
- Dashboard/report đọc đúng dữ liệu sau khi `.NET` ghi.
- Audit log search tìm được action quan trọng.

## Nhóm Test P2

- Excel export nếu còn thời gian.
- UI polish/responsive.
- Biểu đồ nâng cao.

## Cách Ghi Test Case

```text
TC-XX - Tên test
Module:
Backend/UI:
Precondition:
Steps:
Expected result:
Status:
```
