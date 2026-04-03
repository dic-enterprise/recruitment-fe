import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { candidates, type ExtractStatus, type EmploymentTag } from "@/lib/mock-data";
import { ExtractStatusBadge, EmploymentBadge } from "@/components/StatusBadges";
import PageHeader from "@/components/PageHeader";
import { Search } from "lucide-react";

export default function CandidatesPage() {
  const [extractFilter, setExtractFilter] = useState<ExtractStatus | "ALL">("ALL");
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentTag | "ALL">("ALL");
  const [keyword, setKeyword] = useState("");

  const filtered = candidates.filter(c => {
    if (extractFilter !== "ALL" && c.extractStatus !== extractFilter) return false;
    if (employmentFilter !== "ALL" && c.employmentTag !== employmentFilter) return false;
    if (keyword && !c.name.toLowerCase().includes(keyword.toLowerCase()) && !c.email.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Candidates" description="View all candidates and their CV extract status" />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name or email..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-9" />
        </div>
        <Select value={extractFilter} onValueChange={v => setExtractFilter(v as ExtractStatus | "ALL")}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Extract Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Extract Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SCANNING">Scanning</SelectItem>
            <SelectItem value="COMPLETE">Complete</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employmentFilter} onValueChange={v => setEmploymentFilter(v as EmploymentTag | "ALL")}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Availability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="CHUA_NHAN_VIEC">Available</SelectItem>
            <SelectItem value="DA_CO_VIEC">Employed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CV File</TableHead>
              <TableHead>Extract</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <Link to={`/hr/candidates/${c.id}`} className="font-medium text-primary hover:underline">{c.name}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{c.cvFileName}</TableCell>
                <TableCell><ExtractStatusBadge status={c.extractStatus} /></TableCell>
                <TableCell><EmploymentBadge tag={c.employmentTag} /></TableCell>
                <TableCell className="text-muted-foreground">{c.uploadedAt}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No candidates found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
