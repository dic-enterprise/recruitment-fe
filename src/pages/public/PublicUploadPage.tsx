import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ExtractStatusBadge } from '@/shared/components/StatusBadges';
import { candidateService } from '@/shared/lib/api-services';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { validateCvUploadFiles } from '@/shared/lib/cv-upload-utils';

export default function PublicUploadPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (f: File) => candidateService.uploadCVs([f]).then((res) => res.candidates[0]),
    onSuccess: (data) => {
      setCandidateId(String(data.id));
      toast({ title: t('public.cvReceived'), description: t('public.uploadSuccess') });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('public.uploadError'), variant: 'destructive' });
    },
  });

  const { data: candidate } = useQuery({
    queryKey: ['candidate-status', candidateId],
    queryFn: () => candidateService.getById(candidateId!),
    enabled: !!candidateId,
    retry: false,
    refetchInterval: (query) => {
      const status = query.state.data?.extractStatus;
      return status === 'COMPLETE' || status === 'FAILED' ? false : 5000;
    },
  });

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const validation = validateCvUploadFiles(e.target.files);
      if (!validation.ok) {
        toast({ title: t('public.invalidFile'), description: validation.message, variant: 'destructive' });
        return;
      }
      setFile(validation.files[0]);
    },
    [toast, t],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim() || !email.trim()) {
      toast({
        title: t('public.missingFields'),
        description: t('public.fillAllFields'),
        variant: 'destructive',
      });
      return;
    }
    uploadMutation.mutate(file);
  };

  if (candidateId) {
    const status = candidate?.extractStatus || 'PENDING';
    return (
      <div className='flex min-h-screen items-center justify-center bg-background p-4'>
        <Card className='w-full max-w-md animate-fade-in'>
          <CardHeader className='text-center'>
            {status === 'COMPLETE' ? (
              <CheckCircle className='mx-auto h-12 w-12 text-success' />
            ) : status === 'FAILED' ? (
              <AlertCircle className='mx-auto h-12 w-12 text-destructive' />
            ) : (
              <Loader2 className='mx-auto h-12 w-12 text-primary animate-spin' />
            )}
            <CardTitle className='mt-4'>{t('public.cvProcessing')}</CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-sm text-muted-foreground'>
              {t('public.thankYou', { name })}
            </p>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-sm text-muted-foreground'>{t('public.statusLabel')}</span>
              <ExtractStatusBadge status={status} />
            </div>
            {status === 'FAILED' && (
              <p className='text-sm text-destructive'>
                {candidate?.extractError?.message || t('common.serverError')}
              </p>
            )}
            {(status === 'PENDING' || status === 'SCANNING') && (
              <p className='text-xs text-muted-foreground'>{t('public.autoUpdate')}</p>
            )}
            {status === 'COMPLETE' && (
              <p className='text-sm text-success font-medium'>
                {t('public.uploadSuccess')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md animate-slide-up'>
        <CardHeader className='text-center'>
          <Upload className='mx-auto h-10 w-10 text-primary' />
          <CardTitle className='mt-2'>{t('public.submitCv')}</CardTitle>
          <p className='text-sm text-muted-foreground'>{t('public.submitDescription')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='name'>{t('public.fullName')}</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('public.namePlaceholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor='email'>{t('public.email')}</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('public.emailPlaceholder')}
                required
              />
            </div>
            <div>
              <Label htmlFor='cv'>{t('public.cvFile')}</Label>
              <Input id='cv' type='file' accept='.pdf' onChange={handleFileChange} required />
              <p className='mt-1 text-xs text-muted-foreground'>{t('public.pdfHelp')}</p>
            </div>
            {file && (
              <div className='flex items-center gap-2 rounded-md bg-muted p-2 text-sm'>
                <FileText className='h-4 w-4 text-primary' />
                <span className='truncate'>{file.name}</span>
                <span className='ml-auto text-xs text-muted-foreground'>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            )}
            <Button type='submit' className='w-full' disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('public.uploading')}
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  {t('public.submitButton')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
