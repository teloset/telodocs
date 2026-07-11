import { useQuery } from "@tanstack/react-query";
import { fetchSite } from "../../../shared/api/docs-api";
import { docsQueryKeys } from "../../../shared/api/query-keys";

export function useDocsSiteQuery() {
  return useQuery({
    queryKey: docsQueryKeys.site(),
    queryFn: fetchSite,
  });
}
