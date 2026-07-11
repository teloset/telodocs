import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { DocsApiService } from "./docs-api.service";
import { DocsSearchService } from "./docs-search.service";
import { DocsSpaService } from "./docs-spa.service";
import { DocsStaticService } from "./docs-static.service";

@Controller()
export class DocsRenderController {
  constructor(
    private readonly docsApi: DocsApiService,
    private readonly docsSearch: DocsSearchService,
    private readonly docsSpa: DocsSpaService,
    private readonly docsStatic: DocsStaticService,
  ) {}

  @Get("api/docs/site")
  async site(@Res() res: Response) {
    res.json(await this.docsApi.getSite());
  }

  @Get("api/docs/nav")
  async nav(@Res() res: Response) {
    res.json(await this.docsApi.getNav());
  }

  @Get("api/docs/page")
  async page(@Query("path") docPath: string | undefined, @Res() res: Response) {
    try {
      const resolved = this.docsApi.resolveRequestedPath(docPath);
      res.json(await this.docsApi.getPage(resolved));
    } catch (err) {
      if (err instanceof NotFoundException) {
        res.status(404).json({ message: err.message });
        return;
      }
      throw err;
    }
  }

  @Get("api/docs/search")
  async search(@Query("q") query = "", @Res() res: Response) {
    res.json({ results: await this.docsSearch.query(query) });
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

  @Get("assets/*path")
  spaAsset(@Param("path") pathSegments: string[], @Res() res: Response) {
    const assetPath = this.docsSpa.resolveAssetPath(
      `/assets/${pathSegments.join("/")}`,
    );
    if (!assetPath) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }

    res.type(this.docsSpa.getContentType(assetPath)).sendFile(assetPath);
  }

  @Get(["", "docs", "docs/*path"])
  async spaFallback(@Req() req: Request, @Res() res: Response) {
    res.type("html").send(await this.docsSpa.renderIndex(req.path));
  }
}
