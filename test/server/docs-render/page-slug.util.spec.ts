import { describe, expect, it } from "vitest";
import { pageHref } from "../../../src/server/docs-render/utils/page-slug.util";

describe("pageHref", () => {
  it("maps only the root index to /", () => {
    expect(pageHref("index.md")).toBe("/");
    expect(pageHref("index.mdx")).toBe("/");
  });

  it("maps section indexes to their doc path", () => {
    expect(pageHref("engineering-standards/index.mdx")).toBe(
      "/docs/engineering-standards/index.mdx",
    );
    expect(pageHref("design-system/components/index.mdx")).toBe(
      "/docs/design-system/components/index.mdx",
    );
  });

  it("maps regular pages under /docs/", () => {
    expect(pageHref("guides/getting-started.md")).toBe(
      "/docs/guides/getting-started.md",
    );
  });
});
