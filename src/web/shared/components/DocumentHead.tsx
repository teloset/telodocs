import defaultFaviconUrl from "../assets/mcp-favicon.svg";

interface DocumentHeadProps {
  title?: string;
  faviconUrl?: string;
}

export function DocumentHead({ title, faviconUrl }: DocumentHeadProps) {
  return (
    <>
      {title ? <title>{title}</title> : null}
      <link rel="icon" href={faviconUrl ?? defaultFaviconUrl} />
    </>
  );
}
