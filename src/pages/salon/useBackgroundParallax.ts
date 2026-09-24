import { useEffect, type RefObject } from "react";

/**
 * Parallax léger du fond obsidian-graph.svg, calcul repris tel quel du mockup carte-salon.html
 * (lui-même aligné sur VideoLanding.tsx) : décalage = -scrollY × 0,15, borné à ±10 % de la
 * hauteur de l'écran. Comme le mockup, rien n'est appliqué avant le premier scroll, et le
 * transform est retiré quand prefers-reduced-motion est actif (lu à chaque frame).
 */
export function useBackgroundParallax(screenRef: RefObject<HTMLElement>, imageRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;
    let frame = 0;

    function update() {
      ticking = false;
      const screen = screenRef.current;
      const image = imageRef.current;
      if (!screen || !image) return;
      if (reduceMotion.matches) {
        image.style.transform = "";
        return;
      }
      const max = screen.offsetHeight * 0.1;
      const offset = Math.max(-max, Math.min(max, -window.scrollY * 0.15));
      image.style.transform = `translateY(${offset}px)`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      frame = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [screenRef, imageRef]);
}
