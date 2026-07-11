export function docPathFromUrlPath(urlPath: string): string | undefined {
  if (urlPath === "/" || urlPath === "") {
    return undefined;
  }

  if (urlPath.startsWith("/docs/")) {
    return decodeURIComponent(urlPath.slice("/docs/".length));
  }

  return undefined;
}
