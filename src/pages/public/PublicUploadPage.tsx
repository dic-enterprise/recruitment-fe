import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ExtractStatusBadge } from '@/shared/components/StatusBadges';
import { candidateService } from '@/shared/lib/api-services';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import type { Candidate } from '@/shared/types/api';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function PublicUploadPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (f: File) => candidateService.uploadCV(f),
    onSuccess: (data) => {
      setCandidateId(data.id);
      toast({ title: 'CV Received', description: 'Your CV has been successfully uploaded.' });
    },
    onError: () => {
      toast({ title: 'Lỗi', description: 'Không thể tải lên CV. Vui lòng thử lại.', variant: 'destructive' });
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
      const f = e.target.files?.[0];
      if (!f) return;
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Only PDF, .doc, and .docx files are allowed.',
          variant: 'destructive',
        });
        return;
      }
      if (f.size > MAX_SIZE) {
        toast({ title: 'File too large', description: 'Maximum file size is 10 MB.', variant: 'destructive' });
        return;
      }
      setFile(f);
    },
    [toast],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim() || !email.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields and select a CV file.',
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
            <CardTitle className='mt-4'>CV Processing</CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-4'>
            <p className='text-sm text-muted-foreground'>
              Thank you, <strong>{name}</strong>. Your CV is being processed.
            </p>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-sm text-muted-foreground'>Status:</span>
              <ExtractStatusBadge status={status} />
            </div>
            {status === 'FAILED' && (
              <p className='text-sm text-destructive'>
                {candidate?.extractError?.message || 'There was an error processing your CV. Our team has been notified.'}
              </p>
            )}
            {(status === 'PENDING' || status === 'SCANNING') && (
              <p className='text-xs text-muted-foreground'>This page updates automatically...</p>
            )}
            {status === 'COMPLETE' && (
              <p className='text-sm text-success font-medium'>
                Extraction complete! We will review your profile shortly.
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
          <CardTitle className='mt-2'>Submit Your CV</CardTitle>
          <p className='text-sm text-muted-foreground'>Upload your resume to apply for open positions</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='name'>Full Name</Label>
              <Input
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Nguyễn Văn A'
                required
              />
            </div>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@email.com'
                required
              />
            </div>
            <div>
              <Label htmlFor='cv'>CV File</Label>
              <Input id='cv' type='file' accept='.pdf,.doc,.docx' onChange={handleFileChange} required />
              <p className='mt-1 text-xs text-muted-foreground'>PDF, .doc, .docx — Max 10 MB</p>
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
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Submit CV
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
