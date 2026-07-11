import { Injectable } from "@nestjs/common";
import { NavItem } from "./types/nav-item.interface";
import { escapeHtml } from "./utils/html.util";
import { formatLabel } from "./utils/title.util";
import { pageHref } from "./utils/page-slug.util";

@Injectable()
export class NavHtmlRenderer {
  render(items: NavItem[], activePath: string): string {
    return `<nav class="docs-nav" aria-label="Documentation">${this.renderLevel(items, activePath, 0)}</nav>`;
  }

  private renderLevel(
    nodes: NavItem[],
    activePath: string,
    depth: number,
  ): string {
    return `<ul class="docs-nav-level" data-depth="${depth}">${nodes
      .map((node) => this.renderNode(node, activePath, depth))
      .join("")}</ul>`;
  }

  private renderNode(
    node: NavItem,
    activePath: string,
    depth: number,
  ): string {
    if (node.isGroup) {
      return `<li class="docs-nav-section">
        <h5 class="docs-nav-group-title">${escapeHtml(formatLabel(node.name))}</h5>
        ${this.renderLevel(node.children, activePath, depth + 1)}
      </li>`;
    }

    const isFolder = node.children.length > 0 && !node.path;
    const isActive = node.path === activePath;
    const branchOpen =
      isFolder &&
      (isActive ||
        activePath.startsWith(`${node.path}/`) ||
        this.containsActive(node.children, activePath));

    if (isFolder) {
      return `<li class="docs-nav-folder${branchOpen ? " is-open" : ""}">
        <button type="button" class="docs-nav-folder-toggle" aria-expanded="${branchOpen}">
          <span class="docs-nav-chevron" aria-hidden="true"></span>
          <span>${escapeHtml(formatLabel(node.name))}</span>
        </button>
        ${this.renderLevel(node.children, activePath, depth + 1)}
      </li>`;
    }

    const href = node.href ?? pageHref(node.path);
    const className = isActive ? "docs-nav-link is-active" : "docs-nav-link";
    return `<li class="docs-nav-item"><a class="${className}" href="${href}">${escapeHtml(node.name)}</a></li>`;
  }

  private containsActive(nodes: NavItem[], activePath: string): boolean {
    return nodes.some(
      (node) =>
        node.path === activePath ||
        (node.path && activePath.startsWith(`${node.path}/`)) ||
        this.containsActive(node.children, activePath),
    );
  }
}
