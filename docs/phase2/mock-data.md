# Mock Data — Phase 2

> File code: [`src/shared/lib/phase2-mock-data.ts`](../../src/shared/lib/phase2-mock-data.ts)

---

## 1. Mục đích

Cung cấp dữ liệu giả và hàm mock mutation để FE dev UI Phase 2 khi Backend chưa sẵn sàng.

**Bật mock trong development:**

```env
# .env.development
VITE_USE_PHASE2_MOCK=true
```

Khi `VITE_USE_PHASE2_MOCK=true`, các service sau dùng mock:

| Service | Hàm mock |
|---------|----------|
| `matchService.getAll` | `mockGetMatches()` |
| `matchService.triggerMatchBatch` | `mockTriggerMatch()` |
| `candidateService.uploadCVs` | `mockUploadCandidates()` |
| `interviewProcessService.*` | `mockGetProcesses`, `mockCreateProcess`, ... |

---

## 2. Datasets

### 2.1. `mockCVMatchesPhase2` (8 records)

| matchId | Candidate | Job | Score | pipelineStatus | processId | Use case |
|---------|-----------|-----|-------|----------------|-----------|----------|
| 1 | Nguyễn Minh Đức | Senior FE | 92 | NONE | null | Tạo process mới |
| 2 | Bùi Thanh Sơn | Senior FE | 85 | SHORTLISTED | 102 | Nút disabled trên matching |
| 3 | Trịnh Văn Khoa | Senior FE | 65 | NONE | null | Score thấp |
| 4 | Trần Thị Hương | Backend Java | 88 | CONTACTED | 101 | Đã liên hệ |
| 5 | Trịnh Văn Khoa | Backend Java | 82 | REJECTED | 103 | Rejected |
| 6 | Đặng Minh Tú | Marketing | 80 | NONE | null | Job khác |
| 7 | Nguyễn Minh Đức | DevOps | 55 | NONE | null | Multi-job candidate |
| 8 | Trịnh Văn Khoa | DevOps | 91 | NONE | null | High score DevOps |

### 2.2. `mockInterviewProcesses` (3 records)

| processId | Status | contactStatus | Ghi chú |
|-----------|--------|---------------|---------|
| 101 | CONTACTED | CONTACTED | Demo timeline đầy đủ |
| 102 | SHORTLISTED | NOT_CONTACTED | Demo form liên hệ |
| 103 | REJECTED | CONTACTED | Demo read-only + rejectReason |

### 2.3. `mockProcessActivities`

Activities keyed by `processId` — xem file TS cho chi tiết từng event.

---

## 3. Mock functions

| Function | Mô phỏng API | Ghi chú |
|----------|--------------|---------|
| `mockUploadCandidates(files, jobIds?)` | POST /candidates/upload | Trả `UploadCandidatesResponse` |
| `mockTriggerMatch(jobIds, candidateIds)` | POST /matches/trigger | Trả `TriggerMatchResponse` |
| `mockGetMatches()` | GET /matches | Sort score DESC |
| `mockGetProcesses(params)` | GET /interview-processes | Filter + pagination |
| `mockGetProcessesByCandidate(id)` | GET .../candidate/:id | |
| `getMockProcessDetail(id)` | GET /interview-processes/:id | |
| `mockCreateProcess(body)` | POST /interview-processes | 409 nếu trùng |
| `mockUpdateContact(id, body)` | POST .../contact | Sync match status |
| `mockUpdateProcessMetadata(id, body)` | PATCH /interview-processes/:id | |
| `mockRejectProcess(id, reason)` | POST .../reject | |
| `mockDelay(ms)` | Network latency | Default 300ms |

---

## 4. Scenarios có sẵn

Import `phase2MockScenarios`:

```typescript
import { phase2MockScenarios } from '@/shared/lib/phase2-mock-data';

// Match NONE — mở CreateProcessDialog
phase2MockScenarios.freshMatch;

// Process SHORTLISTED — submit contact form
phase2MockScenarios.shortlistedProcess;

// Process CONTACTED — xem timeline
phase2MockScenarios.contactedProcess;

// Process REJECTED — form disabled
phase2MockScenarios.rejectedProcess;
```

---

## 5. Flow test thủ công với mock

1. `mockGetMatches()` → chọn match id `1`
2. `mockCreateProcess({ matchId: 1, assignedHr: 'Test HR' })` → process mới id 104
3. `mockUpdateContact(104, { contactStatus: 'CONTACTED', contactNote: 'Test' })`
4. `getMockProcessDetail(104)` → verify activities length = 2

---

## 6. Response examples (JSON)

Chi tiết request/response đầy đủ: [api-contract.md](./api-contract.md).

**GET /interview-processes/101:**

```json
{
  "success": true,
  "message": "SUCCESS",
  "data": {
    "process": {
      "id": 101,
      "matchId": 4,
      "candidateId": 2,
      "candidateName": "Trần Thị Hương",
      "jobId": 2,
      "jobTitle": "Backend Developer (Java)",
      "matchScore": 88,
      "status": "CONTACTED",
      "contactStatus": "CONTACTED",
      "contactNote": "Đã gọi điện lúc 14h, ứng viên đồng ý phỏng vấn online tuần sau",
      "contactedAt": "2026-05-30T14:00:00+07:00",
      "assignedHr": "Trần Thị Lan",
      "notes": "Backend mạnh, ưu tiên vòng technical",
      "createdAt": "2026-05-29T10:30:00+07:00",
      "updatedAt": "2026-05-30T14:00:00+07:00"
    },
    "activities": [
      {
        "id": 1001,
        "processId": 101,
        "action": "CONTACT_MARKED",
        "fromStatus": "SHORTLISTED",
        "toStatus": "CONTACTED",
        "note": "Đã gọi điện lúc 14h...",
        "performedBy": "Trần Thị Lan",
        "createdAt": "2026-05-30T14:00:00+07:00"
      },
      {
        "id": 1000,
        "processId": 101,
        "action": "CREATED",
        "toStatus": "SHORTLISTED",
        "performedBy": "Trần Thị Lan",
        "createdAt": "2026-05-29T10:30:00+07:00"
      }
    ]
  }
}
```

---

*Đồng bộ với [api-contract.md](./api-contract.md) và [ui-spec.md](./ui-spec.md).*
