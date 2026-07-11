import { Command } from "cmdk";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useDocsSearchQuery } from "./queries/use-docs-search-query";
import "./search.css";

interface SearchDialogContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const SearchDialogContext = createContext<SearchDialogContextValue | null>(
  null,
);

function SearchDialogPanel({
  query,
  setQuery,
  isOpen,
  setOpen,
}: {
  query: string;
  setQuery: (query: string) => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const close = useCallback(() => setOpen(false), [setOpen]);
  const navigate = useNavigate();
  const searchQuery = useDocsSearchQuery(query, isOpen);
  const results = searchQuery.data ?? [];

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={setOpen}
      label="Search documentation"
      overlayClassName="docs-search-overlay"
      contentClassName="docs-search-dialog"
      shouldFilter={false}
    >
      <div className="docs-search-input-wrap">
        <span aria-hidden="true">⌕</span>
        <Command.Input
          className="docs-search-input"
          placeholder="Search documentation…"
          value={query}
          onValueChange={setQuery}
          autoFocus
        />
      </div>
      {searchQuery.isFetching ? (
        <p className="docs-search-loading">Searching…</p>
      ) : null}
      <Command.List className="docs-search-results">
        <Command.Empty className="docs-search-empty">
          {query.trim() ? "No results found." : "Type to search documentation."}
        </Command.Empty>
        {results.map((hit) => (
          <Command.Item
            key={`${hit.href}-${hit.title}`}
            value={`${hit.title} ${hit.snippet} ${hit.href}`}
            className="docs-search-result"
            onSelect={() => {
              close();
              navigate(hit.href);
            }}
          >
            <span className="docs-search-result-title">{hit.title}</span>
            <span className="docs-search-result-snippet">{hit.snippet}</span>
          </Command.Item>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}

export function SearchDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuery("");
    }
  }, []);

  const open = useCallback(() => {
    setQuery("");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useHotkeys(
    "mod+k",
    (event) => {
      event.preventDefault();
      if (isOpen) {
        close();
      } else {
        open();
      }
    },
    { enableOnFormTags: true },
    [close, isOpen, open],
  );

  const value = useMemo(
    () => ({ isOpen, open, close }),
    [close, isOpen, open],
  );

  return (
    <SearchDialogContext.Provider value={value}>
      {children}
      <SearchDialogPanel
        query={query}
        setQuery={setQuery}
        isOpen={isOpen}
        setOpen={setOpen}
      />
    </SearchDialogContext.Provider>
  );
}

export function useSearchDialog(): SearchDialogContextValue {
  const value = useContext(SearchDialogContext);
  if (!value) {
    throw new Error("useSearchDialog must be used within SearchDialogProvider");
  }
  return value;
}
