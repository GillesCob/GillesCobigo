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
import "./NewHome.hero.css";
import "./NewHome.navbar.css";
import "./NewHome.timeline.css";
import "./NewHome.work.css";
import "./NewHome.skills.css";
import "./NewHome.github.css";
import "./NewHome.contact.css";
import "./NewHome.footer.css";

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
  const heroRef = useRef<HTMLElement>(null);
  const heroBgWrapRef = useRef<HTMLDivElement>(null);
  // Permet de redeclencher la mesure+application de la parallax depuis un autre effet (cf plus
  // bas, quand `fixedHeaderHeight` se corrige), sans dupliquer measure()/update().
  const measureRef = useRef<(() => void) | null>(null);
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

  // Ancre dans l'URL au premier montage (ex. "/#projets" ou "/#contact" depuis un lien externe,
  // cf VideoLanding.tsx) : le hash seul (navigation React Router, pas un rechargement complet) ne
  // déclenche aucun scroll automatique du navigateur, il faut le lire nous-mêmes. `scrollToSection`
  // gère déjà l'offset du header fixed ; ScrollReset.tsx ignore ce montage précis (hash présent)
  // pour ne pas ramener le scroll à 0 juste après. Une frame de délai : au tout premier rendu, les
  // sections (notamment le hero, qui dépend de `fixedHeaderHeight` mesuré ci-dessus) n'ont pas
  // forcément leur position finale.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const raf = requestAnimationFrame(() => scrollToSection(id));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parallax du visuel de fond du hero (image BIM côté Bâtiment, graphe Obsidian côté Dev) :
  // bouge à une fraction de la vitesse du scroll, borné pour ne jamais dépasser la marge ménagée
  // par le sur-dimensionnement de l'image en CSS (190% de hauteur, cf className plus bas). Calcul
  // identique au mockup de référence (updateHeroParallax).
  useEffect(() => {
    let ticking = false;
    // Hauteur + position absolue de hero mises en cache, recalculées seulement au montage et au
    // resize (jamais à chaque scroll) : `getBoundingClientRect()` force un reflow synchrone, et
    // l'appeler à chaque frame de scroll (même throttlé par rAF) est la cause la plus probable du
    // parallax saccadé signalé sur mobile. `window.scrollY` (lu à chaque frame) est en comparaison
    // gratuit, ne force aucun reflow.
    let heroTop = 0;
    let heroHeight = 0;
    let visuals: NodeListOf<HTMLElement> | null = null;
    function measure() {
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      heroTop = rect.top + window.scrollY;
      heroHeight = rect.height;
      visuals = heroBgWrapRef.current?.querySelectorAll<HTMLElement>("img") ?? null;
    }
    function update() {
      ticking = false;
      if (!visuals || visuals.length === 0) return;
      const rectTop = heroTop - window.scrollY;
      const max = heroHeight * 0.2;
      const offset = Math.max(-max, Math.min(max, rectTop * 0.15));
      visuals.forEach((el) => {
        el.style.transform = `translateY(${offset}px)`;
      });
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }
    function onResize() {
      measure();
      onScroll();
    }
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Appel immédiat obligatoire : sans lui, `transform` reste "none" (valeur par défaut, jamais
    // posée) jusqu'au premier scroll, où il saute directement à sa valeur calculée à cet instant
    // (pas de transition douce depuis "none") — cause du saut au premier scroll. La cause du flash
    // du fond signalée plus tôt était ailleurs (z-index, largeur bridée par le reset Tailwind,
    // padding sur le mauvais élément, overflow-hidden en trop), tous corrigés depuis.
    update();
    measureRef.current = () => {
      measure();
      update();
    };
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Re-mesure la parallax quand `fixedHeaderHeight` se corrige (cf effet dedie plus haut : demarre
  // a la valeur approximative HEADER_OFFSET avant d'etre mesuree reellement) : `heroTop` n'etait
  // capture qu'une fois au montage, avec le spacer encore a son ancienne hauteur -> hero se
  // decale legerement une fois le spacer corrige, sans que la parallax (deja lancee) ne le
  // sache jamais. Verifie en pratique : offset fige a 24px au lieu de 22.8px attendu tant que ce
  // correctif n'existait pas.
  useEffect(() => {
    measureRef.current?.();
  }, [fixedHeaderHeight]);

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
    // Pile de police du mockup (body { font-family: ... }), posée une seule fois ici plutôt que
    // répétée dans chaque fichier NewHome.*.css : hero/navbar/timeline la redéclarent chacun sur
    // leur propre classe racine (fait avant que ce point commun soit identifié), mais toute
    // section ajoutée depuis en hérite directement d'ici, sans quoi elle retombe sur la pile
    // Tailwind par défaut du Preflight (`ui-sans-serif, system-ui, ...`), un bug déjà trouvé deux
    // fois au diff pixel (timeline, puis work-list).
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  } as CSSProperties;
  const skills = mode === "dev" ? devSkills : btpSkills;

  return (
    <div data-mode={mode} style={rootStyle} className="min-h-dvh bg-background text-foreground">
      {/* Liseré d'accent toujours visible en haut de page (mockup .mode-strip) : marqueur discret
          du mode courant, pas seulement l'état actif des boutons du switch. Pulse bref à chaque
          bascule pour que le changement se voie. `position:fixed` (pas `sticky`) : cf commentaire
          détaillé dans NewHome.navbar.css (overflow-x:hidden global casse sticky). */}
      <div key={pulseKey} className={cn("mp-mode-strip", pulseKey > 0 && "pulse")} />
      <header ref={headerRef} className="mp-topbar">
        <button onClick={() => scrollToSection("hero")} className="mp-brand">
          {/* Toujours le logo "clair" : /new n'a pas de dark mode (cf FIXED_LIGHT_TOKENS ci-dessus),
              la variante blanche (pensée pour un fond sombre) ne s'applique jamais ici. */}
          <img src="/images/logo-gc-black.png" alt="" className="h-[38px] w-auto flex-shrink-0" />
          Gilles Cobigo
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
        <section id="hero" ref={heroRef} className="mp-hero">
          {/* Les deux visuels restent montés en permanence (seul `hidden` bascule selon le mode,
              comme .btp-only/.dev-only dans le mockup) : la parallax interroge le DOM une seule
              fois au montage (heroBgWrapRef), pas à chaque changement de mode. */}
          <div ref={heroBgWrapRef} className="mp-hero-bg" aria-hidden="true">
            <img
              src="/images/bim-illustration.png"
              alt=""
              className={cn(mode !== "btp" && "hidden")}
            />
            <img
              src="/images/obsidian-graph.svg"
              alt=""
              className={cn(mode !== "dev" && "hidden")}
            />
          </div>
          <div className="mx-auto w-full max-w-[880px] px-5 sm:px-10">
            {mode === "dev" ? (
              <>
                <p className="mp-eyebrow">Développeur · 2022 à aujourd'hui</p>
                <h1>La précision du code, héritée du terrain.</h1>
                <p className="mp-lead">
                  TypeScript, Node.js, React, Prisma. 10 ans dans le bâtiment avant ça, dont BIM Manager sur
                  l'extension en mer de la ville de Monaco. Une reconversion qui n'en est pas une.
                </p>
                <div className="mp-ctas">
                  <button onClick={() => scrollToSection("projets")} className="mp-btn mp-btn-primary">
                    Voir mes projets
                  </button>
                  <button onClick={() => scrollToSection("contact")} className="mp-btn mp-btn-ghost">
                    Me contacter
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mp-eyebrow">BIM Manager · 2008 à 2022</p>
                <h1>BIM Manager, coordination de projets à grande échelle.</h1>
                <p className="mp-lead">
                  10 ans dans le bâtiment chez Bouygues Construction, dont BIM Manager sur l'extension en mer de la
                  ville de Monaco, un projet à 2 milliards d'euros piloté à travers plus de 100 maquettes numériques
                  interconnectées.
                </p>
                <div className="mp-ctas">
                  <button onClick={() => scrollToSection("chantiers")} className="mp-btn mp-btn-primary">
                    Voir mes chantiers
                  </button>
                  <button onClick={() => scrollToSection("contact")} className="mp-btn mp-btn-ghost">
                    Me contacter
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        <TimelineV2 mode={mode} onGoToMode={handlePortalGoTo} />

        <ProjectsSectionV2 mode={mode} />

        {mode === "dev" && <GitHubStats newHomeStyle />}

        <section id="competences" className="scroll-mt-[90px]">
          <motion.div
            className="mx-auto mt-16 flex min-h-0 w-full max-w-[880px] flex-col justify-center border-t border-border px-5 pt-12 sm:mt-[130px] sm:min-h-[82vh] sm:px-10"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
            onViewportEnter={() => setSkillsRevealed(true)}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Mockup : `.row-label` de Compétences porte un style inline `margin:26px 0 0`, qui
                remplace entièrement le margin-bottom:18px par défaut de la classe (pas un ajout) —
                cas particulier à cette section seulement, jamais rencontré sur Parcours/Projets/
                Chantiers. */}
            <p className="mp-row-label" style={{ margin: "26px 0 0" }}>
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
      <footer className="mp-footer">
        <div className="mp-footer-grid">
          <div className="mp-footer-col">
            <p className="h">Gilles Cobigo</p>
            <p>Développeur fullstack, ex-BIM Manager</p>
          </div>
          <div className="mp-footer-col">
            <p className="h">Liens</p>
            <a href="https://github.com/GillesCob" target="_blank" rel="noopener noreferrer">
              github.com/GillesCob
            </a>
            <a href="https://www.linkedin.com/in/gillescobigo" target="_blank" rel="noopener noreferrer">
              linkedin.com/in/gillescobigo
            </a>
            <a href="mailto:contact@gillescobigo.com">contact@gillescobigo.com</a>
          </div>
          <div className="mp-footer-col">
            <p className="h">Ce site</p>
            <p>Construit en React + Vite. Hébergé sur Vercel.</p>
            <a href="https://github.com/GillesCob/GillesCobigo" target="_blank" rel="noopener noreferrer">
              Code sur GitHub
            </a>
          </div>
        </div>
        <p className="mp-footer-copy">© 2026 Gilles Cobigo</p>
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
    <div className="mp-skills-row">
      <p className="mp-cat">{cat}</p>
      <p className="mp-items">{items}</p>
      <span
        aria-hidden="true"
        className="mp-accent-bar transition-[width] duration-700 ease-out"
        style={{ width: revealed ? 64 : 0, transitionDelay: `${SKILL_ROW_DELAYS_MS[index] ?? 0}ms` }}
      />
    </div>
  );
}
