import { Injectable, Inject } from "@nestjs/common";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import hljs from "highlight.js";
import { TELODOCS_CONFIG, TelodocsConfig } from "../core/config/telodocs-config.schema";
import { SearchService } from "../search/search.service";

export interface NavItem {
  name: string;
  path: string;
  children: NavItem[];
}

marked.use(gfmHeadingId());
marked.setOptions({
  gfm: true,
  breaks: false,
});

marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

@Injectable()
export class DocsRenderService {
  private navCache: { items: NavItem[]; expiresAt: number } | null = null;
  private readonly navTtlMs = 30_000;

  constructor(
    @Inject(TELODOCS_CONFIG) private readonly config: TelodocsConfig,
    private readonly search: SearchService,
  ) {}

  async getNavTree(): Promise<NavItem[]> {
    if (this.navCache && this.navCache.expiresAt > Date.now()) {
      return this.navCache.items;
    }

    const files = await this.search.listDocFiles();
    const items = this.buildNavTree(files);
    this.navCache = { items, expiresAt: Date.now() + this.navTtlMs };
    return items;
  }

  async renderPage(relativePath: string): Promise<string> {
    const safePath = this.search.resolveSafePath(relativePath);
    const raw = await fs.readFile(safePath, "utf-8");
    const html = await marked.parse(raw);
    const nav = await this.getNavTree();
    const title = this.titleFromPath(relativePath);
    return this.wrapLayout(title, relativePath, html, nav);
  }

  async renderIndex(): Promise<string> {
    const files = await this.search.listDocFiles();
    const indexFile = files.find((f) => /(^|\/)index\.mdx?$/i.test(f));
    if (indexFile) {
      return this.renderPage(indexFile);
    }

    const nav = await this.getNavTree();
    const links = files
      .map(
        (f) =>
          `<li><a href="/docs/${encodeURI(f)}">${this.titleFromPath(f)}</a></li>`,
      )
      .join("\n");

    const body = `<h1>Documentation</h1><p>Select a document:</p><ul>${links}</ul>`;
    return this.wrapLayout("Documentation", "", body, nav);
  }

  private buildNavTree(files: string[]): NavItem[] {
    const root: NavItem[] = [];

    for (const file of files) {
      const parts = file.split("/");
      let current = root;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]!;
        const isFile = i === parts.length - 1;
        const nodePath = parts.slice(0, i + 1).join("/");
        let existing = current.find((n) => n.name === part);

        if (!existing) {
          existing = {
            name: isFile ? this.titleFromPath(part) : part,
            path: isFile ? nodePath : "",
            children: [],
          };
          current.push(existing);
        }

        if (isFile) {
          existing.path = nodePath;
        } else {
          current = existing.children;
        }
      }
    }

    this.sortNav(root);
    return root;
  }

  private sortNav(items: NavItem[]) {
    items.sort((a, b) => a.name.localeCompare(b.name));
    for (const item of items) {
      if (item.children.length) {
        this.sortNav(item.children);
      }
    }
  }

  private titleFromPath(filePath: string): string {
    const base = path.basename(filePath, path.extname(filePath));
    if (base.toLowerCase() === "index") {
      const parent = path.dirname(filePath);
      return parent === "." ? "Home" : parent;
    }
    return base.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private renderNav(items: NavItem[], activePath: string): string {
    const renderItems = (nodes: NavItem[]): string =>
      nodes
        .map((node) => {
          const isActive = node.path === activePath;
          const link = node.path
            ? `<a href="/docs/${encodeURI(node.path)}" class="${isActive ? "active" : ""}">${this.escapeHtml(node.name)}</a>`
            : `<span class="folder">${this.escapeHtml(node.name)}</span>`;
          const children =
            node.children.length > 0
              ? `<ul>${renderItems(node.children)}</ul>`
              : "";
          return `<li>${link}${children}</li>`;
        })
        .join("");

    return `<ul class="nav-tree">${renderItems(items)}</ul>`;
  }

  private wrapLayout(
    title: string,
    activePath: string,
    bodyHtml: string,
    nav: NavItem[],
  ): string {
    const navHtml = this.renderNav(nav, activePath);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${this.escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css" />
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fafafa;
    }
    .layout { display: flex; min-height: 100vh; }
    aside {
      width: 280px;
      background: #fff;
      border-right: 1px solid #e5e5e5;
      padding: 1.5rem 1rem;
      overflow-y: auto;
      flex-shrink: 0;
    }
    aside h2 { margin: 0 0 1rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; color: #666; }
    .nav-tree { list-style: none; padding: 0; margin: 0; }
    .nav-tree ul { list-style: none; padding-left: 1rem; margin: 0.25rem 0; }
    .nav-tree a, .nav-tree .folder { display: block; padding: 0.25rem 0; font-size: 0.9rem; text-decoration: none; color: #333; }
    .nav-tree a:hover { color: #0066cc; }
    .nav-tree a.active { font-weight: 600; color: #0066cc; }
    .nav-tree .folder { color: #666; font-weight: 500; }
    main {
      flex: 1;
      padding: 2rem 3rem;
      max-width: 52rem;
    }
    main h1 { margin-top: 0; }
    pre { background: #f6f8fa; padding: 1rem; overflow-x: auto; border-radius: 6px; }
    code { font-family: ui-monospace, monospace; font-size: 0.9em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem 0.75rem; text-align: left; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #555; }
  </style>
</head>
<body>
  <div class="layout">
    <aside>
      <h2><a href="/" style="color:inherit;text-decoration:none;">Docs</a></h2>
      ${navHtml}
    </aside>
    <main>${bodyHtml}</main>
  </div>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
