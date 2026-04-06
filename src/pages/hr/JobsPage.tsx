import {useState} from "react";
import {Link} from "react-router-dom";
import {AutoSizer} from "react-virtualized-auto-sizer";
import {Input} from "@/shared/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/shared/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/shared/components/ui/table";
import {Button} from "@/shared/components/ui/button";
import {appendJob, departments, type Job, jobs, type JobStatus} from "@/shared/lib/mock-data";
import {JobStatusBadge} from "@/shared/components/StatusBadges";
import PageHeader from "@/shared/components/PageHeader";
import {CreateJobModal} from "@/shared/components/hr/CreateJobDialog";
import useModal from "@/shared/hooks/useModal";
import {Plus, Search} from "lucide-react";

export default function JobsPage() {
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

    const [modalNode, openModal] = useModal();
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
        <div className="flex h-full min-h-0 flex-col">
            {modalNode}
            <div className="shrink-0">
                <PageHeader
                    title="Jobs"
                    description="Manage job postings"
                    actions={
                        <Button onClick={openCreateJob}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Create job
                        </Button>
                    }
                />
            </div>

            <div className="mb-4 flex shrink-0 flex-wrap gap-3">
                <div className="relative min-w-[200px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
                    <Input placeholder="Search title or department..." value={keyword}
                           onChange={e => setKeyword(e.target.value)} className="pl-9"/>
                </div>
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as JobStatus | "ALL")}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Department"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        {departments.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                                {d.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="min-h-0 min-w-0 flex-1">
                <AutoSizer
                    className="h-full min-h-0 w-full"
                    style={{height: "100%", width: "100%"}}
                    renderProp={({height, width}) =>
                        height == null || width == null ? null : (
                            <div style={{height, width}} className="overflow-auto rounded-lg border">
                                <Table>
                                    <TableHeader className="sticky top-0 z-10 bg-card [&_tr]:border-b">
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
                                                    <Link to={`/hr/jobs/${job.id}`}
                                                          className="font-medium text-primary hover:underline">
                                                        {job.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell
                                                    className="text-muted-foreground">{job.departmentName}</TableCell>
                                                <TableCell
                                                    className="text-muted-foreground">{job.salary || "—"}</TableCell>
                                                <TableCell>
                                                    <JobStatusBadge status={job.status}/>
                                                </TableCell>
                                                <TableCell className="text-right">{job.matchCount}</TableCell>
                                                <TableCell
                                                    className="text-right font-semibold">{job.highMatchCount}</TableCell>
                                            </TableRow>
                                        ))}
                                        {filtered.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6}
                                                           className="py-8 text-center text-muted-foreground">
                                                    No jobs found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )
                    }
                />
            </div>
        </div>
    );
}
