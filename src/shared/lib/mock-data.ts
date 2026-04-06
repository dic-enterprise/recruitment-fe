// ===== Enums =====
export type JobStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";
export type ExtractStatus = "PENDING" | "SCANNING" | "COMPLETE" | "FAILED";
export type EmploymentTag = "CHUA_NHAN_VIEC" | "DA_CO_VIEC";

export interface DepartmentContact {
  name: string;
  email?: string;
  phone?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  manager?: string;
  contacts: DepartmentContact[];
  jobCount: number;
}

export interface Job {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  salary?: string;
  requirements: string;
  status: JobStatus;
  createdAt: string;
  matchCount: number;
  highMatchCount: number;
  location?: string;
  workplaceHybrid?: boolean;
  employmentFullTime?: boolean;
  recruitmentUrgency?: "NORMAL" | "URGENT";
  skills?: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cvFileName: string;
  extractStatus: ExtractStatus;
  employmentTag: EmploymentTag;
  extractError?: { code?: string; message: string };
  uploadedAt: string;
  skills?: string[];
  experience?: string;
}

export interface CVMatch {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  score: number;
  details: Record<string, unknown>;
  createdAt: string;
}

export type MatchQueueStatus = "queued" | "processing" | "done";

export interface MatchQueueItem {
  candidateId: string;
  candidateName: string;
  status: MatchQueueStatus;
}

// ===== Mock Data =====
export const departments: Department[] = [
  { id: "dept-1", code: "ENG", name: "Engineering", manager: "Nguyễn Văn Hùng", contacts: [{ name: "Trần Thị Lan", email: "lan.tran@company.com", phone: "0901234567" }], jobCount: 3 },
  { id: "dept-2", code: "MKT", name: "Marketing", manager: "Lê Minh Tuấn", contacts: [{ name: "Phạm Hồng Nhung", email: "nhung.pham@company.com" }], jobCount: 2 },
  { id: "dept-3", code: "HR", name: "Human Resources", manager: "Vũ Thị Mai", contacts: [{ name: "Đỗ Quang Huy", email: "huy.do@company.com", phone: "0912345678" }], jobCount: 1 },
  { id: "dept-4", code: "FIN", name: "Finance", manager: "Hoàng Anh Dũng", contacts: [{ name: "Bùi Thanh Hà", email: "ha.bui@company.com" }], jobCount: 1 },
];

const jobsSeed: Job[] = [
  { id: "job-1", departmentId: "dept-1", departmentName: "Engineering", title: "Senior Frontend Developer", salary: "25-40M VND", requirements: "5+ years React/TypeScript experience. Strong understanding of modern frontend architecture, testing, and performance optimization.", status: "ACTIVE", createdAt: "2024-01-15", matchCount: 12, highMatchCount: 3 },
  { id: "job-2", departmentId: "dept-1", departmentName: "Engineering", title: "Backend Developer (Java)", salary: "20-35M VND", requirements: "3+ years Java/Spring Boot. Experience with microservices, PostgreSQL, and cloud platforms.", status: "ACTIVE", createdAt: "2024-01-20", matchCount: 8, highMatchCount: 2 },
  { id: "job-3", departmentId: "dept-2", departmentName: "Marketing", title: "Digital Marketing Specialist", salary: "15-25M VND", requirements: "2+ years digital marketing. Google Ads, Facebook Ads, SEO/SEM, analytics.", status: "ACTIVE", createdAt: "2024-02-01", matchCount: 5, highMatchCount: 1 },
  { id: "job-4", departmentId: "dept-1", departmentName: "Engineering", title: "DevOps Engineer", salary: "30-45M VND", requirements: "Kubernetes, Docker, CI/CD pipelines, AWS/GCP. Infrastructure as Code.", status: "CLOSED", createdAt: "2023-11-10", matchCount: 15, highMatchCount: 5 },
  { id: "job-5", departmentId: "dept-2", departmentName: "Marketing", title: "Content Writer", salary: "10-18M VND", requirements: "Strong writing skills in Vietnamese and English. Experience with content strategy.", status: "ARCHIVED", createdAt: "2023-09-01", matchCount: 6, highMatchCount: 0 },
  { id: "job-6", departmentId: "dept-3", departmentName: "Human Resources", title: "HR Generalist", salary: "18-28M VND", requirements: "3+ years HR experience. Knowledge of Vietnamese labor law.", status: "ACTIVE", createdAt: "2024-02-10", matchCount: 3, highMatchCount: 1 },
  { id: "job-7", departmentId: "dept-4", departmentName: "Finance", title: "Financial Analyst", salary: "20-32M VND", requirements: "CFA preferred. Financial modeling, Excel, data analysis.", status: "ACTIVE", createdAt: "2024-02-15", matchCount: 0, highMatchCount: 0 },
];

const FAKE_JOB_TITLES = [
  "Junior Frontend Developer",
  "Staff Engineer (Platform)",
  "Mobile Engineer (Flutter)",
  "QA Automation Engineer",
  "Data Engineer",
  "Machine Learning Engineer",
  "Security Engineer",
  "Technical Writer",
  "Engineering Manager",
  "Solutions Architect",
  "Product Designer",
  "UX Researcher",
  "Brand Manager",
  "Performance Marketing Lead",
  "Social Media Specialist",
  "CRM Specialist",
  "Event Marketing Coordinator",
  "SEO Lead",
  "Talent Acquisition Partner",
  "HR Business Partner",
  "L&D Specialist",
  "Compensation Analyst",
  "Payroll Specialist",
  "Corporate Accountant",
  "FP&A Analyst",
  "Internal Auditor",
  "Treasury Analyst",
  "Tax Associate",
  "Full-stack Developer (Node)",
  "Site Reliability Engineer",
  "Blockchain Developer",
  "Game Client Programmer",
  "Embedded Software Engineer",
  "Sales Engineer",
  "Customer Success Manager",
  "IT Support Lead",
  "Scrum Master",
  "Product Owner",
  "Business Analyst",
  "Office Administrator",
  "Legal Counsel (Commercial)",
  "Procurement Specialist",
  "Graphic Designer",
] as const;

const FAKE_STATUS_ROTATE: JobStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "CLOSED", "ARCHIVED"];

function buildFakeJobs(): Job[] {
  return Array.from({ length: 43 }, (_, i) => {
    const n = i + 8;
    const dept = departments[i % departments.length];
    const title = FAKE_JOB_TITLES[i] ?? `Open Position #${n}`;
    const lo = 12 + (i % 14);
    const hi = lo + 8 + (i % 12);
    return {
      id: `job-${n}`,
      departmentId: dept.id,
      departmentName: dept.name,
      title,
      salary: `${lo}-${hi}M VND`,
      requirements: "Mock JD for list / scroll testing.",
      status: FAKE_STATUS_ROTATE[i % FAKE_STATUS_ROTATE.length],
      createdAt: `2024-${String((i % 11) + 2).padStart(2, "0")}-${String((i % 26) + 1).padStart(2, "0")}`,
      matchCount: (i * 3) % 22,
      highMatchCount: (i * 2) % 7,
    };
  });
}

export const jobs: Job[] = [...jobsSeed, ...buildFakeJobs()];

export const candidates: Candidate[] = [
  { id: "cand-1", name: "Nguyễn Minh Đức", email: "duc.nguyen@gmail.com", phone: "0901111111", cvFileName: "NguyenMinhDuc_CV.pdf", extractStatus: "COMPLETE", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-01-18", skills: ["React", "TypeScript", "Node.js", "GraphQL"], experience: "6 years frontend development" },
  { id: "cand-2", name: "Trần Thị Hương", email: "huong.tran@gmail.com", phone: "0902222222", cvFileName: "TranThiHuong_CV.pdf", extractStatus: "COMPLETE", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-01-19", skills: ["Java", "Spring Boot", "PostgreSQL", "Docker"], experience: "4 years backend development" },
  { id: "cand-3", name: "Lê Quang Hải", email: "hai.le@gmail.com", cvFileName: "LeQuangHai_CV.docx", extractStatus: "COMPLETE", employmentTag: "DA_CO_VIEC", uploadedAt: "2024-01-20", skills: ["Python", "Machine Learning", "TensorFlow"], experience: "3 years data science" },
  { id: "cand-4", name: "Phạm Thị Mai", email: "mai.pham@gmail.com", phone: "0904444444", cvFileName: "PhamThiMai_CV.pdf", extractStatus: "SCANNING", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-02-14" },
  { id: "cand-5", name: "Hoàng Văn Nam", email: "nam.hoang@gmail.com", cvFileName: "HoangVanNam_CV.doc", extractStatus: "PENDING", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-02-15" },
  { id: "cand-6", name: "Vũ Thị Ngọc", email: "ngoc.vu@gmail.com", phone: "0906666666", cvFileName: "VuThiNgoc_CV.pdf", extractStatus: "FAILED", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-02-10", extractError: { code: "AI_TIMEOUT", message: "AI provider timed out after 3 retries. The CV file may be too large or the provider is temporarily unavailable. Please contact Admin IT for retry." } },
  { id: "cand-7", name: "Đặng Minh Tú", email: "tu.dang@gmail.com", cvFileName: "DangMinhTu_CV.pdf", extractStatus: "COMPLETE", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-02-01", skills: ["Marketing", "Google Ads", "SEO", "Content Strategy"], experience: "3 years digital marketing" },
  { id: "cand-8", name: "Bùi Thanh Sơn", email: "son.bui@gmail.com", phone: "0908888888", cvFileName: "BuiThanhSon_CV.pdf", extractStatus: "COMPLETE", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-02-05", skills: ["React", "Vue.js", "CSS", "UI/UX"], experience: "5 years frontend development" },
  { id: "cand-9", name: "Ngô Thị Linh", email: "linh.ngo@gmail.com", cvFileName: "NgoThiLinh_CV.pdf", extractStatus: "FAILED", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-02-12", extractError: { code: "PARSE_ERROR", message: "Unable to parse CV content. The file may be corrupted or in an unsupported format. Please re-upload a valid PDF or DOCX file." } },
  { id: "cand-10", name: "Trịnh Văn Khoa", email: "khoa.trinh@gmail.com", phone: "0900000010", cvFileName: "TrinhVanKhoa_CV.pdf", extractStatus: "COMPLETE", employmentTag: "CHUA_NHAN_VIEC", uploadedAt: "2024-01-25", skills: ["Java", "Kubernetes", "AWS", "Terraform"], experience: "7 years backend/devops" },
];

export const cvMatches: CVMatch[] = [
  { id: "m-1", candidateId: "cand-1", candidateName: "Nguyễn Minh Đức", jobId: "job-1", jobTitle: "Senior Frontend Developer", score: 92, details: { skillMatch: 95, experienceMatch: 88, educationMatch: 90 }, createdAt: "2024-02-01" },
  { id: "m-2", candidateId: "cand-8", candidateName: "Bùi Thanh Sơn", jobId: "job-1", jobTitle: "Senior Frontend Developer", score: 85, details: { skillMatch: 88, experienceMatch: 82, educationMatch: 80 }, createdAt: "2024-02-01" },
  { id: "m-3", candidateId: "cand-10", candidateName: "Trịnh Văn Khoa", jobId: "job-1", jobTitle: "Senior Frontend Developer", score: 65, details: { skillMatch: 60, experienceMatch: 75, educationMatch: 60 }, createdAt: "2024-02-01" },
  { id: "m-4", candidateId: "cand-2", candidateName: "Trần Thị Hương", jobId: "job-2", jobTitle: "Backend Developer (Java)", score: 88, details: { skillMatch: 90, experienceMatch: 85, educationMatch: 88 }, createdAt: "2024-02-02" },
  { id: "m-5", candidateId: "cand-10", candidateName: "Trịnh Văn Khoa", jobId: "job-2", jobTitle: "Backend Developer (Java)", score: 82, details: { skillMatch: 85, experienceMatch: 80, educationMatch: 78 }, createdAt: "2024-02-02" },
  { id: "m-6", candidateId: "cand-7", candidateName: "Đặng Minh Tú", jobId: "job-3", jobTitle: "Digital Marketing Specialist", score: 80, details: { skillMatch: 82, experienceMatch: 78, educationMatch: 80 }, createdAt: "2024-02-05" },
  { id: "m-7", candidateId: "cand-1", candidateName: "Nguyễn Minh Đức", jobId: "job-4", jobTitle: "DevOps Engineer", score: 55, details: { skillMatch: 50, experienceMatch: 60, educationMatch: 55 }, createdAt: "2024-01-01" },
  { id: "m-8", candidateId: "cand-10", candidateName: "Trịnh Văn Khoa", jobId: "job-4", jobTitle: "DevOps Engineer", score: 91, details: { skillMatch: 95, experienceMatch: 90, educationMatch: 85 }, createdAt: "2024-01-01" },
];

// Helper functions
export function isAvailableCandidate(c: Candidate): boolean {
  return c.extractStatus === "COMPLETE" && c.employmentTag === "CHUA_NHAN_VIEC";
}

export function getMatchesForJob(jobId: string): CVMatch[] {
  return cvMatches.filter(m => m.jobId === jobId);
}

export function getMatchesForCandidate(candidateId: string): CVMatch[] {
  return cvMatches.filter(m => m.candidateId === candidateId);
}

export function getActiveJobs(): Job[] {
  return jobs.filter(j => j.status === "ACTIVE");
}

export function appendJob(job: Job): void {
  jobs.push(job);
}

export function updateJob(jobId: string, next: Job): boolean {
  const i = jobs.findIndex(j => j.id === jobId);
  if (i === -1) return false;
  jobs[i] = next;
  return true;
}

export function getFailedExtracts(): Candidate[] {
  return candidates.filter(c => c.extractStatus === "FAILED");
}
