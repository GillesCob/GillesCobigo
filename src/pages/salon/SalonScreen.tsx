import { useRef, type ReactNode } from "react";
import { useBackgroundParallax } from "./useBackgroundParallax";
import { useSalonDocument } from "./useSalonDocument";
import "./salon.css";

interface ISalonScreenProps {
  className?: string;
  children: ReactNode;
}

/**
 * Coque commune aux deux écrans du mockup carte-salon.html : `.cs-root` joue le rôle du <body>
 * du mockup (tokens + typographie, cf salon.css), `.screen` porte le fond graphe Obsidian en
 * parallax. Un <div> plutôt que le <main> du mockup : App.tsx rend déjà toutes les routes dans un
 * <main>, un second <main> imbriqué serait invalide (rendu identique, les deux sont en block).
 */
export default function SalonScreen({ className, children }: ISalonScreenProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  useSalonDocument();
  useBackgroundParallax(screenRef, bgImageRef);

  return (
    <div className="cs-root">
      <div ref={screenRef} className={className ? `screen ${className}` : "screen"}>
        <div className="bg" aria-hidden="true">
          <img ref={bgImageRef} src="/images/obsidian-graph.svg" alt="" />
        </div>
        {children}
      </div>
    </div>
  );
}
