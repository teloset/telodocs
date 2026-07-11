export interface GrepMatch {
  file: string;
  line: number;
  column: number;
  text: string;
  contextBefore: string[];
  contextAfter: string[];
}

export interface ReadResult {
  path: string;
  content: string;
  startLine: number;
  endLine: number;
  totalLines: number;
}
