import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/shared/components/ui/dialog.tsx';
import { Button, type ButtonProps } from '@/shared/components/ui/button.tsx';
import { cn } from '@/shared/lib/utils.ts';

export type BaseDialogProps = {
  header: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
  isLoading?: boolean;
};

export function BaseDialog(props: BaseDialogProps) {
  const { header, body, action, onDismiss, isLoading = false } = props;
  // TODO: isLoading = true, show overlay
  return (
    <Dialog defaultOpen onOpenChange={(open) => !open && onDismiss?.()}>
      <DialogContent
        className={cn('flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl')}
      >
        <div className='shrink-0 space-y-1 border-b px-6 py-4 text-left'>{header}</div>
        <div className='flex min-h-0 min-w-0 flex-auto flex-col overflow-hidden px-6 py-4'>{body}</div>
        {action != null ? <div className='shrink-0 border-t bg-background px-6 py-4'>{action}</div> : null}
      </DialogContent>
    </Dialog>
  );
}

export type BaseHeaderProps = {
  title: string;
  description?: string;
};

export function BaseHeader({ title, description }: BaseHeaderProps) {
  return (
    <div className='space-y-1'>
      <DialogTitle className='text-left text-lg font-semibold leading-none tracking-tight'>{title}</DialogTitle>
      {description ? <p className='text-sm text-muted-foreground'>{description}</p> : null}
    </div>
  );
}

export type BaseActionItem = {
  title: string;
  actionCallback: () => void;
  color?: string;
  disabled?: boolean;
};

function actionColorToVariant(color?: string): ButtonProps['variant'] | 'danger-outline' {
  if (!color || color === 'primary' || color === 'default') return 'default';
  if (color === 'destructive' || color === 'danger') return 'destructive';
  if (color === 'danger-outline') return 'danger-outline';
  if (color === 'secondary') return 'secondary';
  if (color === 'outline') return 'outline';
  if (color === 'ghost') return 'ghost';
  if (color === 'link') return 'link';
  return 'default';
}

export type BaseActionProps = {
  actions: BaseActionItem[];
  className?: string;
};

export function BaseAction({ actions, className }: BaseActionProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-end gap-2', className)}>
      {actions.map((a, i) => (
        <Button
          key={`${a.title}-${i}`}
          type='button'
          variant={actionColorToVariant(a.color)}
          disabled={a.disabled}
          onClick={a.actionCallback}
        >
          {a.title}
        </Button>
      ))}
    </div>
  );
}
