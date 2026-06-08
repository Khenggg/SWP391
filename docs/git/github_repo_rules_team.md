# GitHub Repository Rules cho Team

Tài liệu này giải thích các rule cần áp dụng cho repository của team để tránh lỗi khi làm việc nhóm, bảo vệ các branch quan trọng như `main` và `dev`, đồng thời giữ lịch sử Git sạch, dễ đọc và dễ quản lý.

---

## 1. Không cho commit trực tiếp trên `main` / `dev`

### Ý nghĩa

Thành viên **không được code và commit trực tiếp** trên các branch quan trọng như:

- `main`
- `dev`

Hai branch này là branch chung của team:

| Branch | Vai trò |
|---|---|
| `main` | Chứa code ổn định, bản chính thức hoặc gần production |
| `dev` | Chứa code đang phát triển chung của team |

Mọi thay đổi phải được làm trên branch riêng, sau đó tạo Pull Request để merge vào `dev`.

---

### Ví dụ sai

```bash
git switch dev
git add .
git commit -m "update code"
git push origin dev
```

Sai vì bạn đang commit và push trực tiếp vào `dev`.

---

### Ví dụ đúng

```bash
git switch dev
git pull origin dev
git switch -c feature/login

git add .
git commit -m "feat(auth): add login page"
git push origin feature/login
```

Sau đó tạo Pull Request từ:

```txt
feature/login -> dev
```

---

### Mục đích

Rule này giúp:

- Tránh làm hỏng code chung.
- Tránh xung đột code không kiểm soát.
- Bắt buộc mọi thay đổi phải được review trước khi merge.
- Giúp team biết ai đang làm gì thông qua Pull Request.

---

## 2. Không cho push trực tiếp vào `main` / `dev`

### Ý nghĩa

Dù bạn có lỡ commit trên `main` hoặc `dev` ở máy local, GitHub vẫn sẽ chặn khi bạn push trực tiếp lên remote.

Ví dụ lệnh này sẽ bị chặn:

```bash
git push origin dev
```

hoặc:

```bash
git push origin main
```

---

### Luồng đúng

```txt
feature/login -> Pull Request -> dev
dev -> Pull Request -> main
```

---

### Phân biệt commit trực tiếp và push trực tiếp

| Rule | Ý nghĩa |
|---|---|
| Không commit trực tiếp | Không làm việc trực tiếp trên `main` / `dev` ở máy local |
| Không push trực tiếp | GitHub chặn không cho đẩy code thẳng lên `main` / `dev` |

Trong thực tế, GitHub chủ yếu chặn được **push trực tiếp**. Còn việc commit nhầm ở local thì developer cần tự sửa hoặc dùng Git hook để cảnh báo.

---

## 3. Branch phải theo prefix chuẩn

### Ý nghĩa

Tên branch phải bắt đầu bằng prefix rõ ràng để biết branch đó dùng cho việc gì.

Các prefix được phép:

```txt
feature/
fix/
docs/
test/
chore/
refactor/
hotfix/
release/
bugfix/
```

---

### Ví dụ branch đúng

```txt
feature/login
feature/register
fix/payment-error
docs/update-readme
test/user-service-test
chore/setup-dotnet-api
refactor/booking-service
hotfix/fix-prod-login
release/v1.0.0
bugfix/booking-date-validation
```

---

### Ví dụ branch sai

```txt
login
abc
hung-task
new-code
update
task1
```

Các tên branch này sai vì không nói rõ loại công việc đang làm.

---

## 4. Ý nghĩa từng prefix

| Prefix | Dùng khi nào |
|---|---|
| `feature/` | Làm chức năng mới |
| `fix/` | Sửa lỗi nhỏ hoặc lỗi thông thường |
| `bugfix/` | Sửa bug rõ ràng, thường gắn với issue bug |
| `hotfix/` | Sửa lỗi khẩn cấp trên production hoặc bản quan trọng |
| `docs/` | Sửa tài liệu, README, hướng dẫn |
| `test/` | Thêm hoặc sửa test |
| `chore/` | Setup, cấu hình, cài package, dependency, việc phụ trợ |
| `refactor/` | Sửa lại cấu trúc code nhưng không đổi chức năng |
| `release/` | Chuẩn bị phát hành phiên bản |

---

### Ví dụ task setup dự án

Nếu task là setup `.NET API` và connect Supabase, nên đặt branch là:

```bash
chore/initialize-dotnet-api-connect-supabase
```

Không nên đặt là:

```bash
feature/setup-dotnet
```

Vì setup dự án không phải chức năng người dùng, nên dùng `chore/` hợp lý hơn.

---

## 5. Commit message phải theo Conventional Commits

### Ý nghĩa

Commit message phải viết theo format chuẩn để lịch sử Git dễ đọc, dễ hiểu và dễ tracking.

Format cơ bản:

```txt
type(scope): message
```

Trong đó:

| Thành phần | Ý nghĩa |
|---|---|
| `type` | Loại thay đổi |
| `scope` | Phạm vi thay đổi, có thể có hoặc không |
| `message` | Mô tả ngắn gọn thay đổi |

---

### Ví dụ đúng

```bash
feat(auth): add login API
fix(payment): handle failed transaction
docs(readme): update setup guide
test(user): add unit tests for user service
chore(database): add migration scripts
refactor(booking): simplify booking validation
```

---

### Ví dụ đúng không có scope

```bash
feat: add login page
fix: resolve booking price calculation
chore: configure supabase connection
```

---

### Ví dụ sai

```bash
update code
fix bug
done
login
sửa xong
code mới
```

Sai vì không biết rõ commit đó làm gì, thuộc loại nào, ảnh hưởng phần nào.

---

## 6. Các type commit thường dùng

| Type | Nghĩa |
|---|---|
| `feat` | Thêm chức năng mới |
| `fix` | Sửa lỗi |
| `docs` | Sửa tài liệu |
| `test` | Thêm hoặc sửa test |
| `chore` | Cấu hình, cài package, setup, việc phụ trợ |
| `refactor` | Tối ưu hoặc sắp xếp lại code, không đổi logic |
| `style` | Format code, sửa dấu cách, xuống dòng, không đổi logic |
| `ci` | Cấu hình CI/CD, GitHub Actions |
| `build` | Build tool, dependency |
| `perf` | Tối ưu hiệu năng |

---

### Ví dụ commit nên dùng trong dự án

```bash
feat(auth): add register API
feat(booking): add create booking endpoint
fix(payment): handle VietQR pending transaction
docs(api): update postman usage guide
test(discount): add unit tests for discount service
chore(api): setup dotnet project structure
refactor(user): split user service validation
```

---

## 7. Chặn `.env`, private key, file binary/lớn, file > 5MB

### Ý nghĩa

Không được commit các file nguy hiểm hoặc file quá nặng vào GitHub.

Các file này có thể gây:

- Lộ database password.
- Lộ API key.
- Lộ secret token.
- Lộ private key.
- Repo bị nặng, clone chậm, pull chậm.
- Dính lỗi bảo mật nghiêm trọng.

---

## 8. Chặn file `.env`

### Vì sao phải chặn?

File `.env` thường chứa thông tin nhạy cảm như:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
API_KEY=...
```

Nếu commit file này lên GitHub, người khác có thể lấy được key hoặc password.

---

### Không được commit

```txt
.env
.env.local
.env.production
.env.development
```

---

### Nên commit file mẫu

```txt
.env.example
```

Ví dụ nội dung `.env.example`:

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
```

File `.env.example` chỉ để hướng dẫn người khác biết cần tạo biến môi trường nào, không chứa giá trị thật.

---

## 9. Chặn private key

### Không được commit các file như

```txt
id_rsa
id_ed25519
*.pem
*.key
*.p12
*.pfx
```

Các file này có thể là:

- SSH private key.
- SSL certificate private key.
- Key đăng nhập server.
- Key truy cập cloud.
- Key truy cập database.

Nếu bị lộ, người khác có thể truy cập vào hệ thống hoặc server của team.

---

## 10. Chặn file binary hoặc file lớn

### Không nên commit các file như

```txt
*.zip
*.rar
*.7z
*.exe
*.dll
*.mp4
*.mov
*.psd
*.iso
*.db
*.sqlite
backup.sql
database-dump.zip
```

---

### Vì sao không nên commit?

Git không phù hợp để lưu file nặng hoặc file binary lớn.

Nếu commit nhiều file nặng:

- Repo clone rất lâu.
- Pull/push chậm.
- Lịch sử Git bị phình to.
- Xóa file khỏi thư mục chưa chắc đã xóa khỏi Git history.

---

### Nếu cần lưu file lớn thì dùng gì?

Nên dùng:

```txt
Google Drive
OneDrive
GitHub Release
Git LFS
Cloud Storage
```

---

## 11. Chặn file lớn hơn 5MB

### Ý nghĩa

Nếu file nào lớn hơn `5MB`, hệ thống sẽ không cho commit hoặc không cho push.

Ví dụ nên chặn:

```txt
demo-video.mp4
database-backup.sql
large-image.psd
project-dump.zip
```

---

### Mục đích

Rule này giúp repo nhẹ, sạch và dễ clone.

Trong project code, hầu hết source code đều nhỏ hơn 5MB. Nếu có file vượt quá 5MB, thường đó là file không nên đưa vào Git.

---

## 12. Trước khi push, branch phải chứa latest `origin/dev`

### Ý nghĩa

Trước khi push branch của mình hoặc tạo Pull Request, branch đó phải cập nhật code mới nhất từ `origin/dev`.

Nói đơn giản:

```txt
Code của bạn phải được cập nhật theo code mới nhất của team trước khi đưa lên Pull Request.
```

---

### Ví dụ tình huống

Buổi sáng bạn tạo branch:

```txt
feature/login
```

từ `dev`.

Buổi chiều bạn A merge thay đổi database vào `dev`.

Nếu bạn không cập nhật lại `origin/dev`, branch của bạn vẫn dùng code cũ. Khi tạo Pull Request có thể bị:

- Conflict.
- Lỗi build.
- Lỗi test.
- Sai database schema.
- Ghi đè logic mới của người khác.

---

### Cách cập nhật branch trước khi push

Cách 1: dùng merge

```bash
git switch feature/login
git fetch origin
git merge origin/dev
git push origin feature/login
```

Cách 2: dùng rebase

```bash
git switch feature/login
git fetch origin
git rebase origin/dev
git push origin feature/login
```

---

### Nên dùng merge hay rebase?

| Cách | Khi nào dùng |
|---|---|
| `merge` | Dễ dùng hơn, phù hợp người mới |
| `rebase` | Lịch sử Git sạch hơn, nhưng cần hiểu Git tốt hơn |

Với team sinh viên hoặc team mới học Git, nên dùng `merge` trước cho an toàn.

---

## 13. Flow làm việc chuẩn cho team

Đây là flow khuyến nghị cho tất cả thành viên.

---

### Bước 1: Về branch `dev`

```bash
git switch dev
```

---

### Bước 2: Cập nhật `dev` mới nhất

```bash
git pull origin dev
```

---

### Bước 3: Tạo branch mới đúng prefix

Ví dụ làm chức năng login:

```bash
git switch -c feature/login
```

Ví dụ setup backend .NET:

```bash
git switch -c chore/setup-dotnet-api
```

---

### Bước 4: Code và commit đúng chuẩn

```bash
git add .
git commit -m "feat(auth): add login page"
```

hoặc:

```bash
git commit -m "chore(api): setup dotnet project structure"
```

---

### Bước 5: Cập nhật latest `origin/dev` trước khi push

```bash
git fetch origin
git merge origin/dev
```

Nếu có conflict thì sửa conflict, sau đó:

```bash
git add .
git commit -m "fix: resolve merge conflict with dev"
```

---

### Bước 6: Push branch cá nhân

```bash
git push origin feature/login
```

---

### Bước 7: Tạo Pull Request

Tạo Pull Request từ branch của mình vào `dev`.

```txt
feature/login -> dev
```

Trong Pull Request nên ghi:

```txt
Closes #issue_number
```

Ví dụ:

```txt
Closes #2
```

---

## 14. Flow tổng quát bằng lệnh

```bash
# 1. Về dev mới nhất
git switch dev
git pull origin dev

# 2. Tạo branch mới đúng prefix
git switch -c feature/login

# 3. Code xong thì commit đúng chuẩn
git add .
git commit -m "feat(auth): add login page"

# 4. Cập nhật code mới nhất từ dev trước khi push
git fetch origin
git merge origin/dev

# 5. Push branch cá nhân
git push origin feature/login

# 6. Tạo Pull Request vào dev trên GitHub
```

---

## 15. Checklist trước khi push

Trước khi push branch, kiểm tra các câu sau:

```txt
[ ] Tôi không code trực tiếp trên main/dev.
[ ] Branch của tôi có prefix đúng.
[ ] Commit message của tôi theo Conventional Commits.
[ ] Tôi không commit file .env thật.
[ ] Tôi không commit private key.
[ ] Tôi không commit file zip/rar/exe/video/database dump.
[ ] Không có file nào lớn hơn 5MB.
[ ] Branch của tôi đã cập nhật latest origin/dev.
[ ] Code đã chạy/test ở local.
```

---

## 16. Checklist trước khi tạo Pull Request

```txt
[ ] Pull Request merge vào đúng branch dev.
[ ] Tiêu đề PR rõ ràng.
[ ] Mô tả PR có ghi đã làm gì.
[ ] Có link issue bằng Closes #id nếu có.
[ ] Không có file thừa.
[ ] Không có secret/key/password.
[ ] Không có conflict.
[ ] Build/test không lỗi.
```

---

## 17. Quy ước Pull Request

### Tiêu đề PR nên viết như commit

Ví dụ:

```txt
feat(auth): add login page
fix(payment): handle failed VietQR transaction
chore(api): setup dotnet project structure
docs(readme): update setup guide
```

---

### Mô tả PR nên có

```md
## Summary
- Add login page
- Connect login form with API
- Validate empty email/password

## Testing
- Tested login with valid account
- Tested empty password validation

## Issue
Closes #2
```

---

## 18. Tóm tắt rule cho team

```txt
Không ai được code trực tiếp trên main/dev.
Mọi task phải tạo branch riêng theo prefix chuẩn.
Commit phải viết theo Conventional Commits.
Không được commit file secret, .env, private key, file nặng.
Trước khi push hoặc tạo PR phải cập nhật code mới nhất từ origin/dev.
Tất cả code muốn vào dev/main phải đi qua Pull Request.
```

---

## 19. Ví dụ hoàn chỉnh cho task setup .NET API

Giả sử task là:

```txt
Setup .NET API và connect Supabase
```

Branch nên tạo:

```bash
git switch dev
git pull origin dev
git switch -c chore/setup-dotnet-api-connect-supabase
```

Commit nên viết:

```bash
git add .
git commit -m "chore(api): setup dotnet api and supabase connection"
```

Trước khi push:

```bash
git fetch origin
git merge origin/dev
```

Push:

```bash
git push origin chore/setup-dotnet-api-connect-supabase
```

Sau đó tạo Pull Request:

```txt
chore/setup-dotnet-api-connect-supabase -> dev
```

Mô tả PR:

```md
## Summary
- Initialize .NET API project
- Configure Supabase PostgreSQL connection
- Add basic health check endpoint

## Testing
- Run API locally
- Check database connection log
- Test health check endpoint

## Issue
Closes #2
```

---

## 20. Gợi ý file `.gitignore`

Team nên có `.gitignore` để tránh commit file nhạy cảm hoặc file build.

Ví dụ cơ bản:

```gitignore
# Environment files
.env
.env.*
!.env.example

# Private keys
*.pem
*.key
*.p12
*.pfx
id_rsa
id_ed25519

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# Node / React
node_modules/
dist/
build/

# .NET
bin/
obj/
*.user
*.suo

# Java / Spring Boot
target/
*.class

# Archives
*.zip
*.rar
*.7z

# Database dump
*.db
*.sqlite
*.sql

# Large media
*.mp4
*.mov
*.iso
*.psd
```

Lưu ý: nếu cần commit file SQL migration thì không nên chặn toàn bộ `*.sql`. Khi đó nên tách rule cụ thể hơn, ví dụ chỉ chặn:

```gitignore
backup.sql
dump.sql
database-dump.sql
```

---

## 21. Kết luận

Các rule này giúp team làm việc chuyên nghiệp hơn:

- Code không bị đẩy thẳng vào branch quan trọng.
- Mọi thay đổi đều đi qua Pull Request.
- Branch và commit có quy chuẩn rõ ràng.
- Tránh lộ secret, key, file cấu hình thật.
- Repo nhẹ, sạch, dễ clone.
- Giảm conflict và lỗi merge.
- Dễ quản lý task qua GitHub Issues và Pull Requests.

Đây là bộ rule rất phù hợp cho team sinh viên làm đồ án hoặc dự án nhóm có nhiều backend/frontend cùng phát triển.
