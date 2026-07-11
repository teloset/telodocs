import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import fsp from "node:fs/promises";
import { spawnSync } from "node:child_process";

describe("telodocs new", () => {
  it("template directory includes docs scaffold", () => {
    const templateDir = path.resolve(process.cwd(), "template");
    expect(fs.existsSync(path.join(templateDir, "docs/index.md"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "docs/docs.json"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, ".env.example"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "src"))).toBe(false);
    expect(fs.existsSync(path.join(templateDir, "package.json"))).toBe(false);
  });

  it("scaffolds a docs-only project with replaced tokens", async () => {
    const tmpBase = await fsp.mkdtemp(path.join(os.tmpdir(), "telodocs-cli-"));
    const projectDir = path.join(tmpBase, "my-docs");
    const cliEntry = path.resolve(process.cwd(), "dist/cli/index.js");

    const result = spawnSync(
      "node",
      [cliEntry, "new", "my-docs", "--dir", tmpBase, "--no-git"],
      { encoding: "utf-8" },
    );

    expect(result.status).toBe(0);
    expect(fs.existsSync(path.join(projectDir, "docs/index.md"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "docs/docs.json"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "package.json"))).toBe(false);
    expect(fs.existsSync(path.join(projectDir, "src"))).toBe(false);

    const docsJson = await fsp.readFile(
      path.join(projectDir, "docs/docs.json"),
      "utf-8",
    );
    expect(docsJson).toContain("my-docs Docs");

    await fsp.rm(tmpBase, { recursive: true, force: true });
  });
});
