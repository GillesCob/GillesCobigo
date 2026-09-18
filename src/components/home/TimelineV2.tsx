import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Mode } from "@/store/modeStore";

interface ITimelineV2Item {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  detail?: string;
  cardSide: "left" | "right";
  /** Item "portail" : bascule de mode au clic au lieu de se déplier (cf mockup .tl-portal). */
  portalTo?: Mode;
}

// Repris du mockup Projets/Portfolio/mockups/refonte-v5-bascule.html (section #parcours), avec un
// correctif de contenu : l'année "2016" de "BIM Coordinateur" était vide dans le mockup HTML
// (probable oubli côté maquette : timelineData.ts, source de la vraie Home, la porte bien), on la
// restaure ici plutôt que de reproduire ce trou.
const btpItems: ITimelineV2Item[] = [
  {
    id: "ep-2011",
    year: "2011",
    title: "Les débuts dans le bâtiment",
    subtitle: "Analyste thermique, EP",
    detail:
      "Premiers pas dans la donnée technique. Avant le BIM, avant le code, comprendre comment les bâtiments fonctionnent de l'intérieur. La rigueur commence ici.",
    cardSide: "right",
  },
  {
    id: "bouygues-tp-2016",
    year: "2016",
    title: "BIM Coordinateur",
    subtitle: "Bouygues Travaux Publics, Paris",
    detail:
      "Premier projet complexe, découverte du BIM sur la mise en place des caissons sur l'extension en mer de la ville de Monaco. La donnée technique prend forme dans des maquettes numériques.",
    cardSide: "left",
  },
  {
    id: "bouygues-be-2018",
    year: "2018",
    title: "BIM Manager confirmé",
    subtitle: "Bouygues Bâtiment Sud-Est, Marseille",
    detail: "Projets MRS3, TPR2. Coordination multi-lots, synthèse technique, gestion des conflits de données entre corps de métier.",
    cardSide: "right",
  },
  {
    id: "mareterra-2020",
    year: "2020",
    title: "Mareterra Monaco",
    subtitle: "Bouygues Construction",
    detail:
      "Extension en mer de Monaco. 2 milliards d'euros, plus de 100 maquettes numériques interconnectées. Le projet le plus complexe de ma carrière, à une échelle que peu de BIM Managers ont connue.",
    cardSide: "left",
  },
  {
    id: "portal-vers-dev",
    year: "2022",
    title: "Le virage vers le code",
    subtitle: "Lancement de Cerithe, la suite côté dev",
    cardSide: "right",
    portalTo: "dev",
  },
];

const devItems: ITimelineV2Item[] = [
  {
    id: "portal-vers-btp",
    year: "2008-2022",
    title: "10 ans dans le bâtiment",
    subtitle: "BIM Manager, Bouygues Construction",
    cardSide: "left",
    portalTo: "btp",
  },
  {
    id: "declic-2022",
    year: "2022",
    title: "Le déclic entrepreneurial",
    subtitle: "Lancement de Cerithe",
    detail:
      "J'ai lancé Cerithe pour répondre à un vrai problème terrain. Confronté à la défaillance d'un prestataire dev, j'ai pris la décision de coder moi-même. Ce n'était pas prévu. C'était la meilleure décision.",
    cardSide: "right",
  },
  {
    id: "autodidacte-2023",
    year: "2023-2024",
    title: "L'apprentissage autodidacte",
    subtitle: "ChouxFleurs, premiers projets",
    detail:
      "Python/Flask, puis Node.js, React, TypeScript. ChouxFleurs comme terrain d'expérimentation. Je découvre que le code, c'est ma voie, pas un détour.",
    cardSide: "left",
  },
  {
    id: "formation-2025",
    year: "2025",
    title: "Les formations",
    subtitle: "DWWM/CDA, Baticoop",
    detail: "Structuration des compétences dev. Baticoop comme projet fil rouge. La théorie rejoint enfin la pratique.",
    cardSide: "right",
  },
  {
    id: "maintenant-2025",
    year: "2025",
    title: "Cerithe, Ouvra, Nexio, ce portfolio",
    subtitle: "Projets agentiques, Claude Code",
    detail:
      "Projets agentiques avec Claude Code, stack TypeScript/Node.js/React consolidée. Ce portfolio comme premier livrable public. Je cherche le premier poste ou la première mission qui utilise vraiment ce que je sais faire.",
    cardSide: "left",
  },
];

interface ITimelineCardProps {
  item: ITimelineV2Item;
  onToggle: () => void;
  onGoToMode: (mode: Mode) => void;
}

// Reprend au mot près la structure du mockup (bouton `.tl-head` avec un span texte "titre + retour
// à la ligne + sous-titre" et un span `.tl-chevron`, glyphes unicode ⌄/→/← comme dans le mockup,
// pas des icônes lucide-react : différence de rendu réelle trouvée au diff pixel, cf commentaire
// en tête de NewHome.timeline.css). Le rotate du chevron et la couleur du point sur l'état "ouvert"
// sont pilotés par la classe `.open` posée sur le `.mp-tl-item` parent (cf NewHome.timeline.css),
// pas par une prop locale : pas besoin de connaître `isExpanded` ici.
function TimelineCard({ item, onToggle, onGoToMode }: ITimelineCardProps) {
  const isPortal = item.portalTo !== undefined;
  const chevronGlyph = !isPortal ? "⌄" : item.portalTo === "btp" ? "←" : "→";

  return (
    <div className="mp-tl-side mp-tl-card">
      {/* Doublon de .mp-tl-side.mp-tl-year, cache par defaut (CSS), affiche uniquement sous
          720px ou la colonne annee dediee disparait (cf media query NewHome.timeline.css) :
          sans lui, l'annee de chaque etape disparaissait completement sur mobile. */}
      <span className="mp-tl-year-badge">{item.year}</span>
      <button
        type="button"
        onClick={() => (isPortal ? onGoToMode(item.portalTo as Mode) : onToggle())}
        className={cn("mp-tl-head", item.portalTo === "btp" && "mp-tl-head-left")}
      >
        <span>
          <strong>{item.title}</strong>
          <br />
          <span className="mp-tl-sub">{item.subtitle}</span>
        </span>
        <span className="mp-tl-chevron">{chevronGlyph}</span>
      </button>
      {!isPortal && <p className="mp-tl-detail">{item.detail}</p>}
    </div>
  );
}

interface ITimelineV2Props {
  mode: Mode;
  onGoToMode: (mode: Mode) => void;
}

export default function TimelineV2({ mode, onGoToMode }: ITimelineV2Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const items = mode === "dev" ? devItems : btpItems;

  function toggle(id: string): void {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <section id="parcours" className="mp-parcours scroll-mt-[90px]">
      <motion.div
        className="mx-auto flex min-h-0 w-full max-w-[880px] flex-col justify-center px-5 pt-12 sm:min-h-[82vh] sm:px-10"
        style={{ marginTop: 20 }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="mp-row-label">Mon parcours</p>

        <div className="mp-tl">
          <div className="mp-tl-line" />

          {items.map((item) => {
            const isExpanded = expanded === item.id;
            const cardFirst = item.cardSide === "left";

            return (
              <motion.div
                key={item.id}
                data-portal-to={item.portalTo}
                className={cn("mp-tl-item", item.portalTo && "mp-tl-portal", isExpanded && "open")}
                initial={{ opacity: 0, x: cardFirst ? -28 : 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3, margin: "0px 0px -80px 0px" }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {cardFirst ? (
                  <>
                    <TimelineCard item={item} onToggle={() => toggle(item.id)} onGoToMode={onGoToMode} />
                    <div className="mp-tl-dot" />
                    <div className="mp-tl-side mp-tl-year">{item.year}</div>
                  </>
                ) : (
                  <>
                    <div className="mp-tl-side mp-tl-year">{item.year}</div>
                    <div className="mp-tl-dot" />
                    <TimelineCard item={item} onToggle={() => toggle(item.id)} onGoToMode={onGoToMode} />
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
