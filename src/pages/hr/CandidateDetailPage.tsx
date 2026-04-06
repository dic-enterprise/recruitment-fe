import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { candidates, getMatchesForCandidate } from '@/shared/lib/mock-data';
import { ExtractStatusBadge, EmploymentBadge, ScoreBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { ArrowLeft, Mail, Phone, FileText, AlertCircle } from 'lucide-react';

export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const candidate = candidates.find((c) => c.id === candidateId);

  if (!candidate) return <div className='p-8 text-center text-muted-foreground'>Candidate not found</div>;

  const matches = getMatchesForCandidate(candidate.id);

  return (
    <div>
      <PageHeader
        title={candidate.name}
        description={candidate.email}
        actions={
          <Button variant='outline' asChild>
            <Link to='/hr/candidates'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Link>
          </Button>
        }
      />

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='space-y-4 lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Profile</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex items-center gap-2'>
                <Mail className='h-4 w-4 text-muted-foreground' />
                {candidate.email}
              </div>
              {candidate.phone && (
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  {candidate.phone}
                </div>
              )}
              <div className='flex items-center gap-2'>
                <FileText className='h-4 w-4 text-muted-foreground' />
                {candidate.cvFileName}
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground'>Uploaded:</span>
                {candidate.uploadedAt}
              </div>
              <div className='flex gap-2 pt-2'>
                <ExtractStatusBadge status={candidate.extractStatus} />
                <EmploymentBadge tag={candidate.employmentTag} />
              </div>
            </CardContent>
          </Card>

          {candidate.extractStatus === 'FAILED' && candidate.extractError && (
            <Card className='border-destructive'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base flex items-center gap-2 text-destructive'>
                  <AlertCircle className='h-4 w-4' />
                  Extract Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                {candidate.extractError.code && (
                  <p className='text-xs font-mono text-muted-foreground mb-1'>Code: {candidate.extractError.code}</p>
                )}
                <p className='text-sm'>{candidate.extractError.message}</p>
              </CardContent>
            </Card>
          )}

          {candidate.extractStatus === 'COMPLETE' && candidate.skills && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Extracted Info</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                {candidate.experience && (
                  <p>
                    <span className='text-muted-foreground'>Experience:</span> {candidate.experience}
                  </p>
                )}
                <div>
                  <p className='text-muted-foreground mb-2'>Skills:</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {candidate.skills.map((s) => (
                      <span
                        key={s}
                        className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Match Results ({matches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-8'>No match results for this candidate</p>
            ) : (
              <div className='space-y-3'>
                {matches
                  .sort((a, b) => b.score - a.score)
                  .map((m) => (
                    <div key={m.id} className='rounded-lg border p-4'>
                      <div className='flex items-center justify-between mb-2'>
                        <Link to={`/hr/jobs/${m.jobId}`} className='font-medium text-primary hover:underline'>
                          {m.jobTitle}
                        </Link>
                        <div className='flex items-center gap-2'>
                          {m.score >= 80 && <span className='text-xs font-semibold text-success'>⭐ High Match</span>}
                          <ScoreBadge score={m.score} />
                        </div>
                      </div>
                      <p className='text-xs text-muted-foreground'>Matched on {m.createdAt}</p>
                      <div className='mt-2 grid grid-cols-3 gap-2'>
                        {Object.entries(m.details).map(([key, val]) => (
                          <div key={key} className='rounded-md bg-muted p-2 text-center'>
                            <p className='text-xs text-muted-foreground capitalize'>{key.replace(/([A-Z])/g, ' $1')}</p>
                            <p className='text-sm font-semibold'>{String(val)}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
