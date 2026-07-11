import { Injectable } from "@nestjs/common";
import fs from "node:fs";
import path from "node:path";

@Injectable()
export class DocsSpaService {
  private readonly indexPath = this.resolveIndexPath();

  getIndexPath(): string {
    if (!fs.existsSync(this.indexPath)) {
      throw new Error(
        "Docs UI bundle not found. Run npm run build to compile the React app.",
      );
    }
    return this.indexPath;
  }

  resolveAssetPath(urlPath: string): string | null {
    const distWeb = path.dirname(this.indexPath);
    const assetPath = path.join(distWeb, urlPath.replace(/^\//, ""));

    if (!this.isPathContained(distWeb, assetPath) || !fs.existsSync(assetPath)) {
      return null;
    }

    return fs.statSync(assetPath).isFile() ? assetPath : null;
  }

  getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".js":
        return "application/javascript";
      case ".css":
        return "text/css";
      case ".map":
        return "application/json";
      case ".svg":
        return "image/svg+xml";
      case ".png":
        return "image/png";
      case ".ico":
        return "image/x-icon";
      case ".woff2":
        return "font/woff2";
      default:
        return "application/octet-stream";
    }
  }

  private resolveIndexPath(): string {
    const candidates = [
      path.resolve(__dirname, "../../web/index.html"),
      path.resolve(__dirname, "../../../web/index.html"),
      path.resolve(process.cwd(), "dist/web/index.html"),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return candidates[0]!;
  }

  private isPathContained(root: string, target: string): boolean {
    const relative = path.relative(root, target);
    return relative !== ".." && !relative.startsWith(`..${path.sep}`);
  }
}
