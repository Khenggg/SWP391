# Branch Naming

Quy tắc đặt tên branch: viết thường, ngắn gọn, có khu vực phụ trách và mô tả đúng phạm vi task.

## Mẫu Tên Branch

```text
feature/<area>-<short-name>
fix/<area>-<short-name>
docs/<short-name>
test/<area>-<short-name>
```

## Area Nên Dùng

```text
dotnet
spring
frontend
database
docs
test
integration
```

## Ví Dụ

```text
feature/dotnet-auth-login
feature/spring-dashboard-summary
feature/frontend-staff-entry
fix/dotnet-card-status-conflict
docs/api-contract-entry-flow
test/entry-duplicate-card
```

## Lưu Ý

- Không đặt tên branch quá chung như `feature/update` hoặc `fix/bug`.
- Một branch nên gắn với một issue hoặc một nhóm việc nhỏ có liên quan trực tiếp.
- Nếu task quá lớn, tách issue và branch nhỏ hơn trước khi code.
