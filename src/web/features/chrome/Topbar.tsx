import { Menu, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { McpIcon } from "@/shared/components/McpIcon";
import type { SiteBranding } from "../../shared/types/docs";
import { useSearchDialog } from "../search/search-dialog-context";
import { ThemeToggle } from "./ThemeToggle";

interface TopbarProps {
  site?: SiteBranding;
  onMenuClick?: () => void;
}

export function Topbar({ site, onMenuClick }: TopbarProps) {
  const { open } = useSearchDialog();
  const siteName = site?.siteName ?? "Documentation";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
          onClick={onMenuClick}
        >
          <Menu className="size-4" />
        </Button>
        <Link
          className="inline-flex min-w-0 items-center gap-2.5 font-semibold text-foreground no-underline"
          to="/"
        >
          {site?.logoUrl ? (
            <img
              className="size-6 shrink-0 object-contain"
              src={site.logoUrl}
              alt=""
            />
          ) : (
            <McpIcon className="size-6 shrink-0 text-foreground" />
          )}
          <span className="truncate text-sm">{siteName}</span>
        </Link>
      </div>

      <div className="hidden max-w-md flex-1 md:block">
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-start gap-2 px-3 text-muted-foreground"
          aria-haspopup="dialog"
          onClick={open}
        >
          <Search className="size-4 shrink-0 opacity-60" />
          <span className="flex-1 text-left text-sm">Search docs…</span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            ⌘K
          </Badge>
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="md:hidden"
          aria-label="Search documentation"
          onClick={open}
        >
          <Search className="size-4" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
