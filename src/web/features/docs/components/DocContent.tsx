function attachCopyButtons(root: HTMLElement) {
  root.querySelectorAll(".doc-prose pre, pre").forEach((pre) => {
    if (pre.querySelector(".docs-code-copy")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "docs-code-copy absolute top-2 right-2 inline-flex h-7 items-center rounded-md border bg-background px-2 text-xs shadow-xs hover:bg-accent";
    button.textContent = "Copy";
    button.addEventListener("click", async () => {
      const code =
        pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = "Copied";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1500);
      } catch {
        button.textContent = "Failed";
      }
    });
    pre.appendChild(button);
  });
}

interface DocContentProps {
  html: string;
}

export function DocContent({ html }: DocContentProps) {
  return (
    <article
      key={html}
      ref={(node) => {
        if (node) {
          attachCopyButtons(node);
        }
      }}
      className="doc-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
