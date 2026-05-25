import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { ArrowLeft, Mail, Phone, FileText, AlertCircle, Loader2, Eye, Download, User } from 'lucide-react';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Một hàng thông tin label + value trong Profile card */
function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className='flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0'>
      <span className='mt-0.5 text-muted-foreground/60 shrink-0'>{icon}</span>
      <span className='w-24 shrink-0 text-xs text-muted-foreground'>{label}</span>
      <span className={`text-sm flex-1 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

/** Section wrapper — thay Card, dùng border + rounded thống nhất với CandidatesPage */
function Section({
  title,
  children,
  variant = 'default',
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  return (
    <div
      className={`rounded-lg border ${
        variant === 'danger' ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'
      }`}
    >
      {title && (
        <div
          className={`flex items-center gap-2 border-b px-4 py-3 ${
            variant === 'danger' ? 'border-destructive/30' : 'border-border/60'
          }`}
        >
          <span
            className={`text-xs font-medium uppercase tracking-widest ${
              variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {title}
          </span>
        </div>
      )}
      <div className='px-4 py-3'>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CandidateDetailPage() {
  const { candidateId } = useParams();
  const { toast } = useToast();
  const [cvAction, setCvAction] = useState<'preview' | 'download' | null>(null);

  const { data: candidate, isLoading } = useQuery({
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

  // ── Loading / Not found ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!candidate) {
    return <div className='p-8 text-center text-sm text-muted-foreground'>Candidate not found</div>;
  }

  const cvBusy = cvAction != null;
  const canPreviewCv = candidate.cvPreviewable ?? isCvBrowserPreviewable(candidate.cvFileName);

  // Hiện tên file (bỏ extension) nếu extract FAILED và không có name
  const displayName =
    candidate.name?.trim() ||
    (candidate.extractStatus === 'FAILED'
      ? (candidate.cvFileName?.replace(/\.pdf$/i, '') ?? 'Unknown')
      : 'Processing…');

  return (
    <div className='flex h-full flex-col'>
      {/* ── Header ── */}
      <PageHeader
        title={displayName}
        description={candidate.email ?? 'No email extracted'}
        actions={
          <div className='flex items-center gap-2'>
            {/* CV dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' disabled={cvBusy} className='max-w-[240px] gap-1.5 font-mono text-xs'>
                  {cvBusy ? (
                    <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin' />
                  ) : (
                    <FileText className='h-3.5 w-3.5 shrink-0' />
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

            {/* Back */}
            <Button variant='outline' asChild className='gap-1.5'>
              <Link to='/hr/candidates'>
                <ArrowLeft className='h-3.5 w-3.5' />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {/* ── Body ── */}
      <div className='mx-auto w-full max-w-5xl space-y-3 pb-8'>
        {/* Profile */}
        <Section title='Profile'>
          <InfoRow
            icon={<User className='h-3.5 w-3.5' />}
            label='Name'
            value={
              candidate.name?.trim() ? (
                candidate.name.trim()
              ) : (
                <span className='text-muted-foreground italic'>
                  {candidate.extractStatus === 'FAILED' ? 'Extract failed' : 'Processing…'}
                </span>
              )
            }
          />
          <InfoRow
            icon={<Mail className='h-3.5 w-3.5' />}
            label='Email'
            value={
              candidate.email ? (
                <a href={`mailto:${candidate.email}`} className='text-primary hover:underline underline-offset-2'>
                  {candidate.email}
                </a>
              ) : (
                <span className='text-muted-foreground italic'>—</span>
              )
            }
          />
          {candidate.phone && (
            <InfoRow icon={<Phone className='h-3.5 w-3.5' />} label='Phone' value={candidate.phone} />
          )}
          <InfoRow icon={<FileText className='h-3.5 w-3.5' />} label='CV file' value={candidate.cvFileName} mono />
          <InfoRow
            icon={<span className='font-mono text-[10px] leading-none'>AT</span>}
            label='Uploaded'
            value={<span className='font-mono text-xs tabular-nums'>{formatDateTime(candidate.uploadedAt)}</span>}
          />
          {/* Badges row */}
          <div className='flex gap-2 pt-3'>
            <ExtractStatusBadge status={candidate.extractStatus} />
            <EmploymentBadge tag={candidate.employmentTag} />
          </div>
        </Section>

        {/* Extract error */}
        {candidate.extractStatus === 'FAILED' && candidate.extractError && (
          <Section
            title={
              <span className='flex items-center gap-1.5'>
                <AlertCircle className='h-3 w-3' />
                Extract Error
              </span>
            }
            variant='danger'
          >
            {candidate.extractError.code && (
              <p className='mb-1.5 font-mono text-[11px] text-muted-foreground'>code: {candidate.extractError.code}</p>
            )}
            <p className='text-sm'>{candidate.extractError.message}</p>
          </Section>
        )}

        {/* Extracted info */}
        {candidate.extractStatus === 'COMPLETE' && candidate.skills && (
          <Section title='Extracted Info'>
            {candidate.experience && (
              <div className='mb-3 pb-3 border-b border-border/50'>
                <p className='mb-1 text-xs text-muted-foreground uppercase tracking-wider'>Experience</p>
                <p className='text-sm'>{candidate.experience}</p>
              </div>
            )}
            {candidate.skills.length > 0 && (
              <div>
                <p className='mb-2 text-xs text-muted-foreground uppercase tracking-wider'>Skills</p>
                <div className='flex flex-wrap gap-1.5'>
                  {candidate.skills.map((s) => (
                    <span
                      key={s}
                      className='rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-foreground'
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}
