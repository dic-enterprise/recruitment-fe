import React, { useMemo } from 'react';
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

interface UpsertAIProviderDialogProps {
  onClose: CloseModal;
  provider: Nullable<AIProviderConfig>;
  onSubmit: () => void;
}

const UpsertAIProviderDialog: React.FC<UpsertAIProviderDialogProps> = (props) => {
  const { provider, onSubmit, onClose } = props;
  const isCreateNew = provider == null;

  const mutation = useMutation({
    mutationFn: (payload: AIProviderConfig) => 
      isCreateNew 
        ? adminService.createAIProvider(payload) 
        : adminService.updateAIProvider(provider.id!, payload),
    onSuccess: () => {
      toast.success(isCreateNew ? 'Tạo cấu hình AI thành công' : 'Cập nhật cấu hình AI thành công');
      onSubmit();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Thao tác thất bại');
    }
  });

  const form = useForm<AIProviderConfig>({
    initialValues: provider || {
      name: '',
      providerType: 'OPENAI',
      enabled: true,
      apiKey: '',
      apiUrl: '',
      model: '',
      isActive: false,
    },
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

  return (
    <BaseDialog
      isLoading={isLoading}
      onDismiss={() => onClose(undefined)}
      header={<BaseHeader title={isCreateNew ? 'Create AI Provider' : 'Edit AI Provider'} />}
      body={
        <div className='grid gap-4'>
          <AppInput
            label='Config Name'
            placeholder='My OpenAI Config'
            value={form.values.name}
            onTextUpdate={(next) => void form.updateFieldValue('name', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('name')}
          />

          <div className='space-y-1.5'>
            <Label>Provider Type</Label>
            <Select 
              value={form.values.providerType} 
              onValueChange={(val: any) => void form.updateFieldValue('providerType', val, true)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPENAI">OpenAI</SelectItem>
                <SelectItem value="GEMINI">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AppInput
            label='API Key'
            placeholder='sk-...'
            type="password"
            value={form.values.apiKey}
            onTextUpdate={(next) => void form.updateFieldValue('apiKey', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('apiKey')}
          />

          <AppInput
            label='API URL'
            placeholder='https://api.openai.com/v1'
            value={form.values.apiUrl}
            onTextUpdate={(next) => void form.updateFieldValue('apiUrl', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('apiUrl')}
          />

          <AppInput
            label='Model'
            placeholder='gpt-4o'
            value={form.values.model}
            onTextUpdate={(next) => void form.updateFieldValue('model', next, true)}
            isReadonly={isLoading}
            errorText={form.getFormErrorMessage('model')}
          />

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Enabled</Label>
              <p className="text-[11px] text-muted-foreground">Cho phép sử dụng provider này</p>
            </div>
            <Switch
              checked={form.values.enabled}
              onCheckedChange={(val) => void form.updateFieldValue('enabled', val, true)}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Set as Active</Label>
              <p className="text-[11px] text-muted-foreground">Sử dụng làm provider mặc định cho hệ thống</p>
            </div>
            <Switch
              checked={form.values.isActive}
              onCheckedChange={(val) => void form.updateFieldValue('isActive', val, true)}
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
              color: 'outline',
              actionCallback: () => onClose(undefined),
              disabled: isLoading,
            },
            {
              title: isCreateNew ? 'Create' : 'Save',
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
