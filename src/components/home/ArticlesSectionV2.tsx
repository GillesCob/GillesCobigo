import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getArticles } from "@/lib/articles";

// Nombre de titres affichés à droite du total (mockup : les 3 plus récents).
const LATEST_COUNT = 3;
// Durée du comptage 0 → total (mockup : countUp, 900ms, easing cubique sortant).
const COUNT_UP_DURATION_MS = 900;
// Part de la section visible avant de lancer l'apparition (mockup : threshold 0.25).
const REVEAL_THRESHOLD = 0.25;

// "static" : tout visible d'emblée (prefers-reduced-motion ou pas d'IntersectionObserver, comme le
// mockup qui ne pose alors jamais .art-anim). "armed" : état de départ masqué, en attente de
// l'entrée dans le viewport. "in" : apparition jouée (une seule fois par montage de la page).
type RevealState = "static" | "armed" | "in";

function getInitialRevealState(): RevealState {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return "static";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "static" : "armed";
}

interface IArticlesSectionV2Props {
  // Section propre au mode Dev, gardée montée en mode Bâtiment mais masquée (équivalent du
  // `.dev-only { display:none }` du mockup) : l'apparition ne se rejoue pas à chaque aller-retour
  // entre les deux modes, comme dans le mockup où elle n'est jouée qu'une fois par chargement.
  hidden: boolean;
}

// Section "Articles" de la home (mockup refonte-v5-bascule.html, #articles) : total des articles
// publiés en grand chiffre détouré, 3 derniers titres séparés par des filets, lien vers la liste.
// Données réelles : getArticles() exclut déjà les articles programmés pas encore publiés.
export default function ArticlesSectionV2({ hidden }: IArticlesSectionV2Props) {
  const articles = useMemo(() => getArticles(), []);
  const total = articles.length;
  const latest = articles.slice(0, LATEST_COUNT);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealState, setRevealState] = useState<RevealState>(getInitialRevealState);
  const [displayedTotal, setDisplayedTotal] = useState(() => (revealState === "armed" ? 0 : total));

  useEffect(() => {
    if (revealState !== "armed") return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setRevealState("in");
        observer.disconnect();
      },
      { threshold: REVEAL_THRESHOLD }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [revealState]);

  useEffect(() => {
    if (revealState !== "in") return;
    let raf = 0;
    const start = performance.now();
    function step(now: number): void {
      const t = Math.min(1, (now - start) / COUNT_UP_DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedTotal(Math.round(eased * total));
      if (t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [revealState, total]);

  if (total === 0) return null;

  return (
    <section
      id="articles"
      ref={sectionRef}
      hidden={hidden}
      className={cn(
        "mp-articles",
        revealState !== "static" && "mp-art-anim",
        revealState === "in" && "mp-art-in"
      )}
    >
      <div className="mp-art-block">
        <p className="mp-row-label">Articles</p>
        <div className="mp-art-layout">
          <div className="mp-art-count">
            <span className="mp-art-total">{displayedTotal}</span>
            <span className="mp-art-total-label">articles publiés</span>
          </div>
          <div>
            <ol className="mp-art-list">
              {latest.map((article) => (
                <li key={article.slug} className="mp-art-row">
                  <Link className="mp-art-link" to={`/articles/${article.slug}`}>
                    <span className="mp-art-text">
                      <span className="mp-art-mask">
                        <span className="mp-art-title">{article.title}</span>
                      </span>
                    </span>
                    <span className="mp-art-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <Link className="mp-art-all" to="/articles">
              Tous les articles →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
