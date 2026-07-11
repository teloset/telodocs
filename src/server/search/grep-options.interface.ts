import { GrepMatch } from "./search.types";

export type GrepOutputMode = "content" | "files_with_matches" | "count";

export interface GrepOptions {
  glob?: string;
  maxResults?: number;
  outputMode?: GrepOutputMode;
  caseInsensitive?: boolean;
  contextLines?: number;
}

export type GrepSearchResult =
  | { outputMode: "content"; matches: GrepMatch[] }
  | { outputMode: "files_with_matches"; files: string[] }
  | { outputMode: "count"; counts: Array<{ file: string; count: number }> };
