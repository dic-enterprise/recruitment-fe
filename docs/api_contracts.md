# API Contracts - Recruitment System (Official)

Tài liệu này mô tả chi tiết các API contracts giữa Frontend và Backend của hệ thống Recruitment. Dựa trên cấu trúc backend `recruitment-be` (Spring Boot).

## 1. Thông tin chung (Common Configuration)

- **Base URL:** `http://localhost:8080/api` (môi trường development).
- **Proxy:** Frontend được cấu hình để proxy mọi request bắt đầu bằng `/api` sang Backend.
- **Định dạng dữ liệu:** `application/json`.
- **Định dạng Response chuẩn (`CodeResponse<T>`):**
  Phần lớn các API trả về dữ liệu được bọc trong cấu trúc:
  ```typescript
  {
    success: boolean;   // Trạng thái xử lý thành công hay không
    message: string;   // Thông báo đi kèm
    data?: T;          // Dữ liệu trả về (nếu có)
    error?: {          // Chi tiết lỗi (nếu success = false)
      error_code: string;
      message: string;
    };
  }
  ```

---

## 2. Kiểu dữ liệu (Data Models)

### Department (Phòng ban)
```typescript
interface DepartmentResponse {
  id: number;
  code: string;
  name: string;
  manager?: string;
  contacts: {
    id?: number;
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface DepartmentRequest {
  code: string;
  name: string;
  manager?: string;
  contacts?: {
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
  }[];
}
```

### Job (Tin tuyển dụng)
```typescript
type JobStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

interface JobResponse {
  id: number;
  jobTitle: string;
  departmentId: number;
  departmentCode?: string;
  departmentName?: string;
  salaryRange?: string;
  jobRequirements?: string;
  status: JobStatus;
  totalCVs: number;
  highMatchCVs: number;
  createdAt: string;
  updatedAt: string;
}

interface JobRequest {
  jobTitle: string;
  departmentId: number;
  salaryRange?: string;
  jobRequirements?: string;
}
```

### Candidate (Ứng viên & CV)
```typescript
type UploadStatus = 'PENDING' | 'SCANNING' | 'COMPLETE' | 'FAILED';

interface CandidateResponse {
  id: number;
  cvFileName: string;
  cvFileType?: string;
  uploadStatus: UploadStatus;
  source?: string;
  cvInformation?: {
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experienceLevel?: string;
    education?: any[];
    certifications?: any[];
    languages?: any[];
    additionalInfo?: any;
  } | null;
  createdAt: string;
  updatedAt: string;
}
```

### Matching & Analytics
```typescript
interface MatchResponse {
  id: number;
  candidateId: number;
  candidateName: string;
  jobId: number;
  jobTitle: string;
  matchScore: number;
  isHighMatch: boolean;
  matchDetails?: any;
}

interface DashboardMetrics {
  totalJobs: number;
  totalCVs: number;
  totalHighMatches: number;
  avgMatchRate: number;
}
```

---

## 3. Danh sách Endpoints

### 3.1. Department API
| Method | Path | Request Body | Response Data | Chức năng |
|---|---|---|---|---|
| `GET` | `/api/departments` | - | `DepartmentResponse[]` | Lấy toàn bộ phòng ban |
| `POST` | `/api/departments` | `DepartmentRequest` | `DepartmentResponse` | Tạo phòng ban mới |
| `PUT` | `/api/departments/{id}` | `DepartmentRequest` | `DepartmentResponse` | Cập nhật phòng ban |
| `DELETE`| `/api/departments/{id}` | - | `void` | Xóa phòng ban |

### 3.2. Job API
| Method | Path | Query Params | Request Body | Response Data |
|---|---|---|---|---|
| `GET` | `/api/jobs` | `status`, `departmentId`, `search` | - | `JobResponse[]` |
| `POST` | `/api/jobs` | - | `JobRequest` | `JobResponse` |
| `PUT` | `/api/jobs/{id}` | - | `JobRequest` | `JobResponse` |
| `POST` | `/api/jobs/{id}/close` | - | - | `void` |
| `POST` | `/api/jobs/{id}/archive` | - | - | `void` |
| `DELETE`| `/api/jobs/{id}` | - | - | `void` |

### 3.3. Candidate API
| Method | Path | Request Body | Response Data | Chức năng |
|---|---|---|---|---|
| `GET` | `/api/candidates` | - | `CandidateResponse[]` | Lấy danh sách ứng viên |
| `POST` | `/api/candidates/upload` | `FormData` (file, source) | `CandidateResponse` | Upload và phân tích CV |
| `GET` | `/api/candidates/{id}/cv/download` | - | `blob` | Tải file CV gốc |
| `POST` | `/api/candidates/{id}/cv/retry` | - | `void` | Thử phân tích lại CV lỗi |
| `DELETE`| `/api/candidates/{id}` | - | `void` | Xóa ứng viên |

### 3.4. Matching & Analytics
| Method | Path | Response Data | Chức năng |
|---|---|---|---|---|
| `GET` | `/api/matching/job/{jobId}` | `MatchResponse[]` | Kết quả match theo Job |
| `GET` | `/api/matching/matrix` | `MatchingMatrixResponse` | Ma trận match tổng quan |
| `POST` | `/api/matching/job/{id}/match-all` | `void` | Chạy match 1 Job với mọi CV |
| `GET` | `/api/analytics/dashboard` | `DashboardMetrics` | Chỉ số Dashboard tổng quan |
| `GET` | `/api/analytics/jobs/statistics` | `JobStatistics` | Thống kê Job theo trạng thái |
