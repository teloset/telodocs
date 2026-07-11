import { useLocation } from "react-router-dom";

export function useDocPathFromRoute(): string | undefined {
  const { pathname } = useLocation();
  if (pathname === "/") {
    return undefined;
  }

  if (pathname.startsWith("/docs/")) {
    return decodeURIComponent(pathname.slice("/docs/".length));
  }

  return undefined;
}

export function useActiveDocPath(): string {
  const { pathname } = useLocation();
  if (pathname === "/") {
    return "index.md";
  }

  if (pathname.startsWith("/docs/")) {
    return decodeURIComponent(pathname.slice("/docs/".length));
  }

  return "";
}
