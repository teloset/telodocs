import { Injectable } from "@nestjs/common";
import { SearchService } from "../search/search.service";
import { buildConfigNav, listConfigPageSlugs } from "./builders/config-nav.builder";
import { buildFileNav } from "./builders/file-nav.builder";
import { DocMetaService } from "./doc-meta.service";
import { DocsConfigService } from "./docs-config.service";
import { NavItem } from "./types/nav-item.interface";
import { findGroupName } from "./utils/nav-context.util";
import { resolvePageSlug } from "./utils/page-slug.util";

@Injectable()
export class DocsNavService {
  private cache: { items: NavItem[]; expiresAt: number } | null = null;
  private readonly ttlMs = 30_000;

  constructor(
    private readonly search: SearchService,
    private readonly docsConfig: DocsConfigService,
    private readonly docMeta: DocMetaService,
  ) {}

  async getTree(): Promise<NavItem[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.items;
    }

    const files = await this.search.listDocFiles();
    const config = await this.docsConfig.load();
    const items = config?.navigation?.tabs?.[0]?.groups?.length
      ? await this.buildConfigTree(config, files)
      : await this.buildFileTree(files);

    this.cache = { items, expiresAt: Date.now() + this.ttlMs };
    return items;
  }

  async getGroupName(activePath: string): Promise<string | null> {
    const nav = await this.getTree();
    return findGroupName(nav, activePath);
  }

  private async buildConfigTree(
    config: NonNullable<Awaited<ReturnType<DocsConfigService["load"]>>>,
    files: string[],
  ): Promise<NavItem[]> {
    const slugs =
      config.navigation?.tabs?.[0]?.groups?.flatMap((group) =>
        listConfigPageSlugs(group.pages),
      ) ?? [];
    const paths = slugs
      .map((slug) => resolvePageSlug(slug, files))
      .filter((filePath): filePath is string => Boolean(filePath));

    const titles = Object.fromEntries(
      await Promise.all(
        paths.map(async (filePath) => [
          filePath,
          await this.docMeta.getPageTitle(filePath),
        ]),
      ),
    );

    return buildConfigNav(config, files, titles);
  }

  private async buildFileTree(files: string[]): Promise<NavItem[]> {
    const tree = buildFileNav(files);
    await this.applyTitles(tree);
    return tree;
  }

  private async applyTitles(items: NavItem[]): Promise<void> {
    for (const item of items) {
      if (item.path) {
        item.name = await this.docMeta.getPageTitle(item.path);
      }
      if (item.children.length) {
        await this.applyTitles(item.children);
      }
    }
  }
}
