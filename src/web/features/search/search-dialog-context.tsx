import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDocsSearchQuery } from "./queries/use-docs-search-query";
import "./search.css";

interface SearchDialogContextValue {
  isOpen: boolean;
  query: string;
  setQuery: (query: string) => void;
  open: () => void;
  close: () => void;
  dialogRef: RefObject<HTMLDialogElement | null>;
}

const SearchDialogContext = createContext<SearchDialogContextValue | null>(
  null,
);

function SearchDialogPanel() {
  const { isOpen, query, setQuery, close, dialogRef } = useSearchDialog();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchQuery = useDocsSearchQuery(query, isOpen);
  const results = searchQuery.data ?? [];

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }
    resultRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const selectResult = useCallback(
    (index: number) => {
      const hit = results[index];
      if (!hit) {
        return;
      }
      close();
      navigate(hit.href);
    },
    [close, navigate, results],
  );

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        index < 0 ? 0 : Math.min(index + 1, results.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? 0 : index - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectResult(activeIndex >= 0 ? activeIndex : 0);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="docs-search-dialog"
      aria-label="Search documentation"
      onClose={close}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          close();
        }
      }}
    >
      <form
        className="docs-search-panel"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="docs-search-input-wrap">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="docs-search-input"
            type="search"
            name="q"
            value={query}
            placeholder="Search documentation…"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleInputKeyDown}
          />
        </div>
        {searchQuery.isFetching ? (
          <p className="docs-search-loading">Searching…</p>
        ) : null}
        {!searchQuery.isFetching && query.trim() && !searchQuery.data?.length ? (
          <p className="docs-search-empty">No results found.</p>
        ) : null}
        <ul
          className="docs-search-results"
          role="listbox"
          aria-label="Search results"
          aria-activedescendant={
            activeIndex >= 0 ? `docs-search-result-${activeIndex}` : undefined
          }
        >
          {results.map((hit, index) => (
            <li key={`${hit.href}-${hit.title}`} role="presentation">
              <Link
                id={`docs-search-result-${index}`}
                to={hit.href}
                role="option"
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex ? "docs-search-result-active" : undefined
                }
                ref={(element) => {
                  resultRefs.current[index] = element;
                }}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={close}
              >
                <span className="docs-search-result-title">{hit.title}</span>
                <span className="docs-search-result-snippet">{hit.snippet}</span>
              </Link>
            </li>
          ))}
        </ul>
      </form>
    </dialog>
  );
}

export function SearchDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const open = useCallback(() => {
    setQuery("");
    setIsOpen(true);
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (!dialog.open) {
      dialog.showModal();
    }
    queueMicrotask(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>(".docs-search-input")
        ?.focus();
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const value = useMemo(
    () => ({ isOpen, query, setQuery, open, close, dialogRef }),
    [close, dialogRef, isOpen, open, query],
  );

  return (
    <SearchDialogContext.Provider value={value}>
      {children}
      <SearchDialogPanel />
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
