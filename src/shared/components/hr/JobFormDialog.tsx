import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { BaseDialog, BaseHeader } from '@/shared/components/dialog';
import { EditJobForm } from './EditJobForm';
import { jobService } from '@/shared/lib/api-services';
import { useToast } from '@/shared/hooks/use-toast';
import { type Job } from '@/shared/types/api';

interface JobFormDialogProps {
  job?: Job;
  close: () => void;
  onSuccess?: () => void;
}

export function JobFormDialog({ job, close, onSuccess }: JobFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!job;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: Job) =>
      isEdit ? jobService.update(String(job.id), values) : jobService.create(values),
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: isEdit ? t('jobs.updated') : t('jobs.created'),
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['job', String(job.id)] });
      }
      onSuccess?.();
      close();
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || (isEdit ? t('jobs.updateFailed') : t('jobs.createFailed')),
        variant: 'destructive',
      });
    },
  });

  const submitLabel = mutation.isPending
    ? isEdit
      ? t('jobs.saving')
      : t('jobs.creating')
    : isEdit
      ? t('jobs.saveChanges')
      : t('jobs.postJob');

  return (
    <BaseDialog
      onDismiss={close}
      header={<BaseHeader title={isEdit ? t('jobs.editTitle') : t('jobs.createTitle')} />}
      body={
        <EditJobForm
          initialJob={job || null}
          onSubmit={(values) => mutation.mutate(values)}
          onCancel={close}
          submitLabel={submitLabel}
        />
      }
    />
  );
}
