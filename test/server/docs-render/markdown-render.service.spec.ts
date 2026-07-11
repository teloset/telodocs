import { describe, expect, it } from "vitest";
import { MarkdownRenderService } from "../../../src/server/docs-render/markdown-render.service";

describe("MarkdownRenderService", () => {
  const service = new MarkdownRenderService();

  it("renders GFM tables with a scroll wrapper", async () => {
    const html = await service.renderMarkdown(`
| Term | Orders context |
|------|----------------|
| Product | Item a customer can purchase |
`);

    expect(html).toContain('<div class="docs-table-wrap"><table>');
    expect(html).toContain("<th>Term</th>");
    expect(html).toContain("<td>Product</td>");
    expect(html).toContain("</table></div>");
  });
});
