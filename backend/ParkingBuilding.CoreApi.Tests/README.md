# ParkingBuilding.CoreApi.Tests

## Muc tieu

Thu muc nay dung cho integration test va contract test cua .NET Core API.

## Cau truc de xuat

- `Smoke/`: health, auth-check, boot gate
- `Contracts/`: request/response/status code
- `Flows/`: entry, exit, reservation, payment
- `Fixtures/`: data builder, auth token helper, db reset helper

## Rule

- Uu tien test theo use case nghiep vu, khong test controller theo tung method mot cach roi rac.
- Moi flow mutation DB phai co assert state truoc/sau.
- Test phai co the dung lam acceptance gate cho PR.
