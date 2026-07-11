import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { NavItem } from "../../shared/types/docs";
import { docPathsMatch } from "../../shared/utils/doc-path";
import { useActiveDocPath } from "../docs/hooks/use-doc-path";

interface SidebarNavProps {
  nav: NavItem[];
  onNavigate?: () => void;
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

const linkClassName =
  "flex min-h-8 flex-1 items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground";

function NavLevel({
  nodes,
  depth,
  activePath,
  onNavigate,
}: {
  nodes: NavItem[];
  depth: number;
  activePath: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className={cn("space-y-0.5", depth > 0 && "ml-2 border-l pl-2")}>
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
  onNavigate?: () => void;
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
    href === "/" ? pathname === "/" : docPathsMatch(activePath, node.path);

  return (
    <li>
      <NavLink
        className={cn(
          linkClassName,
          isActiveLink &&
            "border-l-2 border-primary bg-accent font-medium text-primary",
        )}
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
  onNavigate?: () => void;
}) {
  const branchActive = branchIsActive(node, activePath);
  const [override, setOverride] = useState<{
    open: boolean;
    forPath: string;
  } | null>(null);
  const defaultOpen = branchActive || node.defaultExpanded === true;
  const open =
    override?.forPath === activePath ? override.open : defaultOpen;

  const setOpen = (next: boolean) =>
    setOverride({ open: next, forPath: activePath });

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-stretch gap-0.5">
          <CollapsibleTrigger
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform",
                open && "rotate-90",
              )}
            />
          </CollapsibleTrigger>
          {node.href ? (
            <NavLink
              className={cn(linkClassName, branchActive && "font-medium text-foreground")}
              to={node.href}
              onClick={onNavigate}
            >
              {node.name}
            </NavLink>
          ) : (
            <CollapsibleTrigger
              className={cn(
                linkClassName,
                "font-medium",
                depth === 0 && "text-sm font-semibold text-foreground",
              )}
            >
              {node.name}
            </CollapsibleTrigger>
          )}
        </div>
        <CollapsibleContent className="pt-0.5">
          <NavLevel
            nodes={node.children}
            depth={depth + 1}
            activePath={activePath}
            onNavigate={onNavigate}
          />
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

export function SidebarNav({ nav, onNavigate }: SidebarNavProps) {
  const activePath = useActiveDocPath();

  return (
    <nav aria-label="Documentation" className="px-3 py-4">
      <NavLevel
        nodes={nav}
        depth={0}
        activePath={activePath}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
