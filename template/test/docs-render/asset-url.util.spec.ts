import { describe, expect, it } from "vitest";
import { toDocsAssetUrl } from "../../src/docs-render/utils/asset-url.util";

describe("toDocsAssetUrl", () => {
  it("builds a docs asset URL from a relative path", () => {
    expect(toDocsAssetUrl("logo.svg")).toBe("/docs-assets/logo.svg");
    expect(toDocsAssetUrl("images/logo.svg")).toBe(
      "/docs-assets/images/logo.svg",
    );
    expect(toDocsAssetUrl("/favicon.ico")).toBe("/docs-assets/favicon.ico");
  });
});
