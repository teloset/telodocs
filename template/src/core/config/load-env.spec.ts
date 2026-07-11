import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadEnvFile } from "./load-env";

describe("loadEnvFile", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "telodocs-env-"));
    delete process.env.TELODOCS_API_KEY;
    delete process.env.PORT;
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    delete process.env.TELODOCS_API_KEY;
    delete process.env.PORT;
  });

  it("loads variables from .env", () => {
    fs.writeFileSync(
      path.join(tmpDir, ".env"),
      "TELODOCS_API_KEY=secret-from-file\nPORT=4000\n",
    );

    loadEnvFile(tmpDir);

    expect(process.env.TELODOCS_API_KEY).toBe("secret-from-file");
    expect(process.env.PORT).toBe("4000");
  });

  it("does not override existing environment variables", () => {
    process.env.TELODOCS_API_KEY = "already-set";
    fs.writeFileSync(
      path.join(tmpDir, ".env"),
      "TELODOCS_API_KEY=from-file\n",
    );

    loadEnvFile(tmpDir);

    expect(process.env.TELODOCS_API_KEY).toBe("already-set");
  });

  it("ignores missing .env file", () => {
    expect(() => loadEnvFile(tmpDir)).not.toThrow();
    expect(process.env.TELODOCS_API_KEY).toBeUndefined();
  });
});
