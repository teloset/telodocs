import { NavItem } from "../types/nav-item.interface";
import { titleFromPath } from "../utils/title.util";

export function buildFileNav(files: string[]): NavItem[] {
  const root: NavItem[] = [];

  for (const file of files) {
    const parts = file.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      const isFile = i === parts.length - 1;
      const nodePath = parts.slice(0, i + 1).join("/");
      let node = current.find((entry) => entry.name === part);

      if (!node) {
        node = {
          name: isFile ? titleFromPath(part) : part,
          path: isFile ? nodePath : "",
          children: [],
        };
        current.push(node);
      }

      if (isFile) {
        node.path = nodePath;
      } else {
        current = node.children;
      }
    }
  }

  sortFileNav(root);
  return root;
}

function sortFileNav(items: NavItem[]) {
  items.sort((a, b) => {
    const aIsFolder = a.children.length > 0 && !a.path;
    const bIsFolder = b.children.length > 0 && !b.path;
    if (aIsFolder !== bIsFolder) {
      return aIsFolder ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  for (const item of items) {
    if (item.children.length) {
      sortFileNav(item.children);
    }
  }
}
