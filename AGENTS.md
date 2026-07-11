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
| `src/server/` | NestJS server — docs API, MCP, search, auth |
| `src/web/` | React docs UI (Vite, feature-based, React Query) |
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

telodocs is published to npm. Treat every merged change as a release unless the user explicitly says not to bump.

### Version bump (required on every change)

1. Bump `version` in `package.json`
2. Keep `package-lock.json` root/`packages[""]` version in sync (run `npm install` if needed — it rewrites a stale lockfile version)
3. Prefer **patch** for incremental fixes/features (`0.4.0` → `0.4.1`); use **minor** / **major** when the change warrants it
4. Include the bump in the same PR as the change
5. Commit message style: `Release vX.Y.Z with <short summary>.`

### Ship workflow

1. Open a PR with the code change **and** the version bump
2. After the PR merges to `main`, pull `main` and create an annotated tag matching the version:
   ```bash
   git checkout main && git pull origin main
   git tag -a vX.Y.Z -m "Release vX.Y.Z with <short summary>."
   git push origin vX.Y.Z
   ```
3. Pushing a `v*` tag triggers `.github/workflows/publish.yml` (trusted publishing to npm as `telodocs`)
4. Confirm the Publish workflow succeeds on GitHub Actions

### Do not

- Publish with `npm publish` locally (unless bootstrapping a new package name)
- Create or push the `v*` tag from an unmerged feature branch
- Leave `package.json` / `package-lock.json` versions out of sync
- Skip the post-merge tag — a merged bump without a tag never reaches npm

## Testing docs UI changes

There is no `docs/` folder in this repo. To manually verify UI changes:

```bash
npm run build
TELODOCS_DOCS_DIR=./template/docs node dist/server/main.js
```

Or scaffold a smoke project and run `telodocs dev`.

### Theming

Dark mode is class-based: apply `.dark` on `<html>` to activate tokens in `src/web/shared/styles/globals.css`. Preference is stored in `localStorage` as `telodocs-theme` (`light` | `dark` | `system`). Code blocks intentionally stay dark in both themes.
