import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import type { FormikErrors } from 'formik';
import { Briefcase, Bold, Italic, Link2, List, MapPin, Plus, Sparkles, Target, FileText, X } from 'lucide-react';
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
import useForm from '@/shared/hooks/useForm.ts';
import { departments, type Job, type JobStatus } from '@/shared/lib/mock-data.ts';
import { cn } from '@/shared/lib/utils.ts';

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
  if (min != null && max != null) return `${formatVnd(min)} – ${formatVnd(max)} VND`;
  if (min != null) return `Từ ${formatVnd(min)} VND`;
  if (max != null) return `Đến ${formatVnd(max)} VND`;
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

function parseRequirementsToForm(job: Job): { description: string; skills: string[]; urgency: 'NORMAL' | 'URGENT' } {
  let desc = job.requirements;
  let urgency: 'NORMAL' | 'URGENT' = job.recruitmentUrgency ?? 'NORMAL';
  if (desc.includes('[Ưu tiên tuyển dụng khẩn cấp]')) {
    urgency = 'URGENT';
    desc = desc.replace(/\n\n\[Ưu tiên tuyển dụng khẩn cấp\]\s*$/m, '').trim();
  }
  let skills = job.skills ? [...job.skills] : [];
  const km = desc.match(/\n\nKỹ năng:\s*(.+?)\.\s*$/s);
  if (km && km.index !== undefined) {
    if (skills.length === 0) {
      skills = km[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    desc = desc.slice(0, km.index).trim();
  }
  return { description: desc, skills, urgency };
}

function defaultCreateSkills() {
  return ['Figma', 'UI/UX Design', 'Prototyping'];
}

export type JobFormValues = {
  title: string;
  departmentId: string;
  jobStatus: JobStatus;
  recruitmentUrgency: 'NORMAL' | 'URGENT';
  salaryMin: string;
  salaryMax: string;
  location: string;
  workplace: string[];
  description: string;
  skills: string[];
};

function buildInitialValues(job: Job | null): JobFormValues {
  if (job == null) {
    return {
      title: '',
      departmentId: '',
      jobStatus: 'ACTIVE',
      recruitmentUrgency: 'URGENT',
      salaryMin: '',
      salaryMax: '',
      location: '',
      workplace: ['hybrid', 'fulltime'],
      description: '',
      skills: defaultCreateSkills(),
    };
  }
  const parsed = parseRequirementsToForm(job);
  const sal = salaryStringsFromJob(job.salary);
  const ww: string[] = [];
  if (job.workplaceHybrid !== false) ww.push('hybrid');
  if (job.employmentFullTime !== false) ww.push('fulltime');
  return {
    title: job.title,
    departmentId: job.departmentId,
    jobStatus: job.status,
    recruitmentUrgency: parsed.urgency,
    salaryMin: sal.min,
    salaryMax: sal.max,
    location: job.location ?? '',
    workplace: ww,
    description: parsed.description,
    skills: parsed.skills.length ? parsed.skills : [],
  };
}

function validateJobForm(values: JobFormValues): FormikErrors<JobFormValues> {
  const errors: FormikErrors<JobFormValues> = {};
  if (!values.title?.trim()) {
    errors.title = 'Nhập chức danh công việc';
  }
  if (!values.departmentId) {
    errors.departmentId = 'Chọn phòng ban';
  }
  if (values.description.trim().length < 10) {
    errors.description = 'Mô tả tối thiểu 10 ký tự';
  }
  const hasMin = Boolean(values.salaryMin?.trim());
  const hasMax = Boolean(values.salaryMax?.trim());
  if (hasMin !== hasMax) {
    errors.salaryMax = 'Nhập đủ mức lương tối thiểu và tối đa, hoặc để trống cả hai';
  }
  const minN = parseVndDigits(values.salaryMin);
  const maxN = parseVndDigits(values.salaryMax);
  if (minN != null && maxN != null && minN > maxN) {
    errors.salaryMax = 'Lương tối đa phải lớn hơn hoặc bằng tối thiểu';
  }
  if (values.skills.length === 0) {
    errors.skills = 'Thêm ít nhất một kỹ năng mục tiêu';
  }
  return errors;
}

function valuesToJob(values: JobFormValues, initialJob: Job | null): Job {
  const dept = departments.find((d) => d.id === values.departmentId)!;
  const min = parseVndDigits(values.salaryMin);
  const max = parseVndDigits(values.salaryMax);
  const workplaceHybrid = values.workplace.includes('hybrid');
  const employmentFullTime = values.workplace.includes('fulltime');
  const skillsLine = values.skills.length ? `\n\nKỹ năng: ${values.skills.join(', ')}.` : '';
  const urgencyLine = values.recruitmentUrgency === 'URGENT' ? '\n\n[Ưu tiên tuyển dụng khẩn cấp]' : '';
  const requirements = `${values.description.trim()}${skillsLine}${urgencyLine}`.trim();
  const existing = initialJob ?? undefined;

  return {
    id: existing ? existing.id : `job-${Date.now()}`,
    departmentId: dept.id,
    departmentName: dept.name,
    title: values.title.trim(),
    salary: buildSalaryLabel(min, max),
    requirements: requirements || '—',
    status: existing ? values.jobStatus : 'ACTIVE',
    createdAt: existing ? existing.createdAt : new Date().toISOString().slice(0, 10),
    matchCount: existing ? existing.matchCount : 0,
    highMatchCount: existing ? existing.highMatchCount : 0,
    location: values.location.trim() || undefined,
    workplaceHybrid,
    employmentFullTime,
    recruitmentUrgency: values.recruitmentUrgency,
    skills: values.skills.length ? values.skills : undefined,
  };
}

function computeProgress(values: JobFormValues): number {
  let pts = 0;
  if (values.title.trim()) pts += 18;
  if (values.departmentId) pts += 15;
  if (parseVndDigits(values.salaryMin) && parseVndDigits(values.salaryMax)) pts += 18;
  else if (parseVndDigits(values.salaryMin) || parseVndDigits(values.salaryMax)) pts += 9;
  if (values.location.trim()) pts += 12;
  if (values.description.trim().length > 40) pts += 22;
  else if (values.description.trim()) pts += 12;
  if (values.skills.length > 0) pts += 15;
  return Math.min(100, Math.round(pts));
}

const SUGGESTED_SKILLS = ['User Research', 'Design Systems', 'Agile', 'React', 'Communication'];

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
  const isEdit = initialJob != null;
  const initialValues = useMemo(() => buildInitialValues(initialJob), [initialJob]);

  const form = useForm<JobFormValues>({
    initialValues,
    enableReinitialize: true,
    validateOnMount: true,
    validate: validateJobForm,
    onSubmit: (values) => {
      onSubmit(valuesToJob(values, initialJob));
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

  const applyAiInsight = () => {
    const line = 'Yêu cầu nộp portfolio (PDF hoặc link) cùng hồ sơ.';
    const next = values.description.trim() ? `${values.description.trim()}\n\n${line}` : line;
    void setFieldValue('description', next, true);
  };

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

  const labelSubmit = submitLabel ?? (isEdit ? 'Lưu thay đổi' : 'Đăng tuyển');

  const sectionTitle = (n: number, icon: ReactNode, text: string) => (
    <div className='flex items-center gap-2'>
      <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
        {n}
      </span>
      <span className='text-primary'>{icon}</span>
      <CardTitle className='text-base font-semibold'>{text}</CardTitle>
    </div>
  );

  const fields = (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-3'>
          {sectionTitle(1, <Briefcase className='h-4 w-4' />, 'Thông tin cốt lõi')}
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor={titleId}>Chức danh công việc</Label>
            <Input
              id={titleId}
              name='title'
              placeholder='VD: Senior Product Designer'
              value={values.title}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={isFormFieldInvalid('title')}
              className={cn(isFormFieldInvalid('title') && 'border-destructive')}
            />
            {getFormErrorMessage('title') ? (
              <p className='text-sm text-destructive'>{getFormErrorMessage('title')}</p>
            ) : null}
          </div>
          <div className='space-y-2'>
            <Label>Phòng ban</Label>
            <Select
              value={values.departmentId || undefined}
              onValueChange={(v) => {
                void setFieldValue('departmentId', v, true);
                void setFieldTouched('departmentId', true);
              }}
            >
              <SelectTrigger
                aria-invalid={isFormFieldInvalid('departmentId')}
                className={cn(isFormFieldInvalid('departmentId') && 'border-destructive')}
              >
                <SelectValue placeholder='Chọn phòng ban' />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFormErrorMessage('departmentId') ? (
              <p className='text-sm text-destructive'>{getFormErrorMessage('departmentId')}</p>
            ) : null}
          </div>
          {isEdit && (
            <div className='space-y-2'>
              <Label>Trạng thái tin</Label>
              <Select
                value={values.jobStatus}
                onValueChange={(v) => {
                  void setFieldValue('jobStatus', v as JobStatus, true);
                  void setFieldTouched('jobStatus', true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACTIVE'>Active</SelectItem>
                  <SelectItem value='CLOSED'>Closed</SelectItem>
                  <SelectItem value='ARCHIVED'>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className='space-y-2'>
            <Label>Trạng thái tuyển</Label>
            <Select
              value={values.recruitmentUrgency}
              onValueChange={(v) => {
                void setFieldValue('recruitmentUrgency', v as 'NORMAL' | 'URGENT', true);
                void setFieldTouched('recruitmentUrgency', true);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='URGENT'>Khẩn cấp (Ưu tiên)</SelectItem>
                <SelectItem value='NORMAL'>Bình thường</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>{sectionTitle(2, <MapPin className='h-4 w-4' />, 'Chế độ & Địa điểm')}</CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Mức lương dự kiến (VNĐ)</Label>
              <div className='flex items-center gap-2'>
                <Input
                  name='salaryMin'
                  placeholder='Tối thiểu'
                  value={values.salaryMin}
                  onChange={(e) => {
                    const n = parseVndDigits(e.target.value);
                    void setFieldValue('salaryMin', n != null ? formatVnd(n) : '', true);
                  }}
                  onBlur={() => void setFieldTouched('salaryMin', true)}
                  inputMode='numeric'
                  aria-invalid={isFormFieldInvalid('salaryMax')}
                  className={cn(isFormFieldInvalid('salaryMax') && 'border-destructive')}
                />
                <span className='text-muted-foreground'>—</span>
                <Input
                  name='salaryMax'
                  placeholder='Tối đa'
                  value={values.salaryMax}
                  onChange={(e) => {
                    const n = parseVndDigits(e.target.value);
                    void setFieldValue('salaryMax', n != null ? formatVnd(n) : '', true);
                  }}
                  onBlur={() => void setFieldTouched('salaryMax', true)}
                  inputMode='numeric'
                  aria-invalid={isFormFieldInvalid('salaryMax')}
                  className={cn(isFormFieldInvalid('salaryMax') && 'border-destructive')}
                />
              </div>
              {getFormErrorMessage('salaryMax') ? (
                <p className='text-sm text-destructive'>{getFormErrorMessage('salaryMax')}</p>
              ) : null}
            </div>
            <div className='space-y-2'>
              <Label htmlFor={locationId}>Địa điểm làm việc</Label>
              <div className='relative'>
                <MapPin className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  id={locationId}
                  name='location'
                  className='pl-9'
                  placeholder='Quận 1, TP. Hồ Chí Minh'
                  value={values.location}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                />
              </div>
              <ToggleGroup
                type='multiple'
                value={values.workplace}
                onValueChange={(v) => void setFieldValue('workplace', v, true)}
                variant='outline'
                size='sm'
                className='justify-start pt-1'
              >
                <ToggleGroupItem value='hybrid' aria-label='Hybrid'>
                  Hybrid
                </ToggleGroupItem>
                <ToggleGroupItem value='fulltime' aria-label='Toàn thời gian'>
                  Toàn thời gian
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>{sectionTitle(3, <FileText className='h-4 w-4' />, 'Mô tả công việc')}</CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex gap-1 rounded-md border bg-muted/30 p-1'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => insertAroundSelection('**', '**')}
            >
              <Bold className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => insertAroundSelection('*', '*')}
            >
              <Italic className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => insertAroundSelection('\n- ', '')}
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              onClick={() => insertAroundSelection('[', '](https://)')}
            >
              <Link2 className='h-4 w-4' />
            </Button>
          </div>
          <Textarea
            id={descId}
            name='description'
            className={cn('min-h-[140px] resize-y', isFormFieldInvalid('description') && 'border-destructive')}
            placeholder='Viết mô tả chi tiết về vai trò, trách nhiệm và văn hóa đội ngũ...'
            value={values.description}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            aria-invalid={isFormFieldInvalid('description')}
          />
          {getFormErrorMessage('description') ? (
            <p className='text-sm text-destructive'>{getFormErrorMessage('description')}</p>
          ) : null}
          <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100'>
            <div className='flex items-start gap-2'>
              <Sparkles className='mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400' />
              <span>
                <span className='font-medium'>AI Insight:</span> Thêm &apos;Yêu cầu Portfolio&apos; để thu hút ứng viên
                chất lượng hơn.
              </span>
            </div>
            <Button
              type='button'
              variant='link'
              className='h-auto shrink-0 px-2 text-sky-700 dark:text-sky-300'
              onClick={applyAiInsight}
            >
              Áp dụng
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>{sectionTitle(4, <Target className='h-4 w-4' />, 'Kỹ năng mục tiêu')}</CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex flex-wrap gap-2'>
            {values.skills.map((s) => (
              <Badge key={s} variant='secondary' className='gap-1 pr-1 font-normal'>
                {s}
                <button
                  type='button'
                  className='ml-0.5 rounded-full p-0.5 hover:bg-background/80'
                  onClick={() => removeSkill(s)}
                  aria-label={`Xóa ${s}`}
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
          {getFormErrorMessage('skills') ? (
            <p className='text-sm text-destructive'>{getFormErrorMessage('skills')}</p>
          ) : null}
          <div className='flex gap-2'>
            <Input
              placeholder='Thêm kỹ năng khác (VD: React, Communication...)'
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(skillDraft);
                }
              }}
            />
            <Button
              type='button'
              size='icon'
              className='h-10 w-10 shrink-0 rounded-full'
              onClick={() => addSkill(skillDraft)}
            >
              <Plus className='h-5 w-5' />
            </Button>
          </div>
          <div>
            <p className='mb-2 text-xs text-muted-foreground'>Gợi ý từ hệ thống</p>
            <div className='flex flex-wrap gap-2'>
              {SUGGESTED_SKILLS.filter((s) => !values.skills.includes(s)).map((s) => (
                <Button
                  key={s}
                  type='button'
                  variant='outline'
                  size='sm'
                  className='h-8 text-xs'
                  onClick={() => addSkill(s)}
                >
                  + {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const footer = (
    <div className='flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      {showProgress && (
        <div className='min-w-0 flex-1 space-y-1.5'>
          <p className='text-sm text-muted-foreground'>Thông tin hoàn tất {progress}%</p>
          <Progress value={progress} className='h-2' />
        </div>
      )}
      <div className='flex flex-wrap items-center justify-end gap-2'>
        {onCancel && !isEdit && (
          <Button type='button' variant='outline' onClick={onCancel}>
            Hủy
          </Button>
        )}
        <BaseAction
          className={cn(!showProgress && 'w-full justify-end sm:min-w-[140px]')}
          actions={[
            {
              title: labelSubmit,
              actionCallback: () => void submitForm(),
              color: 'primary',
              disabled: isSubmitting || !values.title.trim() || !values.departmentId,
            },
          ]}
        />
      </div>
    </div>
  );

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col'>
      <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>{fields}</div>
      <div className='shrink-0 border-t border-border pt-4 mt-4'>{footer}</div>
    </div>
  );
}
