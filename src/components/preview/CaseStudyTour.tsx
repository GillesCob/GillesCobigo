import { useEffect, useRef, useState } from "react";
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

// Etapes avec bulle du bas (21/08, demande explicite de Gilles, precisee deux fois : uniquement
// 2 et 3, jamais 1 et 4) : sur une cible plus haute que l'ecran, le prospect qui scrolle pour
// tout lire est oblige de remonter tout en haut pour retrouver "Suivant" sans elle.
const STEPS_WITH_BOTTOM_BUBBLE = [1, 2];

// Marges de tolerance du verrou de scroll (21/08, demande explicite de Gilles : "afin d'eviter
// les bugs de scroll qui sautent"). Un plancher/plafond colle exactement sur la position
// d'arrivee declenche le clamp reactif au moindre pixel de scroll, percu comme un saut/rebond.
// TOP_SLACK ne change PAS le point d'arrivee du scrollIntoView (le "mt" reste 10px, la bulle
// "arrive bien tout en haut"), seulement le plancher, plus permissif que la position d'arrivee.
// BOTTOM_SLACK : bulle du bas (etapes 2/3) "pas utilisable sur mobile" collee au bord ecran une
// fois au plafond (60, precise par Gilles apres un premier essai a 24, aligne sur TOP_SLACK) ;
// cible elle-meme (etapes 1/4) "empecher les sauts de scroll", meme logique mais en bas.
const TOP_SLACK = 60;
const BOTTOM_SLACK = 60;

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
// du navigateur (scrollIntoView) l'amene a l'ecran avec la cible, dans le bon ordre.
//
// Resynchronisee le 21/08 sur Projets/V1-Echanges/mockups/version-guided-tour.html (retouche du
// meme jour, seule reference validee) : marge/largeur calquees sur la cible, verrou de scroll
// (plancher sur toutes les etapes, plafond cale sur la bulle du bas aux etapes 2/3 ou sur le bas
// de la cible sinon), 2e bulle compacte en bas de cible aux etapes 2/3, curseur "interdit" +
// toast mobile sur les liens bloques (cf RoundContent.tsx), reprise apres rechargement (cf
// caseStudyTourStore.ts, persist sessionStorage).
export default function CaseStudyTour({ currentRound, search, ctaHref, slug }: ICaseStudyTourProps) {
  const navigate = useNavigate();
  const status = useCaseStudyTourStore((s) => s.status);
  const stepIndex = useCaseStudyTourStore((s) => s.stepIndex);
  const hasAutoStarted = useCaseStudyTourStore((s) => s.hasAutoStarted);
  const blockToastVisible = useCaseStudyTourStore((s) => s.blockToastVisible);
  const start = useCaseStudyTourStore((s) => s.start);
  const next = useCaseStudyTourStore((s) => s.next);
  const prev = useCaseStudyTourStore((s) => s.prev);
  const skip = useCaseStudyTourStore((s) => s.skip);
  const restart = useCaseStudyTourStore((s) => s.restart);
  const hideBlockToast = useCaseStudyTourStore((s) => s.hideBlockToast);

  const roundLower = currentRound.toLowerCase();
  const step = CASE_STUDY_TOUR_STEPS[stepIndex];
  const isOnRightRound = status === "active" && step.round === roundLower;
  const hasBottomBubble = STEPS_WITH_BOTTOM_BUBBLE.includes(stepIndex);

  // Conteneurs DOM inseres juste avant/apres la cible, dans lesquels les bulles sont portees (cf
  // effet ci-dessous). null tant qu'aucune cible n'est trouvee/montee.
  const [bubbleContainer, setBubbleContainer] = useState<HTMLElement | null>(null);
  const [bubbleContainerBottom, setBubbleContainerBottom] = useState<HTMLElement | null>(null);

  // Verrou de scroll (21/08) : refs, pas de state, seulement lus par les listeners scroll/resize
  // globaux ci-dessous, aucun re-render necessaire quand leur valeur change.
  const targetElRef = useRef<HTMLElement | null>(null);
  const bottomContainerRef = useRef<HTMLElement | null>(null);
  const lockMinRef = useRef<number | null>(null);
  const lockMaxRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  // Position d'arrivee (scrollY juste apres le scrollIntoView), memorisee separement du contenu
  // de la cible (21/08) : sert de base garantie pour le plafond, cf computeLockMax().
  const arrivalScrollYRef = useRef<number | null>(null);

  // Reference du plafond : la bulle du bas si elle existe (etapes 2/3, "pas plus loin que la
  // bulle du dessous"), sinon la cible elle-meme (etapes 1/4, "pas plus loin que le bas de la
  // zone presentee"). Aucune des deux : pas de plafond du tout.
  function computeLockMax() {
    const reference = bottomContainerRef.current ?? targetElRef.current;
    if (!reference) {
      lockMaxRef.current = null;
      return;
    }
    const rect = reference.getBoundingClientRect();
    // + BOTTOM_SLACK, pas moins : on veut que la reference finisse plus HAUTE dans le viewport
    // qu'un plafond "colle au bord" (rect.bottom == innerHeight), donc un candidate plus GRAND
    // (correspond a un scrollY plus petit une fois qu'on y est, laissant de l'air en dessous).
    const candidate = rect.bottom + window.scrollY - window.innerHeight + BOTTOM_SLACK;
    // Plancher garanti sur la position d'ARRIVEE, pas sur le contenu : une cible courte, deja
    // entierement visible des l'arrivee avec une grande marge, donne un candidate tres negatif,
    // largement sous le plancher elargi. Sans cette garantie, Math.max(candidate, lockMin)
    // forcerait lockMax = lockMin, bloquant TOUT scroll au pixel pres, exactement le "saut" que
    // la demande cherche a eviter. En prenant le plus permissif entre "candidate reel du
    // contenu" et "position d'arrivee + BOTTOM_SLACK", le plafond garde toujours au moins la
    // marge demandee depuis l'arrivee, et s'agrandit naturellement si le contenu deborde
    // vraiment de l'ecran.
    const arrivalBasedCandidate = (arrivalScrollYRef.current ?? window.scrollY) + BOTTOM_SLACK;
    lockMaxRef.current = Math.max(candidate, arrivalBasedCandidate);
  }

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

  // Spotlight sur la cible + insertion des bulles juste avant/apres elle dans le DOM, uniquement
  // quand l'etape correspond a la version reellement affichee.
  useEffect(() => {
    if (!isOnRightRound) {
      setBubbleContainer(null);
      setBubbleContainerBottom(null);
      targetElRef.current = null;
      bottomContainerRef.current = null;
      lockMinRef.current = null;
      lockMaxRef.current = null;
      arrivalScrollYRef.current = null;
      return;
    }

    const target = document.querySelector<HTMLElement>(`[data-tour-key="${step.key}"]`);
    if (!target) {
      setBubbleContainer(null);
      setBubbleContainerBottom(null);
      return;
    }
    targetElRef.current = target;

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

    // Conteneur de la bulle du haut : z-index STRICTEMENT superieur a celui de la cible (a
    // z-index egal, deux freres positionnes se departagent par l'ordre du DOM, la cible arrivant
    // apres son enorme box-shadow se peignait par-dessus la bulle).
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.zIndex = "61";
    target.parentNode?.insertBefore(container, target);

    // Largeur/position calquees sur la cible, pas sur son parent (21/08, "sur toute la largeur
    // de la zone expliquee") : sans ce recalage, un item de grille (v6-proposals, sous-groupe
    // dans la grille 2 colonnes des propositions) heriterait de toute la largeur du grand parent
    // grid, pas seulement celle du sous-groupe spotlighte.
    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    container.style.width = `${targetRect.width}px`;
    container.style.marginLeft = `${targetRect.left - containerRect.left}px`;
    // Marge + scroll-margin (21/08, "petit decalage", pas colle en haut de la page une fois
    // amenee par scrollIntoView) : scroll-margin-top, pas juste margin-top (un margin classique
    // ne cree de l'espace qu'avec l'element precedent dans le flux, scrollIntoView aligne la
    // boite elle-meme sur le haut de la fenetre, la marge se retrouve scrollee hors champ).
    container.style.marginTop = "10px";
    container.style.marginBottom = "10px";
    container.style.scrollMarginTop = "10px";

    setBubbleContainer(container);

    // 2e bulle, compacte, SOUS la cible (21/08), seulement etapes 2/3. Frere APRES la cible,
    // jamais dedans (elle doit rester hors du cadre spotlight, pas fondue dedans).
    let bottomContainer: HTMLElement | null = null;
    if (STEPS_WITH_BOTTOM_BUBBLE.includes(stepIndex)) {
      bottomContainer = document.createElement("div");
      bottomContainer.style.position = "relative";
      bottomContainer.style.zIndex = "61";
      bottomContainer.style.marginTop = "10px";
      bottomContainer.style.marginBottom = "10px";
      target.after(bottomContainer);
      if (getComputedStyle(target).display === "grid") {
        bottomContainer.style.gridColumn = "1 / -1";
      }
      bottomContainerRef.current = bottomContainer;
      setBubbleContainerBottom(bottomContainer);
    } else {
      bottomContainerRef.current = null;
      setBubbleContainerBottom(null);
    }

    return () => {
      target.style.position = "";
      target.style.zIndex = "";
      target.style.boxShadow = "none";
      target.style.padding = "";
      target.style.boxSizing = "";
      container.remove();
      bottomContainer?.remove();
      targetElRef.current = null;
      bottomContainerRef.current = null;
      lockMinRef.current = null;
      lockMaxRef.current = null;
      arrivalScrollYRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnRightRound, step, stepIndex]);

  // Scroll dedie, separe de l'effet ci-dessus : ne se declenche qu'une fois bubbleContainer mis a
  // jour ET le rendu (portail de la bulle dedans) reellement commite par React, donc une fois le
  // conteneur a sa hauteur finale. Saut instantane : evite qu'une animation ne s'enchaine avec un
  // autre scroll et donne un rendu bugue. Pose aussi le plancher/plafond du verrou (21/08).
  useEffect(() => {
    if (!bubbleContainer) return;
    isProgrammaticScrollRef.current = true;
    bubbleContainer.scrollIntoView({ behavior: "instant", block: "start" });
    arrivalScrollYRef.current = window.scrollY;
    lockMinRef.current = arrivalScrollYRef.current - TOP_SLACK;
    computeLockMax();
    requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbleContainer]);

  // Verrou de scroll global (21/08, demande explicite de Gilles : "bloquer le scroll pour ne pas
  // aller plus haut... on ne peut que descendre vers le bas", puis "impossible de scroller plus
  // loin que la bulle du dessous"/"le bas de la zone presentee"). isProgrammaticScrollRef evite
  // que notre propre rattrapage (window.scrollTo) ne se re-declenche lui-meme via l'evenement
  // scroll qu'il provoque. Le resize remesure la position reelle des bulles plutot que de garder
  // l'ancienne valeur (une bulle dont le texte wrap differemment selon la largeur d'ecran n'est
  // plus au meme scrollY).
  useEffect(() => {
    function handleScroll() {
      if (isProgrammaticScrollRef.current) return;
      if (lockMinRef.current !== null && window.scrollY < lockMinRef.current) {
        isProgrammaticScrollRef.current = true;
        window.scrollTo(0, lockMinRef.current);
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      } else if (lockMaxRef.current !== null && window.scrollY > lockMaxRef.current) {
        isProgrammaticScrollRef.current = true;
        window.scrollTo(0, lockMaxRef.current);
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      }
    }
    function handleResize() {
      const container = bubbleContainer;
      const target = targetElRef.current;
      if (!container || !target) return;
      container.style.width = "";
      container.style.marginLeft = "";
      const targetRect = target.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      container.style.width = `${targetRect.width}px`;
      container.style.marginLeft = `${targetRect.left - containerRect.left}px`;
      const scrollMarginTop = parseFloat(getComputedStyle(container).scrollMarginTop) || 0;
      arrivalScrollYRef.current = container.getBoundingClientRect().top + window.scrollY - scrollMarginTop;
      lockMinRef.current = arrivalScrollYRef.current - TOP_SLACK;
      computeLockMax();
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbleContainer]);

  // Toast "Disponible après la visite" (21/08) : declenche depuis RoundContent.tsx (clic bloque
  // sur un lien pendant le tour), ferme au scroll ou au clic suivant n'importe ou sur la page, +
  // un filet de securite 4s. Le clic qui vient de le declencher ne doit pas le refermer aussitot
  // (meme evenement remontant en capture) : n'ecoute qu'a partir du prochain tour d'evenements.
  useEffect(() => {
    if (!blockToastVisible) return;
    const timeoutId = window.setTimeout(hideBlockToast, 4000);
    const rafId = requestAnimationFrame(() => {
      document.addEventListener("click", hideBlockToast, { capture: true, once: true });
    });
    window.addEventListener("scroll", hideBlockToast, { passive: true, once: true });
    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", hideBlockToast, true);
      window.removeEventListener("scroll", hideBlockToast);
    };
  }, [blockToastVisible, hideBlockToast]);

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
            <strong>Ce parcours pourrait être le vôtre !</strong>
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

  return (
    <>
      {createPortal(
        <div className="rounded-lg border border-border bg-foreground px-5 py-4 text-sm leading-relaxed text-background shadow-lg">
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
      )}
      {hasBottomBubble &&
        bubbleContainerBottom &&
        createPortal(
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-foreground px-5 py-4 text-sm text-background shadow-lg">
            <div className="text-[11px] font-bold uppercase tracking-wide opacity-55">
              Étape {stepIndex + 1} / {CASE_STUDY_TOUR_STEPS.length}
            </div>
            <div className="flex items-center gap-2">
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
          bubbleContainerBottom
        )}
      {blockToastVisible && (
        <div className="fixed bottom-8 left-1/2 z-[10005] -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-lg">
          Disponible après la visite
        </div>
      )}
    </>
  );
}
