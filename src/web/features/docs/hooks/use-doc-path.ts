import { useParams } from "react-router-dom";

export function useDocPathFromRoute(): string | undefined {
  const splat = useParams()["*"];
  if (!splat) {
    return undefined;
  }
  return decodeURIComponent(splat);
}

export function useActiveDocPath(): string {
  const docPath = useDocPathFromRoute();
  return docPath ?? "index.md";
}
