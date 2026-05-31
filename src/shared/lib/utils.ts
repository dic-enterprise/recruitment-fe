import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getDateLocale } from '@/shared/i18n';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(getDateLocale());
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleString(getDateLocale());
  } catch (e) {
    return dateString;
  }
}
