import { DocContent } from "./components/DocContent";
import { PageHeader } from "./components/PageHeader";
import { useDocPathFromRoute } from "./hooks/use-doc-path";
import { useDocPageQuery } from "./queries/use-doc-page-query";
import { DocumentHead } from "../../shared/components/DocumentHead";
import "./docs.css";

export function DocPageView() {
  const docPath = useDocPathFromRoute();
  const { data, isLoading, isError, error } = useDocPageQuery(docPath);

  if (isLoading) {
    return <div className="docs-status">Loading page…</div>;
  }

  if (isError || !data) {
    return (
      <div className="docs-page-error">
        {error instanceof Error ? error.message : "Failed to load page"}
      </div>
    );
  }

  return (
    <>
      <DocumentHead title={data.title} />
      {data.path ? (
        <PageHeader
          title={data.title}
          description={data.description}
          groupName={data.groupName}
        />
      ) : null}
      <DocContent html={data.html} />
    </>
  );
}
