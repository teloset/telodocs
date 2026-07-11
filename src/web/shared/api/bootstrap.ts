import type { DehydratedState } from "@tanstack/react-query";
import { hydrate } from "@tanstack/react-query";
import { queryClient } from "../../app/query-client";

export function hydrateDocsBootstrap(): void {
  const element = document.getElementById("telodocs-bootstrap");
  if (!element?.textContent) {
    return;
  }

  let state: DehydratedState;
  try {
    state = JSON.parse(element.textContent) as DehydratedState;
  } catch {
    return;
  }

  hydrate(queryClient, state);
}
