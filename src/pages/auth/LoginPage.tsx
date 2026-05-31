import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/shared/context/auth-context';
import useForm from '@/shared/hooks/useForm';
import { AppValidation } from '@/shared/utils/Utils';
import { AppInput } from '@/shared/components/AppInput';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Briefcase } from 'lucide-react';

function resolveLoginError(message: string, t: (key: string) => string): string {
  if (message === 'INVALID_CREDENTIALS') return t('auth.invalidCredentials');
  if (message === 'USER_DISABLED') return t('auth.userDisabled');
  return message;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/hr/dashboard';

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo]);

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate(values) {
      return AppValidation.getErrorValidate(values, {
        username: [AppValidation.notEmpty],
        password: [AppValidation.notEmpty],
      });
    },
    onSubmit: async (values) => {
      setApiError(null);
      setSubmitting(true);
      try {
        await login({
          username: values.username.trim(),
          password: values.password,
        });
        navigate(redirectTo, { replace: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : t('auth.loginFailed');
        setApiError(resolveLoginError(message, t));
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (authLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-muted/30 p-4'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='space-y-3 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary'>
            <Briefcase className='h-6 w-6 text-primary-foreground' />
          </div>
          <CardTitle className='text-2xl'>{t('auth.loginTitle')}</CardTitle>
          <CardDescription>{t('nav.tagline')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='space-y-4'
            onSubmit={(event) => {
              event.preventDefault();
              void form.submitForm();
            }}
          >
            <AppInput
              label={t('auth.username')}
              placeholder={t('auth.usernamePlaceholder')}
              value={form.values.username}
              onTextUpdate={(next) => void form.updateFieldValue('username', next, true)}
              isReadonly={submitting}
              aria-invalid={form.isFormFieldInvalid('username')}
              onBlur={() => void form.setFieldTouched('username', true)}
              errorText={form.getFormErrorMessage('username')}
            />

            <div className='space-y-2'>
              <Label htmlFor='login-password'>{t('auth.password')}</Label>
              <div className='relative'>
                <Input
                  id='login-password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={form.values.password}
                  readOnly={submitting}
                  onChange={(event) => void form.updateFieldValue('password', event.target.value, true)}
                  onBlur={() => void form.setFieldTouched('password', true)}
                  aria-invalid={form.isFormFieldInvalid('password')}
                  className='pr-10'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {form.getFormErrorMessage('password') && (
                <p className='text-sm text-destructive'>{form.getFormErrorMessage('password')}</p>
              )}
            </div>

            {apiError && (
              <p className='rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                {apiError}
              </p>
            )}

            <Button type='submit' className='w-full' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.loginButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
