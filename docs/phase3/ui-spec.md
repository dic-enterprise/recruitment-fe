# Phase 3 — UI Spec: Calendar & Schedule Actions

> FE repo: `recruitment-fe` (tham chiếu). Contract API: [api-contract.md](./api-contract.md).

---

## 1. Màn hình mới / cập nhật

| Route | Mô tả |
|-------|-------|
| `/hr/calendar` | Lịch PV — chế độ ngày / tuần / tháng |
| `/hr/interview-processes/:id` | Thêm tab/block **Lịch phỏng vấn** + **Kết quả** |
| `ProcessStepper` | Unlock bước 3 (`INTERVIEW_SCHEDULED`), 4 (`INTERVIEW_DONE`) |

---

## 2. Calendar page — chế độ xem

### 2.1. Toolbar

| Control | Hành vi |
|---------|---------|
| Segmented `Ngày` \| `Tuần` \| `Tháng` | Đổi `calendarView` |
| `←` / `→` | Prev/next **ngày** (day), **tuần** (week), **tháng** (month) |
| `Hôm nay` | `anchorDate = today` |
| Filter job / HR | Truyền query `jobId`, `assignedHr` |

### 2.2. Gọi API theo view

Luôn dùng `GET /v1/interview-schedules` với `startDate`, `endDate` (§2.3 api-contract).

```typescript
// src/shared/lib/calendar-range.ts
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  format,
} from 'date-fns';

export type CalendarView = 'day' | 'week' | 'month';

const DATE_FMT = 'yyyy-MM-dd';

export function resolveCalendarRange(view: CalendarView, anchor: Date) {
  switch (view) {
    case 'day':
      return {
        startDate: format(startOfDay(anchor), DATE_FMT),
        endDate: format(startOfDay(anchor), DATE_FMT),
      };
    case 'week':
      return {
        startDate: format(startOfWeek(anchor, { weekStartsOn: 1 }), DATE_FMT),
        endDate: format(endOfWeek(anchor, { weekStartsOn: 1 }), DATE_FMT),
      };
    case 'month':
      return {
        startDate: format(startOfMonth(anchor), DATE_FMT),
        endDate: format(endOfMonth(anchor), DATE_FMT),
      };
  }
}
```

**React Query:**

```typescript
const { startDate, endDate } = resolveCalendarRange(view, anchorDate);

useQuery({
  queryKey: ['interview-schedules', startDate, endDate, jobId, assignedHr],
  queryFn: () => interviewScheduleService.getCalendar({ startDate, endDate, jobId, assignedHr }),
});
```

Đổi `view` hoặc `anchorDate` → key đổi → refetch tự động.

### 2.3. Layout theo view

| View | Layout gợi ý |
|------|----------------|
| **day** | Timeline dọc 8h–20h; card event theo `scheduledStart`–`scheduledEnd` |
| **week** | 7 cột (T2–CN); event compact |
| **month** | Lưới ô ngày; dot/badge số PV; click ô → chuyển `day` với `anchorDate` = ô đó |

### 2.4. Event card

Hiển thị từ `InterviewScheduleCalendarItem`:

- Giờ: `14:00 – 15:00`
- `candidateName` · `jobTitle`
- Badge `format` (Online / Onsite / Phone)
- Click → drawer chi tiết hoặc navigate `/hr/interview-processes/:processId`

---

## 3. Process detail — actions Phase 3

### 3.1. Khi `status === CONTACTED`

| Action | API |
|--------|-----|
| **Lên lịch phỏng vấn** | `POST /interview-schedules` |
| Form: datetime range, format, url/location, assignedHr | |

Sau success: stepper active tại **Lên lịch PV**; invalidate process + calendar.

### 3.2. Khi `status === INTERVIEW_SCHEDULED`

| Action | API |
|--------|-----|
| **Sửa lịch** | `PATCH /interview-schedules/:id` |
| **Hủy lịch** | `POST .../cancel` + confirm dialog |
| **Ghi kết quả** | `POST .../interview-result` (enabled khi `scheduledEnd` ≤ now hoặc HR override) |

### 3.3. Khi `status === INTERVIEW_DONE`

- Hiển thị outcome + feedback (read-only)
- Nút **Tạo lịch vòng 2** *(optional post-MVP)* — tạo schedule mới nếu PO cho phép nhiều vòng

---

## 4. `ProcessStepper` (cập nhật)

| Step key | Phase 2 | Phase 3 |
|----------|---------|---------|
| `INTERVIEW_SCHEDULED` | Locked | Active khi có schedule `SCHEDULED` |
| `INTERVIEW_DONE` | Locked | Active sau ghi result |
| `OFFER` / `ONBOARDED` | Locked | Vẫn locked — Phase 4 |

---

## 5. Empty & error states

| State | UI |
|-------|-----|
| Không event trong range | "Không có lịch phỏng vấn trong khoảng này" |
| `INVALID_DATE_RANGE` | Toast + reset về tuần hiện tại |
| `SCHEDULE_ALREADY_EXISTS` | Toast — link tới lịch hiện có |

---

## 6. Checklist FE

- [ ] `calendar-range.ts` + unit test range day/week/month
- [ ] `interviewScheduleService.getCalendar`
- [ ] Page `/hr/calendar` + 3 layouts
- [ ] `ScheduleInterviewDialog` on process detail
- [ ] `RecordInterviewResultDialog`
- [ ] Cập nhật `ProcessStepper` unlock rules
- [ ] Sidebar link "Lịch phỏng vấn"
- [ ] Invalidate keys theo api-contract §11
