# Phase 6 — Public Jobs & Apply Form (No CV PDF)

Giai đoạn bổ sung màn **public UI** để người dùng xem danh sách job tuyển dụng và **nộp đơn ứng tuyển** ngay từ trình duyệt.

Điểm khác Phase này:
- Không yêu cầu đăng nhập (không dùng `Authorization`).
- Không upload CV dạng file PDF.
- Khi bấm **Apply**, user điền form (email, số điện thoại, tên, kinh nghiệm (text), skills) → hệ thống **insert trực tiếp vào bảng `candidate`** và enqueue matching tương ứng.

## Mục tiêu
- `Public job list` (chỉ hiển thị job phù hợp/ACTIVE).
- `Public apply form` gắn với `jobId` được chọn.
- `Insert candidate` + `enqueue match job` (không qua pipeline extract CV từ file).

## Trạng thái đầu vào
- FE đã có:
  - HR route: `/hr/jobs`
  - Public route upload CV PDF: `/public/upload`
  - Public route trạng thái CV: `/public/cv/:candidateId/status`
- BE đã có các endpoint nền tảng ở contract hiện tại (jobs/candidates/upload/matches...).

## Tài liệu
- `api-contract.md` — hợp đồng endpoint public cho job/apply form
- `ui-spec.md` — màn UI public job list + form apply
- `plan.md` — checklist FE/BE để triển khai

