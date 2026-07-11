import { Link } from "react-router-dom";
import { useDocsShell } from "../../app/docs-shell-context";
import type { SiteBranding } from "../../shared/types/docs";
import { SearchTrigger } from "../search/SearchTrigger";
import "./chrome.css";

interface TopbarProps {
  site?: SiteBranding;
}

export function Topbar({ site }: TopbarProps) {
  const { toggleSidebar, sidebarOpen } = useDocsShell();
  const siteName = site?.siteName ?? "Documentation";

  return (
    <header className="docs-topbar">
      <div className="docs-topbar-start">
        <button
          type="button"
          className="docs-sidebar-toggle"
          aria-label="Open navigation"
          aria-expanded={sidebarOpen}
          onClick={toggleSidebar}
        >
          <span className="docs-sidebar-toggle-bar" />
          <span className="docs-sidebar-toggle-bar" />
          <span className="docs-sidebar-toggle-bar" />
        </button>
        <Link className="docs-brand" to="/">
          {site?.logoUrl ? (
            <img className="docs-brand-logo" src={site.logoUrl} alt="" />
          ) : (
            <span className="docs-brand-mark" aria-hidden="true" />
          )}
          <span className="docs-brand-text">{siteName}</span>
        </Link>
      </div>
      <div className="docs-topbar-center">
        <SearchTrigger />
      </div>
      <div className="docs-topbar-actions" />
    </header>
  );
}
