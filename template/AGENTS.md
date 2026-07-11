# AGENTS.md

Instructions for AI coding agents working on this documentation project.

This project uses [Telodocs](https://github.com/teloset/telodocs). You only edit files under `docs/` — telodocs runs the site and MCP server.

## Setup commands

- Start the docs site and MCP server: `npx telodocs dev`
- Production mode: `npx telodocs start`
- Config: `.env` (created on scaffold; edit port, auth, or API key as needed)

After starting, open http://localhost:3000 for the site and connect MCP clients to http://localhost:3000/mcp.

## How to create documentation

### 1. Add a Markdown page

Create a `.md` file anywhere under `docs/`:

```
docs/
├── index.md                 # homepage
├── guides/
│   └── getting-started.md
└── reference/
    └── api-errors.md
```

Use **kebab-case** file names (`error-handling.md`, not `ErrorHandling.md`).

### 2. Add optional frontmatter

Frontmatter controls the page header and sidebar metadata:

```markdown
---
title: Error handling
description: How API errors are structured and returned to clients.
group: Reference
---

## Your content starts here
```

Supported fields:

| Field | Purpose |
|---|---|
| `title` | Page title in the header (defaults from filename) |
| `description` | Subtitle under the title |
| `group` | Sidebar group when navigation is auto-generated |

### 3. Register the page in navigation

Edit `docs/docs.json` to control site name, branding, and sidebar order:

```json
{
  "name": "{{projectName}} Docs",
  "logo": "logo.svg",
  "favicon": "favicon.svg",
  "navigation": {
    "tabs": [
      {
        "tab": "Docs",
        "groups": [
          {
            "group": "Getting started",
            "pages": ["index", "guides/getting-started"]
          },
          {
            "group": "Reference",
            "pages": ["reference/api-errors"]
          }
        ]
      }
    ]
  }
}
```

Page slugs in `pages` are paths **without** `.md`, relative to `docs/` (for example `guides/getting-started` → `docs/guides/getting-started.md`).

Logo and favicon paths are relative to `docs/` and served at `/docs-assets/*`.

Remove `docs.json` entirely to fall back to an automatic file-tree sidebar.

### 4. Write the homepage

`docs/index.md` is the site homepage (`/`). You can use plain Markdown or HTML card grids:

```html
<div class="docs-card-grid">
  <a class="docs-card" href="/docs/guides/getting-started.md">
    <h3>Getting started</h3>
    <p>Short description of this section.</p>
  </a>
</div>
```

### 5. Structure long pages

- Use `##` and `###` headings — they appear in the right-hand table of contents.
- Prefer short sections over one long wall of text.
- Use fenced code blocks with language tags for syntax highlighting.

## What agents should do when adding docs

1. Place new content in the most logical folder under `docs/`.
2. Add frontmatter when the filename alone is not a good title.
3. Update `docs/docs.json` navigation so the page appears in the sidebar.
4. Link related pages with relative Markdown links or `/docs/...` paths.
5. Run `npx telodocs dev` and confirm the page renders and appears in the nav.

## MCP tools (for agents querying this project)

When connected to the running telodocs MCP server:

1. `glob_docs` — find files by path pattern (e.g. `**/*error*`)
2. `grep_docs` — search file contents for keywords or regex
3. `read_doc` — read a full file or a line range

Prefer these tools over guessing file locations.

## Writing style

- Write for developers skimming quickly: lead with the answer, then details.
- Use concrete examples (code snippets, command output) over abstract descriptions.
- Keep pages focused — split large topics into multiple pages and link between them.
- Match the tone and structure of existing pages in `docs/`.

## Do not edit

- Do not add a `package.json`, NestJS server, or build tooling to this project — telodocs provides all of that.
- Do not commit secrets in `.env` (use `.env.example` for documented defaults only).
