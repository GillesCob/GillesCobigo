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

// Bulle fixed-top + verrou de scroll + bascule bulle/barre basse pendant un scroll actif : porte
// integralement le 17/08 la mecanique validee sur public/cerithe-v1-6-0/index.html (demandee
// explicitement par Gilles, "toutes les regles appliquees dans ce lien doivent etre transposees").
// Remplace l'ancien positionnement "above"/"right" par calcul de rect (rAF loop), abandonne sur
// Cerithe apres plusieurs bugs de rognage corriges le 17/08 : bulle qui sortait de l'ecran sur une
// section haute, texte tronque en haut de page. Fixed-top n'a plus ce probleme par construction
// (position CSS constante, jamais calculee depuis la cible).
const FIXED_TOP_OFFSET = 92; // sous le bandeau fixe de CaseStudyRound.tsx (~76-92px selon le viewport)

export default function CaseStudyTour({ currentRound, search, ctaHref }: ICaseStudyTourProps) {
  const navigate = useNavigate();
  const [scrollBlocked, setScrollBlocked] = useState(false);
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
  const bottomNavRef = useRef<HTMLDivElement>(null);
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

  // Spotlight + verrou de scroll + bascule bulle/barre basse, uniquement quand l'etape correspond
  // a la version reellement affichee (sinon la navigation ci-dessus est en cours).
  useEffect(() => {
    if (!isOnRightRound) return;

    // Etape narree (pas de "key", cf ICaseStudyTourStep) : aucun ecran reel a montrer, la bulle
    // reste affichee seule. Retour en haut de page pour un contexte neutre plutot que de laisser
    // la bulle flotter sur le scroll laisse par l'etape precedente, aucun spotlight/verrou a poser.
    // "blockScroll" (V0) : en plus, scroll totalement bloque et page entierement grisee, pas juste
    // ramenee en douceur a 0 comme les autres etapes narrees, cf version-guided-tour.html (18/08).
    if (!step.key) {
      lastRoundRef.current = step.round;
      if (bubbleRef.current) bubbleRef.current.style.display = "";
      if (bottomNavRef.current) bottomNavRef.current.style.display = "none";
      if (step.blockScroll) {
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = "hidden";
        setScrollBlocked(true);
        const forceZeroScroll = () => {
          if (window.scrollY !== 0) window.scrollTo(0, 0);
        };
        window.addEventListener("scroll", forceZeroScroll, { passive: true });
        return () => {
          document.documentElement.style.overflow = "";
          setScrollBlocked(false);
          window.removeEventListener("scroll", forceZeroScroll);
        };
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.querySelector<HTMLElement>(`[data-tour-key="${step.key}"]`);
    if (!el) return;

    const roundChanged = lastRoundRef.current !== step.round;
    lastRoundRef.current = step.round;

    // Toggle theme retire (19/08, item 26) : page toujours claire, plus de variante sombre a
    // calculer, cf CaseStudyRound.tsx.
    const overlayColor = "rgba(9,9,11,.55)";
    el.style.position = "relative";
    el.style.zIndex = "60";
    el.style.borderRadius = "14px";
    el.style.transition = "box-shadow .25s ease, margin-top .2s ease";
    el.style.boxShadow = `0 0 0 9999px ${overlayColor}`;
    // Encart V6 (19/08, porte depuis version-guided-tour.html) : ce sous-bloc n'a pas de padding
    // propre (contrairement aux autres cibles qui embarquent une card ou une grille avec gap), le
    // spotlight collait directement au texte/a la carte proposal. box-sizing:border-box pour garder
    // la meme largeur de colonne grid qu'en dehors du tour.
    if (step.key === "v6-proposals") {
      el.style.padding = "16px";
      el.style.boxSizing = "border-box";
    }

    let cancelled = false;
    let isProgrammaticScroll = false;
    let lockMin: number | null = null;
    let lockMax: number | null = null;

    // Marge dynamique quand la cible est trop pres du haut du document pour que le scroll seul
    // la degage de la bulle fixe (meme bug que Cerithe sur "tour-intro"/"tour-specs", corrige ici
    // par un calcul generique plutot que par une liste d'etapes en dur : la marge injectee est
    // exactement le manque constate, quelle que soit l'etape concernee).
    function applyTopMargin(offset: number) {
      const targetTopDoc = el!.getBoundingClientRect().top + window.scrollY - (parseFloat(el!.style.marginTop) || 0);
      const shortfall = offset - targetTopDoc;
      el!.style.marginTop = shortfall > 0 ? `${shortfall}px` : "";
    }

    function computeLock(offset: number) {
      const r = el!.getBoundingClientRect();
      const targetTopDoc = r.top + window.scrollY;
      const targetBottomDoc = r.bottom + window.scrollY;
      lockMin = Math.max(0, targetTopDoc - offset);
      lockMax = Math.max(lockMin, targetBottomDoc - window.innerHeight + 80);
    }

    function scrollToTarget(offset: number) {
      const targetY = el!.getBoundingClientRect().top + window.scrollY - offset;
      isProgrammaticScroll = true;
      window.scrollTo({ top: Math.max(targetY, 0), behavior: "smooth" });
      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 320);
    }

    function settle() {
      const bubbleHeight = bubbleRef.current?.offsetHeight ?? 140;
      const offset = FIXED_TOP_OFFSET + bubbleHeight + 16;
      applyTopMargin(offset);
      computeLock(offset);
      scrollToTarget(offset);
    }

    if (roundChanged) window.scrollTo(0, 0);
    settle();

    // Attendre que les images (captures d'ecran des propositions) aient fini de charger avant de
    // recalculer : tant qu'une image au-dessus de la cible n'a pas sa taille reelle, la page est
    // plus courte qu'elle ne le sera, et le scroll s'arrete trop tot.
    const pendingImages = Array.from(document.images).filter((img) => !img.complete);
    let imgTimeout: ReturnType<typeof setTimeout> | undefined;
    if (pendingImages.length > 0) {
      let remaining = pendingImages.length;
      const done = () => {
        remaining -= 1;
        if (remaining <= 0 && !cancelled) settle();
      };
      pendingImages.forEach((img) => {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
      imgTimeout = setTimeout(() => {
        if (!cancelled) settle();
      }, 1200);
    }

    function onScroll() {
      if (lockMin === null || lockMax === null) return;
      if (!isProgrammaticScroll) {
        if (window.scrollY > lockMax!) window.scrollTo(0, lockMax!);
        else if (window.scrollY < lockMin!) window.scrollTo(0, lockMin!);
      }
      // Pendant un scroll actif, loin du haut de la zone verrouillee : bulle cachee, barre basse
      // Precedent/Suivant a la place (jamais les deux ensemble). Manipulation directe du DOM via
      // ref plutot qu'un setState, pour ne pas re-render a chaque evenement de scroll.
      const nearTop = window.scrollY <= lockMin! + 24;
      if (bubbleRef.current) bubbleRef.current.style.display = nearTop ? "" : "none";
      if (bottomNavRef.current) bottomNavRef.current.style.display = nearTop ? "none" : "grid";
    }

    function onResize() {
      const bubbleHeight = bubbleRef.current?.offsetHeight ?? 140;
      computeLock(FIXED_TOP_OFFSET + bubbleHeight + 16);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      if (imgTimeout) clearTimeout(imgTimeout);
      el.style.boxShadow = "none";
      el.style.marginTop = "";
      el.style.padding = "";
      el.style.boxSizing = "";
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
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

  function revealBubble() {
    if (bubbleRef.current) bubbleRef.current.style.display = "";
    if (bottomNavRef.current) bottomNavRef.current.style.display = "none";
  }

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
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) skip();
        }}
      >
        <div className="max-w-lg rounded-2xl border border-border bg-card p-14 text-center shadow-2xl">
          <h2 className="mb-5 text-2xl font-bold">Vous avez vu comment on y arrive ensemble.</h2>
          <p className="mb-9 text-base leading-relaxed text-muted-foreground">
            Le point de départ de Mylène n'était pas parfait non plus. C'est l'échange qui a fait la différence, pas
            la première version. Pour votre site, ce sera exactement la même méthode.
          </p>
          {ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-base font-semibold text-background"
            >
              On passe à la suite <ArrowRight size={16} />
            </a>
          )}
          {/* Seul endroit ou "Visiter librement" reapparait (retiree des bulles de chaque etape,
              cf ci-dessous) : discret, sous le CTA principal, pour qui a fini et veut fouiller par
              lui-meme. Conforme a .tour-end-skip de version-guided-tour.html. */}
          <button type="button" onClick={skip} className="mt-4 block w-full text-center text-sm text-muted-foreground underline">
            Visiter librement
          </button>
        </div>
      </div>
    );
  }

  if (!isOnRightRound) return null;

  return (
    <>
      {/* Cache plein ecran (V0 uniquement, "blockScroll") : aucune cible reelle a decouper autour,
          meme couleur que le spotlight ci-dessus (theme toggle retire, page toujours claire). */}
      {scrollBlocked && <div className="fixed inset-0 z-[59]" style={{ background: "rgba(9,9,11,.55)" }} />}
      <div
        ref={bubbleRef}
        className="fixed top-[104px] sm:top-[92px] left-4 sm:left-6 z-[61] max-w-[340px] rounded-lg bg-foreground px-4 py-3 text-sm leading-relaxed text-background shadow-xl"
      >
        {/* V0 (index 0) n'est pas comptee dans les "4 etapes" annoncees a Gilles (cf
            caseStudyTourStore.ts) : pas de compteur sur l'intro, "Étape 1/4" demarre au premier
            ecran reellement montre. */}
        {stepIndex > 0 && (
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide opacity-55">
            Étape {stepIndex} / {CASE_STUDY_TOUR_STEPS.length - 1}
          </div>
        )}
        {step.text.map((line, i) => (
          <p key={i} className="mb-3.5">
            {line}
          </p>
        ))}
        {/* "Visiter librement" retiree de cette bulle (comme de toutes les etapes) : ne
            reapparait qu'a la toute fin, dans la modale (cf .tour-end-skip ci-dessus),
            conforme a version-guided-tour.html. */}
        <div className="flex items-center justify-end gap-2">
          {/* Bouton omis (pas juste desactive) a la 1ere etape, cf version-guided-tour.html
              (`current === 0 ? "" : '<button...`) : ecart trouve et corrige le 19/08, item 4. */}
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
      </div>

      {/* Barre basse, visible uniquement pendant un scroll actif loin du haut de la zone verrouillee
          (bascule geree en dehors de React, cf onScroll ci-dessus, pour ne pas re-render a chaque
          frame de scroll). Grid 3 colonnes : le compteur d'etape reste au centre exact de la barre,
          jamais decale par un groupe de gauche/droite de largeur differente. */}
      <div
        ref={bottomNavRef}
        style={{ display: "none" }}
        className="fixed inset-x-0 bottom-0 z-[62] grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-border bg-card px-4 py-2.5 shadow-[0_-8px_20px_rgba(0,0,0,.25)]"
      >
        <button
          type="button"
          onClick={revealBubble}
          title="Revoir le texte de l'étape"
          className="justify-self-start rounded-md border border-border px-3 py-2 text-[15px] leading-none"
        >
          💬
        </button>
        <span className="justify-self-center text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
          Étape {stepIndex} / {CASE_STUDY_TOUR_STEPS.length - 1}
        </span>
        <div className="justify-self-end flex items-center gap-2">
          {/* Bouton omis (pas juste desactive) a la 1ere etape, meme correctif que la bulle
              ci-dessus (19/08, item 4). */}
          {stepIndex !== 0 && (
            <button
              type="button"
              onClick={prev}
              className="rounded-md border border-border px-4 py-2 text-xs font-semibold"
            >
              ← Précédent
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background"
          >
            {stepIndex === CASE_STUDY_TOUR_STEPS.length - 1 ? "Terminer" : "Suivant →"}
          </button>
        </div>
      </div>
    </>
  );
}
