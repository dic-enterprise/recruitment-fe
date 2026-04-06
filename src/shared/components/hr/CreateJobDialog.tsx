import { BaseDialog, BaseHeader } from '@/shared/components/dialog';
import type { CloseModal } from '@/shared/hooks/useModal.ts';
import type { Job } from '@/shared/lib/mock-data.ts';
import { EditJobForm } from '@/shared/components/hr/EditJobForm.tsx';

export type CreateJobModalProps = {
  close: CloseModal<Job | undefined>;
  onJobCreated: (job: Job) => void;
};

export function CreateJobModal({ close, onJobCreated }: CreateJobModalProps) {
  return (
    <BaseDialog
      onDismiss={() => close(undefined)}
      header={<BaseHeader title='Tạo tin tuyển dụng' />}
      body={
        <EditJobForm
          onSubmit={(job) => {
            onJobCreated(job);
            close(job);
          }}
          onCancel={() => close(undefined)}
        />
      }
    />
  );
}
