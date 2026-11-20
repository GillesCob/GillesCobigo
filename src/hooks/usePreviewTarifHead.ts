import { useEffect } from "react";

/**
 * Tete du document tant que la page de prix est montee : noindex (page privee d'un prospect) et feuille de polices du prospect.
 * L'URL de la feuille a deja ete validee par resolveTarifTheme (hote Google Fonts uniquement). Tout est retire au demontage.
 */
export function usePreviewTarifHead(fontsUrl: string | null): void {
  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    let fonts: HTMLLinkElement | null = null;
    if (fontsUrl !== null) {
      fonts = document.createElement("link");
      fonts.rel = "stylesheet";
      fonts.href = fontsUrl;
      document.head.appendChild(fonts);
    }
    return () => {
      robots.remove();
      fonts?.remove();
    };
  }, [fontsUrl]);
}
