import { useState } from "react";
import { List } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { IHeading } from "@/lib/articles";

interface IArticleTocProps {
  headings: IHeading[];
}

export default function ArticleToc({ headings }: IArticleTocProps) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  function handleHeadingClick(id: string, closeDrawer = false) {
    if (closeDrawer) setOpen(false);
    setTimeout(
      () => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
      closeDrawer ? 200 : 0,
    );
  }

  return (
    <>
      {/* Desktop sidebar — xl+ only */}
      <aside className="hidden xl:flex flex-col w-56 shrink-0 fixed top-16 right-0 h-[calc(100vh-4rem)] overflow-y-auto bg-background py-8 px-4 gap-3">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1 underline">
          Dans cet article
        </p>
        <nav className="flex flex-col gap-1">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleHeadingClick(heading.id);
              }}
              className={`text-sm mb-2 text-muted-foreground hover:text-foreground transition-colors leading-snug ${
                heading.level === 3 ? "pl-4" : ""
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile floating button — hidden on xl+ */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Sommaire"
        className="xl:hidden fixed bottom-20 right-6 z-40 w-11 h-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg transition-opacity hover:opacity-90"
      >
        <List size={18} />
      </button>

      {/* Mobile TOC drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="xl:hidden max-h-[70vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle>Sommaire</DrawerTitle>
          </DrawerHeader>
          <nav className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-0.5">
            {headings.map((heading) => (
              <DrawerClose asChild key={heading.id}>
                <button
                  onClick={() => handleHeadingClick(heading.id, true)}
                  className={`text-left text-sm py-2.5 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors leading-snug ${
                    heading.level === 3 ? "pl-6" : ""
                  }`}
                >
                  {heading.text}
                </button>
              </DrawerClose>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
}
