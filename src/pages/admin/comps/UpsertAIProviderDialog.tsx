import React from 'react';
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
  const { provider, allConfigs, onSubmit, onClose } = props;
  const isCreate = provider == null;

  const mutation = useMutation({
    mutationFn: (payload: AIProviderConfig) => adminService.saveAIConfig(buildNextList(allConfigs, payload, isCreate)),
    onSuccess: () => {
      toast.success(isCreate ? 'Tạo cấu hình AI thành công' : 'Cập nhật cấu hình AI thành công');
      onSubmit();
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Thao tác thất bại');
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
          title={isCreate ? 'Thêm cấu hình AI' : 'Chỉnh sửa cấu hình AI'}
          description='Lưu toàn bộ danh sách cấu hình lên server (PUT /admin/ai-config).'
        />
      }
      body={
        <div className='grid gap-4'>
          <AppInput
            label='Tên cấu hình'
            placeholder='VD: OpenAI production, Gemini backup...'
            value={form.values.name ?? ''}
            onTextUpdate={(next) => void form.updateFieldValue('name', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('name')}
          />

          <div className='space-y-1.5'>
            <Label>Loại provider</Label>
            <Select
              value={form.values.providerType}
              onValueChange={(val: AIProviderConfig['providerType']) =>
                void form.updateFieldValue('providerType', val, true)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='Chọn loại' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='OPENAI'>OpenAI</SelectItem>
                <SelectItem value='GEMINI'>Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AppInput
            label='API Key'
            placeholder='sk-...'
            value={form.values.apiKey}
            onTextUpdate={(next) => void form.updateFieldValue('apiKey', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('apiKey')}
          />

          <AppInput
            label='API URL'
            placeholder={
              providerType === 'OPENAI' ? 'https://api.openai.com/v1' : 'https://generativelanguage.googleapis.com'
            }
            value={form.values.apiUrl}
            onTextUpdate={(next) => void form.updateFieldValue('apiUrl', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('apiUrl')}
          />

          <AppInput
            label='Model'
            placeholder={providerType === 'OPENAI' ? 'gpt-4o' : 'gemini-1.5-pro'}
            value={form.values.model}
            onTextUpdate={(next) => void form.updateFieldValue('model', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('model')}
          />

          <div className='flex items-center justify-between p-3 bg-muted/50 rounded-lg border'>
            <div className='space-y-0.5'>
              <Label>Enabled</Label>
              <p className='text-[11px] text-muted-foreground'>Bật để đưa cấu hình này vào hàng đợi round-robin</p>
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
              title: 'Cancel',
              color: 'danger-outline',
              actionCallback: () => onClose(undefined),
              disabled: isLoading,
            },
            {
              title: isCreate ? 'Tạo' : 'Lưu',
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
