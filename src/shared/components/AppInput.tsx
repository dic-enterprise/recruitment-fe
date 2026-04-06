import * as React from 'react';

import { Input } from '@/shared/components/ui/input.tsx';
import { cn } from '@/shared/lib/utils.ts';

export type AppInputProps = {
  placeholder?: string;
  value: string;
  onTextUpdate: (next: string) => void;
  isReadonly?: boolean;
  className?: string;
  'aria-invalid'?: boolean;
  onBlur?: () => void;
};

export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(function AppInput(
  { placeholder, value, onTextUpdate, isReadonly, className, onBlur, 'aria-invalid': ariaInvalid },
  ref,
) {
  return (
    <Input
      ref={ref}
      type='text'
      placeholder={placeholder}
      value={value}
      readOnly={isReadonly}
      onChange={(e) => onTextUpdate(e.target.value)}
      onBlur={onBlur}
      aria-invalid={ariaInvalid}
      className={cn(className)}
    />
  );
});

AppInput.displayName = 'AppInput';
