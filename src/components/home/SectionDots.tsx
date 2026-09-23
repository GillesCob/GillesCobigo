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
    // Articles : mode Dev uniquement (mockup, lien .dev-only entre Projets et Compétences).
    ...(mode === "dev" ? [{ id: "articles", label: "Articles" }] : []),
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
    <nav aria-label="Navigation entre sections" className="mp-section-nav">
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
            className={cn(isActive && "active")}
          >
            <span className="mp-section-nav-dot" />
            <span className="mp-section-nav-label">{link.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
