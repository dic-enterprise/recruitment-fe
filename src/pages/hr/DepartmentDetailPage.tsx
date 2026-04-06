import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { departments, jobs } from '@/shared/lib/mock-data';
import { JobStatusBadge } from '@/shared/components/StatusBadges';
import PageHeader from '@/shared/components/PageHeader';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';

export default function DepartmentDetailPage() {
  const { departmentId } = useParams();
  const dept = departments.find((d) => d.id === departmentId);

  if (!dept) return <div className='p-8 text-center text-muted-foreground'>Department not found</div>;

  const deptJobs = jobs.filter((j) => j.departmentId === dept.id);

  return (
    <div>
      <PageHeader
        title={dept.name}
        description={`Code: ${dept.code}`}
        actions={
          <Button variant='outline' asChild>
            <Link to='/hr/departments'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back
            </Link>
          </Button>
        }
      />

      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle className='text-base'>Details</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            {dept.manager && (
              <div className='flex items-center gap-2'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>Manager:</span> {dept.manager}
              </div>
            )}
            <div className='border-t pt-3'>
              <p className='mb-2 font-medium'>Contacts</p>
              {dept.contacts.map((c, i) => (
                <div key={i} className='mb-2 space-y-1 rounded-md bg-muted p-2'>
                  <p className='font-medium'>{c.name}</p>
                  {c.email && (
                    <div className='flex items-center gap-1.5 text-muted-foreground'>
                      <Mail className='h-3 w-3' />
                      {c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className='flex items-center gap-1.5 text-muted-foreground'>
                      <Phone className='h-3 w-3' />
                      {c.phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Jobs ({deptJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {deptJobs.length === 0 ? (
              <p className='text-sm text-muted-foreground'>No jobs in this department</p>
            ) : (
              <div className='space-y-2'>
                {deptJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/hr/jobs/${job.id}`}
                    className='flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted'
                  >
                    <div>
                      <p className='text-sm font-medium'>{job.title}</p>
                      <p className='text-xs text-muted-foreground'>{job.salary}</p>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
