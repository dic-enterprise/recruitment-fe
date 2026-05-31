import { LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth-context';
import { getAvatarColorClass, getAvatarInitials } from '@/shared/lib/avatar-utils';
import { cn } from '@/shared/lib/utils';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { LanguageMenuItems } from '@/shared/components/LanguageSwitcher';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const initials = getAvatarInitials(user.displayName);
  const colorClass = getAvatarColorClass(user.displayName);

  return (
    <DropdownMenu>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type='button'
              className='rounded-full outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              aria-label={user.displayName}
            >
              <Avatar className='h-9 w-9 cursor-pointer'>
                <AvatarFallback className={cn(colorClass, 'text-sm font-semibold text-white')}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side='bottom'>{user.displayName}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align='end' className='w-48'>
        <LanguageMenuItems />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className='text-destructive focus:text-destructive'>
          <LogOut className='mr-2 h-4 w-4' />
          {t('auth.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
