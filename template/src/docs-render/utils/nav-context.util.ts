import { NavItem } from "../types/nav-item.interface";
import { formatLabel } from "./title.util";

export function findGroupName(
  nav: NavItem[],
  activePath: string,
): string | null {
  for (const item of nav) {
    if (
      item.isGroup &&
      item.children.some((child) => child.path === activePath)
    ) {
      return formatLabel(item.name);
    }

    const nested = findGroupName(item.children, activePath);
    if (nested) {
      return nested;
    }
  }

  return null;
}
