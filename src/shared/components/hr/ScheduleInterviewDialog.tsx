import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { interviewScheduleService } from '@/shared/lib/api-services';
import { invalidateAfterScheduleMutation } from '@/shared/lib/phase3-invalidate';
import {
  defaultScheduleEndIso,
  localDateTimeToIso,
  splitScheduleIso,
} from '@/shared/lib/schedule-datetime';
import { useStatusLabels } from '@/shared/i18n/hooks';
import type { InterviewFormat, InterviewProcess, InterviewSchedule } from '@/shared/types/api';
import { Loader2 } from 'lucide-react';

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: InterviewProcess;
  schedule?: InterviewSchedule;
  onSuccess?: () => void;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  process,
  schedule,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!schedule;
  const queryClient = useQueryClient();
  const { interviewFormat } = useStatusLabels();
  const interviewFormats: InterviewFormat[] = ['ONLINE', 'ONSITE', 'PHONE'];

  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [format, setFormat] = useState<InterviewFormat>('ONLINE');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [location, setLocation] = useState('');
  const [assignedHr, setAssignedHr] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (schedule) {
      const s = splitScheduleIso(schedule.scheduledStart);
      const e = splitScheduleIso(schedule.scheduledEnd);
      setStartDate(s.date);
      setStartTime(s.time);
      setEndDate(e.date);
      setEndTime(e.time);
      setFormat(schedule.format);
      setMeetingUrl(schedule.meetingUrl ?? '');
      setLocation(schedule.location ?? '');
      setAssignedHr(schedule.assignedHr ?? '');
      setNotes(schedule.notes ?? '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setStartTime('09:00');
      const end = defaultScheduleEndIso(today, '09:00');
      setEndDate(end.date);
      setEndTime(end.time);
      setFormat('ONLINE');
      setMeetingUrl('');
      setLocation('');
      setAssignedHr(process.assignedHr ?? '');
      setNotes('');
    }
  }, [open, schedule, process.assignedHr]);

  const mutation = useMutation({
    mutationFn: () => {
      const scheduledStart = localDateTimeToIso(startDate, startTime);
      const scheduledEnd = localDateTimeToIso(endDate, endTime);
      const body = {
        scheduledStart,
        scheduledEnd,
        format,
        meetingUrl: format === 'ONLINE' ? meetingUrl.trim() || null : null,
        location: format === 'ONSITE' ? location.trim() || null : null,
        notes: notes.trim() || undefined,
        assignedHr: assignedHr.trim() || undefined,
      };
      if (isEdit && schedule) {
        return interviewScheduleService.update(schedule.id, body);
      }
      return interviewScheduleService.create({
        processId: process.id,
        ...body,
      });
    },
    onSuccess: () => {
      toast.success(isEdit ? t('dialogs.scheduleInterview.updated') : t('dialogs.scheduleInterview.created'));
      invalidateAfterScheduleMutation(queryClient, process.id);
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: Error & { errorCode?: string }) => {
      if (error.errorCode === 'SCHEDULE_ALREADY_EXISTS') {
        toast.error(t('dialogs.scheduleInterview.activeExists'));
      } else {
        toast.error(error.message || t('dialogs.scheduleInterview.failed'));
      }
    },
  });

  const canSubmit = startDate && startTime && endDate && endTime && (format !== 'ONSITE' || location.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('dialogs.scheduleInterview.editTitle') : t('dialogs.scheduleInterview.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {process.candidateName} · {process.jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>{t('dialogs.scheduleInterview.format')}</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as InterviewFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {interviewFormats.map((f) => (
                  <SelectItem key={f} value={f}>
                    {interviewFormat(f)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-1.5'>
            <Label>{t('dialogs.scheduleInterview.startDate')}</Label>
            <Input type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>{t('dialogs.scheduleInterview.startTime')}</Label>
            <Input type='time' value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>{t('dialogs.scheduleInterview.endDate')}</Label>
            <Input type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className='space-y-1.5'>
            <Label>{t('dialogs.scheduleInterview.endTime')}</Label>
            <Input type='time' value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          {format === 'ONLINE' && (
            <div className='space-y-1.5 sm:col-span-2'>
              <Label>{t('dialogs.scheduleInterview.meetingUrl')}</Label>
              <Input
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder={t('dialogs.scheduleInterview.meetingPlaceholder')}
              />
            </div>
          )}
          {format === 'ONSITE' && (
            <div className='space-y-1.5 sm:col-span-2'>
              <Label>{t('dialogs.scheduleInterview.location')}</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('dialogs.scheduleInterview.locationPlaceholder')}
              />
            </div>
          )}

          <div className='space-y-1.5 sm:col-span-2'>
            <Label>{t('dialogs.scheduleInterview.assignedHr')}</Label>
            <Input value={assignedHr} onChange={(e) => setAssignedHr(e.target.value)} maxLength={100} />
          </div>
          <div className='space-y-1.5 sm:col-span-2'>
            <Label>{t('dialogs.scheduleInterview.notes')}</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={2000} />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit || mutation.isPending}>
            {mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isEdit ? t('dialogs.scheduleInterview.save') : t('dialogs.scheduleInterview.schedule')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
