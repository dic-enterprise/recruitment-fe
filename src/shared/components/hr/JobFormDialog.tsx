import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseDialog, BaseHeader } from '@/shared/components/dialog';
import { EditJobForm } from './EditJobForm';
import { jobService } from '@/shared/lib/api-services';
import { useToast } from '@/shared/hooks/use-toast';
import { type Job } from '@/shared/types/api';

interface JobFormDialogProps {
  job?: Job; // If provided, it's Edit mode; otherwise, Create mode
  close: () => void;
  onSuccess?: () => void;
}

export function JobFormDialog({ job, close, onSuccess }: JobFormDialogProps) {
  const isEdit = !!job;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (values: Job) => 
      isEdit 
        ? jobService.update(String(job.id), values) 
        : jobService.create(values),
    onSuccess: () => {
      toast({ 
        title: 'Success', 
        description: isEdit ? 'Job updated successfully' : 'Job created successfully' 
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['job', String(job.id)] });
      }
      onSuccess?.();
      close();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} job`,
        variant: 'destructive',
      });
    },
  });

  return (
    <BaseDialog
      onDismiss={close}
      header={<BaseHeader title={isEdit ? 'Edit Job Posting' : 'Create Job Posting'} />}
      body={
        <EditJobForm 
          initialJob={job || null} 
          onSubmit={(values) => mutation.mutate(values)} 
          onCancel={close}
          submitLabel={mutation.isPending ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Post Job')}
        />
      }
    />
  );
}
