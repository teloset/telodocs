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
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDocsSearchQuery } from "./queries/use-docs-search-query";

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
    <CommandDialog
      open={isOpen}
      onOpenChange={setOpen}
      title="Search documentation"
      description="Search pages in this documentation site"
      className="top-[12vh] left-[50%] max-w-xl -translate-x-1/2 translate-y-0 sm:max-w-xl"
      showCloseButton
      shouldFilter={false}
    >
      <CommandInput
        placeholder="Search documentation…"
        value={query}
        onValueChange={setQuery}
      />
      {searchQuery.isFetching ? (
        <p className="px-4 py-2 text-sm text-muted-foreground">Searching…</p>
      ) : null}
      <CommandList>
        <CommandEmpty>
          {query.trim() ? "No results found." : "Type to search documentation."}
        </CommandEmpty>
        {results.map((hit) => (
          <CommandItem
            key={`${hit.href}-${hit.title}`}
            value={`${hit.title} ${hit.snippet} ${hit.href}`}
            onSelect={() => {
              close();
              navigate(hit.href);
            }}
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium">{hit.title}</span>
              <span className="truncate text-xs text-muted-foreground">
                {hit.snippet}
              </span>
            </div>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
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
