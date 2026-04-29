import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { candidateService } from '@/shared/lib/api-services';
import { ExtractStatusBadge, EmploymentBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { formatDateTime } from '@/shared/lib/utils';
import { ArrowLeft, Mail, Phone, FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function CandidateDetailPage() {
  const { candidateId } = useParams();

  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => candidateService.getById(candidateId!),
    enabled: !!candidateId,
  });

  if (candidateLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!candidate) return <div className='p-8 text-center text-muted-foreground'>Candidate not found</div>;


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
                {formatDateTime(candidate.uploadedAt)}
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
            <CardTitle className='text-base'>CV Preview</CardTitle>
          </CardHeader>
          <CardContent className='aspect-[3/4] flex items-center justify-center bg-muted rounded-md'>
            <div className='text-center space-y-2'>
              <FileText className='h-12 w-12 text-muted-foreground mx-auto' />
              <p className='text-muted-foreground'>CV Content Preview Coming Soon</p>
              <p className='text-xs text-muted-foreground/60'>{candidate.cvFileName}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
