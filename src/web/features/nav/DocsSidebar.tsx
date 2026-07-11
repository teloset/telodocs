import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useDocsShell } from "../../app/docs-shell-context";
import type { NavItem } from "../../shared/types/docs";
import { useActiveDocPath } from "../docs/hooks/use-doc-path";
import "./nav.css";

interface DocsSidebarProps {
  nav: NavItem[];
}

function containsActive(nodes: NavItem[], activePath: string): boolean {
  return nodes.some(
    (node) =>
      node.path === activePath ||
      (node.path && activePath.startsWith(`${node.path}/`)) ||
      containsActive(node.children, activePath),
  );
}

function folderIsActive(node: NavItem, activePath: string): boolean {
  return (
    node.path === activePath ||
    Boolean(node.path && activePath.startsWith(`${node.path}/`)) ||
    containsActive(node.children, activePath)
  );
}

function NavLevel({
  nodes,
  depth,
  activePath,
  onNavigate,
}: {
  nodes: NavItem[];
  depth: number;
  activePath: string;
  onNavigate: () => void;
}) {
  return (
    <ul className="docs-nav-level" data-depth={depth}>
      {nodes.map((node) => (
        <NavNode
          key={`${node.name}-${node.path}-${depth}`}
          node={node}
          depth={depth}
          activePath={activePath}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}

function NavNode({
  node,
  depth,
  activePath,
  onNavigate,
}: {
  node: NavItem;
  depth: number;
  activePath: string;
  onNavigate: () => void;
}) {
  const isFolder = node.children.length > 0 && !node.path;
  const branchActive = isFolder && folderIsActive(node, activePath);
  const [override, setOverride] = useState<{
    open: boolean;
    forPath: string;
  } | null>(null);
  const open =
    override?.forPath === activePath ? override.open : branchActive;

  if (node.isGroup) {
    return (
      <li className="docs-nav-section">
        <h5 className="docs-nav-group-title">{node.name}</h5>
        <NavLevel
          nodes={node.children}
          depth={depth + 1}
          activePath={activePath}
          onNavigate={onNavigate}
        />
      </li>
    );
  }

  if (isFolder) {
    return (
      <li className={`docs-nav-folder${open ? " is-open" : ""}`}>
        <button
          type="button"
          className="docs-nav-folder-toggle"
          aria-expanded={open}
          onClick={() =>
            setOverride({ open: !open, forPath: activePath })
          }
        >
          <span className="docs-nav-chevron" aria-hidden="true" />
          <span>{node.name}</span>
        </button>
        <NavLevel
          nodes={node.children}
          depth={depth + 1}
          activePath={activePath}
          onNavigate={onNavigate}
        />
      </li>
    );
  }

  const href = node.href ?? (node.path ? `/docs/${node.path}` : "/");
  return (
    <li className="docs-nav-item">
      <NavLink
        className={({ isActive }) =>
          isActive ? "docs-nav-link is-active" : "docs-nav-link"
        }
        to={href}
        end={href === "/"}
        onClick={onNavigate}
      >
        {node.name}
      </NavLink>
    </li>
  );
}

export function DocsSidebar({ nav }: DocsSidebarProps) {
  const { closeSidebar } = useDocsShell();
  const activePath = useActiveDocPath();

  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <nav className="docs-nav" aria-label="Documentation">
        <NavLevel
          nodes={nav}
          depth={0}
          activePath={activePath}
          onNavigate={closeSidebar}
        />
      </nav>
    </aside>
  );
}
