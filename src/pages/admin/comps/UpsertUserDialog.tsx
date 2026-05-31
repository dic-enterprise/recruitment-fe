import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppUser, AppUserRequest, LoginType, UserRole } from '@/shared/types/api.ts';
import { BaseAction, BaseDialog, BaseHeader } from '@/shared/components/dialog';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/shared/lib/api-services.ts';
import useForm from '@/shared/hooks/useForm.ts';
import { AppValidation } from '@/shared/utils/Utils.ts';
import type { CloseModal } from '@/shared/hooks/useModal.ts';
import { AppInput } from '@/shared/components/AppInput.tsx';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Input } from '@/shared/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

type Nullable<T> = T | null | undefined;

interface UpsertUserDialogProps {
  onClose: CloseModal;
  user: Nullable<AppUser>;
  onSubmit: () => void;
}

type UserForm = {
  username: string;
  fullName: string;
  email: string;
  password: string;
  loginType: LoginType;
  role: UserRole;
  enabled: boolean;
};

function mapApiErrorToField(message: string, t: (key: string) => string): Partial<Record<keyof UserForm, string>> {
  if (message === 'USERNAME_ALREADY_EXISTS') return { username: t('users.errors.usernameExists') };
  if (message === 'EMAIL_ALREADY_EXISTS') return { email: t('users.errors.emailExists') };
  if (message === 'password is required when loginType is DB') {
    return { password: t('users.errors.passwordRequiredForDb') };
  }
  return {};
}

const UpsertUserDialog: React.FC<UpsertUserDialogProps> = (props) => {
  const { t } = useTranslation();
  const { user, onSubmit, onClose } = props;
  const isCreate = user == null;
  const originalLoginType = user?.loginType;
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: AppUserRequest) =>
      isCreate ? userService.create(payload) : userService.update(user!.id, payload),
  });

  const initialValues = useMemo<UserForm>(() => {
    if (user == null) {
      return {
        username: '',
        fullName: '',
        email: '',
        password: '',
        loginType: 'DB',
        role: 'HR',
        enabled: true,
      };
    }

    return {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      password: '',
      loginType: user.loginType,
      role: user.role,
      enabled: user.enabled,
    };
  }, [user]);

  const form = useForm<UserForm>({
    initialValues,
    enableReinitialize: true,
    validate(values) {
      const isDb = values.loginType === 'DB';
      const passwordRequired = isDb && (isCreate || originalLoginType === 'SSO');

      const rules: Partial<Record<keyof UserForm, Array<(value: unknown) => string | undefined>>> = {
        username: [AppValidation.notEmpty],
        fullName: [AppValidation.notEmpty],
        email: [AppValidation.notEmpty, AppValidation.isEmail],
      };

      if (passwordRequired) {
        rules.password = [AppValidation.notEmpty];
      }

      return AppValidation.getErrorValidate(values, rules);
    },
    onSubmit: async (values) => {
      const payload: AppUserRequest = {
        username: values.username.trim(),
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        loginType: values.loginType,
        role: values.role,
        enabled: values.enabled,
      };

      if (values.loginType === 'DB' && values.password.trim()) {
        payload.password = values.password;
      }

      try {
        await mutation.mutateAsync(payload);
        toast.success(isCreate ? t('users.created') : t('users.updated'));
        onSubmit();
        onClose();
      } catch (error) {
        const message = error instanceof Error ? error.message : t('common.operationFailed');
        const fieldErrors = mapApiErrorToField(message, t);
        const entries = Object.entries(fieldErrors) as [keyof UserForm, string][];
        if (entries.length > 0) {
          for (const [field, fieldMessage] of entries) {
            void form.setFieldError(field, fieldMessage);
            void form.setFieldTouched(field, true);
          }
          return;
        }
        toast.error(message);
      }
    },
  });

  const isLoading = mutation.isPending;
  const isDb = form.values.loginType === 'DB';
  const passwordRequired = isDb && (isCreate || originalLoginType === 'SSO');

  return (
    <BaseDialog
      isLoading={isLoading}
      onDismiss={() => onClose(undefined)}
      header={
        <BaseHeader title={isCreate ? t('users.createTitle') : t('users.editTitle')} description={t('users.formDescription')} />
      }
      body={
        <div className='grid gap-4'>
          <AppInput
            label={t('users.username')}
            placeholder={t('users.usernamePlaceholder')}
            value={form.values.username}
            onTextUpdate={(next) => void form.updateFieldValue('username', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('username')}
          />

          <AppInput
            label={t('users.fullName')}
            placeholder={t('users.fullNamePlaceholder')}
            value={form.values.fullName}
            onTextUpdate={(next) => void form.updateFieldValue('fullName', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('fullName')}
          />

          <AppInput
            label={t('users.email')}
            placeholder={t('users.emailPlaceholder')}
            value={form.values.email}
            onTextUpdate={(next) => void form.updateFieldValue('email', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('email')}
          />

          <div className='space-y-1.5'>
            <Label>{t('users.loginType')}</Label>
            <Select
              value={form.values.loginType}
              onValueChange={(val: LoginType) => void form.updateFieldValue('loginType', val, true)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DB'>{t('users.loginTypeDb')}</SelectItem>
                <SelectItem value='SSO'>{t('users.loginTypeSso')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isDb && (
            <div className='space-y-2'>
              <Label htmlFor='user-password'>
                {t('users.password')}
                {!passwordRequired && (
                  <span className='ml-1 text-xs font-normal text-muted-foreground'>({t('users.passwordHint')})</span>
                )}
              </Label>
              <div className='relative'>
                <Input
                  id='user-password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('users.passwordPlaceholder')}
                  value={form.values.password}
                  readOnly={isLoading}
                  onChange={(event) => void form.updateFieldValue('password', event.target.value, true)}
                  onBlur={() => void form.setFieldTouched('password', true)}
                  className='pr-10'
                />
                <button
                  type='button'
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {form.getFormErrorMessage('password') && (
                <p className='text-sm text-destructive'>{form.getFormErrorMessage('password')}</p>
              )}
            </div>
          )}

          <div className='space-y-1.5'>
            <Label>{t('users.role')}</Label>
            <Select
              value={form.values.role}
              onValueChange={(val: UserRole) => void form.updateFieldValue('role', val, true)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ADMIN'>{t('users.roleAdmin')}</SelectItem>
                <SelectItem value='HR'>{t('users.roleHr')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center justify-between rounded-lg border bg-muted/50 p-3'>
            <div className='space-y-0.5'>
              <Label>{t('users.enabled')}</Label>
              <p className='text-[11px] text-muted-foreground'>{t('users.enabledHelp')}</p>
            </div>
            <Switch
              checked={form.values.enabled}
              onCheckedChange={(val) => void form.updateFieldValue('enabled', val, true)}
              disabled={isLoading}
            />
          </div>
        </div>
      }
      action={
        <BaseAction
          actions={[
            {
              title: t('common.cancel'),
              color: 'danger-outline',
              actionCallback: () => onClose(undefined),
              disabled: isLoading,
            },
            {
              title: isCreate ? t('common.create') : t('common.save'),
              color: 'primary',
              actionCallback: () => void form.submitForm(),
              disabled: isLoading,
            },
          ]}
        />
      }
    />
  );
};

export default UpsertUserDialog;
