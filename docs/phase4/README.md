# Phase 4 — Offer & Onboard

Tài liệu triển khai giai đoạn cuối pipeline tuyển dụng (sau [Phase 3](../phase3/README.md)).

## Mục tiêu

| Bước | HR làm gì | Hệ thống |
|------|-----------|----------|
| **Offer** | Điền form offer (lương, chế độ — schema linh hoạt, có thể mở rộng) | Lưu offer, **tự gửi** nội dung cho ứng viên (email / kênh tích hợp) |
| **Onboard** | Nhập **ngày onboard**, giao người/đội đón ứng viên | Lưu kế hoạch; bộ phận sắp xếp đón tiếp |

**Điều kiện vào Phase 4:** Process ở `INTERVIEW_DONE`, kết quả PV thường là `PASSED` (tùy PO có bắt buộc hay không).

## Tài liệu

| File | Mô tả |
|------|-------|
| [plan.md](./plan.md) | **Kế hoạch chính** — phạm vi, DB, luồng, lộ trình |
| [api-contract.md](./api-contract.md) | API draft cho BE/FE |

## Trạng thái pipeline (tóm tắt)

```text
INTERVIEW_DONE → OFFER → ONBOARDED
         ↘ REJECTED (mọi giai đoạn)
```

## Liên quan

- Stepper FE: unlock bước **Offer**, **Onboard** (hiện locked sau Phase 3)
- [database.md](../database.md) — sẽ bổ sung `job_offers`, `onboard_plans` khi implement
