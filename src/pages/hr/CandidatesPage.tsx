import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { candidateService } from '@/shared/lib/api-services';
import { ExtractStatusBadge, EmploymentBadge } from '@/shared/components/StatusBadges';
import { UploadCvDialog } from '@/shared/components/hr/UploadCvDialog';
import PageHeader from '@/shared/components/PageHeader';
import { formatDateTime } from '@/shared/lib/utils';
import { useStatusLabels } from '@/shared/i18n/hooks';
import { Search, Upload, Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import type { Candidate, ExtractStatus, EmploymentTag } from '@/shared/types/api';
import debounce from 'lodash/debounce';

export default function CandidatesPage() {
  const { t } = useTranslation();
  const { extractStatus, employment } = useStatusLabels();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [extractFilter, setExtractFilter] = useState<ExtractStatus | 'ALL'>('ALL');
  const [employmentFilter, setEmploymentFilter] = useState<EmploymentTag | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const getCandidateListName = (candidate: Candidate): string => {
    if (candidate.name?.trim()) return candidate.name.trim();
    if (candidate.extractStatus === 'FAILED') return t('candidates.fail');
    return t('candidates.processing');
  };

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', extractFilter, employmentFilter, debouncedKeyword],
    queryFn: () =>
      candidateService.getAll({
        extractStatus: extractFilter === 'ALL' ? undefined : extractFilter,
        employmentTag: employmentFilter === 'ALL' ? undefined : employmentFilter,
        search: debouncedKeyword || undefined,
      }),
  });

  const debouncedSetKeyword = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedKeyword(value);
      }, 500),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSetKeyword.cancel();
    };
  }, [debouncedSetKeyword]);

  const columns: Column<Candidate>[] = [
    {
      header: t('candidates.name'),
      key: 'name',
      width: '250px',
      render: (c) => {
        const displayName = getCandidateListName(c);
        const isExtractFailed = c.extractStatus === 'FAILED' && !c.name?.trim();
        return (
          <span
            className={
              isExtractFailed ? 'font-semibold text-destructive' : 'font-semibold text-foreground'
            }
          >
            {displayName}
          </span>
        );
      },
    },
    {
      header: t('candidates.email'),
      key: 'email',
      render: (c) => c.email || t('common.dash'),
      className: 'text-muted-foreground',
    },
    {
      header: t('candidates.cvFile'),
      key: 'cvFileName',
      className: 'text-muted-foreground text-xs',
    },
    {
      header: t('candidates.extract'),
      key: 'extractStatus',
      render: (c) => <ExtractStatusBadge status={c.extractStatus} />,
    },
    {
      header: t('candidates.status'),
      key: 'employmentTag',
      render: (c) => <EmploymentBadge tag={c.employmentTag} />,
    },
    {
      header: t('candidates.uploaded'),
      key: 'uploadedAt',
      render: (c) => formatDateTime(c.uploadedAt),
      className: 'text-muted-foreground',
    },
    {
      header: t('common.action'),
      key: 'action',
      width: '72px',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (c) => (
        <Button variant='ghost' size='icon' className='h-8 w-8' asChild title={t('common.viewDetail')}>
          <Link to={`/hr/candidates/${c.id}`}>
            <Eye className='h-4 w-4' />
            <span className='sr-only'>{t('common.viewDetail')}</span>
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <PageHeader
        title={t('candidates.title')}
        description={t('candidates.description')}
        actions={
          <Button onClick={() => setUploadOpen(true)} className='h-8'>
            <Upload className='mr-2 h-4 w-4' />
            {t('candidates.uploadCv')}
          </Button>
        }
      />

      <div className='mb-4 flex flex-wrap gap-3'>
        <div className='relative min-w-[200px] flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('candidates.searchPlaceholder')}
            value={keyword}
            onChange={(e) => {
              const value = e.target.value;
              setKeyword(value);
              debouncedSetKeyword(value);
            }}
            className='pl-9'
          />
        </div>
        <Select value={extractFilter} onValueChange={(v) => setExtractFilter(v as ExtractStatus | 'ALL')}>
          <SelectTrigger className='w-44'>
            <SelectValue placeholder={t('candidates.extractStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('candidates.allExtractStatus')}</SelectItem>
            <SelectItem value='PENDING'>{extractStatus('PENDING')}</SelectItem>
            <SelectItem value='SCANNING'>{extractStatus('SCANNING')}</SelectItem>
            <SelectItem value='COMPLETE'>{extractStatus('COMPLETE')}</SelectItem>
            <SelectItem value='FAILED'>{extractStatus('FAILED')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={employmentFilter} onValueChange={(v) => setEmploymentFilter(v as EmploymentTag | 'ALL')}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder={t('candidates.availability')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('candidates.allAvailability')}</SelectItem>
            <SelectItem value='CHUA_NHAN_VIEC'>{employment('CHUA_NHAN_VIEC')}</SelectItem>
            <SelectItem value='DA_CO_VIEC'>{employment('DA_CO_VIEC')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BaseTable
        data={candidates}
        columns={columns}
        isLoading={isLoading}
        className='flex-1 min-h-0'
        emptyMessage={t('candidates.empty')}
        showIndex={true}
      />

      <UploadCvDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
