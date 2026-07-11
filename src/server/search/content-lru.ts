interface ContentEntry {
  path: string;
  mtimeMs: number;
  content: string;
  bytes: number;
}

export class ContentLru {
  private readonly entries = new Map<string, ContentEntry>();
  private totalBytes = 0;

  constructor(
    private readonly maxBytes: number,
    private readonly maxEntries: number,
  ) {}

  get(path: string, mtimeMs: number): string | null {
    const entry = this.entries.get(path);
    if (!entry || entry.mtimeMs !== mtimeMs) {
      return null;
    }

    this.touch(path, entry);
    return entry.content;
  }

  set(path: string, mtimeMs: number, content: string): void {
    const bytes = Buffer.byteLength(content, "utf-8");
    const existing = this.entries.get(path);
    if (existing) {
      this.totalBytes -= existing.bytes;
      this.entries.delete(path);
    }

    const entry: ContentEntry = { path, mtimeMs, content, bytes };
    this.entries.set(path, entry);
    this.totalBytes += bytes;
    this.evict();
  }

  delete(path: string): void {
    const entry = this.entries.get(path);
    if (!entry) {
      return;
    }

    this.totalBytes -= entry.bytes;
    this.entries.delete(path);
  }

  clear(): void {
    this.entries.clear();
    this.totalBytes = 0;
  }

  private touch(path: string, entry: ContentEntry): void {
    this.entries.delete(path);
    this.entries.set(path, entry);
  }

  private evict(): void {
    while (
      this.entries.size > this.maxEntries ||
      this.totalBytes > this.maxBytes
    ) {
      const oldest = this.entries.keys().next().value;
      if (!oldest) {
        break;
      }
      this.delete(oldest);
    }
  }
}
