import type {
  DocPage,
  DocsSearchHit,
  NavItem,
  SiteBranding,
} from "../types/docs";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

export function fetchSite(): Promise<SiteBranding> {
  return getJson<SiteBranding>("/api/docs/site");
}

export function fetchNav(): Promise<{ items: NavItem[] }> {
  return getJson<{ items: NavItem[] }>("/api/docs/nav");
}

export function fetchPage(docPath?: string): Promise<DocPage> {
  const url = docPath
    ? `/api/docs/page?path=${encodeURIComponent(docPath)}`
    : "/api/docs/page";
  return getJson<DocPage>(url);
}

export function fetchSearch(query: string): Promise<{ results: DocsSearchHit[] }> {
  return getJson<{ results: DocsSearchHit[] }>(
    `/api/docs/search?q=${encodeURIComponent(query)}`,
  );
}
