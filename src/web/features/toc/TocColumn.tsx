import { useMemo, useState, useEffect } from "react";
import type { TocHeading } from "../../shared/types/docs";
import "./toc.css";

function useActiveHeadingId(items: TocHeading[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const itemIds = useMemo(
    () => items.map((item) => item.id).join("|"),
    [items],
  );

  useEffect(() => {
    const elements = itemIds
      .split("|")
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [itemIds]);

  return activeId;
}

interface TocColumnProps {
  headings: TocHeading[];
}

export function TocColumn({ headings }: TocColumnProps) {
  const items = useMemo(
    () => headings.filter((heading) => heading.level >= 2),
    [headings],
  );
  const activeId = useActiveHeadingId(items);

  if (!items.length) {
    return null;
  }

  return (
    <aside className="docs-toc" aria-label="On this page">
      <p className="docs-toc-title">On this page</p>
      <ul className="docs-toc-list">
        {items.map((heading) => (
          <li
            key={heading.id}
            className={`docs-toc-item docs-toc-h${heading.level}`}
          >
            <a
              href={`#${heading.id}`}
              className={activeId === heading.id ? "is-active" : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
