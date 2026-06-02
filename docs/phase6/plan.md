# Phase 6 — Plan: Public Jobs & Apply Form (No CV PDF)

## 1. Phạm vi
### In scope
- Public page hiển thị danh sách job (chỉ job `ACTIVE`).
- Khi bấm `Apply job`: mở form để user nhập:
  - `name` (tên)
  - `email`
  - `phone` (số điện thoại)
  - `experience` (text)
  - `skills` (list)
- Submit form:
  - Gọi endpoint **public** để backend insert trực tiếp vào bảng `candidate`.
  - Enqueue `MATCH_JOB` cho `jobId` tương ứng.

### Out of scope (mvp)
- Upload file CV.
- UI hiển thị chi tiết pipeline extract CV (vì không có CV file).
- Đa bước onboarding/offer/onboard.

## 2. FE — checklist triển khai
1. Thêm public routes:
   - `/public/jobs` — danh sách job + nút Apply.
   - (tuỳ chọn) trang chi tiết job hoặc mở modal Apply trực tiếp.
2. Thêm UI:
   - `ApplyJobDialog` (modal) / form control chuẩn.
   - Validate client (email format, required fields, parse skills).
3. Add service API:
   - `candidateService.applyForm()` (POST endpoint public).
4. Thành công:
   - Hiển thị screen “Đã nhận ứng tuyển” + (tuỳ chọn) link vào trạng thái.
5. Axios interceptor:
   - Cần update `is-public-api-url.ts` để đánh dấu endpoint apply form + jobs là “public” (không gắn Bearer nếu còn token).

## 3. BE — checklist triển khai
1. Chỉnh authorization cho `GET /jobs`:
   - Nếu không có `Authorization`: chỉ trả các job `ACTIVE` (không cho xem CLOSED/ARCHIVED).
2. Tạo endpoint public cho apply form:
   - `POST /candidates/apply` (không cần token).
3. Insert candidate (không qua PDF extract):
   - Insert vào bảng `candidate` với fields: `name/email/phone/experience/skills` (+ các fields bắt buộc khác của schema).
   - Set default:
     - `cvFileName`: giá trị placeholder (ví dụ: `FORM_APPLY`)
     - `cvPreviewable`: `false`
     - `extractStatus`: định nghĩa theo cách matching thực thi với candidate form (xem phần “Open questions”)
4. Enqueue matching:
   - Sau khi insert thành công, enqueue `MATCH_JOB` cho `(candidateId, jobId)`.
5. Response:
   - Trả về `candidateId` (và/hoặc `matchTasksQueued`) để FE hiển thị trạng thái.

## 4. Open questions (cần chốt sớm)
1. Matching hiện tại có thể dùng trực tiếp `candidate.experience/skills` mà không cần CV extract không?
   - Nếu hiện tại engine chỉ dựa vào nội dung CV, BE cần cách xử lý khác cho form application (ví dụ: tạo “extract result” nội bộ từ `experience/skills` hoặc triển khai task `MATCH_JOB_FORM` riêng).
2. Submission của user có được phép apply nhiều lần (tạo nhiều candidate) hay cần deduplicate theo `email+jobId`?
3. `skills` được lưu trên DB dạng `string[]` hay chuỗi join? (contract có thể chốt theo kiểu BE hiện hành)

