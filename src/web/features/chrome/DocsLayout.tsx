import { Outlet } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDocsShell } from "../../app/docs-shell-context";
import { DocumentHead } from "../../shared/components/DocumentHead";
import { useDocPathFromRoute } from "../docs/hooks/use-doc-path";
import { useDocPageQuery } from "../docs/queries/use-doc-page-query";
import { useDocsNavQuery } from "../docs/queries/use-docs-nav-query";
import { useDocsSiteQuery } from "../docs/queries/use-docs-site-query";
import { DocsSidebar } from "../nav/DocsSidebar";
import { SidebarNav } from "../nav/SidebarNav";
import { TocColumn } from "../toc/TocColumn";
import { Topbar } from "./Topbar";

export function DocsLayout() {
  const { sidebarOpen, closeSidebar, toggleSidebar, setSidebarOpen } =
    useDocsShell();
  const docPath = useDocPathFromRoute();
  const siteQuery = useDocsSiteQuery();
  const navQuery = useDocsNavQuery();
  const pageQuery = useDocPageQuery(docPath);

  const site = siteQuery.data;
  const nav = navQuery.data ?? [];
  const headings = pageQuery.data?.headings ?? [];
  const hasToc = headings.some((heading) => heading.level >= 2);
  const fatalError = siteQuery.error ?? navQuery.error;

  if (fatalError) {
    return (
      <Alert variant="destructive" className="m-8 max-w-lg">
        <AlertTitle>Failed to load documentation</AlertTitle>
        <AlertDescription>
          {fatalError instanceof Error ? fatalError.message : "Unknown error"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DocumentHead faviconUrl={site?.faviconUrl} />
      <Topbar site={site} onMenuClick={toggleSidebar} />
      <div
        className={
          hasToc
            ? "grid min-h-[calc(100vh-3.5rem)] grid-cols-1 xl:grid-cols-[17.5rem_minmax(0,1fr)_14rem]"
            : "grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)]"
        }
      >
        <DocsSidebar nav={nav} />
        <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <Outlet />
          </div>
        </main>
        {hasToc ? <TocColumn headings={headings} /> : null}
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[min(88vw,17.5rem)] p-0 lg:hidden">
          <SheetHeader className="border-b px-4 py-3 text-left">
            <SheetTitle className="text-sm">Navigation</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <SidebarNav nav={nav} onNavigate={closeSidebar} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
