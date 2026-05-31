import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminService } from '@/shared/lib/api-services';
import { ExtractStatusBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import type { Candidate } from '@/shared/types/api';

export default function ExtractErrorsPage() {
  const { t } = useTranslation();

  const { data: failedCandidates, isLoading } = useQuery({
    queryKey: ['extract-errors'],
    queryFn: adminService.getExtractErrors,
  });

  const columns: Column<Candidate>[] = [
    {
      header: t('admin.candidate'),
      key: 'name',
      render: (c) => <span className='font-semibold'>{c.name}</span>,
    },
    {
      header: t('admin.email'),
      key: 'email',
      className: 'text-muted-foreground',
    },
    {
      header: t('admin.cvFile'),
      key: 'cvFileName',
      className: 'text-xs text-muted-foreground',
    },
    {
      header: t('admin.status'),
      key: 'extractStatus',
      render: (c) => <ExtractStatusBadge status={c.extractStatus} />,
    },
    {
      header: t('admin.errorCode'),
      key: 'errorCode',
      render: (c) => <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{c.extractError?.code || t('common.dash')}</code>,
    },
    {
      header: t('admin.errorMessage'),
      key: 'errorMessage',
      className: 'max-w-xs text-sm',
      render: (c) => (
        <p className='truncate' title={c.extractError?.message}>
          {c.extractError?.message || t('common.dash')}
        </p>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <PageHeader
        title={t('admin.extractErrorsTitle')}
        description={t('admin.extractErrorsDescription')}
      />

      <BaseTable
        data={failedCandidates}
        columns={columns}
        isLoading={isLoading}
        className='flex-1 min-h-0'
        emptyMessage={t('admin.noExtractErrors')}
        showIndex={true}
      />
    </div>
  );
}
