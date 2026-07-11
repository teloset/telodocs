# {{projectName}}

Documentation MCP server powered by [Telodocs](https://github.com/teloset/telodocs).

## Quick start

```bash
cp .env.example .env
# Set TELODOCS_API_KEY in .env (or export it in your shell)
npm install
npm run dev
```

- Docs site: http://localhost:3000
- MCP endpoint: http://localhost:3000/mcp

## Add documentation

Write Markdown files in `docs/`. Both the MCP tools and the browser UI read from this directory.

## Configuration

Edit `telodocs.config.ts` or `telodocs.config.json`:

- `docsAuth`: `"gated"` (default) or `"open"` for public browser access
- `mcpPath`: MCP mount path (default `/mcp`)
- `docsDir`: documentation directory (default `./docs`)

## Deploy

```bash
docker build -t {{projectNameKebab}} .
docker run -p 3000:3000 -e TELODOCS_API_KEY=<secret> {{projectNameKebab}}
```

See `infra/azure/main.bicep` for Azure Container Apps deployment.
