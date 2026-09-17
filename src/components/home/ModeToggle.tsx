import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Mode } from "@/store/modeStore";

interface IModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

interface IThumbRect {
  width: number;
  left: number;
}

// Segmented control avec pastille glissante (mockup Projets/Portfolio/mockups/refonte-v5-bascule.html,
// #switchThumb). La largeur/position de la pastille sont mesurées sur le bouton actif réel (pas de
// valeurs fixes) car "Mode Dev" et "Mode Bâtiment" n'ont pas la même largeur.
export default function ModeToggle({ mode, onChange }: IModeToggleProps) {
  const devRef = useRef<HTMLButtonElement>(null);
  const btpRef = useRef<HTMLButtonElement>(null);
  const [thumb, setThumb] = useState<IThumbRect>({ width: 0, left: 0 });

  useLayoutEffect(() => {
    function measure() {
      const activeEl = mode === "dev" ? devRef.current : btpRef.current;
      if (!activeEl) return;
      setThumb({ width: activeEl.offsetWidth, left: activeEl.offsetLeft });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mode]);

  return (
    <div className="relative inline-flex items-center gap-2.5 rounded-full border border-border bg-card p-1">
      <motion.span
        className="absolute inset-y-1 left-0 rounded-full bg-mode-accent"
        animate={{ width: thumb.width, x: thumb.left }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <button
        ref={devRef}
        type="button"
        onClick={() => onChange("dev")}
        aria-pressed={mode === "dev"}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:px-4 sm:py-2 sm:text-[13px]",
          mode === "dev" ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Mode Dev
      </button>
      <button
        ref={btpRef}
        type="button"
        onClick={() => onChange("btp")}
        aria-pressed={mode === "btp"}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-200 sm:px-4 sm:py-2 sm:text-[13px]",
          mode === "btp" ? "text-white" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Mode Bâtiment
      </button>
    </div>
  );
}
