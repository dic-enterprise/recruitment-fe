import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AIProviderConfig } from '@/shared/types/api.ts';
import { BaseAction, BaseDialog, BaseHeader } from '@/shared/components/dialog';
import { useMutation } from '@tanstack/react-query';
import { adminService } from '@/shared/lib/api-services.ts';
import useForm from '@/shared/hooks/useForm.ts';
import { AppValidation } from '@/shared/utils/Utils.ts';
import type { CloseModal } from '@/shared/hooks/useModal.ts';
import { AppInput } from '@/shared/components/AppInput.tsx';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';

type Nullable<T> = T | null | undefined;

const EMPTY_CONFIG: AIProviderConfig = {
  name: '',
  providerType: 'OPENAI',
  enabled: true,
  apiKey: '',
  apiUrl: '',
  model: '',
};

interface UpsertAIProviderDialogProps {
  onClose: CloseModal;
  provider: Nullable<AIProviderConfig>;
  allConfigs: AIProviderConfig[];
  onSubmit: () => void;
}

function buildNextList(
  allConfigs: AIProviderConfig[],
  payload: AIProviderConfig,
  isCreate: boolean,
): AIProviderConfig[] {
  if (isCreate) {
    const { id: _id, ...rest } = payload;
    return [...allConfigs, rest];
  }
  if (payload.id != null) {
    return allConfigs.map((c) => (c.id === payload.id ? payload : c));
  }
  return [...allConfigs, payload];
}

const UpsertAIProviderDialog: React.FC<UpsertAIProviderDialogProps> = (props) => {
  const { t } = useTranslation();
  const { provider, allConfigs, onSubmit, onClose } = props;
  const isCreate = provider == null;

  const mutation = useMutation({
    mutationFn: (payload: AIProviderConfig) => adminService.saveAIConfig(buildNextList(allConfigs, payload, isCreate)),
    onSuccess: () => {
      toast.success(isCreate ? t('admin.aiCreated') : t('admin.aiUpdated'));
      onSubmit();
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('common.operationFailed'));
    },
  });

  const form = useForm<AIProviderConfig>({
    initialValues: provider ?? EMPTY_CONFIG,
    enableReinitialize: true,
    validate(values) {
      return AppValidation.getErrorValidate(values, {
        name: [AppValidation.notEmpty],
        apiKey: [AppValidation.notEmpty],
        apiUrl: [AppValidation.notEmpty],
        model: [AppValidation.notEmpty],
      });
    },
    onSubmit: async (values) => {
      mutation.mutate(values);
    },
  });

  const isLoading = mutation.isPending;
  const providerType = form.values.providerType;

  return (
    <BaseDialog
      isLoading={isLoading}
      onDismiss={() => onClose(undefined)}
      header={
        <BaseHeader
          title={isCreate ? t('admin.addAiTitle') : t('admin.editAiTitle')}
          description={t('admin.aiDescription')}
        />
      }
      body={
        <div className='grid gap-4'>
          <AppInput
            label={t('admin.configName')}
            placeholder={t('admin.configNamePlaceholder')}
            value={form.values.name ?? ''}
            onTextUpdate={(next) => void form.updateFieldValue('name', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('name')}
          />

          <div className='space-y-1.5'>
            <Label>{t('admin.providerType')}</Label>
            <Select
              value={form.values.providerType}
              onValueChange={(val: AIProviderConfig['providerType']) =>
                void form.updateFieldValue('providerType', val, true)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('admin.selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='OPENAI'>OpenAI</SelectItem>
                <SelectItem value='GEMINI'>Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AppInput
            label={t('admin.apiKey')}
            placeholder={t('admin.apiKeyPlaceholder')}
            value={form.values.apiKey}
            onTextUpdate={(next) => void form.updateFieldValue('apiKey', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('apiKey')}
          />

          <AppInput
            label={t('admin.apiUrl')}
            placeholder={
              providerType === 'OPENAI' ? 'https://api.openai.com/v1' : 'https://generativelanguage.googleapis.com'
            }
            value={form.values.apiUrl}
            onTextUpdate={(next) => void form.updateFieldValue('apiUrl', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('apiUrl')}
          />

          <AppInput
            label={t('admin.model')}
            placeholder={providerType === 'OPENAI' ? 'gpt-4o' : 'gemini-1.5-pro'}
            value={form.values.model}
            onTextUpdate={(next) => void form.updateFieldValue('model', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('model')}
          />

          <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg border'>
            <div className='space-y-0.5'>
              <Label>{t('admin.enabled')}</Label>
              <p className='text-[11px] text-muted-foreground'>{t('admin.enabledHelp')}</p>
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

export default UpsertAIProviderDialog;
