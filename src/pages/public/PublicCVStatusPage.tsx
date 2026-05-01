import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { candidateService } from '@/shared/lib/api-services';
import { ExtractStatusBadge } from '@/shared/components/StatusBadges';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function PublicCVStatusPage() {
  const { candidateId } = useParams();

  const { data: candidate, isLoading, error } = useQuery({
    queryKey: ['public-candidate', candidateId],
    queryFn: () => candidateService.getById(candidateId!),
    enabled: !!candidateId,
    refetchInterval: (status) => {
      // Tự động refetch mỗi 3 giây nếu đang xử lý
      const extractStatus = status?.state?.data?.extractStatus;
      return extractStatus === 'PENDING' || extractStatus === 'SCANNING' ? 3000 : false;
    }
  });

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background p-4'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background p-4'>
        <Card className='w-full max-w-md text-center'>
          <CardContent className='py-12'>
            <p className='text-muted-foreground'>{error instanceof Error ? error.message : 'Candidate not found.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md animate-fade-in'>
        <CardHeader className='text-center'>
          <FileText className='mx-auto h-10 w-10 text-primary' />
          <CardTitle className='mt-2'>CV Extract Status</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-sm'>
            <strong>{candidate.name}</strong>
          </p>
          <p className='text-sm text-muted-foreground'>{candidate.cvFileName}</p>
          <div className='flex justify-center'>
            <ExtractStatusBadge status={candidate.extractStatus} />
          </div>
          {candidate.extractStatus === 'FAILED' && candidate.extractError && (
            <div className='mt-4 rounded-lg border border-destructive bg-destructive/5 p-4 text-left'>
              <div className='flex items-center gap-2 mb-2'>
                <AlertCircle className='h-4 w-4 text-destructive' />
                <span className='text-sm font-semibold text-destructive'>Error</span>
              </div>
              {candidate.extractError.code && (
                <p className='text-xs font-mono text-muted-foreground mb-1'>{candidate.extractError.code}</p>
              )}
              <p className='text-sm'>{candidate.extractError.message}</p>
            </div>
          )}
          {(candidate.extractStatus === 'PENDING' || candidate.extractStatus === 'SCANNING') && (
            <p className='text-xs text-muted-foreground animate-pulse'>
              Processing... this page will update automatically.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
