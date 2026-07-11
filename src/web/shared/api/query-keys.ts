export const docsQueryKeys = {
  all: ["docs"] as const,
  site: () => [...docsQueryKeys.all, "site"] as const,
  nav: () => [...docsQueryKeys.all, "nav"] as const,
  page: (path?: string) => [...docsQueryKeys.all, "page", path ?? "index"] as const,
  search: (query: string) => [...docsQueryKeys.all, "search", query] as const,
};
