import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CASE_STUDY_TOUR_STEPS, useCaseStudyTourStore } from "@/store/caseStudyTourStore";
import { trackFunnelBeacon } from "@/lib/funnelTracking";

interface ICaseStudyTourProps {
  /** Round affiche par la page qui monte ce composant, ex "V1". */
  currentRound: string;
  /** Query string a conserver sur chaque navigation entre rounds (?from=<slug>/<secret>). */
  search: string;
  /** Destination du CTA de fin de visite, absente si la page est ouverte sans contexte prospect. */
  ctaHref?: string;
  /** Slug du prospect (extrait de ?from=<slug>/<secret>), pour le tracking funnel uniquement.
      Absent si la page est ouverte sans contexte prospect (jamais de tracking dans ce cas). */
  slug?: string;
}

// Refonte du 20/08 (demande explicite de Gilles, apres plusieurs tours de rustines qui
// corrigeaient chaque symptome sans regler la cause : bulle qui ne se rouvrait pas, se rouvrait
// trop tot, se refermait hors du haut de page, s'ouvrait par-dessus le contenu). Cause racine de
// tous ces bugs : l'ancienne bulle etait en position:fixed, avec une hauteur qui changeait
// (repliee/depliee sur mobile), et un verrou de scroll + une marge injectee + un offset recalcules
// a la main en JS pour que bulle et cible restent toujours correctement l'une sous l'autre. Trop de
// variables a garder synchronisees manuellement (hauteur de bulle, position de scroll, limites du
// verrou, marge du document, chargement asynchrone des images).
//
// Nouvelle mecanique : la bulle est un element normal du flux du document (via createPortal dans
// un conteneur insere juste avant la cible), plus jamais positionnee par calcul JS. Le scroll natif
// du navigateur (scrollIntoView) l'amene a l'ecran avec la cible, dans le bon ordre, sans aucun
// calcul de position/marge/verrou a maintenir. Consequence assumee : plus de "bulle toujours
// visible en haut de l'ecran" ni de verrou qui empeche de scroller ailleurs (l'utilisateur peut
// scroller librement ; s'il s'eloigne de la bulle, un scroll manuel en arriere la retrouve, comme
// n'importe quel contenu de page normal).
export default function CaseStudyTour({ currentRound, search, ctaHref, slug }: ICaseStudyTourProps) {
  const navigate = useNavigate();
  const status = useCaseStudyTourStore((s) => s.status);
  const stepIndex = useCaseStudyTourStore((s) => s.stepIndex);
  const hasAutoStarted = useCaseStudyTourStore((s) => s.hasAutoStarted);
  const start = useCaseStudyTourStore((s) => s.start);
  const next = useCaseStudyTourStore((s) => s.next);
  const prev = useCaseStudyTourStore((s) => s.prev);
  const skip = useCaseStudyTourStore((s) => s.skip);
  const restart = useCaseStudyTourStore((s) => s.restart);

  const roundLower = currentRound.toLowerCase();
  const step = CASE_STUDY_TOUR_STEPS[stepIndex];
  const isOnRightRound = status === "active" && step.round === roundLower;

  // Conteneur DOM insere juste avant la cible, dans lequel la bulle est portee (cf effet
  // ci-dessous). null tant qu'aucune cible n'est trouvee/montee.
  const [bubbleContainer, setBubbleContainer] = useState<HTMLElement | null>(null);

  // Auto-demarrage uniquement en arrivant sur la V1, une seule fois par session de navigation
  // (hasAutoStarted persiste dans le store, jamais relance meme si on revient sur la V1 apres
  // avoir arrete la visite volontairement).
  useEffect(() => {
    if (roundLower === "v1" && status === "idle" && !hasAutoStarted) {
      start();
      if (slug) trackFunnelBeacon(slug, "visite-guidee");
    }
  }, [roundLower, status, hasAutoStarted, start, slug]);

  // L'etape courante pointe vers une autre version que celle affichee (survient juste apres
  // "Suivant" sur la derniere etape d'une version) : on y navigue en conservant ?from=.
  useEffect(() => {
    if (status === "active" && step.round !== roundLower) {
      navigate(`/cas-client/${step.round}${search}`);
    }
  }, [status, step, roundLower, search, navigate]);

  // Spotlight sur la cible + insertion de la bulle juste avant elle dans le DOM, uniquement quand
  // l'etape correspond a la version reellement affichee (sinon la navigation ci-dessus est en
  // cours). Un seul effet, plus aucun calcul de scroll/marge/verrou : scrollIntoView natif fait
  // tout le travail de positionnement.
  useEffect(() => {
    if (!isOnRightRound) {
      setBubbleContainer(null);
      return;
    }

    const target = document.querySelector<HTMLElement>(`[data-tour-key="${step.key}"]`);
    if (!target) {
      setBubbleContainer(null);
      return;
    }

    target.style.position = "relative";
    target.style.zIndex = "60";
    target.style.borderRadius = "14px";
    target.style.transition = "box-shadow .25s ease";
    target.style.boxShadow = "0 0 0 9999px rgba(9,9,11,.55)";
    // Encart V6 (etape 4) : ce sous-bloc n'a pas de padding propre (contrairement aux autres
    // cibles qui embarquent une card ou une grille avec gap), le spotlight collait directement au
    // texte/a la carte proposal. box-sizing:border-box pour garder la meme largeur de colonne grid
    // qu'en dehors du tour.
    if (step.key === "v6-proposals") {
      target.style.padding = "16px";
      target.style.boxSizing = "border-box";
    }

    // Conteneur de la bulle : z-index STRICTEMENT superieur a celui de la cible (corrige le 20/08,
    // ecart trouve par Gilles : "les bulles sont grisees"). A z-index egal, deux freres positionnes
    // se departagent par l'ordre du DOM, pas la valeur numerique - la cible arrivant apres le
    // conteneur, son enorme box-shadow (l'assombrissement plein ecran) se peignait par-dessus la
    // bulle. 61 > 60 : la bulle reste toujours au-dessus du cache, quel que soit l'ordre DOM.
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.zIndex = "61";
    target.parentNode?.insertBefore(container, target);
    // setBubbleContainer declenche le rendu du portail (bulle) DANS ce conteneur, mais de facon
    // asynchrone (mise a jour d'etat React) : le scroll ne doit se faire qu'une fois ce contenu
    // reellement monte, cf effet dedie plus bas qui depend de bubbleContainer, jamais ici avant
    // que le conteneur n'ait sa hauteur finale (sinon scrollIntoView vise un conteneur encore
    // vide, hauteur 0, et le repositionnement une fois la bulle montee est visible/saccade).
    setBubbleContainer(container);

    return () => {
      target.style.position = "";
      target.style.zIndex = "";
      target.style.boxShadow = "none";
      target.style.padding = "";
      target.style.boxSizing = "";
      container.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnRightRound, step]);

  // Scroll dedie, separe de l'effet ci-dessus : ne se declenche qu'une fois bubbleContainer mis a
  // jour ET le rendu (portail de la bulle dedans) reellement commite par React, donc une fois le
  // conteneur a sa hauteur finale. Saut instantane (pas "smooth", meme convention que le reste du
  // funnel) : evite qu'une animation ne s'enchaine avec un autre scroll et donne un rendu bugue.
  useEffect(() => {
    if (!bubbleContainer) return;
    bubbleContainer.scrollIntoView({ behavior: "instant", block: "start" });
  }, [bubbleContainer]);

  // Fin reelle de la visite ("Terminer" sur la derniere etape) : retour propre sur la V1 en
  // haut de page plutot que de laisser le prospect sur la V6 au milieu du scroll, puis affichage
  // du CTA au moment ou son interet vient d'etre maximise par tout le parcours vu.
  useEffect(() => {
    if (status !== "finished") return;
    if (roundLower !== "v1") {
      navigate(`/cas-client/v1${search}`);
      return;
    }
    window.scrollTo(0, 0);
  }, [status, roundLower, search, navigate]);

  // bottom-left, pas bottom-right : ScrollToTop.tsx (bouton "remonter en haut", deja present sur
  // toutes les pages) occupe deja ce coin avec un z-index plus eleve, il cachait ce bouton
  // (retour de Gilles le 16/08, prod). Affiche aussi en statut "idle" (pas seulement "off") : le
  // store ne survit pas a un reload et l'auto-demarrage ne se declenche que sur la V1 - un reload
  // en cours de tour sur un autre round retombe en "idle" sans autre moyen de relancer.
  if (status === "idle" || status === "off") {
    return (
      <button
        type="button"
        onClick={restart}
        className="fixed bottom-24 left-4 sm:bottom-5 sm:left-5 z-40 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-lg"
      >
        ↻ Relancer le parcours
      </button>
    );
  }

  if (status === "finished") {
    if (roundLower !== "v1") return null;
    return (
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) skip();
        }}
      >
        <div className="max-w-[520px] rounded-2xl border border-border bg-card py-14 px-12 text-center shadow-2xl">
          <p className="mb-9 text-base leading-relaxed text-muted-foreground">
            Ce parcours pourrait être le vôtre !
            <br />
            La communication est la clé pour réussir à construire un site à votre image.
            <br />
            Les premières propositions ne sont que des ébauches qui, via les séries d'échanges entre vous et moi,
            prendront forme jusqu'à devenir VOTRE site.
          </p>
          {ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-[30px] py-[14px] text-[15px] font-semibold text-background"
            >
              Obtenir des informations <ArrowRight size={16} />
            </a>
          )}
          <button type="button" onClick={skip} className="mt-4 block w-full text-center text-sm text-muted-foreground underline">
            Visiter librement →
          </button>
        </div>
      </div>
    );
  }

  if (!isOnRightRound || !bubbleContainer) return null;

  return createPortal(
    <div className="mb-6 rounded-lg border border-border bg-foreground px-5 py-4 text-sm leading-relaxed text-background shadow-lg">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide opacity-55">
        Étape {stepIndex + 1} / {CASE_STUDY_TOUR_STEPS.length}
      </div>
      {step.text.map((line, i) => (
        <p key={i} className="mb-3.5 last:mb-4">
          {line}
        </p>
      ))}
      <div className="flex items-center justify-end gap-2">
        {stepIndex !== 0 && (
          <button
            type="button"
            onClick={prev}
            className="rounded-md border border-current px-3 py-1.5 text-xs font-semibold opacity-60"
          >
            ← Précédent
          </button>
        )}
        <button
          type="button"
          onClick={next}
          className="rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
        >
          {stepIndex === CASE_STUDY_TOUR_STEPS.length - 1 ? "Terminer" : "Suivant →"}
        </button>
      </div>
    </div>,
    bubbleContainer
  );
}
