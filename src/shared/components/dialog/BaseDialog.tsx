import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog.tsx";
import { Button, type ButtonProps } from "@/shared/components/ui/button.tsx";
import { cn } from "@/shared/lib/utils.ts";

export type BaseDialogProps = {
  header: ReactNode;
  body: ReactNode;
  action: ReactNode;
  /** Gọi khi đóng (overlay, Escape, nút X). Dùng với useModal để `close()`. */
  onDismiss?: () => void;
};

/**
 * Chiều cao: co theo nội dung khi ngắn; khi vượt 90vh thì chỉ phần body cuộn (flex-auto + min-h-0).
 * Rộng: max-w-3xl, w-full — không cần prop class tùy chỉnh.
 */
export function BaseDialog({ header, body, action, onDismiss }: BaseDialogProps) {
  return (
    <Dialog defaultOpen onOpenChange={open => !open && onDismiss?.()}>
      <DialogContent
        className={cn(
          "flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl",
        )}
      >
        <div className="shrink-0 space-y-1 border-b px-6 py-4 text-left">{header}</div>
        <div className="min-h-0 min-w-0 flex-auto overflow-y-auto overscroll-contain px-6 py-4">{body}</div>
        <div className="shrink-0 border-t bg-background px-6 py-4">{action}</div>
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
    <div className="space-y-1">
      <DialogTitle className="text-left text-lg font-semibold leading-none tracking-tight">{title}</DialogTitle>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export type BaseActionItem = {
  title: string;
  actionCallback: () => void;
  color?: string;
  disabled?: boolean;
};

function actionColorToVariant(color?: string): ButtonProps["variant"] {
  if (!color || color === "primary" || color === "default") return "default";
  if (color === "destructive" || color === "danger") return "destructive";
  if (color === "secondary") return "secondary";
  if (color === "outline") return "outline";
  if (color === "ghost") return "ghost";
  if (color === "link") return "link";
  return "default";
}

export type BaseActionProps = {
  actions: BaseActionItem[];
  className?: string;
};

export function BaseAction({ actions, className }: BaseActionProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2", className)}>
      {actions.map((a, i) => (
        <Button
          key={`${a.title}-${i}`}
          type="button"
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
