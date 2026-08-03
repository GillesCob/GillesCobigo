import { useEffect } from "react";

/** Remplace le titre d'onglet tant que la page preview est montée, restaure l'original ensuite. */
export function usePreviewTitle(title?: string) {
  useEffect(() => {
    if (!title) return;
    const original = document.title;
    document.title = title;
    return () => {
      document.title = original;
    };
  }, [title]);
}
