import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { timelineItems } from "@/data/timelineData";
import type { ITimelineItem } from "@/data/timelineData";

interface ITimelineCardProps {
  item: ITimelineItem;
  isExpanded: boolean;
  onToggle: () => void;
  alignRight?: boolean;
}

function TimelineCard({ item, isExpanded, onToggle, alignRight = false }: ITimelineCardProps) {
  return (
    <div className={`${alignRight ? "text-right" : "text-left"}`}>
      <button onClick={onToggle} className="w-full text-left group">
        <div className={`flex items-start gap-2 ${alignRight ? "flex-row-reverse" : "flex-row"}`}>
          <div className={`flex-1 ${alignRight ? "text-right" : "text-left"}`}>
            <p className="font-semibold text-base group-hover:text-foreground transition-colors">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 mt-0.5"
          >
            <ChevronDown size={16} className="text-muted-foreground" />
          </motion.div>
        </div>
      </button>

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
            <p
              className={`text-sm text-muted-foreground mt-3 leading-relaxed ${alignRight ? "text-right" : "text-left"}`}
            >
              {item.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Timeline() {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string): void {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <section className="py-16 px-4 border-b border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Le parcours.</h2>
        <p className="text-muted-foreground mb-12">
          10 ans dans le bâtiment, 4 ans de code. Pas une reconversion, une extension.
        </p>

        <div className="relative">
          {/* Ligne verticale desktop */}
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-border hidden md:block" />
          {/* Ligne verticale mobile */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border md:hidden" />

          <div className="flex flex-col gap-10">
            {timelineItems.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const isExpanded = expanded === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isEven ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {/* Desktop — alternance gauche/droite */}
                  <div className="hidden md:flex items-start">
                    <div className="flex-1 pr-10">
                      {isEven ? (
                        <p className="text-right font-mono text-sm text-muted-foreground/60 pt-1">{item.year}</p>
                      ) : (
                        <TimelineCard item={item} isExpanded={isExpanded} onToggle={() => toggle(item.id)} alignRight />
                      )}
                    </div>

                    {/* Dot */}
                    <div className="flex flex-col items-center flex-shrink-0 w-4 pt-1">
                      <div
                        className={`w-3 h-3 rounded-full ring-2 ring-background border border-border transition-colors ${
                          isExpanded ? "bg-foreground" : "bg-muted-foreground/40"
                        }`}
                      />
                    </div>

                    <div className="flex-1 pl-10">
                      {isEven ? (
                        <TimelineCard item={item} isExpanded={isExpanded} onToggle={() => toggle(item.id)} />
                      ) : (
                        <p className="font-mono text-sm text-muted-foreground/60 pt-1">{item.year}</p>
                      )}
                    </div>
                  </div>

                  {/* Mobile — tout à droite */}
                  <div className="flex md:hidden items-start pl-10 relative">
                    <div
                      className={`absolute left-4 top-1.5 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-background border border-border transition-colors ${
                        isExpanded ? "bg-foreground" : "bg-muted-foreground/40"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-mono text-xs text-muted-foreground/60 mb-1">{item.year}</p>
                      <TimelineCard item={item} isExpanded={isExpanded} onToggle={() => toggle(item.id)} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
