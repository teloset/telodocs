export interface DocFrontmatter {
  title?: string;
  description?: string;
  group?: string;
}

export interface TocHeading {
  level: number;
  id: string;
  text: string;
}

export interface RenderedDoc {
  html: string;
  frontmatter: DocFrontmatter;
  headings: TocHeading[];
}
