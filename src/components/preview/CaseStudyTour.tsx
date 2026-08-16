import { useEffect, useRef, useState } from "react";
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
}

// Visite guidee multi-versions sur /cas-client/<round> : porte le prototype valide dans le vault
// (Projets/V1-Echanges/mockups/version-guided-tour.html, 16/08) en composant React. Spotlight par
// box-shadow demesure (pas de masque SVG/canvas), bulle positionnee par calcul (au-dessus ou a
// droite selon l'etape), navigation reelle entre rounds pilotee par le store (CaseStudyRound.tsx
// est demonte/remonte a chaque changement de route, le store Zustand survit).
export default function CaseStudyTour({ currentRound, search, ctaHref }: ICaseStudyTourProps) {
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

    function place() {
      const r = el.getBoundingClientRect();
      const bubbleHeight = bubbleRef.current?.offsetHeight ?? 0;
      if (step.placement === "right") {
        // Clamp defensif : la cible (sidenav) peut se trouver tres pres du haut de page, le
        // scroll qui l'amene en vue peut aussi ne pas avoir totalement fini son animation au
        // moment du calcul. Sans plancher, la bulle peut se retrouver rognee sous le bandeau
        // fixe (retour de Gilles le 16/08, prod). Marge minimale = hauteur du bandeau + confort.
        const minTop = window.scrollY + 100;
        setBubblePos({ top: Math.max(r.top + window.scrollY, minTop), left: r.right + window.scrollX + 20 });
        return;
      }
      const top = r.top + window.scrollY - bubbleHeight - 16;
      const left = Math.min(r.left + window.scrollX, window.scrollX + window.innerWidth - 340 - 24);
      setBubblePos({ top, left: Math.max(left, 16) });
    }

    // Reset instantane du scroll au changement de version : la nouvelle page peut etre bien
    // plus courte ou plus longue que la precedente, un reset evite un saut visuel imprevisible
    // avant notre propre scroll anime (meme bug que sur le prototype vault, 16/08).
    const scrollOffset = step.placement === "right" ? 130 : 220;
    function scrollToEl() {
      const targetY = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
    }

    let timeout1: ReturnType<typeof setTimeout> | undefined;
    let timeout2: ReturnType<typeof setTimeout> | undefined;
    if (roundChanged) {
      window.scrollTo(0, 0);
      timeout1 = setTimeout(() => {
        scrollToEl();
        timeout2 = setTimeout(place, 260);
      }, 180);
    } else {
      scrollToEl();
      timeout2 = setTimeout(place, 260);
    }

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });

    return () => {
      el.style.boxShadow = "none";
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
      if (timeout1) clearTimeout(timeout1);
      if (timeout2) clearTimeout(timeout2);
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

  if (status === "idle" || status === "off") {
    return status === "off" ? (
      <button
        type="button"
        onClick={restart}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-lg"
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
              Découvrez comment on le rend réel <ArrowRight size={16} />
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

  return (
    <div
      ref={bubbleRef}
      style={{ position: "absolute", top: bubblePos.top, left: bubblePos.left, zIndex: 61 }}
      className="max-w-[340px] rounded-lg bg-foreground px-4 py-3 text-sm leading-relaxed text-background shadow-xl"
    >
      <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide opacity-55">
        Étape {stepIndex + 1} / {CASE_STUDY_TOUR_STEPS.length}
      </div>
      <p className="mb-3.5">{step.text}</p>
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
