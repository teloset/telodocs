import { Injectable, NotFoundException } from "@nestjs/common";
import fs from "node:fs/promises";
import path from "node:path";
import { SearchService } from "../search/search.service";
import { ContentRenderService } from "./content-render.service";
import { DocMetaService } from "./doc-meta.service";
import { DocsConfigService } from "./docs-config.service";
import { DocsNavService } from "./docs-nav.service";
import { SiteBranding } from "./types/docs-config.interface";
import { NavItem } from "./types/nav-item.interface";
import { TocHeading } from "./types/doc-frontmatter.interface";
import { titleFromPath } from "./utils/title.util";
import { escapeHtml } from "./utils/html.util";

export interface DocPagePayload {
  path: string;
  title: string;
  description?: string;
  groupName?: string;
  html: string;
  headings: TocHeading[];
}

@Injectable()
export class DocsApiService {
  constructor(
    private readonly search: SearchService,
    private readonly nav: DocsNavService,
    private readonly config: DocsConfigService,
    private readonly docMeta: DocMetaService,
    private readonly content: ContentRenderService,
  ) {}

  async getSite(): Promise<SiteBranding> {
    return this.config.getBranding();
  }

  async getNav(): Promise<{ items: NavItem[] }> {
    return { items: await this.nav.getTree() };
  }

  async getPage(relativePath?: string): Promise<DocPagePayload> {
    const resolvedPath = await this.resolveDocPath(relativePath);

    if (!resolvedPath) {
      const branding = await this.config.getBranding();
      return {
        path: "",
        title: branding.siteName,
        html: `<section class="docs-empty-home"><h1>${escapeHtml(branding.siteName)}</h1><p>Add <code>docs/index.md</code> or create pages under <code>docs/</code>.</p></section>`,
        headings: [],
      };
    }

    return this.loadPage(resolvedPath);
  }

  async resolveDocPath(relativePath?: string): Promise<string | null> {
    if (!relativePath?.trim()) {
      return this.resolveRootIndexPath();
    }

    const files = await this.search.listDocFiles();
    const normalized = relativePath.replace(/^\//, "");

    if (files.includes(normalized)) {
      return normalized;
    }

    if (/\.md$/i.test(normalized)) {
      const asMdx = normalized.replace(/\.md$/i, ".mdx");
      if (files.includes(asMdx)) {
        return asMdx;
      }
    }

    if (!normalized.includes(".")) {
      const asMd = `${normalized}.md`;
      const asMdx = `${normalized}.mdx`;
      if (files.includes(asMd)) {
        return asMd;
      }
      if (files.includes(asMdx)) {
        return asMdx;
      }
    }

    return normalized;
  }

  private async resolveRootIndexPath(): Promise<string | null> {
    const files = await this.search.listDocFiles();
    return (
      files.find((file) => /^index\.mdx?$/i.test(file)) ?? null
    );
  }

  private async loadPage(relativePath: string): Promise<DocPagePayload> {
    const safePath = this.search.resolveSafePath(relativePath);
    let raw: string;

    try {
      raw = await fs.readFile(safePath, "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        throw new NotFoundException(`Document not found: ${relativePath}`);
      }
      throw err;
    }

    const rendered = await this.content.render(relativePath, raw);
    const title = this.docMeta.resolveText(
      rendered.frontmatter.title?.trim() || titleFromPath(relativePath),
    );
    const groupName = this.docMeta.resolveText(
      rendered.frontmatter.group?.trim() ||
        (await this.nav.getGroupName(relativePath)) ||
        "",
    ) || undefined;

    return {
      path: relativePath,
      title,
      description: rendered.frontmatter.description?.trim()
        ? this.docMeta.resolveText(rendered.frontmatter.description.trim())
        : undefined,
      groupName,
      html: rendered.html,
      headings: rendered.headings,
    };
  }

  resolveRequestedPath(rawPath?: string): string | undefined {
    const trimmed = rawPath?.trim();
    if (!trimmed) {
      return undefined;
    }

    const normalized = trimmed.replace(/^\//, "");
    if (path.basename(normalized) === normalized && !normalized.includes(".")) {
      return `${normalized}.md`;
    }

    return normalized;
  }
}
