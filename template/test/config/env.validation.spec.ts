import { describe, it, expect } from "vitest";
import { validateEnvironment } from "../../src/core/config/env.validation";

describe("validateEnvironment", () => {
  it("applies defaults for optional telodocs settings", () => {
    const env = validateEnvironment({});

    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(3000);
    expect(env.TELODOCS_DOCS_AUTH).toBe("open");
    expect(env.TELODOCS_MCP_AUTH).toBe("open");
    expect(env.TELODOCS_DOCS_DIR).toBe("./docs");
    expect(env.TELODOCS_MCP_PATH).toBe("/mcp");
  });

  it("accepts valid overrides", () => {
    const env = validateEnvironment({
      PORT: "4000",
      TELODOCS_DOCS_AUTH: "gated",
      TELODOCS_MCP_AUTH: "gated",
      TELODOCS_API_KEY: "secret",
    });

    expect(env.PORT).toBe(4000);
    expect(env.TELODOCS_DOCS_AUTH).toBe("gated");
    expect(env.TELODOCS_MCP_AUTH).toBe("gated");
    expect(env.TELODOCS_API_KEY).toBe("secret");
  });

  it("rejects invalid auth modes", () => {
    expect(() =>
      validateEnvironment({ TELODOCS_DOCS_AUTH: "public" }),
    ).toThrow("Environment validation failed");
  });
});
