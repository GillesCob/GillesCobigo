import { Link, useLocation } from "react-router-dom";
import { useCaseStudyTourStore } from "@/store/caseStudyTourStore";

// Copie de PreviewVersionsNav.tsx pour la page cas client (/cas-client/...), seul le prefixe de
// route change (/cas-client/ au lieu de /preview/<slug>/<secret>/). Duplique volontairement,
// pas parametre depuis le composant prive, a la demande explicite de Gilles.

interface ICaseStudyVersionsNavProps {
  basePath: string;
  currentRound: string;
  rounds: { round: string; date: string }[];
}

export default function CaseStudyVersionsNav({ basePath, currentRound, rounds }: ICaseStudyVersionsNavProps) {
  // Conserve ?from=<slug>/<secret> (lien de retour personnalise, cf CaseStudyRound.tsx) sur chaque
  // changement de round : sans ca, cliquer V1 -> V2 perdrait le contexte du prospect en cours.
  const { search } = useLocation();
  // Navigation manuelle desactivee pendant une visite guidee active (18/08, alignee sur
  // version-guided-tour.html : ":root:not(.tour-off) .sidenav button{pointer-events:none}") : la
  // page est deja scroll-verrouillee sur l'etape en cours, un clic ici sortirait le visiteur du
  // parcours guide sans le vouloir. basePath sert de garde-fou : la meme nav sert aussi la page
  // privee (/preview/...) qui n'a pas de tour, jamais desactivee la-bas.
  const isTouring = useCaseStudyTourStore((s) => s.status === "active");
  const disableNav = basePath === "/cas-client" && isTouring;

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-40 flex-shrink-0 gap-1">
        {rounds.map((r) => (
          <Link
            key={r.round}
            to={`${basePath}/${r.round.toLowerCase()}${search}`}
            aria-disabled={disableNav}
            tabIndex={disableNav ? -1 : undefined}
            onClick={(e) => {
              if (disableNav) e.preventDefault();
            }}
            className={`px-3 py-2 rounded-md text-sm font-mono transition-colors ${
              disableNav ? "pointer-events-none opacity-35" : ""
            } ${
              r.round.toLowerCase() === currentRound.toLowerCase()
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {r.round}
          </Link>
        ))}
      </aside>

      {/* Rangee horizontale mobile, en haut du contenu (plus le pattern icone flottante + drawer,
          retire le 16/08 : sur mobile le bouton flottant se retrouvait couvert par les cartes de
          propositions). Element normal, dans le flux, pour que le cheminement fonctionne pareil
          qu'au clavier/desktop. */}
      <nav className="md:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {rounds.map((r) => (
          <Link
            key={r.round}
            to={`${basePath}/${r.round.toLowerCase()}${search}`}
            aria-disabled={disableNav}
            tabIndex={disableNav ? -1 : undefined}
            onClick={(e) => {
              if (disableNav) e.preventDefault();
            }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-mono transition-colors ${
              disableNav ? "pointer-events-none opacity-35" : ""
            } ${
              r.round.toLowerCase() === currentRound.toLowerCase()
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground bg-card border border-border"
            }`}
          >
            {r.round}
          </Link>
        ))}
      </nav>
    </>
  );
}
