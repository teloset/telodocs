import { Injectable } from "@nestjs/common";
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";
import hljs from "highlight.js";

@Injectable()
export class MarkdownRenderService {
  constructor() {
    marked.use(gfmHeadingId());
    marked.setOptions({ gfm: true, breaks: false });
    marked.use({
      renderer: {
        code({ text, lang }: { text: string; lang?: string }) {
          const language =
            lang && hljs.getLanguage(lang) ? lang : "plaintext";
          const highlighted = hljs.highlight(text, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
        },
      },
    });
  }

  async renderMarkdown(source: string): Promise<string> {
    return marked.parse(source);
  }
}
