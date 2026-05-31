import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Department, DepartmentContact } from '@/shared/types/api.ts';
import { BaseAction, BaseDialog, BaseHeader } from '@/shared/components/dialog';
import { useMutation } from '@tanstack/react-query';
import { departmentService } from '@/shared/lib/api-services.ts';
import useForm from '@/shared/hooks/useForm.ts';
import { AppValidation } from '@/shared/utils/Utils.ts';
import type { CloseModal } from '@/shared/hooks/useModal.ts';
import { AppInput } from '@/shared/components/AppInput.tsx';
import { toast } from 'sonner';

type Nullable<T> = T | null | undefined;

interface UpsertDepartmentDialogProps {
  onClose: CloseModal;
  department: Nullable<Department>;
  onSubmit: () => void;
}

const UpsertDepartmentDialog: React.FC<UpsertDepartmentDialogProps> = (props) => {
  const { t } = useTranslation();
  const { department, onSubmit, onClose } = props;
  const isCreateNew = department == null;

  const mutation = useMutation({
    mutationFn: (payload: Department) => 
      isCreateNew 
        ? departmentService.create(payload) 
        : departmentService.update(department.id, payload),
    onSuccess: () => {
      toast.success(isCreateNew ? t('departments.created') : t('departments.updated'));
      onSubmit();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || t('common.operationFailed'));
    }
  });

  type DepartmentForm = {
    name: string;
    code: string;
    manager: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  };

  const initialValues = useMemo<DepartmentForm>(() => {
    if (department == null) {
      return {
        name: '',
        code: '',
        manager: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      };
    }

    const primaryContact = department.contacts[0];
    return {
      name: department.name ?? '',
      code: department.code ?? '',
      manager: department.manager ?? '',
      contactName: primaryContact?.name ?? '',
      contactEmail: primaryContact?.email ?? '',
      contactPhone: primaryContact?.phone ?? '',
    };
  }, [department]);

  const form = useForm<DepartmentForm>({
    initialValues,
    enableReinitialize: true,
    validate(values) {
      return AppValidation.getErrorValidate(values, {
        name: [AppValidation.notEmpty],
        code: [AppValidation.notEmpty],
        manager: [AppValidation.notEmpty],
        contactEmail: [AppValidation.notEmpty, AppValidation.isEmail],
        contactName: [AppValidation.notEmpty],
        contactPhone: [AppValidation.notEmpty, AppValidation.isPhoneNumber],
      });
    },
    onSubmit: async (values) => {
      const contacts: DepartmentContact[] = values.contactName.trim()
        ? [
            {
              name: values.contactName.trim(),
              email: values.contactEmail.trim() || undefined,
              phone: values.contactPhone.trim() || undefined,
            },
          ]
        : [];

      const payload: any = {
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        manager: values.manager.trim() || undefined,
        contacts,
      };
      
      mutation.mutate(payload as Department);
    },
  });

  const isLoading = mutation.isPending;

  return (
    <BaseDialog
      isLoading={isLoading}
      onDismiss={() => onClose(undefined)}
      header={<BaseHeader title={isCreateNew ? t('departments.createTitle') : t('departments.editTitle')} />}
      body={
        <div className='grid gap-4'>
          <AppInput
            label={t('departments.nameLabel')}
            placeholder={t('departments.namePlaceholder')}
            value={form.values.name}
            onTextUpdate={(next) => void form.updateFieldValue('name', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('name')}
            onBlur={() => void form.setFieldTouched('name', true)}
            errorText={form.getFormErrorMessage('name')}
          />

          <AppInput
            label={t('departments.codeLabel')}
            placeholder={t('departments.codePlaceholder')}
            value={form.values.code}
            onTextUpdate={(next) => void form.updateFieldValue('code', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('code')}
            onBlur={() => void form.setFieldTouched('code', true)}
            errorText={form.getFormErrorMessage('code')}
          />

          <AppInput
            label={t('departments.managerLabel')}
            placeholder={t('departments.managerPlaceholder')}
            value={form.values.manager}
            onTextUpdate={(next) => void form.updateFieldValue('manager', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('manager')}
            onBlur={() => void form.setFieldTouched('manager', true)}
            errorText={form.getFormErrorMessage('manager')}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <AppInput
              label={t('departments.contactNameLabel')}
              placeholder={t('departments.contactPlaceholder')}
              value={form.values.contactName}
              onTextUpdate={(next) => void form.updateFieldValue('contactName', next, true)}
              isReadonly={isLoading}
              aria-invalid={form.isFormFieldInvalid('contactName')}
              onBlur={() => void form.setFieldTouched('contactName', true)}
              errorText={form.getFormErrorMessage('contactName')}
            />
            <AppInput
              label={t('departments.contactEmailLabel')}
              placeholder={t('departments.emailPlaceholder')}
              value={form.values.contactEmail}
              onTextUpdate={(next) => void form.updateFieldValue('contactEmail', next, true)}
              isReadonly={isLoading}
              aria-invalid={form.isFormFieldInvalid('contactEmail')}
              onBlur={() => void form.setFieldTouched('contactEmail', true)}
              errorText={form.getFormErrorMessage('contactEmail')}
            />
          </div>

          <AppInput
            label={t('departments.contactPhoneLabel')}
            placeholder={t('departments.phonePlaceholder')}
            value={form.values.contactPhone}
            onTextUpdate={(next) => void form.updateFieldValue('contactPhone', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('contactPhone')}
            onBlur={() => void form.setFieldTouched('contactPhone', true)}
            errorText={form.getFormErrorMessage('contactPhone')}
          />
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
              title: isCreateNew ? t('common.create') : t('common.save'),
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

export default UpsertDepartmentDialog;
