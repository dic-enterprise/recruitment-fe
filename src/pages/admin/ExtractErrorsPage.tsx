import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/shared/lib/api-services';
import { ExtractStatusBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import type { Candidate } from '@/shared/types/api';

export default function ExtractErrorsPage() {
  const { data: failedCandidates, isLoading } = useQuery({
    queryKey: ['extract-errors'],
    queryFn: adminService.getExtractErrors,
  });

  const columns: Column<Candidate>[] = [
    {
      header: 'Candidate',
      key: 'name',
      render: (c) => <span className='font-semibold'>{c.name}</span>,
    },
    {
      header: 'Email',
      key: 'email',
      className: 'text-muted-foreground',
    },
    {
      header: 'CV File',
      key: 'cvFileName',
      className: 'text-xs text-muted-foreground',
    },
    {
      header: 'Status',
      key: 'extractStatus',
      render: (c) => <ExtractStatusBadge status={c.extractStatus} />,
    },
    {
      header: 'Error Code',
      key: 'errorCode',
      render: (c) => <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{c.extractError?.code || '—'}</code>,
    },
    {
      header: 'Error Message',
      key: 'errorMessage',
      className: 'max-w-xs text-sm',
      render: (c) => (
        <p className='truncate' title={c.extractError?.message}>
          {c.extractError?.message || '—'}
        </p>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <PageHeader
        title='Extract Errors'
        description='Candidates with failed CV extraction'
      />

      <BaseTable
        data={failedCandidates}
        columns={columns}
        isLoading={isLoading}
        className='flex-1 min-h-0'
        emptyMessage='No extract errors at this time.'
        showIndex={true}
      />
    </div>
  );
}
