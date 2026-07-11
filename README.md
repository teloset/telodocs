# Telodocs

**Docs site + MCP server from a single `docs/` folder.**

Write Markdown. Telodocs runs the browser UI, search, and MCP tools (`glob_docs`, `grep_docs`, `read_doc`) — no NestJS app, no build step in your project.

```bash
npx telodocs new my-docs
cd my-docs
npx telodocs dev
```

- **Docs site:** http://localhost:3000
- **MCP server:** http://localhost:3000/mcp

[GitHub](https://github.com/teloset/telodocs) · [npm](https://www.npmjs.com/package/telodocs)

## What you get

After `telodocs new`:

```
my-docs/
├── docs/              # Markdown, docs.json, logo, favicon
├── AGENTS.md          # instructions for AI agents writing docs
├── README.md
├── .env               # settings + default API key (gitignored)
├── .env.example
└── .gitignore
```

Sample pages under `docs/`:

```
docs/
├── docs.json
├── index.md
├── logo.svg
├── favicon.svg
├── guides/getting-started.md
└── conventions.md
```

Telodocs ships the server when you run `telodocs dev` or `telodocs start` — your repo stays docs-only.

### Migrating from Mintlify

Telodocs reads a Mintlify-style `docs/docs.json` and supports `.md` / `.mdx` pages. When moving an existing site:

- Put `docs.json`, logo, and favicon under `docs/`
- Use nested groups in `pages` for collapsible sidebar sections (Mintlify format)
- Flat groups named `Parent — Child` are auto-nested into a tree (common after Mintlify export)
- Use page slugs without extensions (e.g. `guides/getting-started`)
- Only root `index` is the homepage — section indexes stay at `/docs/.../index.mdx`
- Replace Mintlify `<Card>` components with `<div class="docs-card-grid">` / `<a class="docs-card">`

See `template/AGENTS.md` (copied into new projects) for step-by-step agent instructions.

## Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `telodocs new <name>` | Scaffold a docs-only project |
| `telodocs dev`        | Start server (development)   |
| `telodocs start`      | Start server (production)    |

Run from the directory that contains `docs/`.

## Customize the site

- **`docs/docs.json`** — site name, logo, favicon, sidebar navigation (Mintlify-style)
- **`docs/*.md`** — pages with optional frontmatter (`title`, `description`, `group`)
- **`AGENTS.md`** — doc authoring guide for coding agents ([agents.md](https://agents.md/) compatible)

## MCP client setup

MCP is **open** by default — no auth headers needed.

To require a key, set `TELODOCS_MCP_AUTH=gated` in `.env` and use `TELODOCS_API_KEY` as the bearer token.

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

Omit `headers` while auth is `open`. Replace the token if you changed `TELODOCS_API_KEY` in `.env`.

## Configuration

`.env` is created on `telodocs new`:

| Variable             | Default                | Description                                          |
| -------------------- | ---------------------- | ---------------------------------------------------- |
| `TELODOCS_API_KEY`   | `i-love-coding-agents` | Used when auth is `gated` (change before production) |
| `TELODOCS_DOCS_AUTH` | `open`                 | `open` or `gated`                                    |
| `TELODOCS_MCP_AUTH`  | `open`                 | `open` or `gated`                                    |
| `PORT`               | `3000`                 | HTTP port                                            |
| `TELODOCS_DOCS_DIR`  | `./docs`               | Documentation directory                              |
| `TELODOCS_MCP_PATH`  | `/mcp`                 | MCP endpoint path                                    |

## How it works

```
docs/  →  telodocs server
              ├── /mcp   ← coding agents
              └── /      ← humans
```

## Contributing

```bash
git clone https://github.com/teloset/telodocs.git
cd telodocs
npm install
npm run build
npm test
```

## License

MIT
