# Tài Liệu Dự Án

Thư mục này chứa tài liệu quản lý, đặc tả, API, test và hướng dẫn làm việc cho dự án Parking Building Management System.

## Cấu Trúc Thư Mục

```text
docs/
  README.md
  specification/   Đặc tả yêu cầu, API, ERD và implementation spec
  planning/        Sprint plan, GitHub Project và meeting notes
  git/             Kiến thức Git, branch và Pull Request
  testing/         Test cases, demo script và Postman guide
  references/      File PDF/DOCX tham khảo
  Parking Building Management UI (1)/  UI mẫu/tham khảo
```

## Specification

- `specification/SRS.md`: điểm vào của tài liệu yêu cầu.
- `specification/Developer_Implementation_Specification_Dual_Backend_NET_SpringBoot.md`: tài liệu triển khai chính cho kiến trúc 2 backend.
- `specification/API_Contract.md`: danh sách base URL, prefix và endpoint ưu tiên.
- `specification/ERD.md`: ghi chú quan hệ bảng và nguyên tắc schema. Migration thật vẫn thuộc `.NET Core API`.

## Planning

- `planning/Sprint_30_Day_Plan.md`: kế hoạch 5 sprint trong 30 ngày.
- `planning/GitHub_Project_Guide.md`: cách tạo GitHub Project, field, milestone, priority và issue.
- `planning/Meeting_Notes.md`: mẫu ghi biên bản họp, quyết định và action item.

## Git

- `git/Git_Workflow.md`: quy trình branch, commit, pull request và merge.
- `git/Branch_Naming.md`: quy tắc đặt tên branch.
- `git/branching.md`: tóm tắt nhanh luồng branch `main`/`dev`/feature.

## Testing

- `testing/Test_Cases.md`: nhóm test bắt buộc cho MVP/demo.
- `testing/Demo_Script.md`: thứ tự demo tối thiểu.
- `testing/Postman_Guide.md`: cách dùng collection và environment trong thư mục `postman/`.

## References

- `references/bo_sung_kien_thuc_github_hoan_chinh_1.pdf`: tài liệu tham khảo về Git/GitHub.
- `references/huong_dan_git_branch_github_1.docx`: tài liệu tham khảo về branch/GitHub.
- `Parking Building Management UI (1)/`: UI mẫu/tham khảo, không phải source chính của frontend hiện tại.

## Ghi Chú Dọn Dẹp

Hiện chưa nên xóa file Markdown nào trong thư mục này vì mỗi file đang giữ một vai trò riêng. Nếu muốn giảm số lượng file sau này, có thể cân nhắc gộp `git/branching.md` vào `git/Git_Workflow.md`, nhưng chỉ nên làm khi team đã thống nhất để tránh làm mất link tài liệu đang được dùng.
