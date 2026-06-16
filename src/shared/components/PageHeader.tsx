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
    <div className='mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold tracking-tight text-foreground md:text-3xl'>{title}</h1>
        {description && <div className='text-sm leading-relaxed text-muted-foreground'>{description}</div>}
      </div>
      {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
    </div>
  );
}
