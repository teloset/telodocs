import { Injectable } from "@nestjs/common";
import path from "node:path";
import { RenderedDoc } from "./types/doc-frontmatter.interface";
import { escapeHtml } from "./utils/html.util";
import { extractHeadings } from "./utils/headings.util";
import { splitFrontmatter } from "./utils/frontmatter.util";
import { MarkdownRenderService } from "./markdown-render.service";

@Injectable()
export class ContentRenderService {
  constructor(private readonly markdown: MarkdownRenderService) {}

  async render(relativePath: string, raw: string): Promise<RenderedDoc> {
    const ext = path.extname(relativePath).toLowerCase();

    if (ext === ".md" || ext === ".mdx") {
      const { frontmatter, body } = splitFrontmatter(raw);
      const html = await this.markdown.renderMarkdown(body);
      return { html, frontmatter, headings: extractHeadings(html) };
    }

    const html = await this.renderPlain(ext, raw);
    return { html, frontmatter: {}, headings: [] };
  }

  private async renderPlain(ext: string, raw: string): Promise<string> {
    switch (ext) {
      case ".txt":
        return `<pre class="doc-plaintext">${escapeHtml(raw)}</pre>`;
      case ".rst":
        return `<div class="doc-rst"><p class="doc-rst-note">ReStructuredText preview</p><pre class="doc-plaintext">${escapeHtml(raw)}</pre></div>`;
      default:
        return `<pre class="doc-plaintext">${escapeHtml(raw)}</pre>`;
    }
  }
}
