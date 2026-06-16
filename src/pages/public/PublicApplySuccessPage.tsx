import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import PublicPageLayout from '@/shared/components/public/PublicPageLayout';

export default function PublicApplySuccessPage() {
  const { t } = useTranslation();
  const { candidateId } = useParams();

  return (
    <PublicPageLayout mainClassName='flex items-center justify-center p-4'>
      <Card className='w-full max-w-lg border-border/80 shadow-md animate-slide-up'>
        <CardHeader className='space-y-4 text-center'>
          <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10'>
            <CheckCircle2 className='h-8 w-8 text-primary' />
          </div>
          <CardTitle className='text-2xl'>{t('public.applySubmitted')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-5 text-center'>
          <p className='leading-relaxed text-muted-foreground'>{t('public.applySuccessMessage')}</p>
          {candidateId ? (
            <p className='rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
              {t('public.candidateCode')}: <span className='font-semibold text-foreground'>{candidateId}</span>
            </p>
          ) : null}
          <Button asChild className='w-full sm:w-auto'>
            <Link to='/public/jobs'>{t('public.backToJobs')}</Link>
          </Button>
        </CardContent>
      </Card>
    </PublicPageLayout>
  );
}
