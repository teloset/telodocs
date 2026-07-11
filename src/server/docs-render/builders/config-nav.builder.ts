import { DocsConfig } from "../types/docs-config.interface";
import { NavItem } from "../types/nav-item.interface";
import { pageHref, resolvePageSlug } from "../utils/page-slug.util";
import { titleFromPath } from "../utils/title.util";

export function buildConfigNav(
  config: DocsConfig,
  files: string[],
  titles: Record<string, string> = {},
): NavItem[] {
  const groups = config.navigation?.tabs?.[0]?.groups ?? [];

  return groups.map((group) => ({
    name: group.group,
    path: "",
    isGroup: true,
    children: group.pages
      .map((slug) => resolvePageSlug(slug, files))
      .filter((filePath): filePath is string => Boolean(filePath))
      .map((filePath) => ({
        name: titles[filePath] ?? titleFromPath(filePath),
        path: filePath,
        href: pageHref(filePath),
        children: [],
      })),
  }));
}
