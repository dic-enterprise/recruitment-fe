# UI Developer Spec — Phase 2 (Interview Process)

> Hướng dẫn implement UI cho FE developers. Mock data: [`phase2-mock-data.ts`](../../src/shared/lib/phase2-mock-data.ts).
>
> API: [api-contract.md](./api-contract.md) · Plan: [plan.md](./plan.md)

---

## 1. Tổng quan màn hình

| # | Route | Component | Mô tả |
|---|-------|-----------|-------|
| 1 | `/hr/matches` | `MatchResultsPage` | **Nâng cấp** — thêm pipeline + action |
| 2 | `/hr/interview-processes` | `InterviewProcessesPage` | **Mới** — danh sách process |
| 3 | `/hr/interview-processes/:id` | `InterviewProcessDetailPage` | **Mới** — stepper + contact + timeline |
| 4 | `/hr/candidates` | `CandidatesPage` | **Nâng cấp** — Upload CV dialog (files + jobs) |
| 5 | `/hr/candidates/:id` | `CandidateDetailPage` | **Nâng cấp** — section processes |

**Sidebar:** thêm link sau "Matching CV":

```typescript
{ to: '/hr/interview-processes', label: 'Interview Process', icon: GitBranch }
```

---

## 2. Design tokens & components tái sử dụng

| Thành phần | Nguồn | Ghi chú |
|------------|-------|---------|
| Layout | `AppLayout`, `PageHeader` | Giữ pattern hiện có |
| Table | `BaseTable` | Sort client-side nếu BE chưa hỗ trợ |
| Dialog | shadcn `Dialog` | StartInterviewDialog |
| Form | shadcn `Form` + RHF hoặc Formik | Theo convention page gần nhất |
| Badge | Pattern `StatusBadges.tsx` | Tạo badge mới tách file |
| Toast | `sonner` via Query/Mutation cache | Không toast thủ công trừ success cụ thể |
| Loading | `Loader2` spinner | Giống `CandidateDetailPage` |

---

## 3. Components mới

### 3.1. `PipelineStatusBadge`

**Path:** `src/shared/components/hr/PipelineStatusBadge.tsx`

| Status | Label (VI) | className gợi ý |
|--------|------------|-----------------|
| `NONE` | Chưa xử lý | `bg-muted text-muted-foreground` |
| `SHORTLISTED` | Đã chọn | `bg-blue-100 text-blue-700 dark:bg-blue-900/40` |
| `CONTACTED` | Đã liên hệ | `bg-indigo-100 text-indigo-700` |
| `INTERVIEW_SCHEDULED` | Đã lên lịch | `bg-primary/15 text-primary` |
| `INTERVIEW_DONE` | Đã phỏng vấn | `bg-purple-100 text-purple-700` |
| `OFFER` | Offer | `bg-amber-100 text-amber-700` |
| `ONBOARDED` | Onboard | `bg-success text-success-foreground` |
| `REJECTED` | Từ chối | `bg-destructive/15 text-destructive` |

```typescript
interface Props {
  status: PipelineStatus;
  size?: 'sm' | 'md';
}
```

### 3.2. `ContactStatusBadge`

| Status | Label | Icon |
|--------|-------|------|
| `NOT_CONTACTED` | Chưa liên hệ | `PhoneOff` hoặc `—` |
| `CONTACTED` | Đã liên hệ | `Phone` + check xanh |

### 3.3. `ProcessStepper`

**Path:** `src/shared/components/hr/ProcessStepper.tsx`

7 bước cố định:

```typescript
const STEPS = [
  { key: 'SHORTLISTED', label: 'Shortlist' },
  { key: 'CONTACTED', label: 'Liên hệ HR' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Lên lịch PV' },
  { key: 'INTERVIEW_DONE', label: 'Kết quả PV' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'ONBOARDED', label: 'Onboard' },
] as const;
```

**Logic hiển thị:**

| Điều kiện | UI |
|-----------|-----|
| Step index < current | ✓ completed (màu primary) |
| Step index === current | ● active (ring) |
| Step index > current && key ∈ Phase 3+ | ○ locked + `Tooltip`: "Sẽ có ở Phase 3" |
| `status === REJECTED` | Stepper mờ, banner đỏ hiển thị `rejectReason` |

```typescript
interface Props {
  status: PipelineStatus;
  rejectReason?: string;
}
```

**Layout:** horizontal trên desktop (`md+`), vertical stack trên mobile.

### 3.4. `StartInterviewDialog`

**Trigger:** nút **Start Interview** trên `MatchResultsPage`.

**Props:**

```typescript
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: CVMatch;
  onSuccess?: () => void;
}
```

**Nội dung dialog (xác nhận, không nhập form):**

```
┌─ Start Interview ─────────────────────────────── [×] ┐
│ Ứng viên:  Nguyễn Minh Đức                          │
│ Job:       Senior Frontend Developer                │
│ Điểm match: [92%]                                   │
│                                                     │
│              [Hủy]  [Start Interview]               │
└─────────────────────────────────────────────────────┘
```

**API:** `POST /interview-processes` body `{ "matchId": <id> }` — không gửi `assignedHr` / `notes`. HR phụ trách cập nhật trên `InterviewProcessDetailPage` (PATCH).

**States:**

| State | UI |
|-------|-----|
| Loading | Disable nút, spinner trên "Start Interview" |
| 409 | Toast: "Đã tồn tại quy trình cho ứng viên và job này" |
| Success | Toast success + navigate `/hr/interview-processes/:id` |

### 3.5. `ContactStatusForm`

**Path:** `src/shared/components/hr/ContactStatusForm.tsx`

```typescript
interface Props {
  process: InterviewProcess;
  onUpdated?: (process: InterviewProcess) => void;
  readOnly?: boolean; // true nếu REJECTED / ONBOARDED
}
```

**Fields:**

| Field | Component | Ghi chú |
|-------|-----------|---------|
| Trạng thái liên hệ | `Select` hoặc radio | `NOT_CONTACTED` / `CONTACTED` |
| Ghi chú | `Textarea` | Placeholder: "VD: Đã gọi điện, hẹn PV tuần sau" |
| Thời gian liên hệ | Read-only text | Hiện khi `contactedAt` có giá trị |

**Submit:** `POST /interview-processes/:id/contact`

**Disabled khi:** `process.status === 'REJECTED' | 'ONBOARDED'`

### 3.6. `UploadCvDialog`

**Path:** `src/shared/components/hr/UploadCvDialog.tsx`  
**Trigger:** nút **Upload CV** trên `CandidatesPage`.

**Layout (2 cột):**

```
┌─ Upload CV ────────────────────────────────────────────────┐
│  [File CV — trái]          │  [Jobs matching — phải]     │
│  - Chọn nhiều PDF          │  - Checkbox list job ACTIVE  │
│  - Danh sách file + xóa   │  - Có thể để trống (empty)  │
│                            │  - Empty state: chỉ extract │
├────────────────────────────┴──────────────────────────────┤
│  [Hủy]  [Upload (n)]                                       │
└────────────────────────────────────────────────────────────┘
```

**API:** `POST /candidates/upload` — `files` + `jobIds[]` (optional), `source: HR_UPLOAD`.

**Toast success:** số CV, `extractTasksQueued`, `matchTasksQueued` (nếu > 0).

### 3.7. `ProcessTimeline`

**Path:** `src/shared/components/hr/ProcessTimeline.tsx`

Render `activities[]` newest-first.

| action | Label hiển thị |
|--------|----------------|
| `CREATED` | Tạo Interview Process |
| `METADATA_UPDATED` | Cập nhật thông tin |
| `CONTACT_MARKED` | {performedBy} đánh dấu đã liên hệ |
| `REJECTED` | Từ chối ứng viên |
| `STATUS_CHANGED` | Chuyển trạng thái: {from} → {to} |

Format thời gian: `formatDateTime` từ `@/shared/lib/utils`.

---

## 4. Chi tiết từng page

### 4.0. CandidatesPage (nâng cấp upload)

**File:** `src/pages/hr/CandidatesPage.tsx`

- Bỏ `<input type="file">` ẩn; mở `UploadCvDialog` khi bấm **Upload CV**.
- Không block table loading khi upload (dialog tự quản lý pending).

### 4.1. MatchResultsPage (nâng cấp)

**File:** `src/pages/hr/MatchResultsPage.tsx`

**Header:** nút **Start Matching CV** → `StartMatchingCvDialog` (trái: candidate `extractStatus=COMPLETE`, phải: job Active) → `POST /matches/trigger` với `{ jobIds, candidateIds }`.

#### Cột mới

| Header | key | width | render |
|--------|-----|-------|--------|
| Pipeline | `pipelineStatus` | 130px | `<PipelineStatusBadge />` |
| Action | — | 140px | Nút **Start Interview** |

#### Sort

```typescript
const sortedMatches = useMemo(
  () => [...filteredMatches].sort((a, b) => b.score - a.score),
  [filteredMatches],
);
```

#### Nút "Start Interview" — enable/disable

```typescript
function canStartInterview(match: CVMatch): boolean {
  if (match.processId != null) return false;
  return (match.pipelineStatus ?? 'NONE') === 'NONE';
}
```

Tooltip khi disabled: "Đã có quy trình phỏng vấn".

#### High match hint

Nếu `match.score >= job.minMatchingScore` (lookup từ jobs query): icon `Star` nhỏ cạnh score.

---

### 4.2. InterviewProcessesPage (mới)

**File:** `src/pages/hr/InterviewProcessesPage.tsx`

#### Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['interview-processes', { jobId, status, contactStatus, search, page }],
  queryFn: () => interviewProcessService.getAll({ jobId, status, contactStatus, search, page, size: 20 }),
});
```

#### Toolbar

```
[Filter Job ▼]  [Pipeline Status ▼]  [Contact ▼]  [🔍 Search...]     Tổng: 12
```

Filter options Pipeline Status (Phase 2): `ALL`, `SHORTLISTED`, `CONTACTED`, `REJECTED`

#### Columns

| # | Header | render |
|---|--------|--------|
| 1 | Ứng viên | Link → `/hr/candidates/:id` |
| 2 | Job | Text + truncate |
| 3 | Score | `<ScoreBadge />` |
| 4 | Trạng thái | `<PipelineStatusBadge />` |
| 5 | Liên hệ | `<ContactStatusBadge />` |
| 6 | Cập nhật | `formatDate(updatedAt)` |

**Row click:** `navigate(/hr/interview-processes/${id})`

#### Empty state

```
Chưa có Interview Process nào.
Tạo quy trình từ trang Matching CV →
[Đi tới Matching CV]  (Link to /hr/matches)
```

---

### 4.3. InterviewProcessDetailPage (mới)

**File:** `src/pages/hr/InterviewProcessDetailPage.tsx`

#### Layout (desktop)

```
┌──────────────────────────────────────────────────────────────┐
│ ← Back    Interview Process #101                             │
│           Nguyễn Minh Đức · Senior Frontend Developer        │
├──────────────────────────────────────────────────────────────┤
│  [ProcessStepper — full width]                               │
├────────────────────────────┬─────────────────────────────────┤
│  Thông tin (card)          │  Liên hệ HR (card)              │
│  - Ứng viên (link)         │  <ContactStatusForm />          │
│  - Job                     │                                 │
│  - Match score             │                                 │
│  - HR phụ trách (editable) │                                 │
│  - Ghi chú (editable)      │                                 │
│  [Lưu metadata]            │                                 │
├────────────────────────────┴─────────────────────────────────┤
│  Timeline (card full width)                                  │
│  <ProcessTimeline activities={...} />                        │
└──────────────────────────────────────────────────────────────┘
```

#### Header actions (optional)

- Nút "Từ chối" → dialog nhập lý do → `POST .../reject`
- Link "Xem CV" → `/hr/candidates/:candidateId`

#### Metadata edit

PATCH `/interview-processes/:id` — nút "Lưu" riêng, không mix với contact form.

#### Loading / error

| State | UI |
|-------|-----|
| Loading | Skeleton stepper + 2 cards |
| 404 | PageHeader + "Không tìm thấy quy trình" + link back |

---

### 4.4. CandidateDetailPage (nâng cấp)

Thêm section sau Profile card:

**Title:** "Interview Processes"

```typescript
const { data: processes = [] } = useQuery({
  queryKey: ['interview-processes', 'candidate', candidateId],
  queryFn: () => interviewProcessService.getByCandidateId(candidateId),
  enabled: !!candidateId,
});
```

Mini table (3 cột): Job | Status | Link "Chi tiết"

Ẩn section nếu `processes.length === 0`.

---

## 5. Service layer

**File:** `src/shared/lib/api-services.ts`

```typescript
export const interviewProcessService = {
  getAll: (params?: InterviewProcessListParams) => ...,
  getById: (id: string) => ...,
  getByCandidateId: (candidateId: string) => ...,
  create: (body: CreateInterviewProcessRequest) => ...,
  update: (id: string, body: UpdateInterviewProcessRequest) => ...,
  updateContact: (id: string, body: UpdateContactRequest) => ...,
  reject: (id: string, body: { reason: string }) => ...,
};
```

Types đặt trong `src/shared/types/api.ts` (xem mock file để copy).

---

## 6. Error toast mapping

| errorCode | Toast message (VI) |
|-----------|-------------------|
| `PROCESS_ALREADY_EXISTS` | Đã tồn tại quy trình phỏng vấn cho ứng viên và job này |
| `MATCH_NOT_FOUND` | Không tìm thấy kết quả matching |
| `PROCESS_NOT_FOUND` | Không tìm thấy quy trình phỏng vấn |
| `INVALID_CONTACT_TRANSITION` | Không thể cập nhật liên hệ ở trạng thái hiện tại |
| `INVALID_STATUS_TRANSITION` | Chuyển trạng thái không hợp lệ |
| *(default)* | `error.response.data.message` |

---

## 7. Dev với mock data (BE chưa sẵn sàng)

Import từ `src/shared/lib/phase2-mock-data.ts`:

```typescript
import {
  mockCVMatchesPhase2,
  mockInterviewProcesses,
  mockProcessDetail,
  phase2MockHandlers,
} from '@/shared/lib/phase2-mock-data';
```

**Option A — Feature flag:**

```typescript
// .env.development
VITE_USE_PHASE2_MOCK=true
```

Trong service, nếu flag bật → trả mock + simulate delay 300ms.

**Option B — MSW** (khuyến nghị nếu team đã dùng): register handlers từ `phase2MockHandlers`.

**Scenarios có sẵn trong mock:**

| ID | Scenario |
|----|----------|
| match `1` | NONE — có thể tạo process |
| match `2` | SHORTLISTED — process `102` đã tạo |
| match `4` | CONTACTED — process `101` đã liên hệ |
| process `103` | REJECTED — test stepper + read-only form |

---

## 8. Accessibility & i18n

- Tất cả label user-facing **tiếng Việt** (giữ English cho sidebar tùy convention hiện tại)
- Nút action có `aria-label` khi chỉ icon
- Stepper: `aria-current="step"` trên bước active
- Form: label + `htmlFor` đầy đủ

---

## 9. File checklist implement

| File | Action |
|------|--------|
| `src/shared/types/api.ts` | + Phase 2 types |
| `src/shared/lib/api-services.ts` | + `interviewProcessService` |
| `src/shared/lib/phase2-mock-data.ts` | Mock (đã có) |
| `src/shared/components/hr/PipelineStatusBadge.tsx` | Tạo |
| `src/shared/components/hr/ContactStatusBadge.tsx` | Tạo |
| `src/shared/components/hr/ProcessStepper.tsx` | Tạo |
| `src/shared/components/hr/StartInterviewDialog.tsx` | Tạo |
| `src/shared/components/hr/ContactStatusForm.tsx` | Tạo |
| `src/shared/components/hr/ProcessTimeline.tsx` | Tạo |
| `src/pages/hr/InterviewProcessesPage.tsx` | Tạo |
| `src/pages/hr/InterviewProcessDetailPage.tsx` | Tạo |
| `src/pages/hr/MatchResultsPage.tsx` | Sửa |
| `src/pages/hr/CandidateDetailPage.tsx` | Sửa |
| `src/App.tsx` | + routes |
| `src/shared/components/AppSidebar.tsx` | + nav |

---

## 10. QA scenarios (manual)

1. Từ `/hr/matches`, tạo process cho match score cao nhất → redirect/list có record mới
2. Tạo lại cùng match → toast 409, không duplicate
3. Mở detail → stepper ở Shortlist ✓, Liên hệ active
4. Đánh dấu "Đã liên hệ" + ghi chú → timeline + badge cập nhật
5. `/hr/candidates/:id` hiển thị process vừa tạo
6. Filter list theo job + status hoạt động
7. Process REJECTED → form contact disabled, banner lý do

---

*Phiên bản: 1.0 — đồng bộ [api-contract.md](./api-contract.md)*
