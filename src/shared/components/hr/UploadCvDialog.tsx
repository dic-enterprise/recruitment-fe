import { useCallback, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { candidateService, jobService } from '@/shared/lib/api-services';
import { validateCvUploadFiles } from '@/shared/lib/cv-upload-utils';
import { cn } from '@/shared/lib/utils';
import { Briefcase, FileText, Loader2, Trash2, Upload } from 'lucide-react';

interface UploadCvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadCvDialog({ open, onOpenChange }: UploadCvDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', 'upload-dialog'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
    enabled: open,
  });

  const activeJobs = useMemo(() => jobs.filter((j) => j.status === 'ACTIVE'), [jobs]);

  const resetForm = useCallback(() => {
    setFiles([]);
    setSelectedJobIds([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const merged = [...files, ...Array.from(fileList)];
    const validation = validateCvUploadFiles(merged);
    if (validation.ok === false) {
      toast.error(validation.message);
      return;
    }
    setFiles(validation.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleJob = (jobId: number, checked: boolean) => {
    setSelectedJobIds((prev) =>
      checked ? [...prev, jobId] : prev.filter((id) => id !== jobId),
    );
  };

  const uploadMutation = useMutation({
    mutationFn: () =>
      candidateService.uploadCVs(files, {
        jobIds: selectedJobIds.length > 0 ? selectedJobIds : undefined,
        source: 'HR_UPLOAD',
      }),
    onSuccess: (result) => {
      toast.success(t('dialogs.uploadCv.success'), {
        description: t('dialogs.uploadCv.successDesc', { count: result.candidates.length }),
      });
      void queryClient.invalidateQueries({ queryKey: ['candidates'] });
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({ queryKey: ['matches', 'queue'] });
      handleClose(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('dialogs.uploadCv.failed'));
    },
  });

  const canSubmit = files.length > 0 && !uploadMutation.isPending;
  const maxMatchTasks = files.length * selectedJobIds.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle>{t('dialogs.uploadCv.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.uploadCv.description')}</DialogDescription>
        </DialogHeader>

        <div className='grid min-h-0 flex-1 gap-0 md:grid-cols-2'>
          <div className='flex min-h-[280px] flex-col border-b md:border-b-0 md:border-r'>
            <div className='border-b px-4 py-2'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {t('dialogs.uploadCv.fileSection')}
              </p>
            </div>
            <div className='flex flex-1 flex-col p-4'>
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,application/pdf'
                multiple
                className='hidden'
                onChange={(e) => addFiles(e.target.files)}
              />
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed',
                  'border-muted-foreground/25 bg-muted/20 px-4 py-8 transition-colors hover:border-primary/50 hover:bg-muted/40',
                  files.length > 0 && 'min-h-[120px] flex-none',
                )}
              >
                <Upload className='h-8 w-8 text-muted-foreground' />
                <span className='text-sm font-medium'>{t('dialogs.uploadCv.dropzone')}</span>
                <span className='text-xs text-muted-foreground'>{t('dialogs.uploadCv.sizeLimit')}</span>
              </button>

              {files.length > 0 && (
                <ScrollArea className='mt-3 max-h-[200px]'>
                  <ul className='space-y-2 pr-3'>
                    {files.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className='flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-sm'
                      >
                        <FileText className='h-4 w-4 shrink-0 text-primary' />
                        <div className='min-w-0 flex-1'>
                          <p className='truncate font-medium'>{file.name}</p>
                          <p className='text-[10px] text-muted-foreground'>{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 shrink-0'
                          onClick={() => removeFile(index)}
                          disabled={uploadMutation.isPending}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </div>

          <div className='flex min-h-[280px] flex-col'>
            <div className='flex items-center justify-between border-b px-4 py-2'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {t('dialogs.uploadCv.jobsSection')}
              </p>
              {selectedJobIds.length > 0 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs'
                  onClick={() => setSelectedJobIds([])}
                >
                  {t('dialogs.uploadCv.deselect')}
                </Button>
              )}
            </div>
            <div className='flex flex-1 flex-col p-4'>
              {jobsLoading ? (
                <div className='flex flex-1 items-center justify-center'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
              ) : activeJobs.length === 0 ? (
                <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground'>
                  <Briefcase className='h-8 w-8 opacity-40' />
                  <p>{t('dialogs.uploadCv.noJobs')}</p>
                  <p className='text-xs'>{t('dialogs.uploadCv.extractOnly')}</p>
                </div>
              ) : (
                <>
                  <p className='mb-2 text-xs text-muted-foreground'>{t('dialogs.uploadCv.selectJobsHelp')}</p>
                  <ScrollArea className='flex-1 max-h-[280px]'>
                    <ul className='space-y-1 pr-3'>
                      {activeJobs.map((job) => {
                        const checked = selectedJobIds.includes(job.id);
                        return (
                          <li key={job.id}>
                            <label
                              className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition-colors',
                                checked ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50',
                              )}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => toggleJob(job.id, v === true)}
                                className='mt-0.5'
                                disabled={uploadMutation.isPending}
                              />
                              <div className='min-w-0 flex-1'>
                                <p className='text-sm font-medium leading-snug'>{job.title}</p>
                                <p className='text-xs text-muted-foreground'>{job.departmentName}</p>
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className='border-t px-6 py-4'>
          <div className='mr-auto hidden text-xs text-muted-foreground sm:block'>
            {t('dialogs.uploadCv.summary', {
              fileCount: files.length,
              jobCount: selectedJobIds.length,
              taskCount: maxMatchTasks,
            })}
          </div>
          <Button type='button' variant='outline' onClick={() => handleClose(false)} disabled={uploadMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type='button' disabled={!canSubmit} onClick={() => uploadMutation.mutate()}>
            {uploadMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {t('dialogs.uploadCv.upload', { count: files.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
