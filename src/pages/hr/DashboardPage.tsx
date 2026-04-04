import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getActiveJobs, candidates, cvMatches, jobs } from "@/shared/lib/mock-data";
import { Briefcase, Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import PageHeader from "@/shared/components/PageHeader";

function StatCard({ title, value, subtitle, icon: Icon, color }: { title: string; value: string | number; subtitle?: string; icon: React.ElementType; color: string }) {
  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const activeJobs = getActiveJobs();
  const activeJobIds = new Set(activeJobs.map(j => j.id));
  const activeMatches = cvMatches.filter(m => activeJobIds.has(m.jobId));
  const highMatches = activeMatches.filter(m => m.score >= 80);
  const avgScore = activeMatches.length > 0 ? Math.round(activeMatches.reduce((s, m) => s + m.score, 0) / activeMatches.length) : 0;
  const completedExtracts = candidates.filter(c => c.extractStatus === "COMPLETE").length;
  const failedExtracts = candidates.filter(c => c.extractStatus === "FAILED").length;
  const pendingExtracts = candidates.filter(c => c.extractStatus === "PENDING" || c.extractStatus === "SCANNING").length;

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of active recruitment metrics" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Active Jobs" value={activeJobs.length} subtitle={`${jobs.filter(j => j.status === "CLOSED").length} closed · ${jobs.filter(j => j.status === "ARCHIVED").length} archived`} icon={Briefcase} color="bg-primary/10 text-primary" />
        <StatCard title="Total Candidates" value={candidates.length} subtitle={`${candidates.filter(c => c.employmentTag === "CHUA_NHAN_VIEC").length} available`} icon={Users} color="bg-accent/10 text-accent" />
        <StatCard title="High Matches (≥80)" value={highMatches.length} subtitle={`From ${activeMatches.length} total matches`} icon={TrendingUp} color="bg-success/10 text-success" />
        <StatCard title="Avg Match Score" value={`${avgScore}%`} subtitle="Active jobs only" icon={TrendingUp} color="bg-info/10 text-info" />
        <StatCard title="Extracts Complete" value={completedExtracts} icon={CheckCircle} color="bg-success/10 text-success" />
        <StatCard title="Extracts Pending" value={pendingExtracts} icon={Clock} color="bg-warning/10 text-warning" />
        <StatCard title="Extract Failures" value={failedExtracts} subtitle="Requires Admin IT action" icon={AlertTriangle} color="bg-destructive/10 text-destructive" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.departmentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{job.highMatchCount} high</p>
                    <p className="text-xs text-muted-foreground">{job.matchCount} total</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeMatches.slice(0, 5).map(match => (
                <div key={match.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{match.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{match.jobTitle}</p>
                  </div>
                  <div className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${match.score >= 80 ? "bg-success/10 text-success" : match.score >= 60 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
                    {match.score}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
