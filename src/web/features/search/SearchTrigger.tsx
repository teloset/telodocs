import { useSearchDialog } from "./search-dialog-context";
import "./search.css";

export function SearchTrigger() {
  const { open } = useSearchDialog();

  return (
    <button
      type="button"
      className="docs-search-trigger"
      aria-haspopup="dialog"
      onClick={open}
    >
      <span className="docs-search-trigger-icon" aria-hidden="true">
        ⌕
      </span>
      <span className="docs-search-trigger-label">Search docs…</span>
      <kbd className="docs-search-kbd">⌘K</kbd>
    </button>
  );
}
