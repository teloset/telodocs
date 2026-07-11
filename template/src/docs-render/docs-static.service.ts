import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";
import { SearchService } from "../search/search.service";

const MIME_TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

@Injectable()
export class DocsStaticService {
  constructor(private readonly search: SearchService) {}

  resolveAssetPath(relativePath: string): string {
    const safePath = this.search.resolveSafePath(relativePath);
    if (!fs.existsSync(safePath) || !fs.statSync(safePath).isFile()) {
      throw new Error(`Asset not found: ${relativePath}`);
    }
    return safePath;
  }

  getContentType(relativePath: string): string {
    const ext = path.extname(relativePath).toLowerCase();
    return MIME_TYPES[ext] ?? "application/octet-stream";
  }
}
