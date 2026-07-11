import { Controller, Get, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { DocsRenderService } from "./docs-render.service";

@Controller()
export class DocsRenderController {
  constructor(private readonly docsRender: DocsRenderService) {}

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
}
