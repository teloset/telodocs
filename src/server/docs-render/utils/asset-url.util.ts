export function toDocsAssetUrl(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `/docs-assets/${encodeURI(normalized)}`;
}
