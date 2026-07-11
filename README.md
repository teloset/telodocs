# Telodocs

Documentation MCP server and docs site. You only maintain a `docs/` folder — telodocs runs the server, UI, and MCP tools.

Published as [`telodocs`](https://www.npmjs.com/package/telodocs) on npm.

## Quick start

```bash
npx telodocs new my-docs
cd my-docs
npx telodocs dev
```

- **Docs site:** http://localhost:3000
- **MCP server:** http://localhost:3000/mcp

Optional: `cp .env.example .env` to change port or enable auth.

## What you get

After `telodocs new`, your project contains only:

```
my-docs/
├── docs/           # your content (Markdown, docs.json, logo, favicon)
├── .env.example
├── .gitignore
└── README.md
```

Telodocs provides the NestJS server, docs UI, and MCP tools when you run `telodocs dev` or `telodocs start`.

## Commands

| Command | Description |
|---|---|
| `telodocs new <name>` | Create a docs-only project |
| `telodocs dev` | Start server in development mode |
| `telodocs start` | Start server in production mode |

Run these from your project directory (where `docs/` lives).

## Customize

Edit `docs/docs.json` for site name, logo, favicon, and sidebar navigation. Add Markdown under `docs/`.

## Connect your MCP client

### Cursor

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

Bearer token is only required when `TELODOCS_MCP_AUTH=gated` in `.env`.

## Configuration

Settings live in `.env` (copy from `.env.example`):

| Variable | Default | Description |
|---|---|---|
| `TELODOCS_API_KEY` | — | Required when auth is `gated` |
| `TELODOCS_DOCS_AUTH` | `open` | `open` or `gated` |
| `TELODOCS_MCP_AUTH` | `open` | `open` or `gated` |
| `PORT` | `3000` | HTTP port |
| `TELODOCS_DOCS_DIR` | `./docs` | Documentation directory |
| `TELODOCS_MCP_PATH` | `/mcp` | MCP endpoint path |

## Architecture

```
docs/  →  telodocs server (glob/grep/read)
              ├── /mcp   ← agents
              └── /      ← humans
```

## Development (telodocs repo)

```bash
git clone https://github.com/teloset/telodocs.git
cd telodocs
npm install
npm run build
npm test
```

## License

MIT
