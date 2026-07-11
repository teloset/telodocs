# AGENTS.md

Instructions for AI coding agents working on the **telodocs** npm package (server, CLI, and scaffold template).

User-facing documentation projects scaffolded via `telodocs new` include their own `AGENTS.md` with content-authoring guidance — see `template/AGENTS.md`.

## Setup commands

- Install dependencies: `npm install`
- Build: `npm run build`
- Run tests: `npm test`
- Local CLI (after build): `node dist/cli/index.js new my-docs --no-git`

## Project layout

| Path | Purpose |
|---|---|
| `src/cli/` | CLI commands (`new`, `dev`, `start`) |
| `src/server/` | NestJS server — docs UI, MCP, search, auth |
| `template/` | Files copied by `telodocs new` (docs-only scaffold) |
| `test/` | Vitest tests |

Scaffolded projects contain `docs/`, `.env`, `.env.example`, `.gitignore`, `README.md`, and `AGENTS.md`.

## Code conventions

- TypeScript strict mode; NestJS module/service/controller patterns under `src/server/`
- Keep files under ~200 lines where practical — split into focused services
- Match existing naming: `*.service.ts`, `*.controller.ts`, `*.module.ts`
- Run `npm test` before finishing; fix failures

## Changing the scaffold

When editing `template/`:

1. Update `SCAFFOLD_ENTRIES` in `src/cli/commands/new.ts` if adding new top-level scaffold files
2. Update `test/cli/new.spec.ts` if scaffold shape changes
3. Rebuild and run the CLI scaffold test

Documentation authoring instructions for end users live in `template/AGENTS.md` and `template/docs/`.

## Releases

- Version lives in `package.json`
- Push a `v*` tag to trigger `.github/workflows/publish.yml` (trusted publishing to npm as `telodocs`)
- Do not publish manually unless setting up a new package name on npm

## Testing docs UI changes

There is no `docs/` folder in this repo. To manually verify UI changes:

```bash
npm run build
node dist/cli/index.js new /tmp/telodocs-smoke --no-git
cd /tmp/telodocs-smoke && node ../dist/cli/index.js dev
```

Or point `TELODOCS_DOCS_DIR` at `template/docs` when running the server from this repo.
