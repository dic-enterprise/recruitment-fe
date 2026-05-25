import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { departmentService } from '@/shared/lib/api-services.ts';
import PageHeader from '@/shared/components/PageHeader.tsx';
import { Building2, Mail, Phone, Plus, User, Pencil, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button.tsx';
import { BaseTable, type Column } from '@/shared/components/BaseTable.tsx';
import useModal from '@/shared/hooks/useModal.ts';
import UpsertDepartmentDialog from '@/pages/hr/department/comps/UpsertDepartmentDialog.tsx';
import type { Department } from '@/shared/types/api.ts';
import React from 'react';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [modalNode, openModal] = useModal();

  const { data: departmentList, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentService.getAll,
  });

  async function openCreateDepartment() {
    await openModal((close) => (
      <UpsertDepartmentDialog
        department={null}
        onClose={close}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ['departments'] });
        }}
      />
    ));
  }

  async function openEditDepartment(dept: Department) {
    await openModal((close) => (
      <UpsertDepartmentDialog
        department={dept}
        onClose={close}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ['departments'] });
        }}
      />
    ));
  }

  const columns: Column<Department>[] = [
    {
      header: 'Department Name',
      key: 'name',
      width: '300px',
      render: (dept) => (
        <div className='font-semibold flex items-center gap-2'>
          <Building2 className='h-4 w-4 text-muted-foreground' />
          {dept.name}
        </div>
      ),
    },
    {
      header: 'Code',
      key: 'code',
      render: (dept) => (
        <span className='rounded-md bg-secondary px-2 py-0.5 text-xs font-mono font-medium text-secondary-foreground border'>
          {dept.code}
        </span>
      ),
    },
    {
      header: 'Manager',
      key: 'manager',
      render: (dept) =>
        dept.manager ? (
          <div className='flex items-center gap-2'>
            <User className='h-3.5 w-3.5 text-muted-foreground' />
            <span>{dept.manager}</span>
          </div>
        ) : (
          <span className='text-muted-foreground italic text-xs'>Not assigned</span>
        ),
    },
    {
      header: 'Jobs',
      key: 'jobCount',
      className: 'text-center',
      headerClassName: 'text-center',
      render: (dept) => (
        <span className={dept.jobCount > 0 ? 'font-medium' : 'text-muted-foreground'}>{dept.jobCount}</span>
      ),
    },
    {
      header: 'Primary Contact',
      key: 'contact',
      render: (dept) =>
        dept.contacts[0] ? (
          <div className='flex flex-col text-xs space-y-0.5'>
            <div className='flex items-center gap-1.5'>
              <Mail className='h-3 w-3 text-muted-foreground' />
              <span className='text-muted-foreground'>{dept.contacts[0].email}</span>
            </div>
            {dept.contacts[0].phone && (
              <div className='flex items-center gap-1.5'>
                <Phone className='h-3 w-3 text-muted-foreground' />
                <span className='text-muted-foreground'>{dept.contacts[0].phone}</span>
              </div>
            )}
          </div>
        ) : (
          <span className='text-muted-foreground italic text-xs'>No contact</span>
        ),
    },
    {
      header: 'Actions',
      key: 'actions',
      width: '100px',
      render: (dept) => (
        <Button variant='outline' size='sm' onClick={() => openEditDepartment(dept)}>
          <Edit className='mr-1.5 h-3.5 w-3.5' />
          Edit
        </Button>
      ),
    },
  ];

  return (
    <React.Fragment>
      <div className='flex h-full flex-col'>
        <PageHeader
          title='Departments'
          description='Manage company departments and their primary contacts'
          actions={
            <Button onClick={openCreateDepartment} className='h-8'>
              <Plus className='mr-2 h-4 w-4' />
              New Department
            </Button>
          }
        />

        <BaseTable
          data={departmentList}
          columns={columns}
          isLoading={isLoading}
          className='flex-1 min-h-0'
          showIndex={true}
        />
      </div>
      {modalNode}
    </React.Fragment>
  );
}
