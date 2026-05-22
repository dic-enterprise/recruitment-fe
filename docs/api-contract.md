# API Contract - Recruitment System

This document outlines the API endpoints required to support the Recruitment Frontend application.

## Base URL
`https://api.recruitment-system.com/v1`

## Authentication

**Default:** protected endpoints require:
`Authorization: Bearer <token>`

**Exceptions**

| Endpoint | Auth | Notes |
|----------|------|--------|
| `GET /candidates/:id/cv/preview` | **Public** (no `Authorization`) | Browser opens URL directly in a new tab; must not require login. |
| `GET /candidates/:id/cv/download` | **Required** | Valid Bearer + permission (e.g. `HR`, `ADMIN`). Return `401` if missing/invalid token, `403` if authenticated but not allowed. |
| All other endpoints | **Required** | As usual. |

---

## Global Response Wrapper

All API responses are wrapped in a standard `CodeResponse` object.

```json
{
  "success": "boolean",
  "message": "string (e.g., 'SUCCESS' or error message)",
  "data": "T | null"
}
```

- **success**: Indicates if the operation was successful.
- **message**: Provides additional context, especially in case of errors.
- **data**: The actual payload of the response (e.g., Department, Job, List of Candidates).

---

## Data Models

### Department
```json
{
  "id": "number",
  "code": "string",
  "name": "string",
  "manager": "string?",
  "contacts": [
    {
      "name": "string",
      "email": "string?",
      "phone": "string?"
    }
  ],
  "jobCount": "number"
}
```

### Job
```json
{
  "id": "number",
  "departmentId": "number",
  "departmentName": "string",
  "title": "string",
  "salary": "string?",
  "requirements": "string",
  "status": "ACTIVE | CLOSED | ARCHIVED",
  "createdAt": "ISO8601 string",
  "matchCount": "number",
  "highMatchCount": "number",
  "location": "string?",
  "workplaceHybrid": "boolean?",
  "employmentFullTime": "boolean?",
  "recruitmentUrgency": "NORMAL | URGENT",
  "minMatchingScore": "number (1-100)",
  "skills": ["string"]
}
```

### Candidate
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string?",
  "cvFileName": "string",
  "cvPreviewable": "boolean",
  "extractStatus": "PENDING | SCANNING | COMPLETE | FAILED",
  "employmentTag": "CHUA_NHAN_VIEC | DA_CO_VIEC",
  "uploadedAt": "ISO8601 string",
  "skills": ["string"]?,
  "experience": "string?"
}
```

### ExtractErrorLog (from `queue_tasks`)
```json
{
  "taskId": "number",
  "candidateId": "number",
  "errorCode": "string?",
  "errorMessage": "string?",
  "retryCount": "number",
  "maxRetries": "number",
  "failedAt": "ISO8601 string?"
}
```

### CVMatch
```json
{
  "id": "number",
  "candidateId": "number",
  "candidateName": "string",
  "jobId": "number",
  "jobTitle": "string",
  "score": "number",
  "pipelineStatus": "NONE | SHORTLISTED | CONTACTED | INTERVIEW_SCHEDULED | INTERVIEW_DONE",
  "createdAt": "ISO8601 string"
}
```

`pipelineStatus` defaults to `NONE` when a new match is created. HR advances candidates through the pipeline after review.

---

## Endpoints

### 1. Departments
- **GET /departments**
  - Returns `CodeResponse<List<Department>>`.
- **GET /departments/:id**
  - Returns `CodeResponse<Department>`.
- **POST /departments**
  - Creates a new department. Returns `CodeResponse<Department>`.
- **PUT /departments/:id**
  - Updates an existing department. Returns `CodeResponse<Department>`.

### 2. Jobs
- **GET /jobs**
  - Query Params: `status`, `departmentId`, `search`
  - Returns `CodeResponse<List<Job>>`.
- **GET /jobs/:id**
  - Returns `CodeResponse<Job>`.
- **POST /jobs**
  - Creates a new job posting. Returns `CodeResponse<Job>`.
- **PUT /jobs/:id**
  - Updates an existing job. Returns `CodeResponse<Job>`.

### 3. Candidates
- **GET /candidates**
  - Query Params: `extractStatus`, `employmentTag`, `search`
  - Returns `CodeResponse<List<Candidate>>`.
- **GET /candidates/:id**
  - Returns `CodeResponse<Candidate>`.
  - `cvPreviewable` on `Candidate` must be set by the server from the stored file type (see **CV file preview rules** below). The UI only shows **Preview** when `cvPreviewable === true`.
- **GET /candidates/:id/cv/preview** — **Public API**
  - **Authentication:** none. Do **not** require `Authorization`. The frontend opens this URL directly (`window.open`) so the browser can render PDF/images inline without attaching a Bearer token.
  - **Purpose:** stream CV for in-browser viewing (**not** wrapped in `CodeResponse`).
  - **Allowed only** when the file type is browser-previewable (same rules as `cvPreviewable`).
  - If the file is not previewable (e.g. `.doc`, `.docx`): **HTTP 415** (or **400**); optional JSON error body; do not return file bytes.
  - **Success (200):** raw file body.
    - `Content-Type`: correct MIME (see table below).
    - `Content-Disposition: inline; filename="<cvFileName>"` (UTF-8 `filename*` if needed).
    - Avoid `X-Frame-Options: DENY` on this endpoint if embed/preview in tab is required; `Content-Security-Policy` should still restrict embedding to product needs.
  - **Errors:** `404` candidate/CV not found. Do not use `401` for missing token (endpoint is public).
  - **CORS:** allow `GET` from the frontend origin (or serve API and SPA under the same site) so a new tab load succeeds.
  - **Example:** `GET /v1/candidates/6/cv/preview`
- **GET /candidates/:id/cv/download** — **Protected API** *(auth tạm tắt trên BE; sẽ bật sau)*
  - **Authentication (planned):** `Authorization: Bearer <token>`; roles `HR` / `ADMIN`.
  - **Hiện tại:** public giống preview — không yêu cầu token.
  - **Purpose:** download CV for **any** stored file type (**not** wrapped in `CodeResponse`).
  - **Success (200):** raw file body.
    - `Content-Type`: correct MIME (or `application/octet-stream` if unknown).
    - `Content-Disposition: attachment; filename="<cvFileName>"`.
  - **Errors:** `404` candidate/CV not found (`401` / `403` khi bật auth).
  - **Example:** `GET /v1/candidates/6/cv/download` with `Authorization: Bearer …`
- **POST /candidates/upload**
  - Multipart/form-data: `files` — one or more **PDF** files (same field name repeated, or array).
  - Max **10MB** per file, **100MB** total request size.
  - Returns `CodeResponse<List<Candidate>>` — one candidate record per file; each enqueues `EXTRACT_CV`.
  - Errors: `400` if no files, empty files only, or any non-PDF.

#### CV file preview rules (browser-inline)

The frontend treats a CV as previewable only when the browser can render it inline (new tab). Backend must use the **same** rules for `cvPreviewable` and for allowing `GET .../cv/preview`.

| Extension | MIME type (example) | `cvPreviewable` | Preview API | Download API |
|-----------|---------------------|-----------------|-------------|--------------|
| `pdf` | `application/pdf` | `true` | Yes (public) | Yes (auth) |
| `png` | `image/png` | `true` | Yes (public) | Yes (auth) |
| `jpg`, `jpeg` | `image/jpeg` | `true` | Yes (public) | Yes (auth) |
| `gif` | `image/gif` | `true` | Yes (public) | Yes (auth) |
| `webp` | `image/webp` | `true` | Yes (public) | Yes (auth) |
| `svg` | `image/svg+xml` | `true` | Yes (public) | Yes (auth) |
| `txt` | `text/plain; charset=utf-8` | `true` | Yes (public) | Yes (auth) |
| `doc`, `docx`, `xls`, `xlsx`, `ppt`, `pptx`, … | Office / binary | `false` | **No** (415/400) | Yes (auth) |
| other | `application/octet-stream` | `false` | **No** (415/400) | Yes (auth) |

**Implementation notes for backend**
- Set `cvPreviewable` on create/update of candidate CV from extension or detected MIME.
- **Preview controller:** permit all / anonymous `GET .../cv/preview`; enforce previewable file type only.
- **Download controller:** require authenticated user + permission; always allow download when authorized, regardless of `cvPreviewable`.
- `preview` and `download` may read the same stored file; differ by `Content-Disposition` (`inline` vs `attachment`), auth rules, and preview type gate.
- Public preview exposes CV by `candidateId`; if stricter privacy is needed later, add optional signed query token (e.g. `?token=`) without breaking the public, no-Bearer contract for the browser tab.
- Do not convert Office files to PDF for preview unless product adds that later; until then, Office uploads are download-only.

### 4. Matches
- **GET /matches**
  - Returns `CodeResponse<List<CVMatch>>`.
- **GET /matches/job/:jobId**
  - Returns `CodeResponse<List<CVMatch>>`.
- **GET /matches/candidate/:candidateId**
  - Returns `CodeResponse<List<CVMatch>>`.
- **GET /matches/queue**
  - Returns `CodeResponse<List<MatchQueueItem>>` — active tasks from `queue_tasks` (PENDING / PROCESSING).
  - Item detail:
    ```json
    {
      "taskId": "number",
      "taskType": "EXTRACT_CV | MATCH_JOB",
      "candidateId": "number",
      "jobId": "number | null",
      "candidateName": "string",
      "status": "queued | processing | done",
      "retryCount": "number",
      "maxRetries": 3
    }
    ```
- **POST /matches/trigger**
  - Body: `{ "jobId": "number", "candidateIds": ["number"] }`
  - Enqueues `MATCH_JOB` tasks (async AI scoring). Returns `CodeResponse<Void>` immediately.

#### `queue_tasks` locking (internal)

- Worker claims tasks with PostgreSQL `FOR UPDATE SKIP LOCKED` → `PROCESSING` + `locked_at` / `locked_by`.
- `locked_by`: worker id (`app.queue.worker-id` or `{hostname}-{uuid}`).
- Stale lock: `PROCESSING` longer than `app.queue.lock-timeout-minutes` (default 15) → reset to `PENDING`.

#### `queue_tasks.metadata` (JSONB, internal)

Task payload is stored in `metadata` (not separate FK columns):

| `taskType` | `metadata` example |
|------------|-------------------|
| `EXTRACT_CV` | `{ "candidateId": 6 }` |
| `MATCH_JOB` | `{ "candidateId": 6, "jobId": 1 }` |

API `GET /matches/queue` still exposes `candidateId` / `jobId` at top level (mapped from `metadata`).

### 5. Statistics (Dashboard)
- **GET /stats/summary**
  - Returns `CodeResponse<DashboardStats>`.
  - DashboardStats detail:
    ```json
    {
      "activeJobs": "number",
      "totalCandidates": "number",
      "highMatches": "number",
      "avgMatchScore": "number",
      "extractsComplete": "number",
      "extractsPending": "number",
      "extractFailures": "number"
    }
    ```

### 6. Admin & System
- **GET /admin/extract-errors**
  - Returns `CodeResponse<List<ExtractErrorLog>>` — failed `EXTRACT_CV` tasks from `queue_tasks` (newest first).
- **GET /admin/ai-config**
  - Returns `CodeResponse<List<AIProviderConfiguration>>`.
- **PUT /admin/ai-config**
  - Body: `List<AIProviderConfiguration>`.
  - Returns `CodeResponse<List<AIProviderConfiguration>>`.

#### AIProviderConfiguration (unlimited rows; full list replaced on PUT):
```json
[
  {
    "id": 1,
    "name": "string (optional label)",
    "enabled": true,
    "apiKey": "string",
    "apiUrl": "string",
    "model": "string",
    "providerType": "GEMINI | OPENAI"
  }
]
```

Enabled providers are used in a round-robin queue; on failure/timeout the next enabled provider is tried.
