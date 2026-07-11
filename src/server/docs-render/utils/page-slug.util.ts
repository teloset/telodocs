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

/** Resolves a docs URL slug or API path to a file under docs/. */
export function resolveDocFilePath(
  slug: string,
  files: string[],
): string | null {
  const trimmed = slug.replace(/^\//, "");

  if (files.includes(trimmed)) {
    return trimmed;
  }

  const viaSlug = resolvePageSlug(trimmed, files);
  if (viaSlug) {
    return viaSlug;
  }

  const normalized = trimmed.replace(/\.mdx?$/i, "");

  for (const ext of [".md", ".mdx"]) {
    const pagePath = `${normalized}${ext}`;
    if (files.includes(pagePath)) {
      return pagePath;
    }
  }

  for (const ext of [".md", ".mdx"]) {
    const indexPath = `${normalized}/index${ext}`;
    if (files.includes(indexPath)) {
      return indexPath;
    }
  }

  if (/\.md$/i.test(trimmed)) {
    const asMdx = trimmed.replace(/\.md$/i, ".mdx");
    if (files.includes(asMdx)) {
      return asMdx;
    }
  }

  return null;
}

export function pageHref(resolvedPath: string): string {
  if (/^index\.mdx?$/i.test(resolvedPath)) {
    return "/";
  }

  const withoutExt = resolvedPath.replace(/\.mdx?$/i, "");
  if (/\/index$/i.test(withoutExt)) {
    return `/docs/${encodeURI(withoutExt.replace(/\/index$/i, ""))}`;
  }

  return `/docs/${encodeURI(resolvedPath)}`;
}

export function isRootIndexPath(resolvedPath: string): boolean {
  return /^index\.mdx?$/i.test(resolvedPath);
}
