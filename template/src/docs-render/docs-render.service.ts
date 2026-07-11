import { Injectable } from "@nestjs/common";
import fs from "node:fs/promises";
import { SearchService } from "../search/search.service";
import { ContentRenderService } from "./content-render.service";
import { DocMetaService } from "./doc-meta.service";
import { DocsConfigService } from "./docs-config.service";
import { DocsNavService } from "./docs-nav.service";
import { LayoutService } from "./layout.service";
import { PageHeaderRenderer } from "./page-header.renderer";
import { TocHtmlRenderer } from "./toc-html.renderer";
import { escapeHtml } from "./utils/html.util";
import { titleFromPath } from "./utils/title.util";

@Injectable()
export class DocsRenderService {
  constructor(
    private readonly search: SearchService,
    private readonly nav: DocsNavService,
    private readonly config: DocsConfigService,
    private readonly docMeta: DocMetaService,
    private readonly content: ContentRenderService,
    private readonly layout: LayoutService,
    private readonly pageHeader: PageHeaderRenderer,
    private readonly toc: TocHtmlRenderer,
  ) {}

  async renderIndex(): Promise<string> {
    const indexFile = (await this.search.listDocFiles()).find((file) =>
      /(^|\/)index\.mdx?$/i.test(file),
    );

    if (indexFile) {
      return this.renderPage(indexFile);
    }

    const nav = await this.nav.getTree();
    const branding = await this.config.getBranding();
    const body = `<section class="docs-empty-home">
      <h1>${escapeHtml(branding.siteName)}</h1>
      <p>Add <code>docs/index.md</code> or create pages under <code>docs/</code>.</p>
    </section>`;

    return this.layout.renderPage({
      title: branding.siteName,
      activePath: "",
      bodyHtml: body,
      nav,
      ...branding,
    });
  }

  async renderPage(relativePath: string): Promise<string> {
    const safePath = this.search.resolveSafePath(relativePath);
    const raw = await fs.readFile(safePath, "utf-8");
    const rendered = await this.content.render(relativePath, raw);
    const nav = await this.nav.getTree();
    const branding = await this.config.getBranding();

    const title = this.docMeta.resolveText(
      rendered.frontmatter.title?.trim() || titleFromPath(relativePath),
    );
    const groupName = this.docMeta.resolveText(
      rendered.frontmatter.group?.trim() ||
        (await this.nav.getGroupName(relativePath)) ||
        "",
    ) || undefined;

    const header = this.pageHeader.render({
      title,
      description: rendered.frontmatter.description?.trim()
        ? this.docMeta.resolveText(rendered.frontmatter.description.trim())
        : undefined,
      groupName,
    });

    const body = `${header}<article class="doc-prose">${rendered.html}</article>`;
    const tocHtml = this.toc.render(rendered.headings);

    return this.layout.renderPage({
      title,
      activePath: relativePath,
      bodyHtml: body,
      nav,
      tocHtml,
      ...branding,
    });
  }
}
