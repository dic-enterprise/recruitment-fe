# Phase 5 — Authentication & User Management

Giai đoạn tích hợp **đăng nhập JWT**, **bảo vệ route FE**, và **quản lý user** (CRUD) cho hệ thống tuyển dụng.

**Phụ thuộc:** [Phase 4](../phase4/README.md) (pipeline offer/onboard đã có trên BE).

## Mục tiêu

| Hạng mục | Mô tả |
|----------|--------|
| **Login** | Màn hình đăng nhập username/password → nhận JWT |
| **Protected routes** | Route HR/Admin yêu cầu token hợp lệ; redirect `/login` nếu chưa auth |
| **Session** | Lưu token + user; gắn `Authorization` cho mọi API (trừ public) |
| **User CRUD** | Màn quản trị user (ADMIN): username, fullName, email, loginType, password, role |

## Tài liệu

| File | Đối tượng |
|------|-----------|
| [api-contract.md](./api-contract.md) | BE/FE — endpoint, body, lỗi, JWT |
| [ui-spec.md](./ui-spec.md) | FE — login, guard route, màn user list/form |

## Trạng thái BE

| Hạng mục | Trạng thái |
|----------|------------|
| `POST /v1/auth/login` | ✓ |
| `GET /v1/auth/me` | ✓ |
| `GET/POST/PUT/DELETE /v1/users` | ✓ |
| Bảng `app_users`, `login_type` (DB/SSO) | ✓ Flyway V1_9_0–V1_10_0 |
| Seed dev `admin` / `hr` (password: `password`) | ✓ V1_9_1 |

## Base URL

| Môi trường | URL |
|------------|-----|
| Local | `http://localhost:8081` |
| Production | Cấu hình `VITE_API_BASE_URL` (hoặc tương đương) trên FE |

**Prefix API:** `/v1`

## Liên quan

- Swagger: `{BASE}/swagger-ui.html`
- [database.md](../database.md) — bảng `app_users`
- `modules/libs/auth-utils` — filter JWT, CORS
