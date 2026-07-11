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

On scaffold, a `.env` file is created automatically. Auth is **open** by default — no API key needed until you enable gated mode.

## What you get

After `telodocs new`, your project contains:

```
my-docs/
├── docs/              # your content (Markdown, docs.json, logo, favicon)
├── AGENTS.md          # instructions for AI agents writing docs
├── README.md
├── .env               # settings + default API key (gitignored)
├── .env.example       # reference copy
└── .gitignore
```

Sample content under `docs/`:

```
docs/
├── docs.json
├── index.md
├── logo.svg
├── favicon.svg
├── guides/getting-started.md
└── conventions.md
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

- Edit `docs/docs.json` for site name, logo, favicon, and sidebar navigation
- Add Markdown pages under `docs/`
- See `AGENTS.md` in your project for doc authoring conventions (also compatible with [agents.md](https://agents.md/))

## Connect your MCP client

By default, MCP is open — no headers required. When you set `TELODOCS_MCP_AUTH=gated` in `.env`, use the API key from that file.

### Cursor

```json
{
  "mcpServers": {
    "my-docs": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer i-love-coding-agents"
      }
    }
  }
}
```

Replace the bearer token with your `TELODOCS_API_KEY` if you changed it in `.env`.

## Configuration

Settings live in `.env` (created on `telodocs new`; see `.env.example` for reference):

| Variable | Default | Description |
|---|---|---|
| `TELODOCS_API_KEY` | `i-love-coding-agents` | Used when auth is `gated` (change before production) |
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
