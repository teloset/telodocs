---
title: Introduction
description: Documentation for {{projectName}}, powered by Telodocs — one content source for agents and humans.
---

<div class="docs-card-grid">
  <a class="docs-card" href="/docs/guides/getting-started.md">
    <h3>Getting started</h3>
    <p>Set up your dev environment and add your first page.</p>
  </a>
  <a class="docs-card" href="/docs/conventions.md">
    <h3>Conventions</h3>
    <p>Coding standards, naming, and testing patterns.</p>
  </a>
</div>

## What you have

- **`docs/`** — your documentation content (source of truth)
- **MCP server** at `/mcp` — agents query docs via `glob_docs`, `grep_docs`, `read_doc`
- **Docs site** at `/` — humans browse the same Markdown in a browser

## Customize navigation

Edit `docs/docs.json` to set the site name, logo, favicon, sidebar groups, and page order. Asset paths are relative to `docs/` (for example `"logo": "logo.svg"`). Remove the file to fall back to an automatic file tree.

## Quick start

1. Copy `.env.example` to `.env` and adjust settings if needed
2. Run `npm install && npm run dev`
3. Open http://localhost:3000
4. Connect your MCP client (see README)
