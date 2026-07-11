import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { NavItem } from "./types/nav-item.interface";
import { escapeHtml } from "./utils/html.util";
import { NavHtmlRenderer } from "./nav-html.renderer";

export interface PageLayoutOptions {
  title: string;
  activePath: string;
  bodyHtml: string;
  nav: NavItem[];
  tocHtml?: string;
  siteName?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

const STYLESHEETS = ["docs-shell.css", "docs-prose.css", "docs-toc.css"];

@Injectable()
export class LayoutService {
  private readonly stylesheets = new Map<string, string>();

  constructor(private readonly navHtml: NavHtmlRenderer) {
    for (const name of STYLESHEETS) {
      this.stylesheets.set(name, this.loadAsset(name));
    }
  }

  getStylesheet(name: string): string {
    const sheet = this.stylesheets.get(name);
    if (!sheet) {
      throw new Error(`Unknown stylesheet: ${name}`);
    }
    return sheet;
  }

  renderPage(options: PageLayoutOptions): string {
    const navHtml = this.navHtml.render(options.nav, options.activePath);
    const siteName = options.siteName ?? "Documentation";
    const styles = STYLESHEETS.map(
      (name) => `<link rel="stylesheet" href="/assets/${name}" />`,
    ).join("\n  ");
    const tocColumn = options.tocHtml ?? "";
    const favicon = options.faviconUrl
      ? `<link rel="icon" type="${this.faviconType(options.faviconUrl)}" href="${escapeHtml(options.faviconUrl)}" />`
      : "";
    const brandMark = options.logoUrl
      ? `<img class="docs-brand-logo" src="${escapeHtml(options.logoUrl)}" alt="" />`
      : `<span class="docs-brand-mark" aria-hidden="true"></span>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(options.title)} · ${escapeHtml(siteName)}</title>
  ${favicon}
  ${styles}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css" />
</head>
<body class="docs-body">
  <header class="docs-topbar">
    <a class="docs-brand" href="/">
      ${brandMark}
      <span class="docs-brand-text">${escapeHtml(siteName)}</span>
    </a>
    <div class="docs-topbar-actions">
      <a class="docs-topbar-link" href="/">Home</a>
    </div>
  </header>
  <div class="docs-shell${tocColumn ? " has-toc" : ""}">
    <aside class="docs-sidebar">
      <div class="docs-sidebar-header">On this site</div>
      ${navHtml}
    </aside>
    <main class="docs-main">${options.bodyHtml}</main>
    ${tocColumn}
  </div>
  <script src="/assets/docs.js" defer></script>
</body>
</html>`;
  }

  private faviconType(url: string): string {
    return url.toLowerCase().endsWith(".svg")
      ? "image/svg+xml"
      : "image/x-icon";
  }

  private loadAsset(name: string): string {
    const candidates = [
      path.join(__dirname, "assets", name),
      path.join(process.cwd(), "src/docs-render/assets", name),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, "utf-8");
      }
    }

    throw new Error(`Docs asset not found: ${name}`);
  }
}
