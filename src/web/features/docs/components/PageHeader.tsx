interface PageHeaderProps {
  title: string;
  description?: string;
  groupName?: string;
}

export function PageHeader({ title, description, groupName }: PageHeaderProps) {
  return (
    <header className="docs-page-header">
      {groupName ? <p className="docs-page-eyebrow">{groupName}</p> : null}
      <h1>{title}</h1>
      {description ? (
        <p className="docs-page-description">{description}</p>
      ) : null}
    </header>
  );
}
