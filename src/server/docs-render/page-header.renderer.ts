import { Injectable } from "@nestjs/common";
import { escapeHtml } from "./utils/html.util";

export interface PageHeaderOptions {
  title: string;
  description?: string;
  groupName?: string;
}

@Injectable()
export class PageHeaderRenderer {
  render(options: PageHeaderOptions): string {
    const eyebrow = options.groupName
      ? `<p class="docs-page-eyebrow">${escapeHtml(options.groupName)}</p>`
      : "";
    const description = options.description
      ? `<p class="docs-page-description">${escapeHtml(options.description)}</p>`
      : "";

    return `<header class="docs-page-header">
      ${eyebrow}
      <h1>${escapeHtml(options.title)}</h1>
      ${description}
    </header>`;
  }
}
