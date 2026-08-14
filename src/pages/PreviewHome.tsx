import { Link, useParams } from "react-router-dom";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import PreviewCredit from "@/components/preview/PreviewCredit";
import PricingCard from "@/components/preview/PricingCard";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import NotFound from "@/pages/NotFound";

export default function PreviewHome() {
  const { secret } = useParams<{ project: string; secret: string }>();
  const project = secret ? previewProjects[secret] : undefined;
  const { theme, toggleTheme } = useThemeStore();
  usePreviewFavicon(project?.logo);
  usePreviewTitle(project?.projectName);

  if (!project) return <NotFound />;

  // Premier contact a froid (coldIntro present) : fond creme en clair (headline-bg, deja defini
  // dans tailwind.config.ts, jusque-la inutilise) plutot que le blanc austere du reste du
  // portfolio. En sombre, "btp-dark" (#2C1810, brun) essaye puis retire le 14/08 (percu comme
  // rougeatre a l'ecran, jugé pas pro) : fond standard du theme conserve en sombre. Page d'un
  // client deja engage (Mylene) : fond inchange dans les deux modes.
  const isColdProspect = Boolean(project.coldIntro);

  return (
    <div
      className={`min-h-dvh flex flex-col relative ${
        isColdProspect ? "bg-headline-bg dark:bg-background" : "bg-background"
      }`}
    >
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl text-center">
          <img src={project.logo} alt="" className="h-56 md:h-80 w-auto mx-auto mb-8 drop-shadow-lg" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{project.projectName}</h1>

          {project.coldIntro ? (
            // Premier contact a froid (prospect pas encore client) : fond plus chaleureux que le
            // reste du portfolio (cf fond de page ci-dessus), mais accents restes sobres/pro
            // (couleurs neutres du systeme, pas de teinte vive) a la demande de Gilles le 14/08 :
            // un accent colore (coral, puis amber) a ete essaye et jugé pas assez pro, retire.
            <div className="mb-6">
              <p className="text-base md:text-lg font-medium text-foreground leading-relaxed max-w-xl mx-auto mb-6">
                {project.coldIntro}
              </p>

              {/* Lien direct vers le mockup HTML statique (pas vers la page de suivi /preview/.../<round>,
                  inutile pour un premier contact a froid : le prospect veut voir son site, pas un ecran
                  de suivi de version). */}
              {project.rounds[0]?.proposals[0]?.htmlPath && (
                <Button asChild size="lg" className="rounded-full mb-8 h-14 px-10 text-lg">
                  <a href={project.rounds[0].proposals[0].htmlPath} target="_blank" rel="noopener noreferrer">
                    Votre site <ArrowRight size={20} />
                  </a>
                </Button>
              )}

              {/* bg-foreground/5 plutot que bg-card : bg-card reference le token "carte" pense pour
                  le fond noir/blanc par defaut, pas pour le fond creme/brun chaud de cette page,
                  un overlay relatif au texte s'adapte correctement aux deux. */}
              <div className="rounded-2xl bg-foreground/5 border border-foreground/10 px-6 py-5 max-w-md mx-auto">
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  <span className="block mb-1">Envie de voir un exemple concret ?</span>
                  Voici tout le travail réalisé pour une autre commerçante de Mont-de-Marsan, du premier jet jusqu'au
                  résultat final.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/cas-client/v1" target="_blank" rel="noopener noreferrer">
                    Voir l'exemple <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>

              <div className="mt-8">
                <PricingCard projectName={project.projectName} phone={project.phone} />
              </div>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-lg mb-1">Suivi du projet avec {project.contactName}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Version en cours de discussion : <span className="font-mono font-semibold">{project.currentRound}</span>
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-14">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-sm text-foreground">{project.nextAction}</span>
              </div>

              <div className="flex flex-col gap-3 text-left">
                {project.rounds.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">Aucune version disponible pour l'instant.</p>
                )}
                {/* Uniquement le round le plus recent (rounds[0], deja trie du plus recent au plus ancien) :
                    l'historique complet reste accessible via le drawer de versions sur la page de detail. */}
                {project.rounds.slice(0, 1).map((r) => (
                  <Link
                    key={r.round}
                    to={`/preview/${project.slug}/${secret}/${r.round.toLowerCase()}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card px-6 py-5 hover:border-foreground/30 hover:shadow-sm transition-all"
                  >
                    <div>
                      <span className="font-mono text-base font-semibold">{r.round}</span>
                      <span className="text-sm text-muted-foreground ml-3">{r.date}</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {r.proposals.length} proposition{r.proposals.length > 1 ? "s" : ""} à consulter
                      </p>
                    </div>
                    <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <PreviewCredit />
    </div>
  );
}
