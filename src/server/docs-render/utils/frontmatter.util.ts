import { DocFrontmatter } from "../types/doc-frontmatter.interface";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function splitFrontmatter(raw: string): {
  frontmatter: DocFrontmatter;
  body: string;
} {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return { frontmatter: {}, body: raw };
  }

  const frontmatter: DocFrontmatter = {};
  for (const line of match[1]!.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (key === "title" || key === "description" || key === "group") {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body: raw.slice(match[0].length) };
}
