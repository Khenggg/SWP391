# Frontend E2E layout

## Muc tieu

Thu muc nay dung cho smoke test va acceptance E2E, khong dung de thay the integration test backend.

## Cau truc

- `specs/smoke/`: app boot, login page, health gate
- `specs/p1/`: flow nghiem thu bat buoc
- `specs/p2/`: flow nghiep vu quan trong nhung chua la blocker merge
- `specs/p3/`: flow kho, thanh toan, lost card, mismatch
- `fixtures/`: auth state, du lieu tao san, upload file test
- `pages/`: page object cho flow lap lai
- `support/`: helper login, reset data, API helper
- `reports/`: artifact html, trace, screenshot

## Rule

- Moi spec chi nen co 1 business goal ro rang.
- Ten file phai noi duoc acceptance criteria.
- E2E chi cover critical journey, khong cover tat ca chi tiet UI.
- E2E goi backend that cua moi truong test/production-like; khong intercept API de tra du lieu gia.
