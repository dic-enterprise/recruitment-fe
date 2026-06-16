import { Link } from 'react-router-dom';
import { Briefcase, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Job } from '@/shared/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

interface JobListingCardProps {
  job: Job;
  onApply?: (job: Job) => void;
  className?: string;
}

export default function JobListingCard({ job, onApply, className }: JobListingCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        'group relative h-full overflow-hidden border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        className,
      )}
    >
      <div className='absolute inset-y-0 left-0 w-1 scale-y-0 bg-primary transition-transform duration-200 group-hover:scale-y-100' />
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg leading-snug'>{job.title}</CardTitle>
        <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
          <span className='inline-flex items-center gap-1'>
            <Briefcase className='h-3.5 w-3.5' />
            {job.departmentName}
          </span>
          {job.location ? (
            <span className='inline-flex items-center gap-1'>
              <MapPin className='h-3.5 w-3.5' />
              {job.location}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {job.recruitmentUrgency === 'URGENT' ? (
          <Badge variant='destructive'>{t('public.urgentHiring')}</Badge>
        ) : null}
        <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>{job.requirements}</p>
        {job.skills?.length ? (
          <div className='flex flex-wrap gap-1.5'>
            {job.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant='secondary' className='font-normal'>
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 ? (
              <Badge variant='outline' className='font-normal'>
                +{job.skills.length - 5}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <div className='flex flex-wrap gap-2 pt-1'>
          <Button asChild variant='outline' size='sm'>
            <Link to={`/public/jobs/${job.id}`}>{t('common.viewDetail')}</Link>
          </Button>
          {onApply ? (
            <Button size='sm' onClick={() => onApply(job)}>
              {t('public.applyJob')}
            </Button>
          ) : (
            <Button asChild size='sm'>
              <Link to={`/public/jobs/${job.id}`}>{t('public.applyJob')}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
