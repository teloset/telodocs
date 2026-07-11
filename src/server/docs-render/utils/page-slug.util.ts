import path from "node:path";

export function resolvePageSlug(
  slug: string,
  files: string[],
): string | null {
  const normalized = slug.replace(/^\//, "").replace(/\.mdx?$/i, "");

  const matches = files.filter((file) => {
    const withoutExt = file.replace(/\.mdx?$/i, "");
    const base = path.basename(withoutExt);
    return withoutExt === normalized || base === normalized;
  });

  if (matches.length === 1) {
    return matches[0]!;
  }

  if (matches.length > 1) {
    const exact = matches.find(
      (file) => file.replace(/\.mdx?$/i, "") === normalized,
    );
    return exact ?? matches[0]!;
  }

  return null;
}

export function pageHref(resolvedPath: string): string {
  if (/^index\.mdx?$/i.test(resolvedPath)) {
    return "/";
  }
  return `/docs/${encodeURI(resolvedPath)}`;
}

export function isRootIndexPath(resolvedPath: string): boolean {
  return /^index\.mdx?$/i.test(resolvedPath);
}
