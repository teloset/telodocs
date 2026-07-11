import { NavItem } from "../docs-render/types/nav-item.interface";

export interface McpNavItem {
  name: string;
  path?: string;
  children?: McpNavItem[];
}

export function toMcpNav(items: NavItem[]): McpNavItem[] {
  return items.map((item) => ({
    name: item.name,
    ...(item.path ? { path: item.path } : {}),
    ...(item.children.length
      ? { children: toMcpNav(item.children) }
      : {}),
  }));
}
