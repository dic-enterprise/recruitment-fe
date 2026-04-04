import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { getFailedExtracts } from "@/shared/lib/mock-data";
import { ExtractStatusBadge } from "@/shared/components/StatusBadges";
import PageHeader from "@/shared/components/PageHeader";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

export default function ExtractErrorsPage() {
  const { toast } = useToast();
  const failedCandidates = getFailedExtracts();

  const handleRetry = (name: string) => {
    toast({ title: "Retry queued", description: `Extract retry has been queued for ${name}.` });
  };

  return (
    <div>
      <PageHeader
        title="Extract Errors"
        description="Candidates with failed CV extraction — Admin IT can retry"
      />

      {failedCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No extract errors at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CV File</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error Code</TableHead>
                <TableHead>Error Message</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {failedCandidates.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.cvFileName}</TableCell>
                  <TableCell><ExtractStatusBadge status={c.extractStatus} /></TableCell>
                  <TableCell className="font-mono text-xs">{c.extractError?.code || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{c.extractError?.message || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRetry(c.name)}>
                      <RotateCcw className="mr-1 h-3 w-3" />Retry
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
