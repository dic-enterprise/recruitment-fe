import * as React from 'react';

import { Input } from '@/shared/components/ui/input.tsx';
import { Label } from '@/shared/components/ui/label.tsx';
import { cn } from '@/shared/lib/utils.ts';

export type AppInputProps = {
  label?: React.ReactNode;
  errorText?: string;
  /** Applied to the outer wrapper when `label` is set */
  wrapperClassName?: string;
  placeholder?: string;
  value: string;
  onTextUpdate: (next: string) => void;
  isReadonly?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  onBlur?: () => void;
};

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  {
    label,
    errorText,
    wrapperClassName,
    placeholder,
    value,
    onTextUpdate,
    isReadonly,
    className,
    onBlur,
    'aria-invalid': ariaInvalid,
  },
  ref,
) {
  const id = React.useId();
  const showFieldChrome = label != null;

  const input = (
    <Input
      ref={ref}
      id={showFieldChrome ? id : undefined}
      type='text'
      placeholder={placeholder}
      value={value}
      readOnly={isReadonly}
      onChange={(e) => onTextUpdate(e.target.value)}
      onBlur={onBlur}
      aria-invalid={ariaInvalid}
      aria-describedby={errorText ? `${id}-error` : undefined}
      className={cn(className)}
    />
  );

  if (!showFieldChrome) {
    return input;
  }

  return (
    <div className={cn('space-y-2', wrapperClassName)}>
      <Label htmlFor={id}>{label}</Label>
      {input}
      {errorText ? (
        <p id={`${id}-error`} className='text-sm text-destructive'>
          {errorText}
        </p>
      ) : null}
    </div>
  );
});

AppInput.displayName = 'AppInput';
