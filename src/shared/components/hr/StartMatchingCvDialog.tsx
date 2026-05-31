import { useCallback, useMemo, useState } from 'react';
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
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { candidateService, jobService, matchService } from '@/shared/lib/api-services';
import { cn } from '@/shared/lib/utils';
import { Briefcase, Loader2, Play, Search, User } from 'lucide-react';
import type { Candidate } from '@/shared/types/api';

interface StartMatchingCvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getCandidateLabel(c: Candidate): string {
  if (c.name?.trim()) return c.name.trim();
  return c.cvFileName?.replace(/\.pdf$/i, '') ?? `Candidate #${c.id}`;
}

export function StartMatchingCvDialog({ open, onOpenChange }: StartMatchingCvDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<number[]>([]);
  const [candidateSearch, setCandidateSearch] = useState('');

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', 'start-matching-dialog'],
    queryFn: () => jobService.getAll({ status: 'ACTIVE' }),
    enabled: open,
  });

  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates', 'extract-complete', 'start-matching'],
    queryFn: () => candidateService.getAll({ extractStatus: 'COMPLETE' }),
    enabled: open,
  });

  const activeJobs = useMemo(() => jobs.filter((j) => j.status === 'ACTIVE'), [jobs]);

  const filteredCandidates = useMemo(() => {
    const q = candidateSearch.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        getCandidateLabel(c).toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.cvFileName?.toLowerCase().includes(q),
    );
  }, [candidates, candidateSearch]);

  const resetForm = useCallback(() => {
    setSelectedCandidateIds([]);
    setSelectedJobIds([]);
    setCandidateSearch('');
  }, []);

  const handleClose = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const toggleCandidate = (id: number, checked: boolean) => {
    setSelectedCandidateIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  const toggleJob = (jobId: number, checked: boolean) => {
    setSelectedJobIds((prev) =>
      checked ? [...prev, jobId] : prev.filter((id) => id !== jobId),
    );
  };

  const selectAllCandidates = () => {
    setSelectedCandidateIds(filteredCandidates.map((c) => c.id));
  };

  const triggerMutation = useMutation({
    mutationFn: () =>
      matchService.triggerMatchBatch({
        candidateIds: selectedCandidateIds,
        jobIds: selectedJobIds,
      }),
    onSuccess: (result) => {
      let description = t('dialogs.startMatching.successDesc', { count: result.matchTasksQueued });
      if (result.skippedCandidateIds.length > 0) {
        description += ` ${t('dialogs.startMatching.successDescSkipped', { count: result.skippedCandidateIds.length })}`;
      }
      toast.success(t('dialogs.startMatching.success'), { description });
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      void queryClient.invalidateQueries({ queryKey: ['matches', 'queue'] });
      handleClose(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('dialogs.startMatching.failed'));
    },
  });

  const canSubmit =
    selectedCandidateIds.length > 0 && selectedJobIds.length > 0 && !triggerMutation.isPending;

  const estimatedTasks = selectedCandidateIds.length * selectedJobIds.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl'>
        <DialogHeader className='border-b px-6 py-4'>
          <DialogTitle>{t('dialogs.startMatching.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.startMatching.description')}</DialogDescription>
        </DialogHeader>

        <div className='grid min-h-0 flex-1 gap-0 md:grid-cols-2'>
          <div className='flex min-h-[300px] flex-col border-b md:border-b-0 md:border-r'>
            <div className='flex items-center justify-between gap-2 border-b px-4 py-2'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {t('dialogs.startMatching.extractedSection')}
              </p>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 text-xs'
                onClick={selectAllCandidates}
                disabled={filteredCandidates.length === 0 || triggerMutation.isPending}
              >
                {t('dialogs.startMatching.selectAll')}
              </Button>
            </div>
            <div className='border-b px-4 py-2'>
              <div className='relative'>
                <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
                <Input
                  className='h-8 pl-8 text-sm'
                  placeholder={t('dialogs.startMatching.searchPlaceholder')}
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                />
              </div>
            </div>
            <div className='flex flex-1 flex-col p-4 pt-2'>
              {candidatesLoading ? (
                <div className='flex flex-1 items-center justify-center'>
                  <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className='flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground'>
                  <User className='h-8 w-8 opacity-40' />
                  <p>{t('dialogs.startMatching.noCandidates')}</p>
                  <p className='text-xs'>{t('dialogs.startMatching.uploadFirst')}</p>
                </div>
              ) : (
                <ScrollArea className='flex-1 max-h-[280px]'>
                  <ul className='space-y-1 pr-3'>
                    {filteredCandidates.map((c) => {
                      const checked = selectedCandidateIds.includes(c.id);
                      return (
                        <li key={c.id}>
                          <label
                            className={cn(
                              'flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition-colors',
                              checked ? 'border-primary/40 bg-primary/5' : 'hover:bg-muted/50',
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => toggleCandidate(c.id, v === true)}
                              className='mt-0.5'
                              disabled={triggerMutation.isPending}
                            />
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-medium leading-snug'>{getCandidateLabel(c)}</p>
                              <p className='truncate text-xs text-muted-foreground'>
                                {c.email || c.cvFileName}
                              </p>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              )}
            </div>
          </div>

          <div className='flex min-h-[300px] flex-col'>
            <div className='flex items-center justify-between border-b px-4 py-2'>
              <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {t('dialogs.startMatching.jobsSection')}
              </p>
              {selectedJobIds.length > 0 && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs'
                  onClick={() => setSelectedJobIds([])}
                >
                  {t('dialogs.startMatching.deselectAll')}
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
                  <p>{t('dialogs.startMatching.noJobs')}</p>
                </div>
              ) : (
                <>
                  <p className='mb-2 text-xs text-muted-foreground'>{t('dialogs.startMatching.help')}</p>
                  <ScrollArea className='flex-1 max-h-[300px]'>
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
                                disabled={triggerMutation.isPending}
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
          <div className='mr-auto text-xs text-muted-foreground'>
            {t('dialogs.startMatching.summary', {
              cvCount: selectedCandidateIds.length,
              jobCount: selectedJobIds.length,
              taskCount: estimatedTasks,
            })}
          </div>
          <Button type='button' variant='outline' onClick={() => handleClose(false)} disabled={triggerMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type='button' disabled={!canSubmit} onClick={() => triggerMutation.mutate()}>
            {triggerMutation.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Play className='mr-2 h-4 w-4' />
            )}
            {t('dialogs.startMatching.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
