# Phase 5 — Plan: Auth & User Management

## 1. Tổng quan

Phase 5 bổ sung lớp **xác thực** và **quản trị user** cho recruitment platform. FE triển khai login + guard route; BE đã có API (xem [api-contract.md](./api-contract.md)).

## 2. Phạm vi

### In scope

- Login username/password (`loginType = DB`)
- JWT session 24h
- Protected API + FE routes
- CRUD `app_users` (ADMIN UI)
- Phân role `ADMIN` / `HR` trên UI

### Out of scope (phase sau)

- OAuth2 / SSO login flow trên FE
- Quên mật khẩu / reset email
- `@HasPermission` chi tiết từng module trên BE
- Audit log đăng nhập

## 3. BE (đã xong)

| Task | Trạng thái |
|------|------------|
| Bảng `app_users` + Flyway | ✓ |
| `POST /v1/auth/login`, `GET /v1/auth/me` | ✓ |
| CRUD `/v1/users` | ✓ |
| `login_type` DB/SSO + validation password/email | ✓ |
| auth-utils JWT filter | ✓ |

## 4. FE — lộ trình đề xuất

| Bước | Công việc | Ước lượng |
|------|-----------|-----------|
| 1 | `AuthProvider` + storage + types | 0.5d |
| 2 | Màn `/login` + API login | 0.5d |
| 3 | Axios interceptors + 401 handler | 0.5d |
| 4 | `ProtectedRoute` / `AdminRoute` + wrap HR layout | 0.5d |
| 5 | Header user + logout | 0.25d |
| 6 | Màn `/admin/users` list + form CRUD | 1d |
| 7 | QA: admin vs hr, token hết hạn, redirect | 0.5d |

**Tổng:** ~3.75 ngày dev.

## 5. Rủi ro

| Rủi ro | Giảm thiểu |
|--------|------------|
| Token hết hạn giữa session | Check `expiresAt` + `/auth/me` khi focus tab |
| HR truy cập admin | `AdminRoute` + ẩn menu |
| CORS production | Cấu hình `AUTH_SERVER_DOMAIN` / cors BE |

## 6. Tài liệu

- [README.md](./README.md)
- [api-contract.md](./api-contract.md)
- [ui-spec.md](./ui-spec.md)
