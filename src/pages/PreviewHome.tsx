import { useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
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
  const { hash } = useLocation();
  usePreviewFavicon(project?.logo);
  usePreviewTitle(project?.projectName);

  // Arrivee depuis le mockup V1 (#exemple) ou depuis /cas-client/* (#tarif) : navigation complete
  // (nouvel onglet), le navigateur ne scroll pas tout seul vers le hash tant que React n'a pas
  // rendu la page (id absent du HTML initial). Meme pattern que Home.tsx (delai court).
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [hash]);

  if (!project) return <NotFound />;

  // Premier contact a froid (coldIntro present) : fond creme en clair (headline-bg, deja defini
  // dans tailwind.config.ts, jusque-la inutilise) plutot que le blanc austere du reste du
  // portfolio. En sombre, "btp-dark" (#2C1810, brun) essaye puis retire le 14/08 (percu comme
  // rougeatre a l'ecran, jugé pas pro) : fond standard du theme conserve en sombre. Page d'un
  // client deja engage (Mylene) : fond inchange dans les deux modes.
  const isColdProspect = Boolean(project.coldIntro);
  // Passe le chemin de retour vers /cas-client/* en query param plutot que de dupliquer cette page
  // par prospect : la page cas client est commune a tous (donnees figees sur Mylene), seul le lien
  // de retour change. Achemine par CaseStudyVersionsNav sur toute la navigation V1->V6.
  const caseStudyFrom = secret ? `${project.slug}/${secret}` : "";

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
          <img
            src={project.logo}
            alt=""
            className="h-56 md:h-80 w-auto mx-auto mb-8 drop-shadow-lg"
            style={project.logoMaxWidth ? { maxWidth: project.logoMaxWidth } : undefined}
          />
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
                  de suivi de version). Meme onglet (retire le 15/08, cf bandeau de retour du mockup) :
                  mockup -> exemple -> tarif restaient chacun un nouvel onglet, ca en accumulait 3-4 au
                  total pour un simple aller-retour, jamais l'intention initiale. */}
              {project.rounds[0]?.proposals[0]?.htmlPath && (
                <Button asChild size="lg" className="rounded-full mb-3 h-14 px-10 text-lg">
                  <a href={project.rounds[0].proposals[0].htmlPath}>
                    Votre site <ArrowRight size={20} />
                  </a>
                </Button>
              )}
              {/* Badge tarif discret sous le bouton principal (16/08) : le prix n'apparaissait
                  qu'en bas de page, un prospect pouvait repartir sans jamais le voir. Scroll vers
                  #tarif plutot que de dupliquer le montant en dur, source unique = PricingCard. */}
              <div className="mb-8">
                <a
                  href="#tarif"
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 border border-foreground/10 px-4 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  À partir de 500€
                </a>
              </div>

              {/* bg-foreground/5 plutot que bg-card : bg-card reference le token "carte" pense pour
                  le fond noir/blanc par defaut, pas pour le fond creme/brun chaud de cette page,
                  un overlay relatif au texte s'adapte correctement aux deux. */}
              <div id="exemple" className="rounded-2xl bg-foreground/5 border border-foreground/10 px-6 py-5 max-w-md mx-auto scroll-mt-8">
                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                  <span className="block mb-1">Le site proposé n'est qu'un premier jet.</span>
                  On l'affine ensemble jusqu'au résultat final, comme pour cette autre commerçante de Mont-de-Marsan :
                  voici tout son parcours, du premier jet à la version livrée.
                  En général, la mise en ligne complète prend une semaine une fois les informations réunies.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/cas-client/v1?from=${caseStudyFrom}`}>
                    Voir l'exemple <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>

              <div id="tarif" className="mt-8 scroll-mt-8">
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
