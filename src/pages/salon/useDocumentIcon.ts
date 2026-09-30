import { useEffect } from "react";

const ICON_RELS = ["icon", "apple-touch-icon"] as const;

function setLinkHref(rel: string, href: string): () => void {
  const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (existing) {
    const previous = existing.getAttribute("href");
    existing.setAttribute("href", href);
    return () => {
      if (previous === null) existing.removeAttribute("href");
      else existing.setAttribute("href", previous);
    };
  }
  const link = document.createElement("link");
  link.rel = rel;
  link.setAttribute("href", href);
  document.head.appendChild(link);
  return () => link.remove();
}

/**
 * Icône d'onglet et apple-touch-icon propres à une page (carte Habitat Expo : logo GC du mockup,
 * public/images/favicon.png), à la place de celles d'index.html, restaurées au démontage.
 * Limite (SPA, index.html commun) : posées par le JS, donc absentes pour un robot ou un aperçu de
 * lien qui ne l'exécute pas.
 */
export function useDocumentIcon(href: string) {
  useEffect(() => {
    const restores = ICON_RELS.map((rel) => setLinkHref(rel, href));
    return () => restores.forEach((restore) => restore());
  }, [href]);
}
