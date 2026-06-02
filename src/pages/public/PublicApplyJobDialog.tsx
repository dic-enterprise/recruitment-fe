import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { candidateService } from '@/shared/lib/api-services';
import type { Job } from '@/shared/types/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface ApplyFormState {
  name: string;
  email: string;
  phone: string;
  experience: string;
  skillsInput: string;
}

const INITIAL_FORM: ApplyFormState = {
  name: '',
  email: '',
  phone: '',
  experience: '',
  skillsInput: '',
};

function parseSkills(raw: string): string[] {
  return Array.from(new Set(raw.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)));
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface PublicApplyJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicApplyJobDialog({ job, open, onOpenChange }: PublicApplyJobDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState<ApplyFormState>(INITIAL_FORM);

  const applyMutation = useMutation({
    mutationFn: () =>
      candidateService.applyPublic({
        jobId: job!.id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        experience: form.experience.trim(),
        skills: parseSkills(form.skillsInput),
        source: 'PUBLIC_APPLY',
      }),
    onSuccess: (data) => {
      setForm(INITIAL_FORM);
      onOpenChange(false);
      toast({
        title: t('public.applySubmitted'),
        description: t('public.applySubmittedDescription'),
      });
      navigate(`/public/apply/success/${data.candidate.id}`);
    },
    onError: () => {
      toast({
        title: t('common.error'),
        description: t('public.applyError'),
        variant: 'destructive',
      });
    },
  });

  const validationMessage = useMemo(() => {
    if (!form.name.trim() || !form.email.trim() || !form.experience.trim() || !form.skillsInput.trim()) {
      return t('public.fillAllFields');
    }
    if (!isEmail(form.email.trim())) return t('validation.invalidEmail');
    if (form.experience.trim().length < 10) return t('public.experienceTooShort');
    if (parseSkills(form.skillsInput).length === 0) return t('public.skillsRequired');
    return '';
  }, [form, t]);

  const submitDisabled = !job || applyMutation.isPending || !!validationMessage;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!applyMutation.isPending) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>{t('public.applyForJob', { title: job?.title ?? '' })}</DialogTitle>
          <DialogDescription>{t('public.applyFormDescription')}</DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div>
            <Label htmlFor='apply-name'>{t('public.fullName')}</Label>
            <Input
              id='apply-name'
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t('public.namePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor='apply-email'>{t('public.email')}</Label>
            <Input
              id='apply-email'
              type='email'
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t('public.emailPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor='apply-phone'>{t('public.phone')}</Label>
            <Input
              id='apply-phone'
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder={t('public.phonePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor='apply-experience'>{t('public.experience')}</Label>
            <Textarea
              id='apply-experience'
              rows={4}
              value={form.experience}
              onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))}
              placeholder={t('public.experiencePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor='apply-skills'>{t('public.skills')}</Label>
            <Textarea
              id='apply-skills'
              rows={3}
              value={form.skillsInput}
              onChange={(e) => setForm((prev) => ({ ...prev, skillsInput: e.target.value }))}
              placeholder={t('public.skillsPlaceholder')}
            />
            <p className='mt-1 text-xs text-muted-foreground'>{t('public.skillsHelp')}</p>
          </div>
          {validationMessage ? <p className='text-sm text-destructive'>{validationMessage}</p> : null}
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={applyMutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type='button' disabled={submitDisabled} onClick={() => applyMutation.mutate()}>
            {applyMutation.isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                {t('public.submitting')}
              </>
            ) : (
              t('public.applyNow')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

