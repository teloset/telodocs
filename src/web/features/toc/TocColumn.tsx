import { useMemo, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TocHeading } from "../../shared/types/docs";

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
    <aside
      className="sticky top-14 hidden h-[calc(100vh-3.5rem)] border-l xl:block"
      aria-label="On this page"
    >
      <ScrollArea className="h-full px-4 py-8">
        <p className="mb-3 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          On this page
        </p>
        <ul className="space-y-0.5">
          {items.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={cn(
                  "block border-l-2 border-transparent py-1 text-sm text-muted-foreground transition-colors hover:text-primary",
                  heading.level === 3 && "pl-5",
                  heading.level >= 4 && "pl-7",
                  heading.level === 2 && "pl-2",
                  activeId === heading.id &&
                    "border-primary font-medium text-primary",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </aside>
  );
}
