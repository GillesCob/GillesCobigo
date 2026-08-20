import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

// Bulle fixed-top + verrou de scroll : porte integralement le 17/08 la mecanique validee sur
// public/cerithe-v1-6-0/index.html (demandee explicitement par Gilles, "toutes les regles
// appliquees dans ce lien doivent etre transposees"). Remplace l'ancien positionnement
// "above"/"right" par calcul de rect (rAF loop), abandonne sur Cerithe apres plusieurs bugs de
// rognage corriges le 17/08 : bulle qui sortait de l'ecran sur une section haute, texte tronque en
// haut de page. Fixed-top n'a plus ce probleme par construction (position CSS constante, jamais
// calculee depuis la cible). Bascule bulle/barre basse retiree le 20/08 (portee depuis
// Projets/V1-Echanges/mockups/version-guided-tour.html, decision de Gilles du 19/08 jamais portee
// jusqu'ici : "mecanique 'double UI' jugee pas propre pour laptop/mobile"). La bulle reste
// desormais fixe et visible en permanence pendant tout le tour ; sur mobile seul son texte se
// replie/deplie selon la proximite du haut de la zone verrouillee (cf etat `expanded`), jamais de
// bascule vers un second bloc d'UI.
// 76 : aligne sur .tour-bubble{top:76px} de version-guided-tour.html (corrige le 20/08, ecart
// trouve par Gilles : la classe CSS reelle ci-dessous utilisait 92/104px, jamais alignee sur cette
// constante qui ne sert que de repli avant premiere mesure, cf getOffset()).
const FIXED_TOP_OFFSET = 76;

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

  const bubbleRef = useRef<HTMLDivElement>(null);
  const lastRoundRef = useRef<string | null>(null);
  // Texte de la bulle replie/deplie sur mobile uniquement (cf media query Tailwind sur le rendu
  // plus bas, desktop/laptop toujours deplie). Ouvert par defaut a chaque arrivee sur une etape
  // (meme comportement que le mockup, "precise par Gilles" le 19/08), se referme automatiquement
  // au premier scroll qui eloigne de la zone verrouillee.
  const [expanded, setExpanded] = useState(true);

  // Auto-demarrage uniquement en arrivant sur la V1, une seule fois par session de navigation
  // (hasAutoStarted persiste dans le store, jamais relance meme si on revient sur la V1 apres
  // avoir arrete la visite volontairement). Tracking funnel (cf trackFunnelBeacon("visite-guidee")
  // du mockup version-guided-tour.html) uniquement ici, au demarrage automatique reel, jamais sur
  // un "Relancer le parcours" manuel (deja compte une fois, meme logique que le mockup).
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

  // Bulle ouverte a chaque nouvelle etape (cf mockup, bubble.classList.add("expanded") dans
  // render()), avant meme que le spotlight/verrou de scroll ci-dessous ne s'installe.
  // useLayoutEffect (pas useEffect, corrige le 20/08, ecart trouve par Gilles) : la mise a jour
  // doit etre repercutee dans le DOM AVANT que l'effet de spotlight ci-dessous ne mesure
  // bubbleRef.current.offsetHeight, sinon une bulle repliee (mobile) d'une etape precedente
  // fausse la hauteur mesuree pour la nouvelle etape, offset trop court, chevauchement bulle/
  // encart spotlighte. useLayoutEffect flush son setState de facon synchrone avant peinture,
  // contrairement a useEffect (asynchrone, aurait pu s'executer apres la mesure).
  useLayoutEffect(() => {
    setExpanded(true);
  }, [stepIndex]);

  // Spotlight + verrou de scroll, uniquement quand l'etape correspond a la version reellement
  // affichee (sinon la navigation ci-dessus est en cours).
  useEffect(() => {
    if (!isOnRightRound) return;

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
    // Pas de transition sur margin-top (corrige le 20/08, ecart trouve par Gilles : la bulle
    // "s'ouvrait trop tot" en scrollant vers le haut, le haut de la zone spotlightee restait
    // cache derriere) : applyTopMargin()/computeLock() lisent getBoundingClientRect() juste
    // apres avoir change cette propriete, une transition anime la retournait dans son etat
    // intermediaire (pas encore etabli), lockMin calcule trop bas. Aligne sur .tour-target du
    // mockup, qui n'anime que box-shadow, jamais margin-top (mecanisme different : spacer
    // separe plutot que marge posee directement sur la cible).
    el.style.transition = "box-shadow .25s ease";
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
      // SANS marge quand la cible tient deja entierement dans la fenetre (corrige le 20/08, ecart
      // trouve par Gilles : un "mini-scroll" restait possible en prod alors que le mockup est
      // completement bloque). Les +80 ne servent que de confort visuel une fois qu'un vrai scroll
      // est deja necessaire, jamais pour decider s'il l'est, cf version-guided-tour.html
      // (computeLock, retour de Gilles a 100% de zoom, 19/08).
      const neededMax = targetBottomDoc - window.innerHeight;
      lockMax = neededMax > lockMin ? neededMax + 80 : lockMin;
    }

    // Saut instantane, jamais "smooth" (corrige le 20/08, ecart trouve en comparant au mockup) :
    // ce dernier est passe a un saut instantane le 19/08 precisement pour ce type de bug ("le
    // scroll est degueulasse, ca bug" remonte par Gilles) - un scroll anime "smooth" s'enchainant
    // avec un second scroll anime (changement de version juste apres) se percutait en plein vol,
    // donnant un rendu bugue. Un saut instantane retire cette classe de bug de fait, pas seulement
    // esthetique. requestAnimationFrame (pas setTimeout) : l'evenement "scroll" du navigateur reste
    // asynchrone meme pour un saut instantane, un seul frame suffit a le laisser se declencher
    // avant de relever le flag, sans reintroduire de delai percu.
    function scrollToTarget(offset: number, callback?: () => void) {
      const targetY = el!.getBoundingClientRect().top + window.scrollY - offset;
      isProgrammaticScroll = true;
      window.scrollTo(0, Math.max(targetY, 0));
      requestAnimationFrame(() => {
        isProgrammaticScroll = false;
        if (callback) callback();
      });
    }

    // Offset = bas reel de la bulle (mesure, pas devine) + 16px de respiration. Corrige le 20/08
    // (ecart trouve par Gilles) : l'ancien calcul FIXED_TOP_OFFSET (constante unique 92) +
    // bubbleHeight ne correspondait plus a la position reelle de la bulle des que son `top` CSS
    // varie selon le viewport (top-[104px] mobile vs sm:top-[92px] desktop) - offset trop court
    // sur mobile, bulle qui chevauchait la cible spotlightee. getBoundingClientRect().bottom d'un
    // element position:fixed est deja relatif au haut du viewport, quel que soit le breakpoint qui
    // s'applique : plus besoin de connaitre/deviner le `top` CSS en dur pour le reconstituer.
    function getOffset() {
      const bubbleRect = bubbleRef.current?.getBoundingClientRect();
      return (bubbleRect ? bubbleRect.bottom : FIXED_TOP_OFFSET + 140) + 16;
    }

    function settle() {
      const offset = getOffset();
      applyTopMargin(offset);
      computeLock(offset);
      // Verrou dur (overflow:hidden), pose seulement une fois le scroll d'installation termine
      // (jamais avant, risquerait d'interferer avec l'animation "smooth" selon les navigateurs) :
      // corrige le 20/08, ecart trouve par Gilles ("scroll toujours possible", "ca bug"). Le verrou
      // souple ci-dessous (onScroll, snapback JS) ne suffit pas seul a bloquer un scroll inertiel
      // de trackpad qui depasse la zone avant que le listener ne reagisse, cf version-guided-tour.html
      // (meme mecanique, "retour Gilles a 100% de zoom", 19/08) : quand lockMax<=lockMin (aucun
      // scroll reellement necessaire), le blocage doit etre total, pas juste rattrape apres coup.
      scrollToTarget(offset, () => {
        document.documentElement.style.overflow = lockMax !== null && lockMin !== null && lockMax <= lockMin ? "hidden" : "";
      });
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
      // Texte replie/deplie selon la proximite du haut de la zone verrouillee (mobile uniquement,
      // cf mockup) : ferme des qu'on s'en eloigne, se rouvre automatiquement en y revenant. Jamais
      // sur un scroll programmatique (nos propres sauts entre etapes).
      setExpanded(window.scrollY <= lockMin! + 24);
    }

    function onResize() {
      computeLock(getOffset());
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      if (imgTimeout) clearTimeout(imgTimeout);
      el.style.position = "";
      el.style.zIndex = "";
      el.style.boxShadow = "none";
      el.style.marginTop = "";
      el.style.padding = "";
      el.style.boxSizing = "";
      // Leve le verrou dur avant de quitter l'etape (corrige le 20/08, ecart trouve en comparant
      // au mockup : render() y remet overflow a "" en tout debut de fonction, avant tout recalcul
      // pour la nouvelle etape). Sans ce reset, un verrou pose a l'etape N restait actif pendant la
      // transition vers l'etape N+1 et pouvait bloquer le scrollTo() programmatique lui-meme
      // (overflow:hidden sur <html> empeche tout scroll, y compris programmatique), symptome
      // compatible avec "le scroll est degueulasse, ca bug" remonte par Gilles.
      document.documentElement.style.overflow = "";
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

  // bottom-left, pas bottom-right : ScrollToTop.tsx (bouton "remonter en haut", deja present sur
  // toutes les pages) occupe deja ce coin avec un z-index plus eleve, il cachait ce bouton
  // (retour de Gilles le 16/08, prod).
  if (status === "idle" || status === "off") {
    // "idle" affiche aussi ce bouton, pas seulement "off" (corrige le 20/08, ecart trouve par
    // Gilles) : le store ne survit pas a un reload (volontaire, cf caseStudyTourStore.ts), et
    // l'auto-demarrage ne se declenche que sur la V1 (cf effet plus haut) - un reload sur V2/V6
    // pendant le tour retombe donc en "idle" sans jamais redevenir "active" automatiquement.
    // Sans ce cas, l'utilisateur perdait toute possibilite de relancer le parcours (bouton
    // absent, uniquement affiche pour "off").
    return status === "off" || status === "idle" ? (
      <button
        type="button"
        onClick={restart}
        className="fixed bottom-24 left-4 sm:bottom-5 sm:left-5 z-40 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold shadow-lg"
      >
        ↻ Relancer le parcours
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
        {/* Dimensions/typo alignees sur .tour-end-card du mockup (corrige le 20/08, ecart trouve
            par Gilles : max-w-lg/p-14/px-7 py-3.5/text-base arrondis au pas Tailwind le plus
            proche au lieu des valeurs exactes 520px/56px+48px/30px+14px/15px). */}
        <div className="max-w-[520px] rounded-2xl border border-border bg-card py-14 px-12 text-center shadow-2xl">
          <p className="mb-9 text-base leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Ce parcours pourrait être le vôtre !</strong>
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
          {/* Seul endroit ou "Visiter librement" reapparait (retiree des bulles de chaque etape,
              cf ci-dessous) : discret, sous le CTA principal, pour qui a fini et veut fouiller par
              lui-meme. Conforme a .tour-end-skip de version-guided-tour.html (fleche "→" ajoutee
              le 20/08, ecart trouve par Gilles : texte sans fleche avant, contrairement au mockup). */}
          <button type="button" onClick={skip} className="mt-4 block w-full text-center text-sm text-muted-foreground underline">
            Visiter librement →
          </button>
        </div>
      </div>
    );
  }

  if (!isOnRightRound) return null;

  return (
    <div
      ref={bubbleRef}
      // top-[76px] : aligne sur .tour-bubble{top:76px} du mockup, meme valeur toutes tailles
      // d'ecran (corrige le 20/08, ecart trouve par Gilles : 104/92px avant, jamais aligne).
      // left-4 right-4 sur mobile (insets symetriques, sans max-width) : porte du mockup (18/08,
      // correctif "bulle rognee a droite sur iPhone SE/mini"), jamais applique ici avant ce
      // correctif (max-w-[340px] restait actif sur mobile, meme bug reproduit en prod).
      // shadow/padding alignes sur les valeurs exactes du mockup plutot que les presets Tailwind
      // (shadow-xl, py-3) qui divergeaient legerement.
      className="fixed top-[76px] left-4 right-4 sm:left-6 sm:right-auto sm:max-w-[340px] z-[61] rounded-lg bg-foreground px-[18px] py-4 text-sm leading-relaxed text-background shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2.5">
        <div className="text-[11px] font-bold uppercase tracking-wide opacity-55">
          Étape {stepIndex + 1} / {CASE_STUDY_TOUR_STEPS.length}
        </div>
        {/* Bouton replier/deplier, mobile uniquement (cf .tour-toggle du mockup, masque par
            defaut sur desktop/laptop ou le texte est deja visible directement). Breakpoint
            760px (max-[760px]:), pas sm: (640px, corrige le 20/08, ecart trouve par Gilles) :
            aligne sur la media query reelle du mockup (@media(max-width:760px)). */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-label="Afficher/masquer le texte"
          className="hidden max-[760px]:flex items-center justify-center h-[26px] w-[26px] rounded-full border border-current opacity-70 text-[12px] font-bold shrink-0"
        >
          ⓘ
        </button>
      </div>
      {step.text.map((line, i) => (
        <p key={i} className={`mb-3.5 ${expanded ? "block" : "block max-[760px]:hidden"}`}>
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
  );
}
