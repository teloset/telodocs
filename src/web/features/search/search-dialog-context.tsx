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
}: {
  query: string;
  setQuery: (query: string) => void;
}) {
  const { isOpen, close } = useSearchDialog();
  const navigate = useNavigate();
  const searchQuery = useDocsSearchQuery(query, isOpen);
  const results = searchQuery.data ?? [];

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      label="Search documentation"
      className="docs-search-dialog"
      shouldFilter={false}
    >
      <div className="docs-search-input-wrap">
        <span aria-hidden="true">⌕</span>
        <Command.Input
          className="docs-search-input"
          placeholder="Search documentation…"
          value={query}
          onValueChange={setQuery}
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

  const open = useCallback(() => {
    setQuery("");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useHotkeys(
    "mod+k",
    (event) => {
      event.preventDefault();
      setIsOpen((open) => {
        if (open) {
          setQuery("");
        }
        return !open;
      });
    },
    { enableOnFormTags: true },
  );

  const value = useMemo(
    () => ({ isOpen, open, close }),
    [close, isOpen, open],
  );

  return (
    <SearchDialogContext.Provider value={value}>
      {children}
      <SearchDialogPanel query={query} setQuery={setQuery} />
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
