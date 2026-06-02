# Phase 6 — UI Spec: Public Jobs & Apply Form (No CV PDF)

> Mục tiêu: Người dùng public có thể xem list job và bấm **Apply** để gửi form ứng tuyển.

---
## 1. Routes public
| Route | Mô tả |
|-------|--------|
| `/public/jobs` | Danh sách job (ACTIVE) + nút Apply |
| `/public/jobs/:jobId` (tuỳ chọn) | Trang chi tiết job (hiển thị thông tin job + nút Apply) |
| `/public/apply/success/:candidateId` (khuyến nghị) | Trang xác nhận đã gửi đơn (không cần gọi endpoint protected) |

---
## 2. Public job list (`/public/jobs`)
### 2.1 Layout
- Grid/stack card theo responsive
- Mỗi card job hiển thị:
  - `title`
  - `departmentName`
  - `location` (nếu có)
  - `recruitmentUrgency` (nếu có)
  - `requirements` (tóm tắt 2-3 dòng)
  - `skills` dạng badge/tag (nếu job có `skills`)
- Nút CTA:
  - `Apply` (primary) → mở form apply cho `jobId` tương ứng

### 2.2 Error/empty states
- Không có job ACTIVE: hiển thị “No active jobs found” (i18n key mới hoặc dùng key hiện có nếu phù hợp).

---
## 3. Apply form (modal hoặc page)
### 3.1 Trigger
- Nút `Apply` từ job list (hoặc job detail) mở `ApplyJobDialog`.

### 3.2 Field mapping (theo yêu cầu user)
- `name` (text, bắt buộc)
- `email` (email, bắt buộc)
- `phone` (text/telephone, tuỳ chọn)
- `experience` (textarea, text, bắt buộc)
- `skills` (text input hoặc textarea, bắt buộc)
  - Format gợi ý: user nhập theo dòng mới hoặc comma `,` (FE parse ra `string[]`)

### 3.3 Validation (client)
- `name`: required, trim
- `email`: required + validate email format
- `phone`: optional, validate basic (nếu muốn)
- `experience`: required, min length (ví dụ >= 10 chars)
- `skills`:
  - required
  - parse → loại bỏ khoảng trắng, loại trùng rỗng

### 3.4 Submit
- Loading state: disable submit + spinner
- Submit call endpoint public (POST `/candidates/apply`)
- Sau success:
  - navigate `/public/apply/success/:candidateId`

---
## 4. Apply success page
### 4.1 Hiển thị
- Text: “Đã nhận thông tin ứng tuyển. Chúng tôi sẽ liên hệ bạn sớm.”
- Hiển thị `candidateId` (tuỳ chọn, có thể ẩn nếu không cần).

### 4.2 Không bắt buộc
- Không cần gọi endpoint `/candidates/:id` protected.

