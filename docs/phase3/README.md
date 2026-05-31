# Phase 3 — Lịch phỏng vấn & Kết quả PV

Thư mục tài liệu triển khai Phase 3 (sau [Phase 2](../phase2/README.md)).

## Mục tiêu

- **Actions interview process** chưa có ở Phase 2: lên lịch / sửa / hủy PV, ghi **kết quả phỏng vấn** → `INTERVIEW_SCHEDULED`, `INTERVIEW_DONE`.
- **Calendar API:** lấy lịch theo khoảng `startDate`–`endDate` (FE tính range từ chế độ **ngày / tuần / tháng**).
- **Out of scope Phase 3:** Offer, Onboard (Phase 4).

## Tài liệu

| File | Đối tượng | Mô tả |
|------|-----------|-------|
| [plan.md](./plan.md) | PM / Tech Lead | Phạm vi, DB migration, lộ trình BE/FE |
| [api-contract.md](./api-contract.md) | BE + FE | Endpoints, models, date range, errors |
| [ui-spec.md](./ui-spec.md) | FE | Calendar day/week/month, gọi API, UX |

## Tính năng ↔ API

| UI (gợi ý) | API |
|--------------|-----|
| `/hr/calendar` — xem lịch ngày/tuần/tháng | `GET /v1/interview-schedules?startDate&endDate` |
| Chi tiết process — form lên lịch PV | `POST /v1/interview-schedules` |
| Sửa / hủy lịch | `PATCH`, `POST .../cancel` |
| Ghi kết quả PV | `POST /v1/interview-processes/:id/interview-result` |
| Unlock stepper "Lên lịch PV" | Side effect khi tạo schedule |

## Thứ tự đọc

1. [plan.md](./plan.md)
2. [api-contract.md](./api-contract.md)
3. [ui-spec.md](./ui-spec.md)

## Liên quan

- [phase2/api-contract.md](../phase2/api-contract.md) — Process CRUD Phase 2
- [database.md](../database.md) — ER (sẽ bổ sung `interview_schedules` khi implement)
