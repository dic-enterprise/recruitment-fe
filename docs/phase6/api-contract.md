# Phase 6 — API Contract: Public Jobs & Apply Form (No CV PDF)

## 0. Lưu ý
- Contract tham chiếu `docs/api-contract.md` (global mô hình + `CodeResponse<T>`).
- Phase này bổ sung **public apply form** để tạo record `candidate` trực tiếp (không upload CV PDF).

---
## 1. Jobs: công khai list ACTIVE

### 1.1 `GET /jobs` — Auth optional

**Auth:**
- Có token (`Authorization: Bearer ...`): trả theo query `status`, `departmentId`, `search` như hiện tại.
- Không có token: **chỉ trả job `status = ACTIVE`**, bỏ qua các filter cho phép xem `CLOSED/ARCHIVED`.

**Query params (tuỳ chọn):**
- `status` (nếu public thì BE luôn ép `ACTIVE`)
- `departmentId`
- `search`

**Response 200:**
- `CodeResponse<List<Job>>`

---
## 2. Public apply form: tạo candidate & enqueue matching

### 2.1 `POST /candidates/apply` — Public (không cần token)

**Auth:** none

**Content-Type:** `application/json`

**Request body:**
```json
{
  "jobId": 123,
  "name": "Nguyen Van A",
  "email": "candidate@example.com",
  "phone": "0123 456 789",
  "experience": "Nội dung kinh nghiệm (text)",
  "skills": ["React", "TypeScript"],
  "source": "PUBLIC_APPLY"
}
```

**Validation (gợi ý):**
- `jobId`: required, phải tồn tại job và (nếu public) job phải `ACTIVE`
- `name`: required, trim, độ dài tối thiểu (ví dụ >= 2)
- `email`: required, format email
- `phone`: optional, validate theo regex cơ bản (nếu product yêu cầu)
- `experience`: required, min length (ví dụ >= 10 chars)
- `skills`: required, mỗi skill trim + loại rỗng, không cho empty list

### 2.2 Insert vào bảng `candidate` (không qua CV extract từ file)
Sau khi validate:
1. Insert record vào bảng `candidate` với fields:
   - `name`, `email`, `phone`
   - `experience`
   - `skills` (string[] hoặc format BE đang dùng)
2. Set default:
   - `cvFileName`: giá trị placeholder (ví dụ: `FORM_APPLY`)
   - `cvPreviewable`: `false`
   - `extractStatus`: phụ thuộc cách BE thực thi matching (xem Open questions)
   - `employmentTag`: mặc định (ví dụ `CHUA_NHAN_VIEC`)

### 2.3 Enqueue matching
- Sau insert thành công, enqueue `MATCH_JOB` cho cặp `(candidateId, jobId)`.
- Matching cần lấy dữ liệu từ `candidate.experience/skills` (không dựa vào CV extract task từ file).

### 2.4 Response
**Response 200:**
- `CodeResponse<{ candidate: Candidate, matchTasksQueued?: number }>`

**Error:**
- `400` invalid payload / validation error
- `404` jobId không tồn tại (hoặc job không `ACTIVE` trong chế độ public)
- `409` nếu BE deduplicate theo constraint (tùy rule)

---
## 3. Open questions (cần chốt trước triển khai BE)
1. Matching hiện tại chạy dựa vào dữ liệu nào?
   - Nếu engine chỉ dựa vào kết quả extract từ CV: cần thêm bước “form->extract” nội bộ hoặc task/flow matching riêng.
2. Candidate deduplication:
   - Nếu user apply nhiều lần cùng email cho cùng job: tạo nhiều candidate hay cập nhật candidate cũ?
3. Format `skills` trên DB:
   - DB lưu `string[]` hay chuỗi join (ví dụ comma-separated)?

