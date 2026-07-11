import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerMcpTools } from "../../../src/server/mcp/mcp-tool-registry";
import { SearchService } from "../../../src/server/search/search.service";
import { DocsSearchService } from "../../../src/server/docs-render/docs-search.service";
import { DocsNavService } from "../../../src/server/docs-render/docs-nav.service";

describe("registerMcpTools", () => {
  it("registers documentation MCP tools", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });

    registerMcpTools(server, {
      search: {} as SearchService,
      docsSearch: {} as DocsSearchService,
      docsNav: {} as DocsNavService,
      logToolCall: () => undefined,
    });

    const registered = Object.keys(
      (server as unknown as { _registeredTools: Record<string, unknown> })
        ._registeredTools,
    );

    expect(registered).toEqual([
      "get_nav",
      "list_docs",
      "search_docs",
      "glob",
      "grep",
      "read",
    ]);
  });
});
