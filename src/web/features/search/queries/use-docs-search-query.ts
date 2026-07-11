import { useQuery } from "@tanstack/react-query";
import { fetchSearch } from "../../../shared/api/docs-api";
import { docsQueryKeys } from "../../../shared/api/query-keys";

export function useDocsSearchQuery(query: string, enabled: boolean) {
  return useQuery({
    queryKey: docsQueryKeys.search(query),
    queryFn: () => fetchSearch(query),
    enabled: enabled && query.trim().length > 0,
    select: (data) => data.results,
    placeholderData: (previous) => previous,
  });
}
