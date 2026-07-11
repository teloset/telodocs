import { describe, expect, it } from "vitest";
import { nestPrefixedConfigGroups } from "../../../src/server/docs-render/builders/nest-config-groups.util";
import { DocsConfigGroup } from "../../../src/server/docs-render/types/docs-config.interface";

describe("nestPrefixedConfigGroups", () => {
  it("returns groups unchanged when no prefixed names exist", () => {
    const groups: DocsConfigGroup[] = [
      { group: "Overview", pages: ["index"] },
      { group: "Guides", pages: ["guides/start"] },
    ];

    expect(nestPrefixedConfigGroups(groups)).toEqual(groups);
  });

  it("merges prefixed groups under their parent and drops duplicate standalone parent", () => {
    const groups: DocsConfigGroup[] = [
      { group: "Overview", pages: ["index"] },
      { group: "Engineering Standards", pages: ["engineering-standards/index"] },
      {
        group: "Engineering Standards — API Design",
        pages: ["engineering-standards/api-design/introduction"],
      },
      {
        group: "Engineering Standards — Testing",
        pages: ["engineering-standards/testing/index"],
      },
    ];

    expect(nestPrefixedConfigGroups(groups)).toEqual([
      { group: "Overview", pages: ["index"] },
      {
        group: "Engineering Standards",
        pages: [
          "engineering-standards/index",
          {
            group: "API Design",
            pages: ["engineering-standards/api-design/introduction"],
          },
          {
            group: "Testing",
            pages: ["engineering-standards/testing/index"],
          },
        ],
      },
    ]);
  });

  it("supports en dash and hyphen separators", () => {
    const groups: DocsConfigGroup[] = [
      {
        group: "Framework Standards – Python",
        pages: ["python/index"],
      },
      {
        group: "Framework Standards - TypeScript",
        pages: ["typescript/index"],
      },
    ];

    expect(nestPrefixedConfigGroups(groups)).toEqual([
      {
        group: "Framework Standards",
        pages: [
          { group: "Python", pages: ["python/index"] },
          { group: "TypeScript", pages: ["typescript/index"] },
        ],
      },
    ]);
  });
});
