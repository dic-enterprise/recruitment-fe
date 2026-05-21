import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { candidateService } from '@/shared/lib/api-services';
import { downloadBlob, getCvPreviewUrl, isCvBrowserPreviewable } from '@/shared/lib/cv-file-utils';
import { ExtractStatusBadge, EmploymentBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { formatDateTime } from '@/shared/lib/utils';
import { useToast } from '@/shared/hooks/use-toast';
import { ArrowLeft, Mail, Phone, FileText, AlertCircle, Loader2, Eye, Download } from 'lucide-react';

export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const { toast } = useToast();
  const [cvAction, setCvAction] = useState<'preview' | 'download' | null>(null);

  const { data: candidate, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: () => candidateService.getById(candidateId!),
    enabled: !!candidateId,
  });

  const handleDownloadCv = async () => {
    if (!candidateId || !candidate) return;
    setCvAction('download');
    try {
      const blob = await candidateService.downloadCv(candidateId);
      downloadBlob(blob, candidate.cvFileName);
    } catch {
      toast({
        title: 'Không thể tải CV',
        description: 'Không tải được file từ server.',
        variant: 'destructive',
      });
    } finally {
      setCvAction(null);
    }
  };

  if (candidateLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!candidate) return <div className='p-8 text-center text-muted-foreground'>Candidate not found</div>;

  const cvBusy = cvAction != null;
  const canPreviewCv = candidate.cvPreviewable ?? isCvBrowserPreviewable(candidate.cvFileName);

  return (
    <div>
      <PageHeader
        title={candidate.name}
        description={candidate.email}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' disabled={cvBusy} className='max-w-[220px]'>
                  {cvBusy ? (
                    <Loader2 className='mr-2 h-4 w-4 shrink-0 animate-spin' />
                  ) : (
                    <FileText className='mr-2 h-4 w-4 shrink-0' />
                  )}
                  <span className='truncate'>{candidate.cvFileName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                {canPreviewCv && candidateId && (
                  <DropdownMenuItem asChild disabled={cvBusy}>
                    <a href={getCvPreviewUrl(candidateId)} target='_blank' rel='noopener noreferrer'>
                      <Eye className='mr-2 h-4 w-4' />
                      Xem trước CV
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => void handleDownloadCv()} disabled={cvBusy}>
                  <Download className='mr-2 h-4 w-4' />
                  Tải CV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant='outline' asChild>
              <Link to='/hr/candidates'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back
              </Link>
            </Button>
          </>
        }
      />

      <div className='mx-auto grid max-w-3xl gap-4'>
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
    </div>
  );
}
