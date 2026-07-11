# Telodocs

Scaffold a docs repo that serves as a **remote MCP server** with a minimal rendered docs site. One content source in `docs/` drives both agent queries and human browsing.

Published as [`@teloset/telodocs`](https://www.npmjs.com/package/@teloset/telodocs) on npm. Source: [github.com/teloset/telodocs](https://github.com/teloset/telodocs).

## Quick start

```bash
npx @teloset/telodocs new my-docs
cd my-docs
cp .env.example .env
# Set TELODOCS_API_KEY in .env
npm install
npm run dev
```

- **Docs site:** http://localhost:3000
- **MCP server:** http://localhost:3000/mcp

## What you get

Each generated project includes:

- `docs/` — your documentation (Markdown, plain text, RST)
- MCP tools: `glob_docs`, `grep_docs`, `read_doc` (agentic lexical search, no embeddings)
- A minimal server-rendered docs UI with file-tree navigation
- `Dockerfile` and Azure Container Apps Bicep template
- Single shared API key via `TELODOCS_API_KEY`

## Connect your MCP client

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "my-docs": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer <TELODOCS_API_KEY>"
      }
    }
  }
}
```

### Claude Code

Add to project `.mcp.json` or `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "my-docs": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer <TELODOCS_API_KEY>"
      }
    }
  }
}
```

### Codex

Configure a remote MCP HTTP server pointing at `/mcp` with the same Bearer token header.

## Writing docs

Add Markdown files under `docs/`. Both the MCP tools and the browser UI read from the same directory — no separate build step, no index to sync.

```bash
echo "# Error handling\n\nAlways return structured errors..." > docs/error-handling.md
```

## Configuration

Edit `telodocs.config.ts` in your generated project:

```typescript
export default defineConfig({
  docsDir: "./docs",
  mcpPath: "/mcp",
  docsAuth: "gated", // or "open" to make the browser UI public
  port: 3000,
});
```

## Deploy

### Docker

```bash
docker build -t my-docs .
docker run -p 3000:3000 -e TELODOCS_API_KEY=<secret> my-docs
```

### Azure Container Apps

```bash
az deployment group create \
  --resource-group my-rg \
  --template-file infra/azure/main.bicep \
  --parameters appName=my-docs containerImage=<your-image> apiKey=<secret>
```

## Security model

- **One shared API key** for all MCP consumers (and the docs site when `docsAuth` is `"gated"`)
- Key is set via `TELODOCS_API_KEY` environment variable — never commit it
- To rotate: redeploy with a new key; all clients must update
- No per-user revocation in v1 — if the key leaks, everyone loses access until rotation

## Architecture

```
docs/  →  SearchModule (glob/grep/read)
              ├── McpModule (/mcp)     ← agents
              └── DocsRenderModule (/)  ← humans
```

MCP search is **agentic, not semantic**: glob → grep → read, mirroring how coding agents search local files.

## Development (telodocs repo)

Clone and work on the generator:

```bash
git clone https://github.com/teloset/telodocs.git
cd telodocs
npm install
npm run build
npm test

# Run the CLI locally
node dist/cli/index.js new my-test-docs --dir /tmp
```

## Publishing

First publish is manual (`npm login && npm publish --access public` with 2FA).

Subsequent releases: tag with `v*` and GitHub Actions publishes via trusted publishing (OIDC).

## License

MIT
