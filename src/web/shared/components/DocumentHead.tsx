import { type ReactNode } from "react";

interface DocumentHeadProps {
  title?: string;
  faviconUrl?: string;
}

export function DocumentHead({ title, faviconUrl }: DocumentHeadProps) {
  return (
    <>
      {title ? <title>{title}</title> : null}
      {faviconUrl ? <link rel="icon" href={faviconUrl} /> : null}
    </>
  );
}
