import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useModeStore, type Mode } from "@/store/modeStore";
import ModeToggle from "@/components/home/ModeToggle";
import SectionDots from "@/components/home/SectionDots";
import TimelineV2 from "@/components/home/TimelineV2";
import ProjectsSectionV2 from "@/components/home/ProjectsSectionV2";
import GitHubStats from "@/components/home/GitHubStats";
import ContactSectionInline from "@/components/home/ContactSectionInline";

// Décalage du header sticky pour tout scroll calculé à la main (nav à points, CTA hero, bascule
// de mode), identique au HEADER_OFFSET du mockup de référence.
const HEADER_OFFSET = 90;

// Teintes d'accent par mode (cf tailwind.config.ts, couleur `mode-accent`), converties en HSL exact
// à partir des hex du mockup de référence (:root --accent / body[data-mode="btp"] --accent).
// Dev = #2B4A4A (pas de token existant équivalent). Bâtiment = #B5562B : volontairement DIFFÉRENT
// du token `coral` (#D85A30) déjà utilisé ailleurs sur le site, cf audit du 17/09 (le mockup utilise
// une teinte plus terreuse/sombre que `coral`, un token Tailwind préexistant mais pas la bonne
// couleur pour ce mode précis).
const DEV_ACCENT_HSL = "180 27% 23%";
const BTP_ACCENT_HSL = "19 62% 44%";

// /new reste toujours en fond clair, quel que soit le thème dark/light choisi ailleurs sur le
// site (src/store/themeStore.ts) : le mockup de référence n'a pas de dark mode du tout. Plutôt que
// de toucher au mécanisme de thème global (qui doit continuer à s'appliquer normalement sur /,
// /articles, etc.), on fige ici, localement, les tokens shadcn consommés par cette page et ses
// sous-composants (y compris GitHubStats, partagé avec l'ancienne Home) : posés en style inline sur
// le conteneur racine, ils gagnent sur les valeurs `.dark` héritées de <html> sans jamais en
// dépendre. Les 4 tokens cités dans le mockup (bg/ink/muted/line) sont convertis en HSL exact à
// partir de ses hex (Projets/Portfolio/mockups/refonte-v5-bascule.html, variables :root) ; les
// autres tokens (primary, destructive, ring...) reprennent tels quels les valeurs déjà utilisées
// par le thème clair du site (src/globals.css), absentes du mockup mais déjà correctes en clair.
const FIXED_LIGHT_TOKENS: CSSProperties = {
  "--background": "60 16.7% 97.6%", // #FAFAF8
  "--foreground": "210 8.3% 9.4%", // #16181A
  "--card": "0 0% 100%", // #fff (pastille ModeToggle, cf mockup .mode-toggle)
  "--card-foreground": "210 8.3% 9.4%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "210 8.3% 9.4%",
  "--primary": "220.9 39.3% 11%",
  "--primary-foreground": "210 20% 98%",
  "--secondary": "220 14.3% 95.9%",
  "--secondary-foreground": "220.9 39.3% 11%",
  "--muted": "210 4.3% 45.1%", // #6E7378 (ex. points de la timeline)
  "--muted-foreground": "210 4.3% 45.1%", // #6E7378
  "--accent": "220 14.3% 95.9%",
  "--accent-foreground": "220.9 39.3% 11%",
  "--destructive": "0 84.2% 60.2%",
  "--destructive-foreground": "210 20% 98%",
  "--border": "42.9 12.3% 88.8%", // #E6E4DF
  "--input": "42.9 12.3% 88.8%", // #E6E4DF
  "--ring": "224 71.4% 4.1%",
} as CSSProperties;

const devSkills = [
  { cat: "Backend", items: "Node.js, Express, Prisma" },
  { cat: "Frontend", items: "React, TypeScript" },
  { cat: "Agentique", items: "Claude API, Claude Code" },
  { cat: "DevOps", items: "Docker, Nginx" },
];

const btpSkills = [
  { cat: "Maquette numérique", items: "Revit, Navisworks, Solibri, Dalux, BIM 360, coordination multi-lots" },
  { cat: "Pilotage", items: "100+ maquettes interconnectées (Mareterra, 2 milliards d'euros)" },
  { cat: "Métier", items: "BIM, coordination chantier" },
];

function scrollToSection(id: string): void {
  if (id === "hero") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

// Bascule instantanée (pas de smooth scroll : ça se passe pendant que le contenu est encore
// invisible, cf handleModeChange ci-dessous).
function jumpToSection(id: string): void {
  if (id === "hero") {
    window.scrollTo({ top: 0 });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: y });
}

// Projets ↔ Chantiers occupent la même place dans le menu mais pas le même id (cf mockup).
function mapSectionToMode(section: string, nextMode: Mode): string {
  if (section === "projets" && nextMode === "btp") return "chantiers";
  if (section === "chantiers" && nextMode === "dev") return "projets";
  return section;
}

export default function NewHome() {
  const mode = useModeStore((s) => s.mode);
  const setMode = useModeStore((s) => s.setMode);
  const [activeSection, setActiveSection] = useState("hero");
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Rejoue l'animation "pulse" du liseré d'accent (mode-strip) à chaque bascule de mode : changer
  // `key` force React à remonter l'élément, ce qui relance l'animation CSS même si le mode cliqué
  // est déjà actif (équivalent du "void strip.offsetWidth" du mockup de référence).
  const [pulseKey, setPulseKey] = useState(0);
  // État du bouton/pastille du switch, mis à jour immédiatement au clic (mockup : le
  // `classList.toggle("active", ...)` et `updateSwitchThumb()` sont synchrones, seul le contenu
  // de la section attend les 300ms via setTimeout). Découplé de `mode` (qui pilote le contenu,
  // délibérément retardé) pour ne plus avoir ce délai perçu sur le bouton lui-même.
  const [displayMode, setDisplayMode] = useState<Mode>(mode);
  // Liseré d'accent qui se déploie en cascade sous chaque ligne de compétence (mockup .skills-row
  // ::after), déclenché une fois quand toute la section entre dans le viewport (pas par ligne).
  const [skillsRevealed, setSkillsRevealed] = useState(false);
  // Nom/prénom du logo, dans la navbar : visible en haut de page, disparaît proprement (largeur +
  // opacité, pas juste un `hidden` sec) dès qu'on quitte le tout haut de la page, ne laissant que le
  // logo seul. Seuil de 24px (pas 0) pour ne pas déclencher sur un micro-scroll accidentel/rebond.
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // Largeur naturelle du bloc logo+nom (mesurée une fois, avant toute disparition) : gelée dans
  // `brandWidth`, appliquée au bouton une fois scrollé pour qu'il garde sa largeur d'origine au lieu
  // de se resserrer sur le logo seul. Le logo peut alors se recentrer (position absolue) dans cette
  // même zone au lieu de rester collé à gauche avec un vide à droite. Mesurée depuis le logo
  // (largeur réelle) et le nom (`scrollWidth`, insensible au `max-width` qui le fait disparaître) +
  // le gap fixe, jamais depuis la largeur rendue du bouton lui-même : si la page arrive déjà
  // scrollée (ancre en milieu de page), le bouton serait déjà dans son état réduit au tout premier
  // montage, faussant une mesure prise sur lui.
  const BRAND_GAP_PX = 10;
  const brandLogoRef = useRef<HTMLImageElement>(null);
  const brandNameRef = useRef<HTMLSpanElement>(null);
  const [brandWidth, setBrandWidth] = useState<number>();
  useEffect(() => {
    if (brandWidth !== undefined) return;
    const logoEl = brandLogoRef.current;
    const nameEl = brandNameRef.current;
    if (!logoEl || !nameEl) return;
    setBrandWidth(logoEl.getBoundingClientRect().width + BRAND_GAP_PX + nameEl.scrollWidth);
  }, [brandWidth]);
  const heroRef = useRef<HTMLElement>(null);
  const heroBgWrapRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  // Hauteur réelle du bandeau fixed (liseré + topbar), mesurée plutôt que la constante HEADER_OFFSET
  // (90, approximative) : un écart de quelques px entre les deux laissait un mince espace blanc
  // entre la topbar et le fond du hero, visible à l'œil. Le spacer qui compense la sortie de flux
  // du bandeau fixed utilise cette valeur mesurée, jamais HEADER_OFFSET (qui reste la référence des
  // calculs de scroll ailleurs dans ce fichier, un besoin différent qui tolère l'approximation).
  const [fixedHeaderHeight, setFixedHeaderHeight] = useState(HEADER_OFFSET);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    function measure() {
      if (headerEl) setFixedHeaderHeight(headerEl.getBoundingClientRect().height + 4);
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  // Parallax du visuel de fond du hero (image BIM côté Bâtiment, graphe Obsidian côté Dev) :
  // bouge à une fraction de la vitesse du scroll, borné pour ne jamais dépasser la marge ménagée
  // par le sur-dimensionnement de l'image en CSS (190% de hauteur, cf className plus bas). Calcul
  // identique au mockup de référence (updateHeroParallax).
  useEffect(() => {
    let ticking = false;
    function update() {
      ticking = false;
      const heroEl = heroRef.current;
      const visuals = heroBgWrapRef.current?.querySelectorAll<HTMLElement>("img");
      if (!heroEl || !visuals || visuals.length === 0) return;
      const rect = heroEl.getBoundingClientRect();
      const max = rect.height * 0.32;
      const offset = Math.max(-max, Math.min(max, rect.top * 0.35));
      visuals.forEach((el) => {
        el.style.transform = `translateY(${offset}px)`;
      });
    }
    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    window.addEventListener("scroll", onScrollOrResize);
    window.addEventListener("resize", onScrollOrResize);
    // Appel immédiat obligatoire : sans lui, `transform` reste "none" (valeur par défaut, jamais
    // posée) jusqu'au premier scroll, où il saute directement à sa valeur calculée à cet instant
    // (pas de transition douce depuis "none") — cause du saut au premier scroll. La cause du flash
    // du fond signalée plus tôt était ailleurs (z-index, largeur bridée par le reset Tailwind,
    // padding sur le mauvais élément, overflow-hidden en trop), tous corrigés depuis.
    update();
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  const runModeSwap = useCallback(
    (nextMode: Mode, targetSection: string) => {
      setIsTransitioning(true);
      setPulseKey((k) => k + 1);
      window.setTimeout(() => {
        setMode(nextMode);
        setActiveSection(targetSection);
        requestAnimationFrame(() => {
          jumpToSection(targetSection);
          setIsTransitioning(false);
        });
      }, 300);
    },
    [setMode]
  );

  // Bascule via le toggle de la topbar : atterrit sur l'équivalent de la section actuellement
  // affichée (retenue via activeSection, tenu à jour par SectionDots au scroll).
  const handleModeChange = useCallback(
    (nextMode: Mode) => {
      if (nextMode === mode) return;
      setDisplayMode(nextMode);
      runModeSwap(nextMode, mapSectionToMode(activeSection, nextMode));
    },
    [mode, activeSection, runModeSwap]
  );

  // Bascule via un item "portail" du Parcours : atterrit toujours sur Parcours (comportement du
  // mockup, data-goto-mode + scrollIntoView vers #parcours).
  const handlePortalGoTo = useCallback(
    (nextMode: Mode) => {
      if (nextMode === mode) {
        scrollToSection("parcours");
        return;
      }
      setDisplayMode(nextMode);
      runModeSwap(nextMode, "parcours");
    },
    [mode, runModeSwap]
  );

  const rootStyle = {
    ...FIXED_LIGHT_TOKENS,
    "--mode-accent": mode === "btp" ? BTP_ACCENT_HSL : DEV_ACCENT_HSL,
  } as CSSProperties;
  const skills = mode === "dev" ? devSkills : btpSkills;

  return (
    <div data-mode={mode} style={rootStyle} className="min-h-dvh bg-background text-foreground">
      {/* Liseré d'accent toujours visible en haut de page (mockup .mode-strip) : marqueur discret
          du mode courant, pas seulement l'état actif des boutons du switch. Pulse bref à chaque
          bascule (cf .mode-strip-pulse, globals.css) pour que le changement se voie. */}
      {/* `fixed` et non `sticky` : `html, body { overflow-x: hidden }` (globals.css, partagé par
          tout le site) force `overflow-y` à `auto` sur les deux (règle CSS de résolution de
          `overflow`), ce qui casse `position: sticky` ici (le scroll réel se fait sur `html`,
          pas sur `body`, qui devient alors le conteneur de référence de la sticky sans jamais
          scroller lui-même : la barre reste "collée" à sa position de départ dans le flux et
          défile avec la page au lieu de rester visible). Même contournement déjà utilisé par la
          Navbar globale du site (src/components/layout/Navbar.tsx, `fixed`). */}
      <div
        key={pulseKey}
        className={cn(
          "fixed left-0 top-0 z-50 h-1 w-full bg-mode-accent transition-colors duration-[350ms] ease-in-out",
          pulseKey > 0 && "mode-strip-pulse"
        )}
      />
      <header
        ref={headerRef}
        className="fixed left-0 top-1 z-40 flex w-full items-center justify-between border-b border-border bg-background px-4 py-[18px] sm:px-10"
      >
        <button
          onClick={() => scrollToSection("hero")}
          className="relative flex h-[38px] items-center text-xl font-bold"
          style={{ width: isScrolled ? brandWidth : undefined, transition: "width 300ms ease-in-out" }}
        >
          {/* Toujours le logo "clair" : /new n'a pas de dark mode (cf FIXED_LIGHT_TOKENS ci-dessus),
              la variante blanche (pensée pour un fond sombre) ne s'applique jamais ici. Position
              absolue : glisse de la gauche (état normal) au centre de la zone gelée `brandWidth`
              (une fois le nom disparu), transform étant la seule propriété qui s'anime proprement
              ici (contrairement à `justify-content`, jamais interpolable). */}
          <img
            ref={brandLogoRef}
            src="/images/logo-gc-black.png"
            alt=""
            className={cn(
              "logo-sweep-reveal absolute left-0 top-0 h-[38px] w-auto transition-transform duration-300 ease-in-out",
              isScrolled && "left-1/2 -translate-x-1/2"
            )}
          />
          <span
            ref={brandNameRef}
            className={cn(
              "overflow-hidden whitespace-nowrap pl-[48px] transition-opacity duration-200 ease-in-out",
              isScrolled ? "opacity-0" : "opacity-100"
            )}
          >
            Gilles Cobigo
          </span>
        </button>
        <ModeToggle mode={displayMode} onChange={handleModeChange} />
      </header>
      {/* Compense la sortie du flux des deux éléments fixed ci-dessus (liseré + topbar), hauteur
          mesurée réellement (cf fixedHeaderHeight) pour ne laisser aucun espace résiduel. */}
      <div style={{ height: fixedHeaderHeight }} />

      <SectionDots mode={mode} activeSection={activeSection} onActiveChange={setActiveSection} />

      {/* pt-10/sm:pt-[70px] ici (pas sur la section hero) : reproduit exactement le mockup, où ce
          padding vit sur `main` (au-dessus de hero), jamais sur `.hero` elle-même (`min-height:78vh`
          sans padding). Sur hero, ce padding se retranchait de l'espace de centrage vertical du
          flex (`justify-content:center`), décalant tout le contenu (texte + fond) ~60-85px trop
          haut par rapport au mockup, vérifié par mesure directe des deux (getBoundingClientRect). */}
      <div
        className={cn(
          "pt-10 transition-[opacity,transform] duration-300 ease-in-out sm:pt-[70px]",
          isTransitioning && "translate-y-2 opacity-0"
        )}
      >
        <section
          id="hero"
          ref={heroRef}
          className="relative z-0 flex min-h-[calc(100svh-90px)] flex-col justify-center sm:min-h-[78vh]"
        >
          {/* Les deux visuels restent montés en permanence (seul `hidden` bascule selon le mode,
              comme .btp-only/.dev-only dans le mockup) : la parallax interroge le DOM une seule
              fois au montage (heroBgWrapRef), pas à chaque changement de mode. */}
          <div
            ref={heroBgWrapRef}
            className="pointer-events-none absolute left-1/2 w-screen -translate-x-1/2 overflow-hidden -z-10"
            style={{ top: -70, height: "calc(100% + 70px)" }}
            aria-hidden="true"
          >
            {/* Position/taille identiques au mockup (top:-45%, left:-12.5%, width:125%, height:190%,
                object-fit:cover). `max-w-none` obligatoire : le reset Tailwind (`img { max-width:100% }`)
                bridait sinon la largeur à 100% du conteneur (1440px) au lieu des 125% demandés
                (1800px) — vérifié via getComputedStyle, la hauteur n'a pas cet équivalent donc
                passait déjà, seule la largeur restait clampée. */}
            <img
              src="/images/bim-illustration.png"
              alt=""
              className={cn(
                "absolute -left-[12.5%] -top-[45%] h-[190%] w-[125%] max-w-none object-cover opacity-[0.16]",
                mode !== "btp" && "hidden"
              )}
            />
            <img
              src="/images/obsidian-graph.svg"
              alt=""
              className={cn(
                "absolute -left-[12.5%] -top-[45%] h-[190%] w-[125%] max-w-none object-cover opacity-[0.16]",
                mode !== "dev" && "hidden"
              )}
            />
          </div>
          <div className="mx-auto w-full max-w-[880px] px-5 sm:px-10">
            {mode === "dev" ? (
              <>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-mode-accent">
                  Développeur · 2022 à aujourd'hui
                </p>
                <h1 className="mb-5 text-[clamp(30px,4.5vw,44px)] font-extrabold leading-[1.2]">
                  La précision du code, héritée du terrain.
                </h1>
                <p className="mb-[30px] min-h-[112px] max-w-xl text-lg text-muted-foreground">
                  TypeScript, Node.js, React, Prisma. 10 ans dans le bâtiment avant ça, dont BIM Manager sur
                  l'extension en mer de la ville de Monaco. Une reconversion qui n'en est pas une.
                </p>
                <div className="mt-[34px] flex flex-wrap gap-3.5">
                  <button
                    onClick={() => scrollToSection("projets")}
                    className="rounded-[10px] bg-mode-accent px-[22px] py-3 text-[13px] font-bold text-white transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(20,18,16,0.12)]"
                  >
                    Voir mes projets
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="rounded-[10px] border border-foreground px-[22px] py-3 text-[13px] font-bold transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(20,18,16,0.12)]"
                  >
                    Me contacter
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-mode-accent">
                  BIM Manager · 2008 à 2022
                </p>
                <h1 className="mb-5 text-[clamp(30px,4.5vw,44px)] font-extrabold leading-[1.2]">
                  BIM Manager, coordination de projets à grande échelle.
                </h1>
                <p className="mb-[30px] min-h-[112px] max-w-xl text-lg text-muted-foreground">
                  10 ans dans le bâtiment chez Bouygues Construction, dont BIM Manager sur l'extension en mer de la
                  ville de Monaco, un projet à 2 milliards d'euros piloté à travers plus de 100 maquettes numériques
                  interconnectées.
                </p>
                <div className="mt-[34px] flex flex-wrap gap-3.5">
                  <button
                    onClick={() => scrollToSection("chantiers")}
                    className="rounded-[10px] bg-mode-accent px-[22px] py-3 text-[13px] font-bold text-white transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(20,18,16,0.12)]"
                  >
                    Voir mes chantiers
                  </button>
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="rounded-[10px] border border-foreground px-[22px] py-3 text-[13px] font-bold transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(20,18,16,0.12)]"
                  >
                    Me contacter
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <TimelineV2 mode={mode} onGoToMode={handlePortalGoTo} />

        <ProjectsSectionV2 mode={mode} />

        {mode === "dev" && <GitHubStats maxWidthClassName="max-w-[640px]" sectionClassName="mt-16" />}

        <section id="competences" className="scroll-mt-[90px]">
          <motion.div
            className="mx-auto mt-16 flex min-h-0 w-full max-w-[880px] flex-col justify-center border-t border-border px-5 pt-12 sm:mt-[130px] sm:min-h-[82vh] sm:px-10"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
            onViewportEnter={() => setSkillsRevealed(true)}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="mb-[18px] text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Compétences
            </p>
            <div className="flex flex-col">
              {skills.map((skill, i) => (
                <SkillRow key={skill.cat} cat={skill.cat} items={skill.items} index={i} revealed={skillsRevealed} />
              ))}
            </div>
          </motion.div>
        </section>

        <ContactSectionInline />
      </div>

      {/* Footer statique, hors de la transition de mode-fade (mockup : <footer> est un frère de
          <main>, jamais affecté par la classe mode-fade portée par main uniquement). */}
      <footer className="mt-[70px] border-t border-border px-10 pb-[30px] pt-10">
        <div className="mx-auto flex max-w-[880px] flex-wrap gap-[60px]">
          <div className="flex flex-col">
            <p className="mb-2.5 text-sm font-bold">Gilles Cobigo</p>
            <p className="mb-1.5 text-[13px] text-muted-foreground">Développeur fullstack, ex-BIM Manager</p>
          </div>
        </div>
        <p className="mt-[30px] text-center text-xs text-muted-foreground">© 2026 Gilles Cobigo</p>
      </footer>
    </div>
  );
}

// Cascade de délais du liseré d'accent sous chaque ligne (mockup : nth-of-type 2/3/4 = 0.12/0.24/0.36s,
// 1re ligne sans délai).
const SKILL_ROW_DELAYS_MS = [0, 120, 240, 360];

interface ISkillRowProps {
  cat: string;
  items: string;
  index: number;
  revealed: boolean;
}

function SkillRow({ cat, items, index, revealed }: ISkillRowProps) {
  return (
    <div className="relative overflow-hidden border-b border-border py-10">
      <p className="mb-3 text-[clamp(28px,4.8vw,48px)] font-extrabold leading-[1.05] tracking-[-0.01em]">{cat}</p>
      <p className="max-w-full text-left text-[15px] text-muted-foreground">{items}</p>
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 bg-mode-accent transition-[width] duration-700 ease-out"
        style={{ width: revealed ? 64 : 0, transitionDelay: `${SKILL_ROW_DELAYS_MS[index] ?? 0}ms` }}
      />
    </div>
  );
}
