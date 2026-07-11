export function docPathFromUrlPath(urlPath: string): string | undefined {
  if (urlPath === "/" || urlPath === "") {
    return undefined;
  }

  if (urlPath.startsWith("/docs/")) {
    return decodeURIComponent(urlPath.slice("/docs/".length));
  }

  return undefined;
}

export function docPathFromLocationPathname(pathname: string): string | undefined {
  return docPathFromUrlPath(pathname);
}

export function docPathsMatch(activePath: string, nodePath: string): boolean {
  if (!nodePath) {
    return false;
  }

  if (activePath === nodePath) {
    return true;
  }

  const normalize = (value: string) =>
    value.replace(/\.mdx?$/i, "").replace(/\/index$/i, "");

  return normalize(activePath) === normalize(nodePath);
}
