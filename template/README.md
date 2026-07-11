# {{projectName}} Docs

Your documentation lives in `docs/`. Telodocs runs the site and MCP server.

## Quick start

```bash
npx telodocs dev
```

- **Docs site:** http://localhost:3000
- **MCP server:** http://localhost:3000/mcp

## Project layout

```
├── docs/              # Markdown, docs.json, logo, favicon
├── AGENTS.md          # how to add and structure documentation
├── .env               # settings (gitignored)
├── .env.example
└── README.md
```

## Configuration

`.env` is created when you scaffold this project. Auth is **open** by default.

| Variable | Default | Description |
|---|---|---|
| `TELODOCS_API_KEY` | `i-love-coding-agents` | Used when auth is `gated` |
| `TELODOCS_DOCS_AUTH` | `open` | `open` or `gated` |
| `TELODOCS_MCP_AUTH` | `open` | `open` or `gated` |
| `PORT` | `3000` | HTTP port |

Edit `.env` to change port or enable gated auth. Change the API key before using gated mode in production.

## MCP (when auth is gated)

```json
{
  "mcpServers": {
    "{{projectNameKebab}}": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer i-love-coding-agents"
      }
    }
  }
}
```

See the root [Telodocs README](https://github.com/teloset/telodocs#readme) for full setup details.
