# Phase 5 — API Contract: Auth & Users

> **Base URL:** `{HOST}/v1` (ví dụ `http://localhost:8081/v1`)  
> **Wrapper:** `CodeResponse<T>` — mọi response JSON đều bọc trong object này.  
> **Auth:** JWT Bearer (trừ endpoint public).

---

## 0. `CodeResponse<T>`

```json
{
  "success": true,
  "message": "SUCCESS",
  "data": { }
}
```

| Trường | Kiểu | Mô tả |
|--------|------|--------|
| `success` | boolean | `true` khi thành công |
| `message` | string | `"SUCCESS"` hoặc mã/message lỗi |
| `data` | T \| null | Payload |

**Lỗi:** `success: false`, HTTP 4xx/5xx, `message` chứa mã lỗi (ví dụ `INVALID_CREDENTIALS`).

---

## 1. Authentication

### 1.1. POST `/auth/login` — Public

Đăng nhập user **`loginType = DB`**. Không cần header `Authorization`.

**Request:**

```json
{
  "username": "admin",
  "password": "password"
}
```

| Field | Bắt buộc | Ghi chú |
|-------|----------|---------|
| `username` | ✓ | Trim phía server |
| `password` | ✓ | |

**Response 200:** `CodeResponse<LoginResponse>`

```json
{
  "success": true,
  "message": "SUCCESS",
  "data": {
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "expiresInSeconds": 86400,
    "userId": 1,
    "username": "admin",
    "displayName": "System Admin",
    "role": "ADMIN"
  }
}
```

| Field | Kiểu | Mô tả |
|-------|------|--------|
| `accessToken` | string | JWT — gửi kèm request sau |
| `tokenType` | string | Luôn `"Bearer"` |
| `expiresInSeconds` | number | TTL token (giây), mặc định **86400** (24h) |
| `userId` | number | ID `app_users` |
| `username` | string | |
| `displayName` | string | Họ tên hiển thị |
| `role` | `"ADMIN"` \| `"HR"` | Phân quyền UI |

**Lỗi:**

| HTTP | `message` | Khi nào |
|------|-----------|---------|
| 401 | `INVALID_CREDENTIALS` | Sai user/pass, user SSO, hoặc không có password |
| 400 | `USER_DISABLED` | `enabled = false` |
| 400 | `username is required` / `password is required` | Validation |

**JWT payload (tham khảo — FE có thể chỉ dùng response login + `/auth/me`):**

| Claim | Nội dung |
|-------|----------|
| `sub` | username |
| `id` | userId (string) |
| `data` | JSON `{ userId, userName, displayName }` |
| `ROLE` | JSON `{ "role": "ADMIN" }` |
| `exp` | Hết hạn |

Header gửi kèm API protected:

```http
Authorization: Bearer <accessToken>
```

---

### 1.2. GET `/auth/me` — Protected

Lấy user hiện tại từ token (sau refresh trang / kiểm tra session).

**Response 200:** `CodeResponse<CurrentUserResponse>`

```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "admin",
    "displayName": "System Admin",
    "role": "ADMIN"
  }
}
```

**Lỗi:** `401` + `INVALID_CREDENTIALS` — thiếu token, token hết hạn, token không hợp lệ.

---

### 1.3. API public (không cần token)

| Pattern | Mục đích |
|---------|----------|
| `POST /v1/auth/login` | Login |
| `GET /v1/candidates/*/cv/preview` | Preview CV |
| `/swagger-ui/**`, `/api-docs/**` | Swagger |

Mọi endpoint `/v1/**` khác **yêu cầu** `Authorization: Bearer ...`.

---

## 2. Users CRUD

Base path: **`/users`**. Tất cả endpoint **protected**.

> **Gợi ý sản phẩm:** Chỉ role **`ADMIN`** mở màn quản lý user. Role **`HR`** dùng các module tuyển dụng sau khi login.

### 2.1. GET `/users`

Danh sách user.

**Response 200:** `CodeResponse<AppUserResponse[]>`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "fullName": "System Admin",
      "email": "admin@recruitment.local",
      "loginType": "DB",
      "role": "ADMIN",
      "enabled": true,
      "createdAt": "2026-05-31T10:00:00+07:00",
      "updatedAt": "2026-05-31T10:00:00+07:00"
    }
  ]
}
```

---

### 2.2. GET `/users/:id`

Chi tiết một user.

**Lỗi:** `404` — `USER_NOT_FOUND: {id}`

---

### 2.3. POST `/users`

Tạo user mới.

**Request:** `AppUserRequest`

```json
{
  "username": "jdoe",
  "fullName": "John Doe",
  "email": "jdoe@company.com",
  "password": "Secret123!",
  "loginType": "DB",
  "role": "HR",
  "enabled": true
}
```

| Field | Bắt buộc | Ghi chú |
|-------|----------|---------|
| `username` | ✓ | Unique |
| `fullName` | ✓ | Map DB `display_name` |
| `email` | ✓ | Unique, format email — **bắt buộc với DB và SSO** |
| `password` | ✓ nếu `loginType = DB` | Không gửi khi `SSO` |
| `loginType` | ✓ | `"DB"` \| `"SSO"` |
| `role` | ○ | Mặc định `HR` |
| `enabled` | ○ | Mặc định `true` |

**Ví dụ user SSO (không password):**

```json
{
  "username": "sso.user",
  "fullName": "SSO User",
  "email": "sso.user@company.com",
  "loginType": "SSO",
  "role": "HR"
}
```

**Response 200:** `CodeResponse<AppUserResponse>` (không trả `password`).

**Lỗi 400:**

| `message` | Khi nào |
|-----------|---------|
| `password is required when loginType is DB` | Thiếu password (tạo / đổi sang DB) |
| `password must not be set when loginType is SSO` | Gửi password với SSO |
| `email is required` | Thiếu email |
| `USERNAME_ALREADY_EXISTS` | Trùng username |
| `EMAIL_ALREADY_EXISTS` | Trùng email |

---

### 2.4. PUT `/users/:id`

Cập nhật user (gửi **full body** giống POST).

| Tình huống | `password` |
|------------|------------|
| `loginType = DB`, không gửi password | Giữ mật khẩu cũ |
| `loginType = DB`, có password mới | Đổi mật khẩu |
| Đổi từ SSO → DB | **Bắt buộc** gửi `password` |
| `loginType = SSO` | Không gửi `password` |

**Lỗi:** giống POST + `404 USER_NOT_FOUND`.

---

### 2.5. DELETE `/users/:id`

Xóa user.

**Response 200:**

```json
{
  "success": true,
  "message": "SUCCESS",
  "data": null
}
```

**Lỗi:** `404 USER_NOT_FOUND`

---

## 3. Enum

### `LoginType`

| Giá trị | Đăng nhập FE (Phase 5) |
|---------|-------------------------|
| `DB` | `POST /auth/login` username/password |
| `SSO` | Chưa tích hợp OAuth trên FE — chỉ quản lý record; login qua SSO server sau |

### `UserRole`

| Giá trị | Gợi ý UI |
|---------|----------|
| `ADMIN` | Full quyền + menu **Quản lý user** |
| `HR` | Module tuyển dụng (jobs, candidates, …) |

---

## 4. Dev seed

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password` | ADMIN |
| `hr` | `password` | HR |

---

## 5. TypeScript types (FE)

```typescript
export type UserRole = 'ADMIN' | 'HR';
export type LoginType = 'DB' | 'SSO';

export interface CodeResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  userId: number;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface CurrentUser {
  userId: number;
  username: string;
  displayName: string;
  role: UserRole;
}

export interface AppUserRequest {
  username: string;
  fullName: string;
  email: string;
  password?: string;
  loginType: LoginType;
  role?: UserRole;
  enabled?: boolean;
}

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  email: string;
  loginType: LoginType;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 6. Mã nguồn BE

| Thành phần | Path |
|------------|------|
| Auth API | `AuthController` — `/v1/auth` |
| Users API | `AppUserController` — `/v1/users` |
| Login logic | `AuthService` |
| User CRUD | `AppUserService` |
