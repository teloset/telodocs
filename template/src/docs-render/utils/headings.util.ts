import { TocHeading } from "../types/doc-frontmatter.interface";

const HEADING_RE = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/gis;

export function extractHeadings(html: string): TocHeading[] {
  const headings: TocHeading[] = [];

  for (const match of html.matchAll(HEADING_RE)) {
    headings.push({
      level: Number(match[1]),
      id: match[2]!,
      text: stripTags(match[3]!),
    });
  }

  return headings;
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim();
}
