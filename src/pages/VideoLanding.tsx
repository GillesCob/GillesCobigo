import { useEffect, useRef, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BIMTerm from "@/components/shared/BIMTerm";
import { videoLinks, videoRedirects } from "@/data/videoLinks";
import NotFound from "@/pages/NotFound";
import "./VideoLanding.bg.css";

// Fond clair fixe, aligne sur le nouveau design du portfolio (/new, mode Dev), independant
// du theme sombre/clair partage du reste du site (meme principe que NewHome.tsx). Les tokens
// CSS ci-dessous reprennent les valeurs du theme clair de globals.css (`:root`, jamais `.dark`),
// reappliquees localement pour que tous les composants partages (Button, Badge) qui lisent
// var(--foreground)/var(--primary)/etc. rendent en clair sur cette page precise, sans toucher
// au theme global. Plus de bouton de bascule sombre/clair ici (palette fixe = rien a basculer,
// meme choix que NewHome).
const LIGHT_THEME_VARS = {
  "--background": "0 0% 100%",
  "--foreground": "224 71.4% 4.1%",
  "--muted-foreground": "220 8.9% 46.1%",
  "--secondary": "220 14.3% 95.9%",
  "--secondary-foreground": "220.9 39.3% 11%",
  "--primary": "220.9 39.3% 11%",
  "--primary-foreground": "210 20% 98%",
  "--accent": "220 14.3% 95.9%",
  "--accent-foreground": "220.9 39.3% 11%",
  "--input": "220 13% 91%",
  "--border": "220 13% 91%",
} as React.CSSProperties;

export default function VideoLanding() {
  const { token } = useParams<{ token: string }>();
  const [playing, setPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgWrapRef = useRef<HTMLDivElement>(null);

  // Parallax du fond obsidian-graph.svg au scroll de la page : meme calcul que le hero de
  // /new (NewHome.tsx), simplifie puisqu'ici toute la page joue le role du "hero" (pas de
  // sections distinctes). Bornee par le surdimensionnement de l'image en CSS (140% de hauteur,
  // cf VideoLanding.bg.css) pour ne jamais laisser apparaitre un bord.
  useEffect(() => {
    let ticking = false;
    let pageTop = 0;
    let pageHeight = 0;
    let bgImg: HTMLElement | null = null;

    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      pageTop = rect.top + window.scrollY;
      pageHeight = rect.height;
      bgImg = bgWrapRef.current?.querySelector<HTMLElement>("img") ?? null;
    }
    function update() {
      ticking = false;
      if (!bgImg) return;
      const rectTop = pageTop - window.scrollY;
      const max = pageHeight * 0.1;
      const offset = Math.max(-max, Math.min(max, rectTop * 0.15));
      bgImg.style.transform = `translateY(${offset}px)`;
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
    // Appel immediat obligatoire : sans lui, `transform` reste "none" jusqu'au premier scroll,
    // ou il saute directement a sa valeur calculee (pas de transition douce depuis "none").
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (token && videoRedirects[token]) {
    return <Navigate to={`/v/${videoRedirects[token]}`} replace />;
  }

  const video = token ? videoLinks[token] : undefined;

  if (!video) return <NotFound />;

  return (
    <div
      ref={containerRef}
      className="min-h-dvh bg-background flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={LIGHT_THEME_VARS}
    >
      <div ref={bgWrapRef} className="vl-bg" aria-hidden="true">
        <img src="/images/obsidian-graph.svg" alt="" className="select-none pointer-events-none" />
      </div>

      <div className="relative w-full max-w-xl lg:max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Gilles Cobigo</h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-md mb-6 leading-relaxed">
          10 ans dans le bâtiment, <BIMTerm>BIM Manager</BIMTerm> sur l&apos;extension en mer de Monaco. Aujourd&apos;hui
          développeur fullstack.
        </p>

        <div className="flex flex-wrap gap-1.5 mb-8">
          <Badge variant="secondary">Node.js</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">React</Badge>
        </div>

        <div className="relative aspect-video rounded-xl border border-white/10 bg-zinc-950 overflow-hidden mb-10">
          {playing && video.videoUrl ? (
            <video src={video.videoUrl} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <button
              type="button"
              onClick={() => video.videoUrl && setPlaying(true)}
              disabled={!video.videoUrl}
              aria-label="Lire la vidéo de présentation"
              className="absolute inset-0 flex items-center justify-center disabled:cursor-default group"
            >
              <img
                src="/images/logo-gc-white.png"
                alt=""
                className="absolute inset-0 m-auto h-36 md:h-52 w-auto opacity-20"
              />
              <span className="relative w-14 h-14 rounded-full bg-orange-600 flex items-center justify-center transition-transform group-hover:scale-105 group-disabled:opacity-40 group-disabled:group-hover:scale-100">
                <Play size={22} className="text-white ml-0.5" fill="white" />
              </span>
              {!video.videoUrl && (
                <span className="absolute bottom-3 left-4 text-xs font-medium text-zinc-400">
                  Vidéo à venir
                </span>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-2.5">
          <Button asChild size="lg" className="whitespace-nowrap">
            <a href="https://gillescobigo.com" target="_blank" rel="noopener noreferrer">
              gillescobigo.com <ArrowRight size={16} className="ml-1" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap text-foreground">
            {video.secondaryCta ? (
              <a
                href={video.secondaryCta.href}
                {...(video.secondaryCta.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {video.secondaryCta.label}
              </a>
            ) : (
              // Ancre sur la nouvelle home (bascule /new -> / du 18/09, cf PR #206) : /projects
              // n'existe plus, la liste de projets vit maintenant dans la section #projets de /.
              // Toujours #projets (jamais #chantiers) : choix simple, demandé par Gilles plutôt
              // qu'une logique conditionnelle sur le mode par défaut du visiteur.
              <Link to="/#projets" target="_blank" rel="noopener noreferrer">
                Voir mes projets
              </Link>
            )}
          </Button>
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap text-foreground">
            <a href="/cv-gilles-cobigo.pdf" download>
              Télécharger le CV <Download size={16} className="ml-1" />
            </a>
          </Button>
          {/* Ancien bouton "Lire mes articles" (Link to="/articles") retiré : /articles n'a pas
              d'équivalent sur la nouvelle home (décision de Gilles, PR #206), plutôt que de
              pointer vers une section inexistante. */}
          <Button asChild size="lg" variant="outline" className="whitespace-nowrap text-foreground">
            <Link to="/#contact" target="_blank" rel="noopener noreferrer">
              Me contacter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
