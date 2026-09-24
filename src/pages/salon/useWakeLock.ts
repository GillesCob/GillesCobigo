import { useEffect } from "react";

/**
 * Empêche la mise en veille de l'écran tant que le composant est monté (écran stand), comme le
 * mockup : demande au montage, redemande au retour au premier plan (le navigateur relâche le
 * verrou quand l'onglet passe en arrière-plan), relâche au démontage. Aucun texte affiché : un
 * refus (navigateur non compatible, contexte non sécurisé) laisse simplement l'écran se mettre
 * en veille plutôt que d'afficher un état faux.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let pending = false;
    let disposed = false;

    async function request() {
      if (sentinel || pending || disposed) return;
      pending = true;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (disposed) {
          await lock.release();
          return;
        }
        sentinel = lock;
        lock.addEventListener("release", () => {
          sentinel = null;
        });
      } catch {
        // Refus ou contexte non sécurisé : pas d'état affiché, cf docblock.
      } finally {
        pending = false;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") void request();
    }

    void request();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release();
      sentinel = null;
    };
  }, []);
}
