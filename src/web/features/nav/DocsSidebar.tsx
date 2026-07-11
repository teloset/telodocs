import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavItem } from "../../shared/types/docs";
import { SidebarNav } from "./SidebarNav";

interface DocsSidebarProps {
  nav: NavItem[];
}

export function DocsSidebar({ nav }: DocsSidebarProps) {
  return (
    <aside
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] border-r bg-sidebar lg:block"
      aria-label="Documentation navigation"
    >
      <ScrollArea className="h-full">
        <SidebarNav nav={nav} />
      </ScrollArea>
    </aside>
  );
}
