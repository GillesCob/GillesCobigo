import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";
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
  isExpanded: boolean;
  onToggle: () => void;
  onGoToMode: (mode: Mode) => void;
  alignRight: boolean;
}

function TimelineCard({ item, isExpanded, onToggle, onGoToMode, alignRight }: ITimelineCardProps) {
  const isPortal = item.portalTo !== undefined;
  const Icon = item.portalTo === "btp" ? ArrowLeft : ArrowRight;

  return (
    <div className={alignRight ? "text-right" : "text-left"}>
      <button
        onClick={() => (isPortal ? onGoToMode(item.portalTo as Mode) : onToggle())}
        className="w-full text-left group"
      >
        <div className={cn("flex items-start gap-2", alignRight ? "flex-row-reverse" : "flex-row")}>
          <div className={cn("flex-1", alignRight ? "text-right" : "text-left")}>
            <p
              className={cn(
                "font-semibold text-base transition-colors",
                isPortal ? "group-hover:text-mode-accent" : "group-hover:text-foreground"
              )}
            >
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
          </div>
          {isPortal ? (
            <Icon
              size={16}
              className={cn(
                "mt-0.5 flex-shrink-0 text-mode-accent transition-transform duration-200",
                item.portalTo === "btp" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"
              )}
            />
          ) : (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-0.5 flex-shrink-0"
            >
              <ChevronDown size={16} className="text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </button>

      {!isPortal && (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className={cn("mt-3 text-sm leading-relaxed text-muted-foreground", alignRight ? "text-right" : "text-left")}>
                {item.detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
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
    <section id="parcours" className="scroll-mt-[90px]">
      <motion.div
        className="mx-auto flex min-h-0 w-full max-w-[880px] flex-col justify-center border-t border-border px-5 pt-12 sm:min-h-[82vh] sm:px-10"
        style={{ marginTop: 130 }}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="mb-[18px] text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Mon parcours</p>

        <div className="relative">
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:hidden" />

          <div className="flex flex-col gap-10">
            {items.map((item) => {
              const isExpanded = expanded === item.id;
              const cardOnRight = item.cardSide === "right";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: cardOnRight ? 28 : -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3, margin: "0px 0px -80px 0px" }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  {/* Desktop */}
                  <div className="hidden md:flex items-start">
                    <div className="flex-1 pr-10">
                      {cardOnRight ? (
                        <p className="text-right font-mono text-sm text-muted-foreground/60 pt-1">{item.year}</p>
                      ) : (
                        <TimelineCard item={item} isExpanded={isExpanded} onToggle={() => toggle(item.id)} onGoToMode={onGoToMode} alignRight />
                      )}
                    </div>

                    <div className="flex flex-col items-center flex-shrink-0 w-4 pt-1">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full ring-2 ring-background border border-border transition-colors",
                          item.portalTo ? "bg-mode-accent" : isExpanded ? "bg-foreground" : "bg-muted-foreground/40"
                        )}
                      />
                    </div>

                    <div className="flex-1 pl-10">
                      {cardOnRight ? (
                        <TimelineCard item={item} isExpanded={isExpanded} onToggle={() => toggle(item.id)} onGoToMode={onGoToMode} alignRight={false} />
                      ) : (
                        <p className="font-mono text-sm text-muted-foreground/60 pt-1">{item.year}</p>
                      )}
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="flex md:hidden items-start pl-10 relative">
                    <div
                      className={cn(
                        "absolute left-4 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-background border border-border transition-colors",
                        item.portalTo ? "bg-mode-accent" : isExpanded ? "bg-foreground" : "bg-muted-foreground/40"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-mono text-xs text-muted-foreground/60 mb-1">{item.year}</p>
                      <TimelineCard item={item} isExpanded={isExpanded} onToggle={() => toggle(item.id)} onGoToMode={onGoToMode} alignRight={false} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
