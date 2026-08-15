import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { List } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// Copie de PreviewVersionsNav.tsx pour la page cas client (/cas-client/...), seul le prefixe de
// route change (/cas-client/ au lieu de /preview/<slug>/<secret>/). Duplique volontairement,
// pas parametre depuis le composant prive, a la demande explicite de Gilles.

interface ICaseStudyVersionsNavProps {
  basePath: string;
  currentRound: string;
  rounds: { round: string; date: string }[];
}

export default function CaseStudyVersionsNav({ basePath, currentRound, rounds }: ICaseStudyVersionsNavProps) {
  const [open, setOpen] = useState(false);
  // Conserve ?from=<slug>/<secret> (lien de retour personnalise, cf CaseStudyRound.tsx) sur chaque
  // changement de round : sans ca, cliquer V1 -> V2 perdrait le contexte du prospect en cours.
  const { search } = useLocation();

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-40 flex-shrink-0 gap-1">
        {rounds.map((r) => (
          <Link
            key={r.round}
            to={`${basePath}/${r.round.toLowerCase()}${search}`}
            className={`px-3 py-2 rounded-md text-sm font-mono transition-colors ${
              r.round.toLowerCase() === currentRound.toLowerCase()
                ? "bg-secondary text-secondary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {r.round}
          </Link>
        ))}
      </aside>

      {/* Bouton mobile : icone seule remplacee par un bouton texte+icone (15/08), un utilisateur
          "basique" qui ne connait pas ce pattern d'icone n'aurait jamais compris qu'il y a 6
          versions a consulter derriere un simple rond. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 h-11 pl-4 pr-5 rounded-full bg-foreground text-background flex items-center gap-2 shadow-lg transition-opacity hover:opacity-90 text-sm font-medium"
      >
        <List size={18} />
        Voir les {rounds.length} versions
      </button>

      {/* Drawer mobile */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="md:hidden max-h-[70vh] flex flex-col">
          <DrawerHeader className="border-b border-border pb-4">
            <DrawerTitle>Versions</DrawerTitle>
          </DrawerHeader>
          <nav className="overflow-y-auto flex-1 px-4 py-4 flex flex-col gap-1">
            {rounds.map((r) => (
              <DrawerClose asChild key={r.round}>
                <Link
                  to={`${basePath}/${r.round.toLowerCase()}${search}`}
                  className={`flex items-center justify-between text-left text-sm py-2.5 px-3 rounded-md transition-colors ${
                    r.round.toLowerCase() === currentRound.toLowerCase()
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="font-mono">{r.round}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </Link>
              </DrawerClose>
            ))}
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
}
