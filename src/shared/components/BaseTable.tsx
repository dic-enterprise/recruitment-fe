import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

export interface Column<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

interface BaseTableProps<T> {
  data: T[] | undefined;
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: string;
  stickyHeader?: boolean;
  showIndex?: boolean;
}

export function BaseTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
  emptyMessage,
  className,
  rowClassName,
  stickyHeader = true,
  showIndex = false,
}: BaseTableProps<T>) {
  const { t } = useTranslation();
  const resolvedEmptyMessage = emptyMessage ?? t('common.noData');

  return (
    <div className={cn('relative w-full overflow-auto rounded-md border border-slate-200 bg-card', className)}>
      {isLoading && (
        <div className='absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[1px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      )}

      <Table className='border-collapse'>
        <TableHeader className={cn(stickyHeader && 'sticky top-0 z-10 bg-blue-50/95 dark:bg-blue-900/40 shadow-sm')}>
          <TableRow className='hover:bg-transparent border-b border-slate-200 divide-x divide-slate-200'>
            {showIndex && (
              <TableHead className='h-11 w-10 border-slate-200 px-0 text-center font-bold text-blue-800 dark:text-blue-300'>
                #
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'h-11 border-slate-200 px-4 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300',
                  col.headerClassName,
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className='[&_tr:last-child]:border-b'>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <TableRow
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors border-b border-slate-200',
                  // Zebra striping
                  index % 2 === 0 ? 'bg-white dark:bg-card' : 'bg-slate-50/80 dark:bg-muted/30',
                  onRowClick && 'cursor-pointer hover:bg-primary/5',
                  rowClassName,
                )}
              >
                {showIndex && (
                  <TableCell className='w-10 border-r border-slate-200 px-0 text-center text-[10px] font-medium text-muted-foreground'>
                    {index + 1}
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-4 py-3 border-r border-slate-200 last:border-r-0 text-sm',
                      col.className
                    )}
                  >
                    {col.render ? col.render(item, index) : (item[col.key as keyof T] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            !isLoading && (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (showIndex ? 1 : 0)} 
                  className='h-32 text-center text-muted-foreground'
                >
                  {resolvedEmptyMessage}
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
