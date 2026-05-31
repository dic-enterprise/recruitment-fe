import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userService } from '@/shared/lib/api-services.ts';
import PageHeader from '@/shared/components/PageHeader.tsx';
import { Edit, Plus, Trash2, UserCog } from 'lucide-react';
import { Button } from '@/shared/components/ui/button.tsx';
import { BaseTable, type Column } from '@/shared/components/BaseTable.tsx';
import useModal from '@/shared/hooks/useModal.ts';
import UpsertUserDialog from '@/pages/admin/comps/UpsertUserDialog.tsx';
import type { AppUser } from '@/shared/types/api.ts';
import { Badge } from '@/shared/components/ui/badge.tsx';
import { cn } from '@/shared/lib/utils.ts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function UsersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [modalNode, openModal] = useModal();
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const { data: userList, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      toast.success(t('users.deleted'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || t('common.operationFailed'));
    },
  });

  async function openCreateUser() {
    await openModal((close) => (
      <UpsertUserDialog
        user={null}
        onClose={close}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />
    ));
  }

  async function openEditUser(appUser: AppUser) {
    await openModal((close) => (
      <UpsertUserDialog
        user={appUser}
        onClose={close}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }}
      />
    ));
  }

  const columns: Column<AppUser>[] = [
    {
      header: t('users.username'),
      key: 'username',
      render: (row) => (
        <div className='flex items-center gap-2 font-medium'>
          <UserCog className='h-4 w-4 text-muted-foreground' />
          {row.username}
        </div>
      ),
    },
    {
      header: t('users.fullName'),
      key: 'fullName',
    },
    {
      header: t('users.email'),
      key: 'email',
    },
    {
      header: t('users.loginType'),
      key: 'loginType',
      render: (row) => (
        <Badge variant='outline' className='font-mono text-xs'>
          {row.loginType}
        </Badge>
      ),
    },
    {
      header: t('users.role'),
      key: 'role',
      render: (row) => (
        <Badge className={cn('border-0', row.role === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
          {row.role === 'ADMIN' ? t('users.roleAdmin') : t('users.roleHr')}
        </Badge>
      ),
    },
    {
      header: t('users.enabled'),
      key: 'enabled',
      render: (row) => (
        <Badge variant={row.enabled ? 'default' : 'secondary'}>
          {row.enabled ? t('common.enabled') : t('common.disabled')}
        </Badge>
      ),
    },
    {
      header: t('common.actions'),
      key: 'actions',
      width: '160px',
      render: (row) => (
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => openEditUser(row)}>
            <Edit className='mr-1.5 h-3.5 w-3.5' />
            {t('common.edit')}
          </Button>
          <Button variant='outline' size='sm' onClick={() => setDeleteTarget(row)}>
            <Trash2 className='h-3.5 w-3.5 text-destructive' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <React.Fragment>
      <div className='flex h-full flex-col'>
        <PageHeader
          title={t('users.title')}
          description={t('users.description')}
          actions={
            <Button onClick={openCreateUser} className='h-8'>
              <Plus className='mr-2 h-4 w-4' />
              {t('users.addUser')}
            </Button>
          }
        />

        <BaseTable
          data={userList}
          columns={columns}
          isLoading={isLoading}
          className='flex-1 min-h-0'
          showIndex={true}
          emptyMessage={t('users.empty')}
        />
      </div>

      {modalNode}

      <AlertDialog open={deleteTarget != null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('users.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('users.deleteConfirmMessage', { username: deleteTarget?.username ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
}
