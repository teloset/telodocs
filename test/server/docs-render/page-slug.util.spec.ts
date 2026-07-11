import { describe, expect, it } from "vitest";
import {
  pageHref,
  resolveDocFilePath,
} from "../../../src/server/docs-render/utils/page-slug.util";

const files = [
  "index.mdx",
  "guides/getting-started.md",
  "engineering-standards/index.mdx",
  "engineering-standards/architecture/index.mdx",
  "engineering-standards/architecture/architecture-principles.mdx",
];

describe("pageHref", () => {
  it("maps only the root index to /", () => {
    expect(pageHref("index.md")).toBe("/");
    expect(pageHref("index.mdx")).toBe("/");
  });

  it("maps section indexes to clean directory URLs", () => {
    expect(pageHref("engineering-standards/index.mdx")).toBe(
      "/docs/engineering-standards",
    );
    expect(pageHref("design-system/components/index.mdx")).toBe(
      "/docs/design-system/components",
    );
  });

  it("maps regular pages under /docs/", () => {
    expect(pageHref("guides/getting-started.md")).toBe(
      "/docs/guides/getting-started.md",
    );
  });
});

describe("resolveDocFilePath", () => {
  it("resolves directory-style paths to section index files", () => {
    expect(resolveDocFilePath("engineering-standards/architecture", files)).toBe(
      "engineering-standards/architecture/index.mdx",
    );
  });

  it("resolves explicit index slugs and file paths", () => {
    expect(
      resolveDocFilePath("engineering-standards/architecture/index", files),
    ).toBe("engineering-standards/architecture/index.mdx");
    expect(
      resolveDocFilePath("engineering-standards/architecture/index.mdx", files),
    ).toBe("engineering-standards/architecture/index.mdx");
  });
});
