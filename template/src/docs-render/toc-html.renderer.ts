import { Injectable } from "@nestjs/common";
import { TocHeading } from "./types/doc-frontmatter.interface";
import { escapeHtml } from "./utils/html.util";

@Injectable()
export class TocHtmlRenderer {
  render(headings: TocHeading[]): string {
    const items = headings.filter((heading) => heading.level >= 2);
    if (!items.length) {
      return "";
    }

    const links = items
      .map(
        (heading) =>
          `<li class="docs-toc-item docs-toc-h${heading.level}"><a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`,
      )
      .join("");

    return `<aside class="docs-toc" aria-label="On this page">
      <p class="docs-toc-title">On this page</p>
      <ul class="docs-toc-list">${links}</ul>
    </aside>`;
  }
}
