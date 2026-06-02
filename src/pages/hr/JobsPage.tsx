import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { jobService, departmentService } from '@/shared/lib/api-services';
import { JobStatusBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { JobFormDialog } from '@/shared/components/hr/JobFormDialog';
import { BaseTable, type Column } from '@/shared/components/BaseTable';
import useModal from '@/shared/hooks/useModal';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { Job, JobStatus } from '@/shared/types/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function JobsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const { data: jobList, isLoading } = useQuery({
    queryKey: ['jobs', statusFilter, deptFilter, keyword],
    queryFn: () => jobService.getAll({
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      departmentId: deptFilter === 'ALL' ? undefined : deptFilter,
      search: keyword || undefined,
    }),
  });

  const [modalNode, openModal] = useModal();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      toast.success(t('jobs.deleted'));
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('jobs.deleteFailed'));
    },
  });

  const openCreateJob = () => {
    void openModal((close) => (
      <JobFormDialog
        close={close}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }}
      />
    ));
  };

  const openEditJob = (job: Job) => {
    void openModal((close) => (
      <JobFormDialog
        job={job}
        close={close}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }}
      />
    ));
  };

  const columns: Column<Job>[] = [
    {
      header: t('jobs.jobTitle'),
      key: 'title',
      width: '350px',
      render: (job) => <span className='font-semibold'>{job.title}</span>,
    },
    {
      header: t('jobs.department'),
      key: 'departmentName',
      className: 'text-muted-foreground',
    },
    {
      header: t('jobs.status'),
      key: 'status',
      render: (job) => <JobStatusBadge status={job.status} />,
    },
    {
      header: t('jobs.threshold'),
      key: 'minMatchingScore',
      className: 'text-center font-medium text-slate-500',
      headerClassName: 'text-center',
      render: (job) => (
        <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[11px]'>
          {job.minMatchingScore ?? 60}%
        </span>
      ),
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: '170px',
      render: (job) => (
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => openEditJob(job)}>
            <Edit className='mr-1.5 h-3.5 w-3.5' />
            {t('jobs.edit')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => setDeleteTarget(job)}>
            <Trash2 className='h-3.5 w-3.5 text-destructive' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className='flex h-full min-h-0 flex-col'>
      {modalNode}
      <div className='shrink-0'>
        <PageHeader
          title={t('jobs.title')}
          description={t('jobs.description')}
          actions={
            <Button onClick={openCreateJob} className='h-8'>
              <Plus className='mr-2 h-4 w-4' />
              {t('jobs.createJob')}
            </Button>
          }
        />
      </div>

      <div className='mb-4 flex shrink-0 flex-wrap gap-3'>
        <div className='relative min-w-[200px] flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('jobs.searchPlaceholder')}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className='pl-9'
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | 'ALL')}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder={t('jobs.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('jobs.allStatus')}</SelectItem>
            <SelectItem value='ACTIVE'>{t('jobs.statusActive')}</SelectItem>
            <SelectItem value='CLOSED'>{t('jobs.statusClosed')}</SelectItem>
            <SelectItem value='ARCHIVED'>{t('jobs.statusArchived')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder={t('jobs.department')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='ALL'>{t('jobs.allDepartments')}</SelectItem>
            {departments?.map((d) => (
              <SelectItem key={d.id} value={String(d.id)}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BaseTable
        data={jobList}
        columns={columns}
        isLoading={isLoading}
        className='flex-1 min-h-0'
        emptyMessage={t('jobs.empty')}
        showIndex={true}
      />

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('jobs.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('jobs.deleteConfirmMessage', { title: deleteTarget?.title ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(String(deleteTarget.id))}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
