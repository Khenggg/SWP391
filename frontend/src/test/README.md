# Frontend test layout

## Muc tieu

Thu muc nay dung cho component test va UI behavior test, khong dung cho E2E.

## Cau truc de xuat

- `src/test/components/`: test cho component tai su dung
- `src/test/pages/`: test cho page co form/filter/table phuc tap
- `src/test/utils/`: helper va render wrapper

## Rule

- Moi component phuc tap phai co it nhat 1 happy path va 1 validation/error path.
- Test phai bieu dien hanh vi nguoi dung, khong assert implementation detail.
- Luong co goi API duoc kiem tra bang E2E tren backend test/production-like, khong chan request bang du lieu gia.
