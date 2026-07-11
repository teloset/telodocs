import { describe, it, expect } from "vitest";
import { formatGrepResult } from "../../../src/server/mcp/grep-format.util";

describe("formatGrepResult", () => {
  it("formats files_with_matches output", () => {
    const text = formatGrepResult({
      outputMode: "files_with_matches",
      files: ["guides/start.md", "api/auth.md"],
    });
    expect(text).toBe("guides/start.md\napi/auth.md");
  });

  it("formats count output", () => {
    const text = formatGrepResult({
      outputMode: "count",
      counts: [
        { file: "guides/start.md", count: 2 },
        { file: "api/auth.md", count: 1 },
      ],
    });
    expect(text).toBe("guides/start.md:2\napi/auth.md:1");
  });
});
