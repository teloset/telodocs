import { useQuery } from "@tanstack/react-query";
import { fetchNav } from "../../../shared/api/docs-api";
import { docsQueryKeys } from "../../../shared/api/query-keys";

export function useDocsNavQuery() {
  return useQuery({
    queryKey: docsQueryKeys.nav(),
    queryFn: fetchNav,
    select: (data) => data.items,
  });
}
