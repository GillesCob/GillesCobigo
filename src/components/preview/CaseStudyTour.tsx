import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CASE_STUDY_TOUR_STEPS, useCaseStudyTourStore } from "@/store/caseStudyTourStore";

interface ICaseStudyTourProps {
  /** Round affiche par la page qui monte ce composant, ex "V1". */
  currentRound: string;
  /** Query string a conserver sur chaque navigation entre rounds (?from=<slug>/<secret>). */
  search: string;
  /** Destination du CTA de fin de visite, absente si la page est ouverte sans contexte prospect. */
  ctaHref?: string;
  /** Destination du CTA "Discutons-en" affiche des l'etape 1, absente sans contexte prospect. */
  discussHref?: string;
}

// Visite guidee multi-versions sur /cas-client/<round> : porte le prototype valide dans le vault
// (Projets/V1-Echanges/mockups/version-guided-tour.html, 16/08) en composant React. Spotlight par
// box-shadow demesure (pas de masque SVG/canvas), bulle positionnee par calcul (au-dessus ou a
// droite selon l'etape), navigation reelle entre rounds pilotee par le store (CaseStudyRound.tsx
// est demonte/remonte a chaque changement de route, le store Zustand survit).
export default function CaseStudyTour({ currentRound, search, ctaHref, discussHref }: ICaseStudyTourProps) {
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

  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState<{ top: number; left: number } | null>(null);
  const lastRoundRef = useRef<string | null>(null);

  // Auto-demarrage uniquement en arrivant sur la V1, une seule fois par session de navigation
  // (hasAutoStarted persiste dans le store, jamais relance meme si on revient sur la V1 apres
  // avoir arrete la visite volontairement).
  useEffect(() => {
    if (roundLower === "v1" && status === "idle" && !hasAutoStarted) {
      start();
    }
  }, [roundLower, status, hasAutoStarted, start]);

  // L'etape courante pointe vers une autre version que celle affichee (survient juste apres
  // "Suivant" sur la derniere etape d'une version) : on y navigue en conservant ?from=.
  useEffect(() => {
    if (status === "active" && step.round !== roundLower) {
      navigate(`/cas-client/${step.round}${search}`);
    }
  }, [status, step, roundLower, search, navigate]);

  // Spotlight + positionnement de la bulle, uniquement quand l'etape correspond a la version
  // reellement affichee (sinon la navigation ci-dessus est en cours).
  useEffect(() => {
    if (!isOnRightRound) return;

    const found = document.querySelector<HTMLElement>(`[data-tour-key="${step.key}"]`);
    if (!found) return;
    const el = found;

    const roundChanged = lastRoundRef.current !== step.round;
    lastRoundRef.current = step.round;

    el.style.position = "relative";
    el.style.zIndex = "60";
    el.style.borderRadius = "14px";
    el.style.transition = "box-shadow .25s ease";
    el.style.boxShadow = "0 0 0 9999px rgba(0,0,0,.72)";

    let lastTop = NaN;
    let lastLeft = NaN;
    function place() {
      const r = el.getBoundingClientRect();
      let top: number;
      let left: number;
      if (step.placement === "right" && window.innerWidth - r.right >= 360) {
        top = r.top + window.scrollY;
        left = r.right + window.scrollX + 20;
      } else if (step.placement === "right") {
        // Pas assez de place a droite (mobile, la nav de versions prend toute la largeur) :
        // repli sous la cible plutot que hors ecran, retour de Gilles le 16/08.
        top = r.bottom + window.scrollY + 16;
        left = Math.max(Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - 340 - 24), 16);
      } else {
        const bubbleHeight = bubbleRef.current?.offsetHeight ?? 0;
        top = r.top + window.scrollY - bubbleHeight - 16;
        left = Math.max(Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - 340 - 24), 16);
      }
      // Evite un re-render (donc un nouvel objet bubblePos) a chaque frame de la boucle rAF quand
      // rien n'a bouge : la cible/le scroll sont stables la plupart du temps entre deux frames.
      if (top === lastTop && left === lastLeft) return;
      lastTop = top;
      lastLeft = left;
      setBubblePos({ top, left });
    }

    // Reset instantane du scroll au changement de version : la nouvelle page peut etre bien
    // plus courte ou plus longue que la precedente, un reset evite un saut visuel imprevisible
    // avant notre propre scroll anime (meme bug que sur le prototype vault, 16/08).
    // Offset "above" derive de la vraie hauteur de la bulle (deja rendue avec le contenu de cette
    // etape a ce stade) plutot qu'un chiffre fige : l'etape 1 (CTA "Discutons-en" en plus) est
    // plus haute que les autres, un offset fixe la laissait deborder sous le bandeau (meme bug
    // que sur le prototype vault, 16/08).
    const bubbleHeight = bubbleRef.current?.offsetHeight ?? 130;
    const scrollOffset = step.placement === "right" ? 130 : (96 + bubbleHeight);
    function scrollToEl() {
      const targetY = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
    }

    // Repositionnement en boucle (requestAnimationFrame) tant que l'etape est affichee, au lieu
    // d'un delai fixe apres le scroll : un setTimeout devine une duree d'animation, une boucle
    // rAF s'aligne toujours sur l'etat reel, quel que soit le temps que prend le scroll (cause
    // des rognages constates en prod le 16/08 sur l'etape sidenav et l'etape V3).
    let rafId = 0;
    function loop() {
      place();
      rafId = requestAnimationFrame(loop);
    }

    // Attendre que les images de la page (captures d'ecran des propositions) aient fini de
    // charger avant de calculer le scroll : tant qu'une image au-dessus de la cible n'a pas sa
    // taille reelle, la page est plus courte qu'elle ne le sera, et le scroll calcule s'arrete
    // trop tot (cause du "ca ne descend pas assez" sur les etapes V2/V6, retour de Gilles le
    // 16/08). La bulle (boucle rAF ci-dessus) se recale d'elle-meme sans attendre, seul le
    // scroll a besoin d'etre differe. "cancelled" evite qu'un appel differe d'une etape deja
    // quittee (clic rapide Suivant/Precedent) ne vienne re-scroller au mauvais endroit.
    let cancelled = false;
    function waitForImages(maxWaitMs: number): Promise<void> {
      return new Promise((resolve) => {
        const pending = Array.from(document.images).filter((img) => !img.complete);
        if (pending.length === 0) {
          resolve();
          return;
        }
        let remaining = pending.length;
        const done = () => {
          remaining -= 1;
          if (remaining <= 0) resolve();
        };
        pending.forEach((img) => {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        });
        setTimeout(resolve, maxWaitMs);
      });
    }

    if (roundChanged) window.scrollTo(0, 0);
    scrollToEl();
    rafId = requestAnimationFrame(loop);
    waitForImages(1200).then(() => {
      if (!cancelled) scrollToEl();
    });

    window.addEventListener("resize", place);

    return () => {
      cancelled = true;
      el.style.boxShadow = "none";
      window.removeEventListener("resize", place);
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnRightRound, step]);

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
  // (retour de Gilles le 16/08, prod).
  if (status === "idle" || status === "off") {
    return status === "off" ? (
      <button
        type="button"
        onClick={restart}
        className="fixed bottom-5 left-5 z-40 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-lg"
      >
        ↻ Relancer la visite guidée
      </button>
    ) : null;
  }

  if (status === "finished") {
    if (roundLower !== "v1") return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-6">
        <div className="max-w-lg rounded-2xl border border-border bg-card p-14 text-center shadow-2xl">
          <h2 className="mb-5 text-2xl font-bold">Alors, ça vous plaît ?</h2>
          <p className="mb-9 text-base leading-relaxed text-muted-foreground">
            Vous venez de voir tout le parcours, du premier jet à la version finale. Je peux faire pareil pour
            votre site.
          </p>
          {ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-base font-semibold text-background"
            >
              Montrez-moi comment <ArrowRight size={16} />
            </a>
          )}
          <button
            type="button"
            onClick={skip}
            className="mt-6 block w-full text-sm text-muted-foreground underline"
          >
            Continuer à visiter librement
          </button>
        </div>
      </div>
    );
  }

  if (!isOnRightRound || !bubblePos) return null;

  const bubbleStyle: CSSProperties = { position: "absolute", top: bubblePos.top, left: bubblePos.left, zIndex: 61 };

  return (
    <div
      ref={bubbleRef}
      style={bubbleStyle}
      className="max-w-[340px] rounded-lg bg-foreground px-4 py-3 text-sm leading-relaxed text-background shadow-xl"
    >
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide opacity-55">
        Étape {stepIndex + 1} / {CASE_STUDY_TOUR_STEPS.length}
      </div>
      <p className="mb-3.5">{step.text}</p>
      {/* Discutons-en : generalise a toutes les etapes (16/08, propose comme prototype sur l'etape 1
          seule puis valide sur les 6 etapes le meme jour). Ouvre la page tarif du prospect avec
          ?discuter=1, lu par PreviewHome/PricingCard pour ouvrir directement la modale de
          confirmation du numero (rien de preselectionne, options discutees au telephone). */}
      {discussHref && (
        <div className="mb-3 border-t border-background/25 pt-3">
          <a href={discussHref} className="inline-flex items-center gap-1.5 text-[13px] font-bold opacity-90 hover:opacity-100 hover:underline">
            🎯 Discutons-en →
          </a>
        </div>
      )}
      <div className="flex items-center justify-between gap-2.5">
        <button type="button" onClick={skip} className="text-xs underline opacity-55">
          Visiter librement
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={stepIndex === 0}
            className="rounded-md border border-current px-3 py-1.5 text-xs font-semibold opacity-60 disabled:opacity-25"
          >
            ← Précédent
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
          >
            {stepIndex === CASE_STUDY_TOUR_STEPS.length - 1 ? "Terminer" : "Suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}
