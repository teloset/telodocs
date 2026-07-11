import { Injectable } from "@nestjs/common";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import fs from "node:fs";
import path from "node:path";
import { docsQueryKeys } from "../../shared/docs-query-keys";
import { DocsApiService } from "./docs-api.service";
import { docPathFromUrlPath } from "./utils/doc-path.util";

@Injectable()
export class DocsSpaService {
  private readonly indexPath = this.resolveIndexPath();

  constructor(private readonly docsApi: DocsApiService) {}

  getIndexPath(): string {
    if (!fs.existsSync(this.indexPath)) {
      throw new Error(
        "Docs UI bundle not found. Run npm run build to compile the React app.",
      );
    }
    return this.indexPath;
  }

  async renderIndex(urlPath: string): Promise<string> {
    const queryClient = new QueryClient();
    const docPath = docPathFromUrlPath(urlPath);

    queryClient.setQueryData(docsQueryKeys.site(), await this.docsApi.getSite());
    queryClient.setQueryData(docsQueryKeys.nav(), await this.docsApi.getNav());

    try {
      const resolved = docPath
        ? this.docsApi.resolveRequestedPath(docPath)
        : undefined;
      queryClient.setQueryData(
        docsQueryKeys.page(docPath),
        await this.docsApi.getPage(resolved),
      );
    } catch {
      // Client will fetch the page if bootstrap failed.
    }

    const json = JSON.stringify(dehydrate(queryClient)).replace(/</g, "\\u003c");
    const script = `<script id="telodocs-bootstrap" type="application/json">${json}</script>`;
    const template = fs.readFileSync(this.getIndexPath(), "utf-8");
    return template.replace("</head>", `${script}</head>`);
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
