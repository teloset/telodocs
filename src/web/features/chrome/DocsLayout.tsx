import { Outlet } from "react-router-dom";
import { useDocsShell } from "../../app/docs-shell-context";
import { DocumentHead } from "../../shared/components/DocumentHead";
import { useDocPathFromRoute } from "../docs/hooks/use-doc-path";
import { useDocPageQuery } from "../docs/queries/use-doc-page-query";
import { useDocsNavQuery } from "../docs/queries/use-docs-nav-query";
import { useDocsSiteQuery } from "../docs/queries/use-docs-site-query";
import { DocsSidebar } from "../nav/DocsSidebar";
import { TocColumn } from "../toc/TocColumn";
import { Topbar } from "./Topbar";
import "./chrome.css";

export function DocsLayout() {
  const { sidebarOpen, closeSidebar } = useDocsShell();
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
      <div className="docs-status">
        {fatalError instanceof Error ? fatalError.message : "Failed to load docs"}
      </div>
    );
  }

  return (
    <div className={`docs-app${sidebarOpen ? " docs-sidebar-open" : ""}`}>
      <DocumentHead faviconUrl={site?.faviconUrl} />
      <Topbar site={site} />
      <div className={`docs-shell${hasToc ? " has-toc" : ""}`}>
        <DocsSidebar nav={nav} />
        <main className="docs-main">
          <div className="docs-content">
            <Outlet />
          </div>
        </main>
        {hasToc ? <TocColumn headings={headings} /> : null}
      </div>
      {sidebarOpen ? (
        <div
          className="docs-sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
