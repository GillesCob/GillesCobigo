import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CaseStudyVersionsNav from "@/components/preview/CaseStudyVersionsNav";
import PreviewCredit from "@/components/preview/PreviewCredit";
import { RoundContent } from "@/components/preview/RoundContent";
import CaseStudyTour from "@/components/preview/CaseStudyTour";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import NotFound from "@/pages/NotFound";

// Page "cas client" publique (/cas-client/<round>) : reproduit a l'identique l'interface privee
// que Mylene a utilisee (/preview/dressing-mailys/EuMLnfc8Uk/<round>), donnees figees sur son
// projet (pas de lookup par secret), pour montrer a un prospect a froid l'interface reelle plutot
// qu'un resume. URL sans le nom de sa boutique (voulu, page ouverte dans un nouvel onglet depuis
// PreviewHome.tsx). Lien de retour personnalise vers /preview/<slug>/<secret> du prospect transmis
// en query param (?from=...) plutot que par une page dupliquee par prospect, cf CaseStudyVersionsNav.tsx
// pour la propagation sur tous les rounds. Cf Projets/Boutiques/workflow-cc.md.
const CASE_STUDY_SECRET = "EuMLnfc8Uk";

export default function CaseStudyRound() {
  const { round } = useParams<{ round: string }>();
  const [searchParams] = useSearchParams();
  const { search } = useLocation();
  const from = searchParams.get("from");
  const project = previewProjects[CASE_STUDY_SECRET];
  const entry = project.rounds.find((r) => r.round.toLowerCase() === round?.toLowerCase());
  const { theme, toggleTheme } = useThemeStore();
  usePreviewFavicon(project.logo);
  usePreviewTitle(entry ? `${entry.round} · ${project.projectName} (exemple)` : undefined);

  if (!entry) return <NotFound />;

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      <CaseStudyTour
        currentRound={entry.round}
        search={search}
        ctaHref={from ? `/preview/${from}#tarif` : undefined}
      />

      {/* Bandeau figé en haut, visible pendant tout le scroll (demande explicite du 15/08 : un
          encart qui ne reste que le temps de le croiser une fois se rate trop facilement). Le
          toggle theme, auparavant seul en absolute top-4 right-4, est integre a la meme barre
          fixed pour ne jamais se faire recouvrir par elle. Lien personnalise si ?from=<slug>/<secret>
          est present (transmis depuis PreviewHome.tsx), sinon repli generique (acces direct a la
          page sans ce contexte). */}
      <div className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <p className="text-sm text-foreground shrink-0">Envie de la même chose pour votre site ?</p>
            {from ? (
              <Button asChild size="sm" className="rounded-full shrink-0 w-fit">
                <Link to={`/preview/${from}#tarif`}>
                  Découvrez comment <ArrowRight size={14} />
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground shrink-0">
                Répondez au mail que vous avez reçu, ou appelez-moi.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 shrink-0"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* pt-[165px]/sm:pt-[150px] : compense la hauteur du bandeau fixed ci-dessus (96px suffisait
          seul), mais aussi la bulle de la visite guidee sur l'etape 1 ("proposals"), qui a besoin
          d'assez de place au-dessus de sa cible pour ne pas etre rognee en haut d'ecran quand la
          page est deja scrollee tout en haut (meme bug et meme correctif que sur le prototype
          vault, Projets/V1-Echanges/mockups/version-guided-tour.html, 16/08 : passe de 96 a 150px
          desktop/165px mobile). max-w-6xl : memes proportions que PreviewRound.tsx, page dont
          celle-ci est la copie. */}
      <div className="flex-1 px-6 md:px-12 pt-[165px] sm:pt-[150px] pb-10 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <CaseStudyVersionsNav
                basePath="/cas-client"
                currentRound={entry.round}
                // Ordre inverse de project.rounds (V6 -> V1, le plus recent d'abord, utile sur la page
                // privee de Mylene) : ici V1 -> V6, pour qu'un prospect qui arrive lise la progression
                // dans l'ordre plutot que de tomber sur la version la plus aboutie en premier.
                rounds={[...project.rounds].reverse().map((r) => ({ round: r.round, date: r.date }))}
              />
            </div>

            <div className="flex-1 min-w-0">
              <RoundContent entry={entry} contactName={project.contactName} />

              {/* Formulaire volontairement inactif : simple demonstration du mecanisme de retour
                  pour un prospect, jamais un vrai envoi (posterait dans le Formspree de Mylene). */}
              <div className="rounded-xl border border-border p-6 bg-card">
                <h2 className="text-sm font-semibold mb-3">Vos retours concernant la {entry.round}</h2>
                <textarea
                  disabled
                  rows={4}
                  placeholder="Listez ici les éléments à ajouter, modifier ou supprimer, à chaque nouvelle version proposée."
                  className="w-full rounded-lg border border-input bg-muted/30 px-3 py-3 text-sm text-muted-foreground resize-none cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  className="mt-3 inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary/50 text-primary-foreground cursor-not-allowed"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PreviewCredit />
    </div>
  );
}
