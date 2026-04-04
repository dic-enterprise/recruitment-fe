import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Button } from "@/shared/components/ui/button";
import { jobs, departments, appendJob, type Job, type JobStatus } from "@/shared/lib/mock-data";
import { JobStatusBadge } from "@/shared/components/StatusBadges";
import PageHeader from "@/shared/components/PageHeader";
import { CreateJobModal } from "@/shared/components/hr/CreateJobDialog";
import useModal from "@/shared/hooks/useModal";
import { Plus, Search } from "lucide-react";

export default function JobsPage() {
  const [modalNode, openModal] = useModal();
  const [jobList, setJobList] = useState<Job[]>(() => [...jobs]);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [keyword, setKeyword] = useState("");

  const filtered = jobList.filter(j => {
    if (statusFilter !== "ALL" && j.status !== statusFilter) return false;
    if (deptFilter !== "ALL" && j.departmentId !== deptFilter) return false;
    if (keyword) {
      const q = keyword.toLowerCase();
      if (!j.title.toLowerCase().includes(q) && !j.departmentName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openCreateJob = () => {
    void openModal(close => (
      <CreateJobModal
        close={close}
        onJobCreated={job => {
          appendJob(job);
          setJobList([...jobs]);
        }}
      />
    ));
  };

  return (
    <div>
      {modalNode}
      <PageHeader
        title="Jobs"
        description="Manage job postings"
        actions={
          <Button onClick={openCreateJob}>
            <Plus className="mr-2 h-4 w-4" />
            Create job
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search title or department..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as JobStatus | "ALL")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="ARCHIVED">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Matches</TableHead>
              <TableHead className="text-right">High (≥80)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(job => (
              <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link to={`/hr/jobs/${job.id}`} className="font-medium text-primary hover:underline">{job.title}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{job.departmentName}</TableCell>
                <TableCell className="text-muted-foreground">{job.salary || "—"}</TableCell>
                <TableCell><JobStatusBadge status={job.status} /></TableCell>
                <TableCell className="text-right">{job.matchCount}</TableCell>
                <TableCell className="text-right font-semibold">{job.highMatchCount}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No jobs found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
