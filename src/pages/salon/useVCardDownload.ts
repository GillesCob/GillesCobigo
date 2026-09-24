import { useCallback, useEffect, useRef, useState } from "react";
import { buildVCard, type IVCardContact } from "./vcard";

const RESET_DELAY_MS = 4000;
const REVOKE_DELAY_MS = 4000;

export interface IVCardDownload {
  isDone: boolean;
  statusMessage: string;
  download: () => void;
}

/**
 * Téléchargement de la fiche contact, même séquence que le mockup : blob vCard, lien <a download>
 * cliqué puis retiré, URL révoquée après 4 s, bouton en état "done" (vert) pendant 4 s puis retour
 * à l'état initial. Le message de la zone aria-live reste affiché après le retour, comme le mockup.
 */
export function useVCardDownload(contact: IVCardContact, filename: string): IVCardDownload {
  const [isDone, setIsDone] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const resetTimer = useRef<number>();

  // Seul le retour à l'état initial est annulé au démontage (setState sur composant démonté). La
  // révocation de l'URL du blob reste programmée : sans effet sur l'UI, elle libère la mémoire.
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const download = useCallback(() => {
    const blob = new Blob([buildVCard(contact, new Date())], { type: "text/vcard;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), REVOKE_DELAY_MS);

    setIsDone(true);
    setStatusMessage(`Fiche contact ${filename} téléchargée.`);
    if (navigator.vibrate) navigator.vibrate(12);
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setIsDone(false), RESET_DELAY_MS);
  }, [contact, filename]);

  return { isDone, statusMessage, download };
}
