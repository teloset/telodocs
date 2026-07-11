import { Injectable, Inject, Logger } from "@nestjs/common";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { APP_CONFIG, AppConfig } from "../core/config/config.schema";
import { DocsNavService } from "../docs-render/docs-nav.service";
import { DocsSearchService } from "../docs-render/docs-search.service";
import { SearchService } from "../search/search.service";
import { MCP_INSTRUCTIONS } from "./mcp-instructions";
import { registerMcpTools } from "./mcp-tool-registry";

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(
    @Inject(APP_CONFIG) private readonly config: AppConfig,
    private readonly search: SearchService,
    private readonly docsSearch: DocsSearchService,
    private readonly docsNav: DocsNavService,
  ) {}

  getMcpPath(): string {
    return this.config.mcpPath;
  }

  async handleRequest(
    req: Parameters<StreamableHTTPServerTransport["handleRequest"]>[0],
    res: Parameters<StreamableHTTPServerTransport["handleRequest"]>[1],
    body: Parameters<StreamableHTTPServerTransport["handleRequest"]>[2],
  ): Promise<void> {
    const server = this.buildServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) {
        return;
      }
      cleanedUp = true;
      void transport.close().catch(() => undefined);
      void server.close().catch(() => undefined);
    };

    res.once("close", cleanup);

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      cleanup();
      throw err;
    }
  }

  private buildServer(): McpServer {
    const server = new McpServer(
      {
        name: "telodocs",
        version: "1.0.0",
      },
      {
        instructions: MCP_INSTRUCTIONS,
      },
    );

    registerMcpTools(server, {
      search: this.search,
      docsSearch: this.docsSearch,
      docsNav: this.docsNav,
      logToolCall: (tool, params, latencyMs, resultCount) => {
        this.logger.log(
          JSON.stringify({
            event: "mcp_tool_call",
            tool,
            params,
            latencyMs,
            resultCount,
          }),
        );
      },
    });

    return server;
  }
}
