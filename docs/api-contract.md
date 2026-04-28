# API Contract - Recruitment System

This document outlines the API endpoints required to support the Recruitment Frontend application.

## Base URL
`https://api.recruitment-system.com/v1`

## Authentication
All requests should include a Bearer token in the Authorization header:
`Authorization: Bearer <token>`

---

## Data Models

### Department
```json
{
  "id": "string",
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
  "id": "string",
  "departmentId": "string",
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
  "skills": ["string"]
}
```

### Candidate
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string?",
  "cvFileName": "string",
  "extractStatus": "PENDING | SCANNING | COMPLETE | FAILED",
  "employmentTag": "CHUA_NHAN_VIEC | DA_CO_VIEC",
  "extractError": {
    "code": "string?",
    "message": "string",
    "timestamp": "ISO8601 string"
  }?,
  "uploadedAt": "ISO8601 string",
  "skills": ["string"]?,
  "experience": "string?"
}
```

### ExtractError
```json
{
  "code": "string",
  "message": "string",
  "timestamp": "ISO8601 string"
}
```

### CVMatch
```json
{
  "id": "string",
  "candidateId": "string",
  "candidateName": "string",
  "jobId": "string",
  "jobTitle": "string",
  "score": "number",
  "details": {
    "skillMatch": "number",
    "experienceMatch": "number",
    "educationMatch": "number"
  },
  "createdAt": "ISO8601 string"
}
```

---

## Endpoints

### 1. Departments
- **GET /departments**
  - Returns a list of all departments.
- **GET /departments/:id**
  - Returns details of a specific department.

### 2. Jobs
- **GET /jobs**
  - Query Params: `status`, `departmentId`, `search`
  - Returns a paginated list of jobs.
- **GET /jobs/:id**
  - Returns details of a specific job.
- **POST /jobs**
  - Creates a new job posting.
- **PUT /jobs/:id**
  - Updates an existing job.

### 3. Candidates
- **GET /candidates**
  - Query Params: `extractStatus`, `employmentTag`, `search`
  - Returns a paginated list of candidates.
- **GET /candidates/:id**
  - Returns details of a specific candidate.
- **POST /candidates/upload**
  - Multipart/form-data: `file` (PDF/DOCX)
  - Uploads a CV and initiates the extraction process. Returns the created candidate object.

### 4. Matches
- **GET /matches/job/:jobId**
  - Returns all candidates matched for a specific job, sorted by score descending.
- **GET /matches/candidate/:candidateId**
  - Returns all jobs matched for a specific candidate.
- **GET /matches/queue**
  - **Mục đích**: Theo dõi tiến độ các tác vụ AI chạy ngầm. Frontend sử dụng API này để hiển thị thanh trạng thái (Scanning/Matching) cho người dùng.
  - **Dữ liệu trả về**: Danh sách `MatchQueueItem[]`
  - **Chi tiết item**:
    ```json
    {
      "candidateId": "string",
      "candidateName": "string",
      "status": "queued | processing | done"
    }
    ```
- **POST /matches/trigger**
  - Body: `{ "jobId": "string", "candidateIds": ["string"] }`
  - Triggers the matching process for the selected candidates against the specified job.

### 5. Statistics (Dashboard)
- **GET /stats/summary**
  - Returns high-level metrics for the dashboard:
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
  - Returns a list of candidates whose CV extraction failed, including error details.
  - Useful for debugging AI processing issues.
