import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import type { FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import i18n from '@/shared/i18n';
import { Briefcase, Bold, Italic, Link2, List, MapPin, Plus, Target, FileText, X, Loader2 } from 'lucide-react';
import { BaseAction } from '@/shared/components/dialog';
import { Button } from '@/shared/components/ui/button.tsx';
import { Input } from '@/shared/components/ui/input.tsx';
import { Label } from '@/shared/components/ui/label.tsx';
import { Textarea } from '@/shared/components/ui/textarea.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card.tsx';
import { Progress } from '@/shared/components/ui/progress.tsx';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group.tsx';
import { Badge } from '@/shared/components/ui/badge.tsx';
import { Slider } from '@/shared/components/ui/slider.tsx';
import useForm from '@/shared/hooks/useForm.ts';
import { departmentService } from '@/shared/lib/api-services.ts';
import { type Job, type JobStatus, type Department } from '@/shared/types/api.ts';
import { cn } from '@/shared/lib/utils.ts';
import { useQuery } from '@tanstack/react-query';

export function formatVnd(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toLocaleString('vi-VN');
}

function parseVndDigits(raw: string): number | undefined {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function buildSalaryLabel(min?: number, max?: number): string | undefined {
  if (min != null && max != null) {
    return i18n.t('jobs.salaryRange', { min: formatVnd(min), max: formatVnd(max) });
  }
  if (min != null) return i18n.t('jobs.salaryFrom', { amount: formatVnd(min) });
  if (max != null) return i18n.t('jobs.salaryTo', { amount: formatVnd(max) });
  return undefined;
}

function salaryStringsFromJob(salary?: string): { min: string; max: string } {
  if (!salary) return { min: '', max: '' };
  if (/\d+\s*-\s*\d+\s*M/i.test(salary)) {
    const m = salary.match(/([\d.,]+)\s*-\s*([\d.,]+)\s*M/i);
    if (m) {
      const a = parseFloat(m[1].replace(/,/g, '.')) * 1_000_000;
      const b = parseFloat(m[2].replace(/,/g, '.')) * 1_000_000;
      return { min: formatVnd(Math.round(a)), max: formatVnd(Math.round(b)) };
    }
  }
  const parts = salary.split(/[–-]/);
  if (parts.length >= 2) {
    const parseNum = (s: string) => parseInt(s.replace(/\D/g, ''), 10);
    const a = parseNum(parts[0]);
    const b = parseNum(parts[1]);
    if (a > 0 && b > 0) return { min: formatVnd(a), max: formatVnd(b) };
  }
  return { min: '', max: '' };
}

function parseRequirementsToForm(job: Job): {
  description: string;
  requirements: string;
  urgency: 'NORMAL' | 'URGENT'
} {
  const text = job.requirements || '';
  let urgency: 'NORMAL' | 'URGENT' = job.recruitmentUrgency ?? 'NORMAL';

  const sections: Record<string, string> = {
    desc: '',
    reqs: ''
  };

  const extract = (raw: string, startMarker: string, endMarkers: string[]) => {
    const startIdx = raw.indexOf(startMarker);
    if (startIdx === -1) return '';
    const contentStart = startIdx + startMarker.length;
    let endIdx = raw.length;
    for (const marker of endMarkers) {
      const idx = raw.indexOf(marker, contentStart);
      if (idx !== -1 && idx < endIdx) endIdx = idx;
    }
    return raw.slice(contentStart, endIdx).trim();
  };

  sections.desc = extract(text, '[MÔ TẢ CÔNG VIỆC]', ['[YÊU CẦU]', '[YÊU CẦU BẮT BUỘC]', '[ĐIỂM CỘNG]', '[Ưu tiên tuyển dụng khẩn cấp]']);

  // Try new marker first, then fallback to old ones
  const newReqs = extract(text, '[YÊU CẦU]', ['[Ưu tiên tuyển dụng khẩn cấp]']);
  if (newReqs) {
    sections.reqs = newReqs;
  } else {
    const nec = extract(text, '[YÊU CẦU BẮT BUỘC]', ['[ĐIỂM CỘNG]', '[Ưu tiên tuyển dụng khẩn cấp]']);
    const plus = extract(text, '[ĐIỂM CỘNG]', ['[Ưu tiên tuyển dụng khẩn cấp]']);
    sections.reqs = [nec, plus].filter(Boolean).join('\n\n');
  }

  if (text.includes('[Ưu tiên tuyển dụng khẩn cấp]')) {
    urgency = 'URGENT';
  }

  if (!sections.desc && !sections.reqs) {
    sections.desc = text.replace(/\[Ưu tiên tuyển dụng khẩn cấp\]/g, '').trim();
  }

  return {
    description: sections.desc,
    requirements: sections.reqs,
    urgency
  };
}

export type JobFormValues = {
  title: string;
  departmentId: string;
  jobStatus: JobStatus;
  recruitmentUrgency: 'NORMAL' | 'URGENT';
  description: string;
  requirements: string;
  minMatchingScore: number;
};

function buildInitialValues(job: Job | null): JobFormValues {
  if (job == null) {
    return {
      title: '',
      departmentId: '',
      jobStatus: 'ACTIVE',
      recruitmentUrgency: 'NORMAL',
      description: '',
      requirements: '',
      minMatchingScore: 70,
    };
  }
  const parsed = parseRequirementsToForm(job);
  return {
    title: job.title,
    departmentId: String(job.departmentId),
    jobStatus: job.status,
    recruitmentUrgency: parsed.urgency,
    description: parsed.description,
    requirements: parsed.requirements,
    minMatchingScore: job.minMatchingScore ?? 60,
  };
}

function validateJobForm(values: JobFormValues): FormikErrors<JobFormValues> {
  const errors: FormikErrors<JobFormValues> = {};
  if (!values.title?.trim()) {
    errors.title = i18n.t('validation.enterJobTitle');
  }
  if (!values.departmentId) {
    errors.departmentId = i18n.t('validation.selectDepartment');
  }
  if (!values.requirements?.trim()) {
    errors.requirements = i18n.t('validation.enterRequirements');
  }
  if (!values.description?.trim()) {
    errors.description = i18n.t('validation.enterDescription');
  }
  if (values.minMatchingScore < 1 || values.minMatchingScore > 100) {
    errors.minMatchingScore = i18n.t('validation.scoreRange');
  }
  return errors;
}

function valuesToJob(values: JobFormValues, initialJob: Job | null, departments: Department[]): Job {
  const dept = departments.find((d) => String(d.id) === values.departmentId)!;

  const sections = [
    `[MÔ TẢ CÔNG VIỆC]\n${values.description.trim()}`,
    `[YÊU CẦU]\n${values.requirements.trim()}`,
    values.recruitmentUrgency === 'URGENT' ? '[Ưu tiên tuyển dụng khẩn cấp]' : ''
  ];

  const requirements = sections.filter(Boolean).join('\n\n');
  const existing = initialJob ?? undefined;

  return {
    id: existing ? existing.id : 0,
    departmentId: dept.id,
    departmentName: dept.name,
    title: values.title.trim(),
    salary: existing?.salary, // Preserve if editing, but hidden in UI
    requirements,
    status: existing ? values.jobStatus : 'ACTIVE',
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    matchCount: existing ? existing.matchCount : 0,
    highMatchCount: existing ? existing.highMatchCount : 0,
    location: existing?.location, // Preserve
    workplaceHybrid: existing?.workplaceHybrid,
    employmentFullTime: existing?.employmentFullTime,
    recruitmentUrgency: values.recruitmentUrgency,
    skills: [], // Reset skills as they are now integrated in requirements
    minMatchingScore: values.minMatchingScore,
  };
}

function computeProgress(values: JobFormValues): number {
  let pts = 0;
  if (values.title.trim()) pts += 20;
  if (values.departmentId) pts += 15;
  if (values.requirements.trim()) pts += 30;
  if (values.description.trim()) pts += 25;
  if (values.minMatchingScore > 0) pts += 10;
  return Math.min(100, Math.round(pts));
}

const SUGGESTED_SKILLS = ['Java', 'React', 'Spring Boot', 'SQL', 'Communication'];

export type EditJobFormProps = {
  initialJob?: Job | null;
  onSubmit: (job: Job) => void;
  onCancel?: () => void;
  submitLabel?: string;
  showProgress?: boolean;
};

export function EditJobForm({
  initialJob = null,
  onSubmit,
  onCancel,
  submitLabel,
  showProgress = true,
}: EditJobFormProps) {
  const { t } = useTranslation();
  const isEdit = initialJob != null;

  const { data: departmentList, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  const initialValues = useMemo(() => buildInitialValues(initialJob), [initialJob]);

  const form = useForm<JobFormValues>({
    initialValues,
    enableReinitialize: true,
    validateOnMount: true,
    validate: validateJobForm,
    onSubmit: (values) => {
      onSubmit(valuesToJob(values, initialJob, departmentList || []));
    },
  });

  const { values, setFieldValue, setFieldTouched, submitForm, isSubmitting, isFormFieldInvalid, getFormErrorMessage } =
    form;

  const descId = useId();
  const titleId = useId();
  const locationId = useId();
  const [skillDraft, setSkillDraft] = useState('');

  useEffect(() => {
    setSkillDraft('');
  }, [initialJob?.id]);

  const progress = useMemo(() => computeProgress(values), [values]);


  const insertAroundSelection = (before: string, after: string) => {
    const el = document.getElementById(descId) as HTMLTextAreaElement | null;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const v = values.description;
    const sel = v.slice(start, end);
    const next = v.slice(0, start) + before + sel + after + v.slice(end);
    void setFieldValue('description', next, true);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + sel.length + after.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const addSkill = (s: string) => {
    const t = s.trim();
    if (!t || values.skills.includes(t)) return;
    void setFieldValue('skills', [...values.skills, t], true);
    void setFieldTouched('skills', true);
    setSkillDraft('');
  };

  const removeSkill = (s: string) => {
    void setFieldValue(
      'skills',
      values.skills.filter((x) => x !== s),
      true,
    );
    void setFieldTouched('skills', true);
  };

  const labelSubmit = submitLabel ?? (isEdit ? t('jobs.saveJob') : t('jobs.postJobVi'));

  const sectionTitle = (_n: number, icon: ReactNode, text: string) => (
    <div className='flex items-center gap-2 border-b border-slate-100 pb-2 mb-2'>
      <span className='text-primary shrink-0'>{icon}</span>
      <h3 className='text-sm font-bold uppercase tracking-tight text-slate-700'>{text}</h3>
    </div>
  );

  const fields = (
    <div className='space-y-4'>
      <Card className='border-none shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-3 pt-0'>
          {sectionTitle(1, <Briefcase className='h-4 w-4' />, t('jobs.coreInfo'))}
        </CardHeader>
        <CardContent className='p-0'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-6'>
            <div className='space-y-1.5 sm:col-span-6'>
              <Label htmlFor={titleId} className='text-xs font-medium text-muted-foreground'>{t('jobs.titleLabel')}</Label>
              <Input
                id={titleId}
                name='title'
                placeholder={t('jobs.titlePlaceholder')}
                value={values.title}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                aria-invalid={isFormFieldInvalid('title')}
                className={cn('h-10 bg-background', isFormFieldInvalid('title') && 'border-destructive')}
              />
              {getFormErrorMessage('title') ? (
                <p className='text-[10px] text-destructive'>{getFormErrorMessage('title')}</p>
              ) : null}
            </div>

            <div className='space-y-1.5 sm:col-span-3 lg:col-span-2'>
              <Label className='text-xs font-medium text-muted-foreground'>{t('jobs.departmentLabel')}</Label>
              <Select
                disabled={loadingDepts}
                value={values.departmentId || undefined}
                onValueChange={(v) => {
                  void setFieldValue('departmentId', v, true);
                  void setFieldTouched('departmentId', true);
                }}
              >
                <SelectTrigger
                  className={cn('h-10 bg-background', isFormFieldInvalid('departmentId') && 'border-destructive')}
                >
                  {loadingDepts ? (
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-3 w-3 animate-spin' />
                      <span className='text-xs'>{t('common.loading')}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder={t('jobs.selectDepartment')} className='text-xs' />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {departmentList?.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFormErrorMessage('departmentId') ? (
                <p className='text-[10px] text-destructive'>{getFormErrorMessage('departmentId')}</p>
              ) : null}
            </div>

            {isEdit && (
              <div className='space-y-1.5 sm:col-span-3 lg:col-span-2'>
                <Label className='text-xs font-medium text-muted-foreground'>{t('jobs.statusLabel')}</Label>
                <Select
                  value={values.jobStatus}
                  onValueChange={(v) => {
                    void setFieldValue('jobStatus', v as JobStatus, true);
                    void setFieldTouched('jobStatus', true);
                  }}
                >
                  <SelectTrigger className='h-10 bg-background'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ACTIVE'>{t('jobs.statusActive')}</SelectItem>
                    <SelectItem value='CLOSED'>{t('jobs.statusClosed')}</SelectItem>
                    <SelectItem value='ARCHIVED'>{t('jobs.statusArchived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='space-y-1.5 sm:col-span-3 lg:col-span-2'>
              <Label className='text-xs font-medium text-muted-foreground'>{t('jobs.priorityLabel')}</Label>
              <Select
                value={values.recruitmentUrgency}
                onValueChange={(v) => {
                  void setFieldValue('recruitmentUrgency', v as 'NORMAL' | 'URGENT', true);
                  void setFieldTouched('recruitmentUrgency', true);
                }}
              >
                <SelectTrigger className='h-10 bg-background'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='URGENT'>{t('jobs.priorityUrgent')}</SelectItem>
                  <SelectItem value='NORMAL'>{t('jobs.priorityNormal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2.5 sm:col-span-3 lg:col-span-2'>
              <div className='flex items-center justify-between'>
                <Label className='text-xs font-medium text-muted-foreground'>{t('jobs.thresholdLabel')}</Label>
                <span className='text-xs font-bold text-primary'>{values.minMatchingScore}%</span>
              </div>
              <div className='px-1 pt-1'>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[values.minMatchingScore]}
                  onValueChange={([v]) => {
                    void setFieldValue('minMatchingScore', v, true);
                    void setFieldTouched('minMatchingScore', true);
                  }}
                  className='py-2'
                />
              </div>
              <p className='text-[10px] text-muted-foreground'>{t('jobs.thresholdHelp', { score: values.minMatchingScore })}</p>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card className='border-none shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-2 pt-0'>
          {sectionTitle(3, <FileText className='h-4 w-4' />, t('jobs.requirements'))}
        </CardHeader>
        <CardContent className='p-0 space-y-3'>
          <div className='group relative flex flex-col rounded-lg border bg-background focus-within:ring-1 focus-within:ring-primary'>
            <Textarea
              name='requirements'
              className='min-h-[140px] border-none bg-transparent resize-none focus-visible:ring-0 text-sm py-3'
              placeholder={t('jobs.requirementsPlaceholder')}
              value={values.requirements}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
          </div>
          {getFormErrorMessage('requirements') && <p className='text-[10px] text-destructive'>{getFormErrorMessage('requirements')}</p>}
        </CardContent>
      </Card>

      <Card className='border-none shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-2 pt-0'>
          {sectionTitle(4, <Briefcase className='h-4 w-4' />, t('jobs.descriptionSection'))}
        </CardHeader>
        <CardContent className='p-0 space-y-3'>
          <div className='group relative flex flex-col rounded-lg border bg-background focus-within:ring-1 focus-within:ring-primary'>
            <div className='flex items-center gap-0.5 border-b bg-muted/20 p-1'>
              <Button type='button' variant='ghost' size='icon' className='h-7 w-7' onClick={() => insertAroundSelection('**', '**')}>
                <Bold className='h-3.5 w-3.5' />
              </Button>
              <Button type='button' variant='ghost' size='icon' className='h-7 w-7' onClick={() => insertAroundSelection('*', '*')}>
                <Italic className='h-3.5 w-3.5' />
              </Button>
              <div className='mx-1 h-4 w-px bg-slate-200' />
              <Button type='button' variant='ghost' size='icon' className='h-7 w-7' onClick={() => insertAroundSelection('\n- ', '')}>
                <List className='h-3.5 w-3.5' />
              </Button>
            </div>
            <Textarea
              id={descId}
              name='description'
              className='min-h-[150px] border-none bg-transparent resize-none focus-visible:ring-0 text-sm py-3'
              placeholder={t('jobs.descriptionPlaceholder')}
              value={values.description}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />
          </div>
          {getFormErrorMessage('description') && <p className='text-[10px] text-destructive'>{getFormErrorMessage('description')}</p>}
        </CardContent>
      </Card>
    </div>
  );

  const footer = (
    <div className='flex w-full items-center justify-between gap-6'>
      {showProgress && (
        <div className='hidden flex-1 items-center gap-4 sm:flex'>
          <div className='flex-1'>
            <div className='mb-1 flex justify-between text-[10px] font-bold uppercase text-slate-400'>
              <span>{t('jobs.profileComplete')}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className='h-1.5 bg-slate-100' />
          </div>
        </div>
      )}
      <div className='flex items-center gap-3'>
        {onCancel && !isEdit && (
          <Button type='button' variant='danger-outline' className='h-10 px-6 text-sm font-medium' onClick={onCancel}>{t('jobs.cancel')}</Button>
        )}
        <Button
          type='button'
          className='h-10 min-w-[140px] px-8 text-sm font-bold shadow-lg shadow-primary/20'
          onClick={() => void submitForm()}
          disabled={isSubmitting || !values.title.trim() || !values.departmentId}
        >
          {labelSubmit}
        </Button>
      </div>
    </div>
  );

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto px-1 py-1'>{fields}</div>
      <div className='shrink-0 border-t bg-slate-50/30 px-2 py-4 dark:bg-slate-950/20'>{footer}</div>
    </div>
  );
}
