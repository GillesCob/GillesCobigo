import { useEffect } from "react";

const SALON_BG = "#FAFAF8";

function upsertMeta(name: string, content: string): () => void {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (existing) {
    const previous = existing.content;
    existing.content = content;
    return () => {
      existing.content = previous;
    };
  }
  const meta = document.createElement("meta");
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
  return () => meta.remove();
}

/**
 * Réglages de document des pages salon, restaurés au démontage :
 * - robots noindex : aucun mécanisme existant dans le repo (pas de react-helmet), meta injectée ici.
 *   Limite : un robot qui n'exécute pas le JS ne la voit pas (SPA, index.html commun).
 * - theme-color #FAFAF8 (meta du mockup, barre du navigateur mobile claire au lieu de #0A0A0A).
 * - fond du <body> #FAFAF8 : équivalent du `body { background: var(--bg) }` du mockup, sinon le
 *   fond sombre global (thème .dark) apparaît sous une page plus courte que l'écran ou au rebond.
 */
export function useSalonDocument() {
  useEffect(() => {
    const restoreRobots = upsertMeta("robots", "noindex, nofollow");
    const restoreThemeColor = upsertMeta("theme-color", SALON_BG);
    const previousBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = SALON_BG;
    return () => {
      restoreRobots();
      restoreThemeColor();
      document.body.style.backgroundColor = previousBg;
    };
  }, []);
}
