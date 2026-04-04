import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { jobs, candidates, getMatchesForJob, isAvailableCandidate, type MatchQueueItem } from "@/shared/lib/mock-data";
import { JobStatusBadge, ScoreBadge, QueueStatusBadge, ExtractStatusBadge, EmploymentBadge } from "@/shared/components/StatusBadges";
import PageHeader from "@/shared/components/PageHeader";
import { ArrowLeft, Play, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const { toast } = useToast();
  const job = jobs.find(j => j.id === jobId);

  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [queueItems, setQueueItems] = useState<MatchQueueItem[]>([]);
  const [isEnqueuing, setIsEnqueuing] = useState(false);

  if (!job) return <div className="p-8 text-center text-muted-foreground">Job not found</div>;

  const matches = getMatchesForJob(job.id);
  const availableCandidates = candidates.filter(isAvailableCandidate);
  const isActive = job.status === "ACTIVE";

  const toggleCandidate = (id: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllAvailable = () => {
    setSelectedCandidates(new Set(availableCandidates.map(c => c.id)));
  };

  const handleStart = () => {
    if (selectedCandidates.size === 0) {
      toast({ title: "No candidates selected", description: "Please select at least one available candidate.", variant: "destructive" });
      return;
    }

    // Check idempotency
    const alreadyQueued = new Set(queueItems.map(q => q.candidateId));
    const newIds = [...selectedCandidates].filter(id => !alreadyQueued.has(id));

    if (newIds.length === 0) {
      toast({ title: "Already enqueued", description: "All selected candidates are already in the matching queue." });
      return;
    }

    setIsEnqueuing(true);
    const newItems: MatchQueueItem[] = newIds.map(id => ({
      candidateId: id,
      candidateName: candidates.find(c => c.id === id)?.name || "",
      status: "queued" as const,
    }));

    setQueueItems(prev => [...newItems, ...prev]);

    // Simulate async processing
    setTimeout(() => {
      setQueueItems(prev => prev.map(item => newIds.includes(item.candidateId) ? { ...item, status: "processing" } : item));
    }, 1500);

    setTimeout(() => {
      setQueueItems(prev => prev.map(item => newIds.includes(item.candidateId) ? { ...item, status: "done" } : item));
      setIsEnqueuing(false);
      toast({ title: "Matching complete", description: `${newIds.length} candidate(s) processed.` });
    }, 4000);

    setSelectedCandidates(new Set());
  };

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.departmentName} · ${job.salary || "Salary not specified"}`}
        actions={
          <Button variant="outline" asChild>
            <Link to="/hr/jobs"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <JobStatusBadge status={job.status} />
        <span className="text-sm text-muted-foreground">Created {job.createdAt}</span>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Requirements (JD)</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p></CardContent>
      </Card>

      {/* Matching Section */}
      {isActive && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Start Matching</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllAvailable}>Select All Available ({availableCandidates.length})</Button>
                <Button size="sm" onClick={handleStart} disabled={isEnqueuing || selectedCandidates.size === 0}>
                  {isEnqueuing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><Play className="mr-2 h-4 w-4" />Start</>}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableCandidates.map(c => {
                const alreadyQueued = queueItems.some(q => q.candidateId === c.id);
                return (
                  <label key={c.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted cursor-pointer">
                    <Checkbox
                      checked={selectedCandidates.has(c.id)}
                      onCheckedChange={() => toggleCandidate(c.id)}
                      disabled={alreadyQueued}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.skills?.join(", ") || "Skills pending"}</p>
                    </div>
                    {alreadyQueued && <span className="text-xs text-muted-foreground">Already enqueued</span>}
                    <ExtractStatusBadge status={c.extractStatus} />
                    <EmploymentBadge tag={c.employmentTag} />
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Status */}
      {queueItems.length > 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Matching Queue</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queueItems.map(item => (
                <div key={item.candidateId} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{item.candidateName}</span>
                  <QueueStatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Matches */}
      <Card>
        <CardHeader><CardTitle className="text-base">Match Results ({matches.length})</CardTitle></CardHeader>
        <CardContent>
          {matches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No match results yet</p>
          ) : (
            <div className="space-y-2">
              {matches.sort((a, b) => b.score - a.score).map(m => (
                <Link key={m.id} to={`/hr/candidates/${m.candidateId}`} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors">
                  <div>
                    <p className="text-sm font-medium">{m.candidateName}</p>
                    <p className="text-xs text-muted-foreground">Matched {m.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.score >= 80 && <span className="text-xs font-semibold text-success">⭐ High Match</span>}
                    <ScoreBadge score={m.score} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
