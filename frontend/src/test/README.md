# Frontend test layout

## Muc tieu

Thu muc nay dung cho component test va UI behavior test, khong dung cho E2E.

## Cau truc de xuat

- `src/test/components/`: test cho component tai su dung
- `src/test/pages/`: test cho page co form/filter/table phuc tap
- `src/test/utils/`: helper, render wrapper, fake data builder
- `src/test/mocks/`: mock nho cho component test

## Rule

- Moi component phuc tap phai co it nhat 1 happy path va 1 validation/error path.
- Test phai bieu dien hanh vi nguoi dung, khong assert implementation detail.
- Neu page can mock API, uu tien MSW hoac service mock nho gon.
