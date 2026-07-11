import path from "node:path";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const DEFAULT_PROJECT_NAME = "Telodocs";

export function extractDocTitle(raw: string, relativePath: string): string {
  const frontmatterTitle = parseFrontmatterTitle(raw);
  const title = frontmatterTitle || titleFromPath(relativePath);
  return title.replaceAll("{{projectName}}", DEFAULT_PROJECT_NAME);
}

function parseFrontmatterTitle(raw: string): string | undefined {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    return undefined;
  }

  for (const line of match[1]!.split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    if (key !== "title") {
      continue;
    }

    return line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }

  return undefined;
}

function titleFromPath(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  if (base.toLowerCase() === "index") {
    const parent = path.dirname(filePath);
    return parent === "." ? "Home" : formatLabel(parent);
  }
  return formatLabel(base);
}

function formatLabel(value: string): string {
  const leaf = value.split("/").pop() ?? value;
  return leaf
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
