## Configuration

All settings live in `.env` (copy from `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `TELODOCS_API_KEY` | — | Required when docs or MCP auth is `gated` |
| `TELODOCS_DOCS_AUTH` | `open` | `open` or `gated` (browser login page) |
| `TELODOCS_MCP_AUTH` | `open` | `open` or `gated` (Bearer token for `/mcp`) |
| `PORT` | `3000` | HTTP port |
| `TELODOCS_DOCS_DIR` | `./docs` | Documentation directory |
| `TELODOCS_MCP_PATH` | `/mcp` | MCP endpoint path |
| `TELODOCS_SUPPORTED_EXTENSIONS` | `.md,.mdx,.txt,.rst` | Comma-separated file types |
