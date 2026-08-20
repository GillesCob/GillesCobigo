import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CaseStudyVersionsNav from "@/components/preview/CaseStudyVersionsNav";
import PreviewCredit from "@/components/preview/PreviewCredit";
import { RoundContent } from "@/components/preview/RoundContent";
import CaseStudyTour from "@/components/preview/CaseStudyTour";
import { previewProjects } from "@/data/previewProjects";
import { useCaseStudyTourStore } from "@/store/caseStudyTourStore";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import NotFound from "@/pages/NotFound";

// Espace ajoute a la hauteur mesuree du bandeau, en dehors du tour actif (19/08, item 25, meme
// convention que le mockup version-guided-tour.html/proposition-1.html).
const BANDEAU_GAP_PX = 24;

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
  // Slug du prospect (avant le "/<secret>"), pour le tracking funnel uniquement (cf
  // trackFunnelBeacon("visite-guidee") dans CaseStudyTour.tsx). Absent si la page est ouverte
  // sans contexte prospect (from absent), jamais de tracking dans ce cas.
  const prospectSlug = from?.split("/")[0];
  const project = previewProjects[CASE_STUDY_SECRET];
  const entry = project.rounds.find((r) => r.round.toLowerCase() === round?.toLowerCase());
  usePreviewFavicon(project.logo);
  usePreviewTitle(entry ? `${entry.round} · ${project.projectName} (exemple)` : undefined);

  // Espace reserve sous le bandeau fixe : deux besoins differents selon l'etat du tour, jamais
  // une seule valeur devinee comme avant (19/08, item 25). Pendant le tour actif, la bulle de
  // l'etape 1 a besoin d'une marge fixe deja calibree le 16/08 (150/165px, intacte, aucune
  // regression prise ici). Hors tour actif (idle, termine, "visite libre") : plus besoin de cette
  // marge bulle, seule la hauteur reelle du bandeau compte, mesuree en JS plutot que devinee (le
  // bandeau peut wrapper differemment selon l'ecran), meme mecanique que
  // Projets/V1-Echanges/mockups/version-guided-tour.html.
  // Bandeau masque pendant tout le tour (19/08, item 5, porte depuis version-guided-tour.html :
  // ":root:not(.tour-off) .topbar{display:none}") : visible seulement une fois "off" (reellement
  // sorti du parcours via "Visiter librement"), jamais pendant "active" ni juste apres "Terminer"
  // ("finished", modale de fin encore affichee).
  const tourStatus = useCaseStudyTourStore((s) => s.status);
  const bandeauVisible = tourStatus === "off";
  const bandeauRef = useRef<HTMLDivElement>(null);
  const [bandeauPadding, setBandeauPadding] = useState<number | null>(null);
  const usesFixedTourPadding = tourStatus === "active";

  useEffect(() => {
    if (!bandeauVisible) {
      setBandeauPadding(null);
      return;
    }
    function sync() {
      if (bandeauRef.current) setBandeauPadding(bandeauRef.current.offsetHeight + BANDEAU_GAP_PX);
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [bandeauVisible]);

  if (!entry) return <NotFound />;

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      <CaseStudyTour
        currentRound={entry.round}
        search={search}
        ctaHref={from ? `/preview/${from}#tarif` : undefined}
        slug={prospectSlug}
      />

      {/* Bandeau figé en haut, visible pendant tout le scroll (demande explicite du 15/08 : un
          encart qui ne reste que le temps de le croiser une fois se rate trop facilement). Masque
          pendant tout le tour, visible seulement une fois "off" (19/08, item 5, cf useEffect
          ci-dessus). Toggle theme retire (19/08, item 26) : page toujours claire, alignee sur
          version-guided-tour.html, y compris pour Mylene (site termine, ne devrait plus y
          retourner). Lien personnalise si ?from=<slug>/<secret> est present (transmis depuis
          PreviewHome.tsx), sinon repli generique (acces direct a la page sans ce contexte). */}
      {bandeauVisible && (
      <div ref={bandeauRef} className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <p className="text-sm text-foreground shrink-0">Vous aussi vous souhaitez créer votre site personnalisé ?</p>
            {from ? (
              <Button asChild size="sm" className="rounded-full shrink-0 w-fit">
                <Link to={`/preview/${from}#tarif`}>
                  Obtenir des informations <ArrowRight size={14} />
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground shrink-0">
                Répondez au mail que vous avez reçu, ou appelez-moi.
              </p>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Pendant le tour actif (usesFixedTourPadding) : pt-[165px]/sm:pt-[150px] fixe, calibre le
          16/08 pour laisser assez de place a la bulle de l'etape 1 au-dessus de sa cible, jamais
          touche ici. Hors tour actif : bandeauPadding mesure dynamiquement (cf useEffect
          ci-dessus), corrige le rognage du bandeau en mode "visite libre" (19/08, item 25).
          max-w-6xl : memes proportions que PreviewRound.tsx, page dont celle-ci est la copie. */}
      <div
        className={`flex-1 px-6 md:px-12 pb-10 md:pb-16 ${usesFixedTourPadding ? "pt-[165px] sm:pt-[150px]" : ""}`}
        style={!usesFixedTourPadding && bandeauPadding !== null ? { paddingTop: bandeauPadding } : undefined}
      >
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
                externalLink={{ label: "Version en ligne ↗", href: "https://dressing-de-mailys.fr/" }}
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
