import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { adminService } from '@/shared/lib/api-services';
import { ExtractStatusBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import { RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import type { Candidate } from '@/shared/types/api';

export default function ExtractErrorsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: failedCandidates, isLoading } = useQuery({
    queryKey: ['extract-errors'],
    queryFn: adminService.getExtractErrors,
  });

  const retryMutation = useMutation({
    mutationFn: adminService.retryExtract,
    onSuccess: () => {
      toast({ title: 'Retry queued', description: 'Extract retry has been successfully queued.' });
      queryClient.invalidateQueries({ queryKey: ['extract-errors'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to queue retry.', variant: 'destructive' });
    },
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
    {
      header: 'Action',
      key: 'action',
      className: 'text-right',
      headerClassName: 'text-right',
      render: (c) => (
        <Button
          variant='outline'
          size='sm'
          onClick={() => retryMutation.mutate(String(c.id))}
          disabled={retryMutation.isPending}
        >
          {retryMutation.isPending ? (
            <Loader2 className='mr-1 h-3 w-3 animate-spin' />
          ) : (
            <RotateCcw className='mr-1 h-3 w-3' />
          )}
          Retry
        </Button>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col'>
      <PageHeader 
        title='Extract Errors' 
        description='Candidates with failed CV extraction — Admin IT can retry' 
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
