# Phase 4 — API Contract (Draft): Offer & Onboard

> **Base URL:** `http://localhost:8081/v1`  
> **Trạng thái:** Draft — triển khai sau khi PO chốt [plan.md](./plan.md) §9.  
> **Wrapper:** `CodeResponse<T>`

---

## 1. Offer

### 1.1. GET `/interview-processes/:id/offer`

**Điều kiện:** Process tồn tại.

**Response:** `CodeResponse<JobOfferResponse | null>`

```json
{
  "success": true,
  "data": {
    "id": 10,
    "processId": 102,
    "status": "SENT",
    "payload": {
      "version": 1,
      "fields": {
        "salary": "3500 USD gross/month",
        "benefits": "BHXH, 15 ngày phép",
        "proposedStartDate": "2026-07-01",
        "candidateMessage": "Chúc mừng bạn..."
      }
    },
    "sentAt": "2026-06-01T10:00:00+07:00",
    "sentToEmail": "candidate@example.com",
    "createdBy": "Trần Thị Lan",
    "createdAt": "2026-06-01T09:00:00+07:00",
    "updatedAt": "2026-06-01T10:00:00+07:00"
  }
}
```

### 1.2. PUT `/interview-processes/:id/offer`

Tạo hoặc cập nhật **DRAFT**.

**Request:**

```json
{
  "payload": {
    "version": 1,
    "fields": {
      "salary": "3500 USD gross/month",
      "benefits": "BHXH, 15 ngày phép",
      "candidateMessage": "Nội dung gửi UV..."
    }
  },
  "createdBy": "Trần Thị Lan"
}
```

**Side effects:**

- Insert/update `job_offers` (`status = DRAFT`)
- `interview_processes.status` → `OFFER` (lần đầu)
- `cv_matches.pipeline_status` → `OFFER`
- Activity `OFFER_DRAFTED`

**Errors:**

| HTTP | errorCode | Khi nào |
|------|-----------|---------|
| 400 | `INVALID_PROCESS_STATUS` | Không phải `INTERVIEW_DONE` / `OFFER` |
| 400 | `INTERVIEW_NOT_PASSED` | Result không phải `PASSED` *(nếu bật rule)* |
| 404 | `PROCESS_NOT_FOUND` | |

### 1.3. POST `/interview-processes/:id/offer/send`

Gửi tự động cho ứng viên.

**Request (optional):**

```json
{
  "resend": false
}
```

**Side effects:**

1. Validate `candidates.email`
2. Enqueue `SEND_OFFER_EMAIL` (hoặc gửi đồng bộ MVP)
3. `offer.status` → `SENT`, `sent_at`, `sent_to_email`
4. Activity `OFFER_SENT`

**Response:** `CodeResponse<JobOfferResponse>`

**Errors:**

| HTTP | errorCode | Khi nào |
|------|-----------|---------|
| 400 | `MISSING_CANDIDATE_EMAIL` | UV không có email |
| 400 | `OFFER_ALREADY_SENT` | Đã SENT và không `resend` |
| 404 | `OFFER_NOT_FOUND` | Chưa có draft |

### 1.4. PATCH `/interview-processes/:id/offer/status`

HR cập nhật khi UV phản hồi ngoài hệ thống.

**Request:**

```json
{
  "status": "ACCEPTED",
  "note": "UV đồng ý qua điện thoại"
}
```

`status`: `ACCEPTED` | `DECLINED` | `WITHDRAWN`

---

## 2. Onboard

### 2.1. GET `/interview-processes/:id/onboard`

**Response:** `CodeResponse<OnboardPlanResponse | null>`

### 2.2. PUT `/interview-processes/:id/onboard`

Tạo / cập nhật kế hoạch (chưa terminal).

**Request:**

```json
{
  "onboardDate": "2026-07-15",
  "welcomeContactName": "Nguyễn Văn A",
  "welcomeContactEmail": "welcome@company.com",
  "welcomeContactPhone": "0901234567",
  "arrangementNotes": "Đón tại sảnh tầng 1, 8h30",
  "confirmedBy": "HR Lan"
}
```

**Side effects:** Activity `ONBOARD_PLANNED` (không đổi `ONBOARDED` cho đến confirm).

### 2.3. POST `/interview-processes/:id/onboard/confirm`

**Side effects:**

1. Validate `onboardDate` đã có
2. `interview_processes.status` → `ONBOARDED`
3. `cv_matches.pipeline_status` → `ONBOARDED`
4. Activity `ONBOARD_CONFIRMED`

**Response:** `CodeResponse<OnboardPlanResponse>` kèm `process.status`

**Errors:**

| HTTP | errorCode | Khi nào |
|------|-----------|---------|
| 400 | `INVALID_PROCESS_STATUS` | Chưa `OFFER` / chưa đủ điều kiện |
| 400 | `ONBOARD_DATE_REQUIRED` | |

---

## 3. Types (TypeScript gợi ý)

```typescript
type OfferStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

interface OfferPayload {
  version: number;
  fields: Record<string, string | number | null>;
}

interface JobOffer {
  id: number;
  processId: number;
  status: OfferStatus;
  payload: OfferPayload;
  sentAt?: string;
  sentToEmail?: string;
}

interface OnboardPlan {
  id: number;
  processId: number;
  onboardDate: string; // YYYY-MM-DD
  welcomeContactName: string;
  welcomeContactEmail?: string;
  welcomeContactPhone?: string;
  arrangementNotes?: string;
  confirmedAt?: string;
}
```

---

## 4. Calendar (Phase 3 — cập nhật)

`GET /interview-schedules` — mặc định **`calendarOnly=true`**: chỉ `status = SCHEDULED` (ẩn `COMPLETED` sau khi PV xong).

| Param | Default | Mô tả |
|-------|---------|-------|
| `calendarOnly` | `true` | Lịch sắp diễn ra; `false` = lịch sử (gồm COMPLETED) |

---

## 5. React Query keys (gợi ý)

| Key | Endpoint |
|-----|----------|
| `['interview-process', id, 'offer']` | GET offer |
| `['interview-process', id, 'onboard']` | GET onboard |

**Invalidate:** sau `send`, `confirm onboard`, `reject`.
