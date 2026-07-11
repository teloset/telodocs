import { describe, expect, it } from "vitest";
import { buildConfigNav } from "../../../src/server/docs-render/builders/config-nav.builder";
import { buildFileNav } from "../../../src/server/docs-render/builders/file-nav.builder";
import { splitFrontmatter } from "../../../src/server/docs-render/utils/frontmatter.util";
import { resolvePageSlug } from "../../../src/server/docs-render/utils/page-slug.util";

describe("docs navigation", () => {
  const files = [
    "index.md",
    "conventions.md",
    "guides/getting-started.md",
  ];

  it("builds a nested tree from doc paths", () => {
    const tree = buildFileNav(files);
    expect(tree.find((item) => item.name === "guides")?.children).toEqual([
      expect.objectContaining({
        name: "Getting Started",
        path: "guides/getting-started.md",
      }),
    ]);
  });

  it("builds grouped navigation from docs.json", () => {
    const tree = buildConfigNav(
      {
        navigation: {
          tabs: [
            {
              tab: "Docs",
              groups: [
                {
                  group: "Getting started",
                  pages: ["index", "guides/getting-started"],
                },
                { group: "Reference", pages: ["conventions"] },
              ],
            },
          ],
        },
      },
      files,
    );

    expect(tree).toHaveLength(2);
    expect(tree[0]?.isGroup).toBe(true);
    expect(tree[0]?.children.map((item) => item.path)).toEqual([
      "index.md",
      "guides/getting-started.md",
    ]);
  });

  it("builds nested groups from docs.json", () => {
    const tree = buildConfigNav(
      {
        navigation: {
          tabs: [
            {
              tab: "Docs",
              groups: [
                {
                  group: "Engineering Standards",
                  pages: [
                    "index",
                    {
                      group: "API Design",
                      expanded: true,
                      pages: [
                        "guides/getting-started",
                        "conventions",
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
      files,
    );

    expect(tree).toHaveLength(1);
    expect(tree[0]?.defaultExpanded).toBe(false);
    expect(tree[0]?.children).toHaveLength(2);
    expect(tree[0]?.children[1]).toMatchObject({
      name: "API Design",
      isGroup: true,
      defaultExpanded: true,
      children: [
        expect.objectContaining({ path: "guides/getting-started.md" }),
        expect.objectContaining({ path: "conventions.md" }),
      ],
    });
  });

  it("nests flattened Mintlify-style group names into a tree", () => {
    const tree = buildConfigNav(
      {
        navigation: {
          tabs: [
            {
              tab: "Docs",
              groups: [
                {
                  group: "Overview",
                  pages: ["index"],
                },
                {
                  group: "Engineering Standards",
                  pages: ["guides/getting-started"],
                },
                {
                  group: "Engineering Standards — Reference",
                  pages: ["conventions"],
                },
              ],
            },
          ],
        },
      },
      files,
    );

    expect(tree).toHaveLength(2);
    expect(tree[0]?.name).toBe("Overview");
    expect(tree[1]).toMatchObject({
      name: "Engineering Standards",
      isGroup: true,
    });
    expect(tree[1]?.children).toHaveLength(2);
    expect(tree[1]?.children[0]).toMatchObject({
      path: "guides/getting-started.md",
    });
    expect(tree[1]?.children[1]).toMatchObject({
      name: "Reference",
      isGroup: true,
      children: [expect.objectContaining({ path: "conventions.md" })],
    });
  });

  it("resolves page slugs to files", () => {
    expect(resolvePageSlug("guides/getting-started", files)).toBe(
      "guides/getting-started.md",
    );
    expect(resolvePageSlug("index", files)).toBe("index.md");
  });
});

describe("frontmatter", () => {
  it("parses title and description", () => {
    const { frontmatter, body } = splitFrontmatter(`---
title: Hello
description: World
---

## Section`);

    expect(frontmatter).toEqual({
      title: "Hello",
      description: "World",
    });
    expect(body.trim().startsWith("## Section")).toBe(true);
  });
});
