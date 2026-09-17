import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Mode } from "@/store/modeStore";

interface ISectionDotsProps {
  mode: Mode;
  activeSection: string;
  onActiveChange: (id: string) => void;
}

interface ISectionLink {
  id: string;
  label: string;
}

// Nav latérale à points (desktop uniquement, masquée sous 900px comme dans le mockup de
// référence). Seul le lien du mode courant (Projets ou Chantiers) existe dans le DOM à un instant
// T : le mapping entre les deux vit dans NewHome.tsx (bascule de mode), pas ici.
export default function SectionDots({ mode, activeSection, onActiveChange }: ISectionDotsProps) {
  const links: ISectionLink[] = [
    { id: "hero", label: "Accueil" },
    { id: "parcours", label: "Parcours" },
    mode === "dev" ? { id: "projets", label: "Projets" } : { id: "chantiers", label: "Chantiers" },
    { id: "competences", label: "Compétences" },
    { id: "contact", label: "Contact" },
  ];

  useEffect(() => {
    const ids = links.map((l) => l.id);
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onActiveChange(entry.target.id);
        });
      },
      { threshold: 0.5 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <nav
      aria-label="Navigation entre sections"
      className="hidden min-[900px]:flex fixed left-[22px] top-1/2 z-30 -translate-y-1/2 flex-col gap-4"
    >
      {links.map((link) => {
        const isActive = activeSection === link.id;
        return (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => {
              e.preventDefault();
              onActiveChange(link.id);
              const el = document.getElementById(link.id);
              if (!el) return;
              if (link.id === "hero") {
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
              }
              const y = el.getBoundingClientRect().top + window.scrollY - 90;
              window.scrollTo({ top: y, behavior: "smooth" });
            }}
            className="group flex items-center gap-2.5"
          >
            <span
              className={cn(
                "h-[7px] w-[7px] flex-shrink-0 rounded-full bg-muted-foreground transition-[background-color,transform] duration-[250ms]",
                isActive && "scale-[1.7] bg-mode-accent"
              )}
            />
            <span
              className={cn(
                "-translate-x-1.5 whitespace-nowrap text-xs font-semibold text-foreground opacity-0 transition-all duration-200",
                isActive && "translate-x-0 opacity-100",
                "group-hover:translate-x-0 group-hover:opacity-100"
              )}
            >
              {link.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
