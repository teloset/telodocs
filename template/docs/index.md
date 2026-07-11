# Welcome to {{projectName}}

This project was scaffolded with [Telodocs](https://github.com/teloset/telodocs) — a documentation MCP server with a minimal rendered docs site.

## What you have

- **`docs/`** — your documentation content (source of truth)
- **MCP server** at `/mcp` — agents query docs via `glob_docs`, `grep_docs`, `read_doc`
- **Docs site** at `/` — humans browse the same Markdown in a browser

## Quick start

1. Copy `.env.example` to `.env` and adjust settings if needed
2. Run `npm install && npm run dev`
3. Open http://localhost:3000
4. Connect your MCP client (see README)

## Next steps

- Add your architecture docs, style guides, and ADRs under `docs/`
- Commit and deploy when ready
