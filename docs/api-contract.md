# API Contract - Recruitment System

This document outlines the API endpoints required to support the Recruitment Frontend application.

## Base URL
`https://api.recruitment-system.com/v1`

## Authentication
All requests should include a Bearer token in the Authorization header:
`Authorization: Bearer <token>`

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
  "minMatchingScore": "number (1-100)",
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
  - Returns `CodeResponse<List<Department>>`.
- **GET /departments/:id**
  - Returns `CodeResponse<Department>`.

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
- **POST /candidates/upload**
  - Multipart/form-data: `file` (PDF)
  - Returns `CodeResponse<Candidate>`.

### 4. Matches
- **GET /matches**
  - Returns `CodeResponse<List<CVMatch>>`.
- **GET /matches/job/:jobId**
  - Returns `CodeResponse<List<CVMatch>>`.
- **GET /matches/candidate/:candidateId**
  - Returns `CodeResponse<List<CVMatch>>`.
- **GET /matches/queue**
  - Returns `CodeResponse<List<MatchQueueItem>>`.
  - Item detail:
    ```json
    {
      "candidateId": "string",
      "candidateName": "string",
      "status": "queued | processing | done"
    }
    ```
- **POST /matches/trigger**
  - Body: `{ "jobId": "string", "candidateIds": ["string"] }`
  - Returns `CodeResponse<Void>`.

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
  - Returns `CodeResponse<List<Candidate>>`.
