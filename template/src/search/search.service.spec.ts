import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { SearchService } from "./search.service";
import { TelodocsConfig } from "../core/config/telodocs-config.schema";

describe("SearchService", () => {
  let tmpDir: string;
  let config: TelodocsConfig;
  let service: SearchService;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "telodocs-test-"));
    await fs.mkdir(path.join(tmpDir, "subdir"), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, "index.md"),
      "# Home\n\nWelcome to the docs.\n",
    );
    await fs.writeFile(
      path.join(tmpDir, "subdir", "errors.md"),
      "# Errors\n\nUse structured errors.\nLine three.\n",
    );

    config = {
      docsDir: tmpDir,
      mcpPath: "/mcp",
      docsAuth: "gated",
      port: 3000,
      supportedExtensions: [".md", ".mdx", ".txt", ".rst"],
    };
    service = new SearchService(config);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("glob finds matching files", async () => {
    const files = await service.glob("**/*.md");
    expect(files).toContain("index.md");
    expect(files).toContain("subdir/errors.md");
  });

  it("glob rejects path traversal in results", async () => {
    const files = await service.glob("**/*");
    for (const file of files) {
      expect(file).not.toContain("..");
    }
  });

  it("read returns file content", async () => {
    const result = await service.read("index.md");
    expect(result.content).toContain("Welcome to the docs");
    expect(result.totalLines).toBeGreaterThan(0);
  });

  it("read supports line ranges", async () => {
    const result = await service.read("subdir/errors.md", {
      startLine: 3,
      endLine: 3,
    });
    expect(result.content).toBe("Use structured errors.");
    expect(result.startLine).toBe(3);
    expect(result.endLine).toBe(3);
  });

  it("read rejects path traversal", async () => {
    await expect(service.read("../outside.md")).rejects.toThrow(
      "escapes docs directory",
    );
  });

  it("grep finds content matches", async () => {
    const matches = await service.grep("structured errors");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.file).toBe("subdir/errors.md");
  });

  it("grep respects maxResults", async () => {
    const matches = await service.grep("e", { maxResults: 1 });
    expect(matches.length).toBeLessThanOrEqual(1);
  });

  it("listDocFiles returns sorted supported files", async () => {
    const files = await service.listDocFiles();
    expect(files).toEqual(["index.md", "subdir/errors.md"]);
  });
});
