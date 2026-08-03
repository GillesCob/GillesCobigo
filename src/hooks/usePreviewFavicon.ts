import { useEffect } from "react";

/** Remplace le favicon par celui du client tant que la page preview est montée, restaure l'original ensuite. */
export function usePreviewFavicon(logoUrl?: string) {
  useEffect(() => {
    if (!logoUrl) return;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    const original = link.href;
    link.href = logoUrl;
    return () => {
      link.href = original;
    };
  }, [logoUrl]);
}
