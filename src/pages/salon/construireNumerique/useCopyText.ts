import { useCallback, useState } from "react";
import { useTransientFlag } from "./useTransientFlag";

export type TCopyStatus = "idle" | "copied" | "failed";

const STATUS_DELAY_MS = 4000;

export interface ICopyText {
  status: TCopyStatus;
  copy: () => Promise<void>;
}

/**
 * Copie `text` dans le presse-papiers. `failed` quand l'API est absente (contexte non sécurisé,
 * navigateur ancien) ou refuse l'accès : l'appelant affiche alors un repli (texte à sélectionner
 * à la main). Le statut retombe à `idle` après 4 s.
 */
export function useCopyText(text: string): ICopyText {
  const [outcome, setOutcome] = useState<Exclude<TCopyStatus, "idle">>("copied");
  const [isShown, showStatus] = useTransientFlag(STATUS_DELAY_MS);

  const copy = useCallback(async () => {
    try {
      if (!navigator.clipboard) throw new Error("Presse-papiers indisponible");
      await navigator.clipboard.writeText(text);
      setOutcome("copied");
    } catch {
      setOutcome("failed");
    }
    showStatus();
  }, [text, showStatus]);

  return { status: isShown ? outcome : "idle", copy };
}
