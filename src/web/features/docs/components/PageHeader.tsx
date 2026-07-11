interface PageHeaderProps {
  title: string;
  description?: string;
  groupName?: string;
}

export function PageHeader({ title, description, groupName }: PageHeaderProps) {
  return (
    <header className="mb-9 border-b pb-6">
      {groupName ? (
        <p className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase">
          {groupName}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          {description}
        </p>
      ) : null}
    </header>
  );
}
