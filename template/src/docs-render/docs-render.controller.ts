import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { DocsRenderService } from "./docs-render.service";
import { DocsStaticService } from "./docs-static.service";
import { LayoutService } from "./layout.service";

const ASSET_NAMES = [
  "docs-shell.css",
  "docs-prose.css",
  "docs-toc.css",
  "docs.js",
] as const;

@Controller()
export class DocsRenderController {
  constructor(
    private readonly docsRender: DocsRenderService,
    private readonly layout: LayoutService,
    private readonly docsStatic: DocsStaticService,
  ) {}

  @Get()
  async index(@Res() res: Response) {
    const html = await this.docsRender.renderIndex();
    res.type("html").send(html);
  }

  @Get("docs/*path")
  async docPage(@Param("path") pathSegments: string[], @Res() res: Response) {
    const relativePath = pathSegments.join("/");
    try {
      const html = await this.docsRender.renderPage(relativePath);
      res.type("html").send(html);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Not found";
      res.status(404).type("html").send(`<h1>Not Found</h1><p>${message}</p>`);
    }
  }

  @Get("docs-assets/*path")
  docAsset(@Param("path") pathSegments: string[], @Res() res: Response) {
    const relativePath = pathSegments.join("/");
    try {
      const filePath = this.docsStatic.resolveAssetPath(relativePath);
      res.type(this.docsStatic.getContentType(relativePath)).sendFile(filePath);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Not found";
      res.status(404).type("text/plain").send(message);
    }
  }

  @Get("assets/docs-shell.css")
  shellStyles(@Res() res: Response) {
    res.type("text/css").send(this.layout.getStylesheet("docs-shell.css"));
  }

  @Get("assets/docs-prose.css")
  proseStyles(@Res() res: Response) {
    res.type("text/css").send(this.layout.getStylesheet("docs-prose.css"));
  }

  @Get("assets/docs-toc.css")
  tocStyles(@Res() res: Response) {
    res.type("text/css").send(this.layout.getStylesheet("docs-toc.css"));
  }

  @Get("assets/docs.js")
  script(@Res() res: Response) {
    res.type("application/javascript").send(this.loadAsset("docs.js"));
  }

  private loadAsset(name: (typeof ASSET_NAMES)[number]): string {
    const candidates = [
      path.join(__dirname, "assets", name),
      path.join(process.cwd(), "src/docs-render/assets", name),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        return fs.readFileSync(candidate, "utf-8");
      }
    }

    throw new Error(`Docs asset not found: ${name}`);
  }
}
