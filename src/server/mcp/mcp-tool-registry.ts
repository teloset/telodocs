import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { DocsNavService } from "../docs-render/docs-nav.service";
import { DocsSearchService } from "../docs-render/docs-search.service";
import {
  GrepOutputMode,
  SearchService,
} from "../search/search.service";
import { formatGrepResult } from "./grep-format.util";
import { toMcpNav } from "./mcp-nav.util";

type ToolHandler = (args: Record<string, unknown>) => Promise<CallToolResult>;

export interface McpToolDeps {
  search: SearchService;
  docsSearch: DocsSearchService;
  docsNav: DocsNavService;
  logToolCall: (
    tool: string,
    params: Record<string, unknown>,
    latencyMs: number,
    resultCount: number,
  ) => void;
}

const READ_ONLY = {
  readOnlyHint: true,
  openWorldHint: false,
} as const;

export function registerMcpTools(server: McpServer, deps: McpToolDeps): void {
  registerTool(
    server,
    "get_nav",
    "Return the documentation site navigation tree (names, paths, nested children). Use first to understand corpus structure.",
    {},
    deps,
    async () => {
      const start = Date.now();
      const nav = toMcpNav(await deps.docsNav.getTree());
      deps.logToolCall("get_nav", {}, Date.now() - start, nav.length);
      return textResult(JSON.stringify(nav, null, 2));
    },
  );

  registerTool(
    server,
    "list_docs",
    "List documentation pages with path, title, size, and mtime. Optional path filters to a subdirectory.",
    { path: z.string() },
    deps,
    async (args) => {
      const filterPath = args.path ? String(args.path) : undefined;
      const start = Date.now();
      let meta = await deps.search.listMeta();
      if (filterPath) {
        const prefix = filterPath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
        meta = meta.filter(
          (entry) =>
            entry.path === prefix || entry.path.startsWith(`${prefix}/`),
        );
      }
      deps.logToolCall(
        "list_docs",
        { path: filterPath },
        Date.now() - start,
        meta.length,
      );
      return textResult(
        meta.length
          ? meta
              .map(
                (entry) =>
                  `${entry.path}\t${entry.title}\t${entry.size}\t${entry.mtimeMs}`,
              )
              .join("\n")
          : "No documentation files found.",
      );
    },
  );

  registerTool(
    server,
    "search_docs",
    "Search documentation by keyword or phrase across titles, paths, and page content. Prefer this before glob+grep chains.",
    { query: z.string(), limit: z.number() },
    deps,
    async (args) => {
      const query = String(args.query ?? "");
      const limit =
        typeof args.limit === "number" && args.limit > 0 ? args.limit : 12;
      const start = Date.now();
      const hits = await deps.docsSearch.query(query, limit);
      deps.logToolCall(
        "search_docs",
        { query, limit },
        Date.now() - start,
        hits.length,
      );
      if (!hits.length) {
        return textResult("No results found.");
      }
      return textResult(
        hits
          .map((hit) => {
            const line = hit.line ? `:${hit.line}` : "";
            return `${hit.path}${line}\t${hit.title}\t${hit.snippet}`;
          })
          .join("\n"),
      );
    },
  );

  registerTool(
    server,
    "glob",
    "Find documentation files by glob pattern relative to docs/. Optional path scopes the search directory. Example: '**/*.md', '**/api/*'",
    { pattern: z.string(), path: z.string() },
    deps,
    async (args) => {
      const pattern = String(args.pattern ?? "");
      const scopePath = args.path ? String(args.path) : undefined;
      const start = Date.now();
      const files = await deps.search.glob(pattern, { path: scopePath });
      deps.logToolCall(
        "glob",
        { pattern, path: scopePath },
        Date.now() - start,
        files.length,
      );
      return textResult(
        files.length ? files.join("\n") : "No files matched the pattern.",
      );
    },
  );

  registerTool(
    server,
    "grep",
    "Search documentation contents with regex. output_mode: content (default), files_with_matches, or count. Optional glob/path filters and case_insensitive.",
    {
      pattern: z.string(),
      path: z.string(),
      glob: z.string(),
      output_mode: z.enum(["content", "files_with_matches", "count"]),
      case_insensitive: z.boolean(),
      head_limit: z.number(),
    },
    deps,
    async (args) => {
      const pattern = String(args.pattern ?? "");
      const scopePath = args.path ? String(args.path) : undefined;
      const glob = args.glob ? String(args.glob) : undefined;
      const outputMode = parseOutputMode(args.output_mode);
      const headLimit = parsePositiveInt(args.head_limit);
      const start = Date.now();
      const result = await deps.search.grep(pattern, {
        glob: mergeGlobFilter(glob, scopePath),
        maxResults: headLimit,
        outputMode,
        caseInsensitive: args.case_insensitive === true,
      });
      const resultCount = countGrepResults(result);
      deps.logToolCall(
        "grep",
        { pattern, path: scopePath, glob, output_mode: outputMode },
        Date.now() - start,
        resultCount,
      );
      return textResult(formatGrepResult(result));
    },
  );

  registerTool(
    server,
    "read",
    "Read a documentation file relative to docs/. Use offset/limit (1-indexed lines) or startLine/endLine.",
    {
      path: z.string(),
      offset: z.number(),
      limit: z.number(),
      startLine: z.number(),
      endLine: z.number(),
    },
    deps,
    async (args) => {
      const docPath = String(args.path ?? "");
      const range = resolveReadRange(args);
      const start = Date.now();
      try {
        const result = await deps.search.read(docPath, range);
        deps.logToolCall(
          "read",
          { path: docPath, ...range },
          Date.now() - start,
          result.endLine - result.startLine + 1,
        );
        const header = `--- ${result.path} (lines ${result.startLine}-${result.endLine} of ${result.totalLines}) ---\n`;
        return textResult(header + result.content);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        deps.logToolCall("read", { path: docPath }, Date.now() - start, 0);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

function registerTool(
  server: McpServer,
  name: string,
  description: string,
  schema: Record<string, z.ZodTypeAny>,
  _deps: McpToolDeps,
  handler: ToolHandler,
) {
  const register = server.tool as (
    toolName: string,
    toolDescription: string,
    paramsSchema: Record<string, z.ZodTypeAny>,
    annotations: typeof READ_ONLY,
    cb: ToolHandler,
  ) => void;
  register.call(server, name, description, schema, READ_ONLY, handler);
}

function textResult(text: string): CallToolResult {
  return { content: [{ type: "text" as const, text }] };
}

function parseOutputMode(value: unknown): GrepOutputMode {
  if (
    value === "files_with_matches" ||
    value === "count" ||
    value === "content"
  ) {
    return value;
  }
  return "content";
}

function parsePositiveInt(value: unknown): number | undefined {
  return typeof value === "number" && value > 0 ? value : undefined;
}

function mergeGlobFilter(
  glob: string | undefined,
  path: string | undefined,
): string | undefined {
  if (!path) {
    return glob;
  }
  const prefix = path.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!prefix) {
    return glob;
  }
  if (glob) {
    return `${prefix}/${glob}`;
  }
  return `${prefix}/**/*`;
}

function resolveReadRange(args: Record<string, unknown>): {
  startLine?: number;
  endLine?: number;
} {
  const offset = parsePositiveInt(args.offset);
  const limit = parsePositiveInt(args.limit);
  const startLine = parsePositiveInt(args.startLine) ?? offset;
  let endLine = parsePositiveInt(args.endLine);
  if (startLine && limit && !endLine) {
    endLine = startLine + limit - 1;
  }
  return { startLine, endLine };
}

function countGrepResults(
  result: Awaited<ReturnType<SearchService["grep"]>>,
): number {
  if (result.outputMode === "files_with_matches") {
    return result.files.length;
  }
  if (result.outputMode === "count") {
    return result.counts.length;
  }
  return result.matches.length;
}
