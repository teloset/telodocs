import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDocsShell } from "../../app/docs-shell-context";
import type { NavItem } from "../../shared/types/docs";
import { docPathsMatch } from "../../shared/utils/doc-path";
import { useActiveDocPath } from "../docs/hooks/use-doc-path";
import "./nav.css";

interface DocsSidebarProps {
  nav: NavItem[];
}

function containsActive(nodes: NavItem[], activePath: string): boolean {
  return nodes.some(
    (node) =>
      docPathsMatch(activePath, node.path) ||
      (node.path && activePath.startsWith(`${node.path}/`)) ||
      containsActive(node.children, activePath),
  );
}

function branchIsActive(node: NavItem, activePath: string): boolean {
  return (
    docPathsMatch(activePath, node.path) ||
    Boolean(node.path && activePath.startsWith(`${node.path}/`)) ||
    containsActive(node.children, activePath)
  );
}

function isCollapsibleBranch(node: NavItem): boolean {
  return node.children.length > 0 && (node.isGroup || !node.path);
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
  const { pathname } = useLocation();

  if (isCollapsibleBranch(node)) {
    return (
      <CollapsibleBranch
        node={node}
        depth={depth}
        activePath={activePath}
        onNavigate={onNavigate}
      />
    );
  }

  const href = node.href ?? (node.path ? `/docs/${node.path}` : "/");
  const isActiveLink =
    href === "/"
      ? pathname === "/"
      : docPathsMatch(activePath, node.path);

  return (
    <li className="docs-nav-item">
      <NavLink
        className={isActiveLink ? "docs-nav-link is-active" : "docs-nav-link"}
        to={href}
        end={href === "/"}
        onClick={onNavigate}
      >
        {node.name}
      </NavLink>
    </li>
  );
}

function CollapsibleBranch({
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
  const branchActive = branchIsActive(node, activePath);
  const [override, setOverride] = useState<{
    open: boolean;
    forPath: string;
  } | null>(null);
  const defaultOpen = branchActive || node.defaultExpanded === true;
  const open =
    override?.forPath === activePath ? override.open : defaultOpen;

  const toggle = () =>
    setOverride({ open: !open, forPath: activePath });

  return (
    <li
      className={`docs-nav-branch${node.isGroup ? " docs-nav-group" : ""}${open ? " is-open" : ""}`}
      data-depth={depth}
    >
      <div className="docs-nav-branch-header">
        <button
          type="button"
          className="docs-nav-branch-toggle"
          aria-expanded={open}
          aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
          onClick={toggle}
        >
          <span className="docs-nav-chevron" aria-hidden="true" />
        </button>
        {node.href ? (
          <NavLink
            className="docs-nav-branch-label docs-nav-link"
            to={node.href}
            onClick={onNavigate}
          >
            {node.name}
          </NavLink>
        ) : (
          <button
            type="button"
            className="docs-nav-branch-label"
            onClick={toggle}
          >
            {node.name}
          </button>
        )}
      </div>
      <NavLevel
        nodes={node.children}
        depth={depth + 1}
        activePath={activePath}
        onNavigate={onNavigate}
      />
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
