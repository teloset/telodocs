import { Injectable, Inject, Logger } from "@nestjs/common";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import { SearchService } from "../search/search.service";

const INSTRUCTIONS = `You are connected to a Telodocs documentation corpus.

Search strategy (recommended):
1. Use glob_docs to find candidate files by path pattern (e.g. "**/*error*")
2. Use grep_docs to search file contents for keywords or regex
3. Use read_doc to read the full file or a specific line range

All paths are relative to the docs/ directory. Start broad with glob, narrow with grep, then read the relevant section.`;

type ToolHandler = (args: Record<string, unknown>) => Promise<CallToolResult>;

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly search: SearchService,
  ) {}

  getMcpPath(): string {
    return this.config.mcpPath;
  }

  async handleRequest(
    req: Parameters<StreamableHTTPServerTransport["handleRequest"]>[0],
    res: Parameters<StreamableHTTPServerTransport["handleRequest"]>[1],
    body: Parameters<StreamableHTTPServerTransport["handleRequest"]>[2],
  ): Promise<void> {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const server = this.buildServer();

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } finally {
      await server.close().catch(() => undefined);
    }
  }

  private buildServer(): McpServer {
    const server = new McpServer(
      {
        name: "telodocs",
        version: "1.0.0",
      },
      {
        instructions: INSTRUCTIONS,
      },
    );

    this.registerTool(
      server,
      "glob_docs",
      "Search for documentation files by glob pattern relative to docs/. Example: '**/*.md', '**/api/*'",
      { pattern: z.string() },
      async (args) => {
        const pattern = String(args.pattern ?? "");
        const start = Date.now();
        const files = await this.search.glob(pattern);
        this.logToolCall("glob_docs", { pattern }, Date.now() - start, files.length);
        return {
          content: [
            {
              type: "text" as const,
              text: files.length
                ? files.join("\n")
                : "No files matched the pattern.",
            },
          ],
        };
      },
    );

    this.registerTool(
      server,
      "grep_docs",
      "Search documentation file contents using regex. Returns matches with file path, line number, and context. Optional glob filters files; maxResults defaults to 50.",
      {
        pattern: z.string(),
        glob: z.string(),
        maxResults: z.number(),
      },
      async (args) => {
        const pattern = String(args.pattern ?? "");
        const glob = args.glob ? String(args.glob) : undefined;
        const maxResults =
          typeof args.maxResults === "number" && args.maxResults > 0
            ? args.maxResults
            : undefined;
        const start = Date.now();
        const matches = await this.search.grep(pattern, { glob, maxResults });
        this.logToolCall(
          "grep_docs",
          { pattern, glob },
          Date.now() - start,
          matches.length,
        );

        if (matches.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No matches found." }],
          };
        }

        const text = matches
          .map((m) => {
            const before = m.contextBefore.map((l) => `  ${l}`).join("\n");
            const after = m.contextAfter.map((l) => `  ${l}`).join("\n");
            return [
              before,
              `${m.file}:${m.line}:${m.column}: ${m.text}`,
              after,
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n---\n");

        return { content: [{ type: "text" as const, text }] };
      },
    );

    this.registerTool(
      server,
      "read_doc",
      "Read a documentation file by path relative to docs/. Optionally specify startLine and endLine (1-indexed). Use 0 to omit a range bound.",
      {
        path: z.string(),
        startLine: z.number(),
        endLine: z.number(),
      },
      async (args) => {
        const docPath = String(args.path ?? "");
        const startLine =
          typeof args.startLine === "number" && args.startLine > 0
            ? args.startLine
            : undefined;
        const endLine =
          typeof args.endLine === "number" && args.endLine > 0
            ? args.endLine
            : undefined;
        const start = Date.now();
        try {
          const result = await this.search.read(docPath, { startLine, endLine });
          this.logToolCall(
            "read_doc",
            { path: docPath, startLine, endLine },
            Date.now() - start,
            result.endLine - result.startLine + 1,
          );
          const header = `--- ${result.path} (lines ${result.startLine}-${result.endLine} of ${result.totalLines}) ---\n`;
          return {
            content: [
              { type: "text" as const, text: header + result.content },
            ],
          };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          this.logToolCall(
            "read_doc",
            { path: docPath },
            Date.now() - start,
            0,
          );
          return {
            content: [{ type: "text" as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      },
    );

    return server;
  }

  private registerTool(
    server: McpServer,
    name: string,
    description: string,
    schema: Record<string, z.ZodTypeAny>,
    handler: ToolHandler,
  ) {
    const register = server.tool as (
      toolName: string,
      toolDescription: string,
      paramsSchema: Record<string, z.ZodTypeAny>,
      cb: ToolHandler,
    ) => void;
    register.call(server, name, description, schema, handler);
  }

  private logToolCall(
    tool: string,
    params: Record<string, unknown>,
    latencyMs: number,
    resultCount: number,
  ) {
    this.logger.log(
      JSON.stringify({
        event: "mcp_tool_call",
        tool,
        params,
        latencyMs,
        resultCount,
      }),
    );
  }
}
