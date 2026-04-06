import React, { useMemo, useState } from 'react';
import type { Department, DepartmentContact } from '@/shared/lib/mock-data.ts';
import { BaseAction, BaseDialog, BaseHeader } from '@/shared/components/dialog';
import useForm from '@/shared/hooks/useForm.ts';
import { AppValidation, sleep } from '@/shared/utils/Utils.ts';
import type { CloseModal } from '@/shared/hooks/useModal.ts';
import { AppInput } from '@/shared/components/AppInput.tsx';

type Nullable<T> = T | null | undefined;

interface UpsertDepartmentDialogProps {
  onClose: CloseModal;
  department: Nullable<Department>;
  onSubmit: (department: Department) => void;
}

const UpsertDepartmentDialog: React.FC<UpsertDepartmentDialogProps> = (props) => {
  const { department, onSubmit, onClose } = props;
  const [isLoading, setLoading] = useState(false);
  const isCreateNew = department == null;

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

      setLoading(true);
      const payload: Department = {
        id: department?.id ?? `dept-${Date.now()}`,
        name: values.name.trim(),
        code: values.code.trim().toUpperCase(),
        manager: values.manager.trim() || undefined,
        contacts,
        jobCount: department?.jobCount ?? 0,
      };
      onSubmit(payload);
      await sleep(500);
      setLoading(false);
      onClose();
    },
  });

  return (
    <BaseDialog
      isLoading={isLoading}
      onDismiss={() => onClose(undefined)}
      header={<BaseHeader title={isCreateNew ? 'Create Department' : 'Edit Department'} />}
      body={
        <div className='grid gap-4'>
          <AppInput
            label='Department name'
            placeholder='Engineering'
            value={form.values.name}
            onTextUpdate={(next) => void form.updateFieldValue('name', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('name')}
            onBlur={() => void form.setFieldTouched('name', true)}
            errorText={form.getFormErrorMessage('name')}
          />

          <AppInput
            label='Department code'
            placeholder='ENG'
            value={form.values.code}
            onTextUpdate={(next) => void form.updateFieldValue('code', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('code')}
            onBlur={() => void form.setFieldTouched('code', true)}
            errorText={form.getFormErrorMessage('code')}
          />

          <AppInput
            label='Manager'
            placeholder='Manager name'
            value={form.values.manager}
            onTextUpdate={(next) => void form.updateFieldValue('manager', next, true)}
            isReadonly={isLoading}
            aria-invalid={form.isFormFieldInvalid('manager')}
            onBlur={() => void form.setFieldTouched('manager', true)}
            errorText={form.getFormErrorMessage('manager')}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <AppInput
              label='Contact name'
              placeholder='Primary contact'
              value={form.values.contactName}
              onTextUpdate={(next) => void form.updateFieldValue('contactName', next, true)}
              isReadonly={isLoading}
              aria-invalid={form.isFormFieldInvalid('contactName')}
              onBlur={() => void form.setFieldTouched('contactName', true)}
              errorText={form.getFormErrorMessage('contactName')}
            />
            <AppInput
              label='Contact email'
              placeholder='email@company.com'
              value={form.values.contactEmail}
              onTextUpdate={(next) => void form.updateFieldValue('contactEmail', next, true)}
              isReadonly={isLoading}
              aria-invalid={form.isFormFieldInvalid('contactEmail')}
              onBlur={() => void form.setFieldTouched('contactEmail', true)}
              errorText={form.getFormErrorMessage('contactEmail')}
            />
          </div>

          <AppInput
            label='Contact phone'
            placeholder='090xxxxxxx'
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

export default UpsertDepartmentDialog;
