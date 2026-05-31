# Phase 5 — UI Spec: Login, Protected Routes & User Management

> FE repo: `recruitment-fe` (tham chiếu). API: [api-contract.md](./api-contract.md).

---

## 1. Phạm vi FE Phase 5

| # | Hạng mục | Ưu tiên |
|---|----------|---------|
| 1 | Màn **Login** | P0 |
| 2 | **Protected routes** + HTTP client gắn JWT | P0 |
| 3 | **Logout** (xóa session, về login) | P0 |
| 4 | Màn **Quản lý user** (list + form CRUD) | P1 — chỉ `ADMIN` |
| 5 | SSO login UI | Out of scope (chỉ CRUD user `loginType=SSO`) |

---

## 2. Routes

| Route | Public? | Mô tả |
|-------|---------|--------|
| `/login` | ✓ | Form đăng nhập |
| `/` hoặc `/hr/**` | ✗ | Layout HR — cần đăng nhập |
| `/admin/users` | ✗ | CRUD user — **chỉ `ADMIN`** |

**Redirect:**

- Chưa login → truy cập protected → `/login?redirect={pathname}`
- Đã login → vào `/login` → redirect `/hr` (hoặc `redirect` query)
- `HR` vào `/admin/users` → 403 page hoặc redirect `/hr`

---

## 3. Màn Login (`/login`)

### 3.1. Layout

- Card giữa màn hình, logo + title **Recruitment**
- 2 field: **Username**, **Password** (type password, có toggle hiện/ẩn)
- Nút **Đăng nhập** (primary, full width)
- Loading state khi gọi API
- Hiển thị lỗi từ API (`message`)

### 3.2. Validation (client)

| Field | Rule |
|-------|------|
| username | Required, trim |
| password | Required |

### 3.3. API

```http
POST /v1/auth/login
Content-Type: application/json

{ "username": "...", "password": "..." }
```

**Thành công:** lưu session (§4) → `navigate(redirect || '/hr')`.

**Lỗi:**

| `message` | UI |
|-----------|-----|
| `INVALID_CREDENTIALS` | Toast/inline: "Tên đăng nhập hoặc mật khẩu không đúng" |
| `USER_DISABLED` | "Tài khoản đã bị vô hiệu hóa" |

### 3.4. Mock dev

- Username: `admin` / `hr`
- Password: `password`

---

## 4. Session & storage

### 4.1. Keys (localStorage hoặc sessionStorage)

| Key | Nội dung |
|-----|----------|
| `recruitment.accessToken` | JWT string |
| `recruitment.tokenType` | `"Bearer"` |
| `recruitment.expiresAt` | ISO timestamp = now + `expiresInSeconds` |
| `recruitment.user` | JSON `{ userId, username, displayName, role }` |

Khuyến nghị **localStorage** để F5 vẫn giữ session; logout xóa hết keys trên.

### 4.2. Hydrate khi app load

```text
App mount
  → đọc token + expiresAt
  → hết hạn? → clear + /login
  → còn hạn? → optional GET /v1/auth/me (validate token)
       → 401 → clear + /login
       → 200 → cập nhật recruitment.user
```

---

## 5. HTTP client (Axios / fetch wrapper)

### 5.1. Request interceptor

```typescript
// Pseudocode
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !isPublicUrl(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isPublicUrl(url: string) {
  return url.includes('/auth/login') || url.includes('/cv/preview');
}
```

`baseURL`: `{VITE_API_BASE_URL}/v1` hoặc full path tùy cấu trúc project.

### 5.2. Response interceptor

| HTTP | Hành vi |
|------|---------|
| **401** | Clear session → `window.location.href = '/login'` (tránh loop trên `/login`) |
| **403** | Toast "Không có quyền" (tùy endpoint) |
| 4xx khác | Hiển thị `response.data.message` |

---

## 6. Protected routes

### 6.1. React Router v6 — ví dụ

```typescript
// src/app/router/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/hr" replace />;
  }
  return <>{children}</>;
}
```

```typescript
// routes excerpt
{
  path: '/login',
  element: <LoginPage />,
},
{
  element: <ProtectedRoute><HrLayout /></ProtectedRoute>,
  children: [
    { path: '/hr', element: <Dashboard /> },
    // ... existing HR routes
  ],
},
{
  path: '/admin/users',
  element: (
    <ProtectedRoute>
      <AdminRoute>
        <UserListPage />
      </AdminRoute>
    </ProtectedRoute>
  ),
},
```

### 6.2. `AuthProvider` context

State tối thiểu:

```typescript
interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => void;
}
```

- `login`: POST login → persist → set user
- `logout`: clear storage → `user = null` → navigate `/login`

### 6.3. Header app

- Hiển thị `displayName` + badge role (`ADMIN` / `HR`)
- Nút **Đăng xuất** → `logout()`

---

## 7. Màn Quản lý user (`/admin/users`) — ADMIN

### 7.1. Danh sách

| Cột | Field |
|-----|-------|
| Username | `username` |
| Họ tên | `fullName` |
| Email | `email` |
| Loại đăng nhập | `loginType` badge `DB` / `SSO` |
| Vai trò | `role` |
| Trạng thái | `enabled` → Active / Disabled |
| Thao tác | Sửa, Xóa |

**API:** `GET /v1/users`

**Toolbar:** nút **Thêm user** → mở drawer/modal form.

### 7.2. Form tạo / sửa

| Field | Control | Ghi chú |
|-------|---------|---------|
| Username | Input | Required |
| Họ tên đầy đủ | Input | `fullName`, required |
| Email | Input email | Required mọi `loginType` |
| Loại đăng nhập | Select `DB` \| `SSO` | |
| Mật khẩu | Input password | Hiện khi `loginType = DB`; required khi **tạo mới**; optional khi sửa (để trống = giữ cũ) |
| Vai trò | Select `ADMIN` \| `HR` | Default `HR` |
| Kích hoạt | Switch `enabled` | Default on |

**Logic UI theo `loginType`:**

```typescript
const isDb = loginType === 'DB';
const isCreate = mode === 'create';

// password field visible when isDb
// password required when isDb && (isCreate || switched from SSO to DB)
```

**API:**

- Tạo: `POST /v1/users`
- Sửa: `PUT /v1/users/:id`
- Xóa: `DELETE /v1/users/:id` + confirm dialog

**Lỗi form:**

| `message` | Hiển thị |
|-----------|----------|
| `USERNAME_ALREADY_EXISTS` | Dưới field username |
| `EMAIL_ALREADY_EXISTS` | Dưới field email |
| `password is required when loginType is DB` | Dưới field password |

### 7.3. Menu

Chỉ render item **Quản lý user** (`/admin/users`) khi `user.role === 'ADMIN'`.

---

## 8. Checklist tích hợp FE

- [ ] Env `VITE_API_BASE_URL` trỏ BE
- [ ] `POST /auth/login` + lưu token/user
- [ ] Interceptor `Authorization: Bearer`
- [ ] 401 → logout + `/login`
- [ ] `ProtectedRoute` bọc layout HR
- [ ] `AdminRoute` cho `/admin/users`
- [ ] Boot: check expiry + optional `/auth/me`
- [ ] Login redirect `?redirect=`
- [ ] Logout xóa storage
- [ ] User CRUD (ADMIN): list, create, edit, delete
- [ ] Ẩn password trong form khi `loginType = SSO`

---

## 9. CORS

BE cho phép `http://localhost:*` và `http://127.0.0.1:*`. Production: cấu hình thêm origin FE trên BE (`auth-utils.cors-patterns`) khi deploy.

---

## 10. Liên kết phase trước

Sau khi Phase 5 xong, mọi API Phase 2–4 (`/jobs`, `/candidates`, `/interview-processes`, …) dùng chung HTTP client đã gắn JWT — không đổi contract từng phase, chỉ thêm header auth.
