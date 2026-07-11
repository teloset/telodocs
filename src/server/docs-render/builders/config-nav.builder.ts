import {
  DocsConfig,
  DocsConfigGroup,
  DocsConfigPageEntry,
} from "../types/docs-config.interface";
import { NavItem } from "../types/nav-item.interface";
import { pageHref, resolvePageSlug } from "../utils/page-slug.util";
import { titleFromPath } from "../utils/title.util";

function isNestedGroup(
  entry: DocsConfigPageEntry,
): entry is DocsConfigGroup {
  return typeof entry === "object" && entry !== null && "group" in entry;
}

function buildPageItem(
  slug: string,
  files: string[],
  titles: Record<string, string>,
): NavItem | null {
  const filePath = resolvePageSlug(slug, files);
  if (!filePath) {
    return null;
  }

  return {
    name: titles[filePath] ?? titleFromPath(filePath),
    path: filePath,
    href: pageHref(filePath),
    children: [],
  };
}

function buildGroupItem(
  group: DocsConfigGroup,
  files: string[],
  titles: Record<string, string>,
): NavItem {
  const rootPath = group.root
    ? resolvePageSlug(group.root, files)
    : null;

  return {
    name: group.group,
    path: "",
    isGroup: true,
    href: rootPath ? pageHref(rootPath) : undefined,
    defaultExpanded: group.expanded ?? false,
    children: buildPageEntries(group.pages, files, titles),
  };
}

function buildPageEntries(
  pages: DocsConfigPageEntry[],
  files: string[],
  titles: Record<string, string>,
): NavItem[] {
  const items: NavItem[] = [];

  for (const entry of pages) {
    if (isNestedGroup(entry)) {
      items.push(buildGroupItem(entry, files, titles));
      continue;
    }

    const page = buildPageItem(entry, files, titles);
    if (page) {
      items.push(page);
    }
  }

  return items;
}

function collectPageSlugs(pages: DocsConfigPageEntry[]): string[] {
  const slugs: string[] = [];

  for (const entry of pages) {
    if (typeof entry === "string") {
      slugs.push(entry);
      continue;
    }

    if (entry.root) {
      slugs.push(entry.root);
    }

    slugs.push(...collectPageSlugs(entry.pages));
  }

  return slugs;
}

export function listConfigPageSlugs(pages: DocsConfigPageEntry[]): string[] {
  return collectPageSlugs(pages);
}

export function buildConfigNav(
  config: DocsConfig,
  files: string[],
  titles: Record<string, string> = {},
): NavItem[] {
  const groups = config.navigation?.tabs?.[0]?.groups ?? [];

  return groups.map((group) => buildGroupItem(group, files, titles));
}
