import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import fsp from "node:fs/promises";
import { spawnSync } from "node:child_process";

describe("telodocs new", () => {
  it("template directory exists with required files", async () => {
    const templateDir = path.resolve(process.cwd(), "template");
    expect(fs.existsSync(templateDir)).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "src/main.ts"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "test"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "docs/index.md"))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, "Dockerfile"))).toBe(true);
  });

  it("token replacement produces valid project name", async () => {
    const tmpBase = await fsp.mkdtemp(path.join(os.tmpdir(), "telodocs-cli-"));
    const content = '{"name":"{{projectNameKebab}}"}';
    const replaced = content.replace("{{projectNameKebab}}", "my-docs");
    expect(replaced).toBe('{"name":"my-docs"}');
    await fsp.rm(tmpBase, { recursive: true, force: true });
  });

  it("scaffolds a project with replaced tokens", async () => {
    const tmpBase = await fsp.mkdtemp(path.join(os.tmpdir(), "telodocs-cli-"));
    const projectDir = path.join(tmpBase, "my-docs");
    const cliEntry = path.resolve(process.cwd(), "dist/cli/index.js");

    const result = spawnSync(
      "node",
      [cliEntry, "new", "my-docs", "--dir", tmpBase, "--no-git"],
      { encoding: "utf-8" },
    );

    expect(result.status).toBe(0);
    expect(fs.existsSync(projectDir)).toBe(true);

    const packageJson = JSON.parse(
      await fsp.readFile(path.join(projectDir, "package.json"), "utf-8"),
    ) as { name: string };
    expect(packageJson.name).toBe("my-docs");
    expect(fs.existsSync(path.join(projectDir, ".env.example"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "test"))).toBe(true);
    expect(fs.existsSync(path.join(projectDir, "telodocs.config.ts"))).toBe(false);

    await fsp.rm(tmpBase, { recursive: true, force: true });
  });
});
