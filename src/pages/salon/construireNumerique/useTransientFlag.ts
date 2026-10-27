import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drapeau qui retombe seul à `false` après `delayMs` (état « fait » d'un bouton, message de
 * confirmation). Le délai est relancé à chaque activation, annulé au démontage.
 */
export function useTransientFlag(delayMs: number): [boolean, () => void] {
  const [isActive, setIsActive] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const activate = useCallback(() => {
    setIsActive(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setIsActive(false), delayMs);
  }, [delayMs]);

  return [isActive, activate];
}
