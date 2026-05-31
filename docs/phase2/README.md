# Phase 2 — Interview Process Core

Thư mục tài liệu triển khai Phase 2.

## Tài liệu

| File | Đối tượng | Mô tả |
|------|-----------|-------|
| [plan.md](./plan.md) | PM / Tech Lead | Kế hoạch tổng thể, phạm vi, lộ trình 4 tuần |
| [api-contract.md](./api-contract.md) | BE + FE | API endpoints, data models, errors, cURL |
| [ui-spec.md](./ui-spec.md) | FE | Component spec, page layout, states, checklist |
| [mock-data.md](./mock-data.md) | FE | Hướng dẫn mock data & test scenarios |

**Tính năng Phase 2 (API):**

| UI | API (xem [api-contract.md](./api-contract.md)) |
|----|-----------------------------------------------|
| `/hr/candidates` — Upload CV dialog | §2 — `POST /candidates/upload` + `jobIds[]` |
| `/hr/matches` — Start Matching CV | §2.6 — `POST /matches/trigger` |
| `/hr/matches` — Start Interview | §4.2 — `POST /interview-processes` (`{ matchId }` only) |
| `/hr/interview-processes` | §4.2 — CRUD + contact + reject |
| Matching worker skip extract FAILED | §2.1.1 |

## Mock data (code)

| File | Mô tả |
|------|-------|
| [`src/shared/lib/phase2-mock-data.ts`](../../src/shared/lib/phase2-mock-data.ts) | Types, datasets, mock CRUD functions |

## Liên quan

- [api-contract.md](../api-contract.md) — API Phase 1 (base)
- [api_contracts.md](../api_contracts.md) — Backend Spring Boot (tham khảo)

## Thứ tự đọc cho developer

1. `plan.md` — hiểu scope
2. `api-contract.md` — contract BE/FE
3. `ui-spec.md` — implement UI
4. `phase2-mock-data.ts` — dev offline với `VITE_USE_PHASE2_MOCK=true`
