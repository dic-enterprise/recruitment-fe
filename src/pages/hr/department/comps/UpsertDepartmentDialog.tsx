import React, { useMemo, useState } from 'react';
import type { Department, DepartmentContact } from '@/shared/lib/mock-data.ts';
import { BaseAction, BaseDialog, BaseHeader } from '@/shared/components/dialog';
import useForm from '@/shared/hooks/useForm.ts';
import { AppValidation, sleep } from '@/shared/utils/Utils.ts';
import type { CloseModal } from '@/shared/hooks/useModal.ts';
import { AppInput } from '@/shared/components/AppInput.tsx';
import { Input } from '@/shared/components/ui/input.tsx';
import { Label } from '@/shared/components/ui/label.tsx';

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
          <div className='space-y-2'>
            <Label htmlFor='department-name'>Department name</Label>
            <Input
              id='department-name'
              name='name'
              placeholder='Engineering'
              value={form.values.name}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isFormFieldInvalid('name')}
            />
            {form.getFormErrorMessage('name') ? (
              <p className='text-sm text-destructive'>{form.getFormErrorMessage('name')}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='department-code'>Department code</Label>
            <Input
              id='department-code'
              name='code'
              placeholder='ENG'
              value={form.values.code}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isFormFieldInvalid('code')}
            />
            {form.getFormErrorMessage('code') ? (
              <p className='text-sm text-destructive'>{form.getFormErrorMessage('code')}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <Label>Manager</Label>
            <AppInput
              placeholder='Manager name'
              value={form.values.manager}
              onTextUpdate={(next) => void form.updateFieldValue('manager', next, true)}
              isReadonly={isLoading}
              aria-invalid={form.isFormFieldInvalid('manager')}
              onBlur={() => void form.setFieldTouched('manager', true)}
            />
            {form.getFormErrorMessage('manager') ? (
              <p className='text-sm text-destructive'>{form.getFormErrorMessage('manager')}</p>
            ) : null}
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='contact-name'>Contact name</Label>
              <Input
                id='contact-name'
                name='contactName'
                placeholder='Primary contact'
                value={form.values.contactName}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='contact-email'>Contact email</Label>
              <Input
                id='contact-email'
                name='contactEmail'
                placeholder='email@company.com'
                value={form.values.contactEmail}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='contact-phone'>Contact phone</Label>
            <Input
              id='contact-phone'
              name='contactPhone'
              placeholder='090xxxxxxx'
              value={form.values.contactPhone}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
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

export default UpsertDepartmentDialog;
