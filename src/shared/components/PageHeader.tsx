export default function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className='mb-6 flex items-start justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-foreground'>{title}</h1>
        {description && (
          <div className='mt-1 text-sm text-muted-foreground'>{description}</div>
        )}
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
}
