import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { candidateService } from '@/shared/lib/api-services';
import { ExtractStatusBadge, EmploymentBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { formatDateTime } from '@/shared/lib/utils';
import { Search, Loader2, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/hooks/use-toast';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import type { Candidate, ExtractStatus, EmploymentTag } from '@/shared/types/api';
import { validateCvUploadFiles } from '@/shared/lib/cv-upload-utils';

function getCandidateListName(candidate: Candidate): string {
  if (candidate.name?.trim()) return candidate.name.trim();
  if (candidate.extractStatus === 'FAILED') return 'Fail';
  return 'Processing...';
}

export default function CandidatesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [extractFilter, setExtractFilter] = useState<ExtractStatus | 'ALL'>('ALL');
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentTag | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', extractFilter, employmentFilter, keyword],
    queryFn: () => candidateService.getAll({
      extractStatus: extractFilter === 'ALL' ? undefined : extractFilter,
      employmentTag: employmentFilter === 'ALL' ? undefined : employmentFilter,
      search: keyword || undefined,
    }),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => candidateService.uploadCVs(files),
    onSuccess: (created) => {
      const count = created.length;
      toast({
        title: 'Thành công',
        description:
          count === 1
            ? 'CV đã được tải lên và đang được xử lý.'
            : `Đã tải lên ${count} CV và đang được xử lý.`,
      });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi tải lên',
        description: error.message || 'Không thể tải lên CV lúc này.',
        variant: 'destructive',
      });
    },
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validation = validateCvUploadFiles(e.target.files);
    if (!validation.ok) {
      toast({ title: 'Không thể upload', description: validation.message, variant: 'destructive' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    uploadMutation.mutate(validation.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const columns: Column<Candidate>[] = [
    {
      header: 'Name',
      key: 'name',
      width: '250px',
      render: (c) => {
        const displayName = getCandidateListName(c);
        const isExtractFailed = c.extractStatus === 'FAILED' && !c.name?.trim();
        return (
          <Link
            to={`/hr/candidates/${c.id}`}
            className={
              isExtractFailed
                ? 'font-semibold text-destructive hover:underline'
                : 'font-semibold text-primary hover:underline'
            }
          >
            {displayName}
          </Link>
        );
      },
    },
    {
      header: 'Email',
      key: 'email',
      render: (c) => c.email || '—',
      className: 'text-muted-foreground',
    },
    {
      header: 'CV File',
      key: 'cvFileName',
      className: 'text-muted-foreground text-xs',
    },
    {
      header: 'Extract',
      key: 'extractStatus',
      render: (c) => <ExtractStatusBadge status={c.extractStatus} />,
    },
    {
      header: 'Status',
      key: 'employmentTag',
      render: (c) => <EmploymentBadge tag={c.employmentTag} />,
    },
    {
      header: 'Uploaded',
      key: 'uploadedAt',
      render: (c) => formatDateTime(c.uploadedAt),
      className: 'text-muted-foreground',
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <PageHeader 
        title='Candidates' 
        description='View all candidates and their CV extract status' 
        actions={
          <div className='flex items-center gap-2'>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              className='hidden'
              accept='.pdf,application/pdf'
              multiple
            />
            <p className='text-xs text-muted-foreground hidden sm:block'>PDF — tối đa 10MB/file, 100MB/lần</p>
            <Button onClick={handleUploadClick} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <Upload className='mr-2 h-4 w-4' />
              )}
              Upload CV
            </Button>
          </div>
        }
      />

      <div className='mb-4 flex flex-wrap gap-3'>
        <div className='relative flex-1 min-w-[200px]'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder='Search name or email...'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className='pl-9'
          />
        </div>
        <Select value={extractFilter} onValueChange={(v) => setExtractFilter(v as ExtractStatus | 'ALL')}>
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Extract Status' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All Extract Status</SelectItem>
            <SelectItem value='PENDING'>Pending</SelectItem>
            <SelectItem value='SCANNING'>Scanning</SelectItem>
            <SelectItem value='COMPLETE'>Complete</SelectItem>
            <SelectItem value='FAILED'>Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employmentFilter} onValueChange={(v) => setEmploymentFilter(v as EmploymentTag | 'ALL')}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Availability' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>All</SelectItem>
            <SelectItem value='CHUA_NHAN_VIEC'>Available</SelectItem>
            <SelectItem value='DA_CO_VIEC'>Employed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BaseTable
        data={candidates}
        columns={columns}
        isLoading={isLoading || uploadMutation.isPending}
        className='flex-1 min-h-0'
        emptyMessage='No candidates found'
        showIndex={true}
      />
    </div>
  );
}
