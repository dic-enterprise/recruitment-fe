import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

export default function PublicApplySuccessPage() {
  const { t } = useTranslation();
  const { candidateId } = useParams();

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-lg'>
        <CardHeader className='text-center'>
          <CheckCircle2 className='mx-auto h-12 w-12 text-green-600' />
          <CardTitle className='mt-3'>{t('public.applySubmitted')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-muted-foreground'>{t('public.applySuccessMessage')}</p>
          {candidateId ? (
            <p className='text-sm text-muted-foreground'>
              {t('public.candidateCode')}: <span className='font-medium'>{candidateId}</span>
            </p>
          ) : null}
          <div className='pt-2'>
            <Button asChild>
              <Link to='/public/jobs'>{t('public.backToJobs')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
