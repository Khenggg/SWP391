# Spring Boot test layout

## Muc tieu

Thu muc nay dung cho test read-model, report, public API, va support API contract.

## Cau truc de xuat

- `java/com/parkingbuilding/support/smoke/`
- `java/com/parkingbuilding/support/contracts/`
- `java/com/parkingbuilding/support/flows/`
- `resources/application-test.yml`

## Rule

- Test read/report phai khoa response va bo loc nghiep vu.
- Khong viet test chi de assert framework startup.
- Test can bat duoc lech contract giua support API va frontend.
