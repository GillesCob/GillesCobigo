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

  // Re-mesure à chaque changement de taille de l'un des deux boutons (ResizeObserver), pas
  // seulement au resize de la fenêtre. Bug du 24/09 (iPhone, rechargement en mode Bâtiment, mode
  // persisté en localStorage) : la mesure au montage tombe AVANT le chargement du logo de la topbar
  // (img largeur 0 à cet instant). Le logo chargé élargit le bloc marque (~134px -> ~167px à 390px),
  // le switch se resserre (justify-content: space-between), "Mode Bâtiment" passe sur 2 lignes et
  // rétrécit/se décale (103px -> 99px), mais la pastille gardait l'ancienne géométrie et débordait
  // à droite du switch. Elle ne se recalait qu'au premier scroll, parce que Safari iOS émet alors un
  // `resize` (barre d'adresse qui se replie). Observer les DEUX boutons couvre aussi le décalage de
  // "Mode Bâtiment" quand seul "Mode Dev" change de largeur, le chargement tardif d'une police
  // (remplace l'ancien document.fonts.ready) et le resize de fenêtre (qui change la largeur des
  // boutons dès qu'elle influe sur la pastille ; un déplacement du switch entier est sans effet,
  // la pastille étant positionnée relativement au switch).
  useLayoutEffect(() => {
    function measure() {
      const activeEl = mode === "dev" ? devRef.current : btpRef.current;
      if (!activeEl) return;
      setThumb({ width: activeEl.offsetWidth, left: activeEl.offsetLeft });
    }
    measure();
    const observer = new ResizeObserver(measure);
    if (devRef.current) observer.observe(devRef.current);
    if (btpRef.current) observer.observe(btpRef.current);
    return () => observer.disconnect();
  }, [mode]);

  return (
    <div className="mp-switch">
      <motion.span
        className="mp-switch-thumb"
        animate={{ width: thumb.width, x: thumb.left }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <button
        ref={devRef}
        type="button"
        onClick={() => onChange("dev")}
        aria-pressed={mode === "dev"}
        className={cn(mode === "dev" && "active")}
      >
        Mode Dev
      </button>
      <button
        ref={btpRef}
        type="button"
        onClick={() => onChange("btp")}
        aria-pressed={mode === "btp"}
        className={cn(mode === "btp" && "active")}
      >
        Mode Bâtiment
      </button>
    </div>
  );
}
