import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";

interface ISkill {
  name: string;
  level: number;
  project: string;
}

interface ICategory {
  label: string;
  level: number;
  skills: ISkill[];
}

const categories: ICategory[] = [
  {
    label: "Backend",
    level: 76,
    skills: [
      { name: "Express / Node.js", level: 75, project: "Cerithe (auth complète, CRUD, upload Supabase)" },
      { name: "Auth JWT + argon2", level: 80, project: "Cerithe" },
      { name: "Prisma + PostgreSQL", level: 78, project: "Cerithe" },
      { name: "Zod (validation)", level: 72, project: "Cerithe" },
      { name: "REST API design", level: 75, project: "Cerithe" },
    ],
  },
  {
    label: "Frontend",
    level: 70,
    skills: [
      { name: "React + TypeScript", level: 70, project: "Cerithe / Nexio" },
      { name: "TanStack Query", level: 68, project: "Cerithe / Nexio (dashboard, kanban)" },
      { name: "Zustand", level: 70, project: "ChouxFleurs / Nexio" },
      { name: "React Hook Form", level: 70, project: "Cerithe / Nexio" },
      { name: "Tailwind + shadcn/ui", level: 68, project: "Nexio / Portfolio" },
    ],
  },
  {
    label: "Agentique",
    level: 71,
    skills: [
      { name: "Claude Code", level: 70, project: "Nexio (auth complète en 1 session)" },
      { name: "CLAUDE.md + règles", level: 72, project: "Tous projets" },
      { name: "Plan mode + review", level: 68, project: "Nexio" },
      { name: "Prompting structuré", level: 74, project: "Portfolio / Nexio" },
    ],
  },
  {
    label: "DevOps",
    level: 49,
    skills: [
      { name: "Docker", level: 45, project: "VPS Hetzner" },
      { name: "Nginx + Certbot", level: 50, project: "VPS Hetzner (en prod)" },
      { name: "Linux / SSH", level: 52, project: "VPS Hetzner" },
      { name: "PostgreSQL VPS", level: 48, project: "VPS Hetzner" },
    ],
  },
  {
    label: "Métier",
    level: 92,
    skills: [
      { name: "Vision produit / BIM", level: 95, project: "Mareterra Monaco, Bouygues" },
      { name: "Gestion de projet", level: 92, project: "Mareterra Monaco (2 milliards €)" },
      { name: "Communication", level: 90, project: "Bouygues Construction" },
      { name: "Analyse des besoins", level: 92, project: "Tous projets" },
    ],
  },
  {
    label: "TypeScript",
    level: 62,
    skills: [
      { name: "Types de base", level: 80, project: "Cerithe" },
      { name: "Generics", level: 35, project: "en cours" },
      { name: "Déclaration de module", level: 70, project: "Cerithe" },
      { name: "Strict mode (exactOptionalPropertyTypes)", level: 65, project: "Cerithe" },
    ],
  },
];

// #3 : viewBox élargi (W=580, H=500) + LABEL_R=175 > R=160 → labels toujours hors des traits de grille
const W = 580;
const H = 500;
const cx = 290;
const cy = 250;
const R = 160;
const LEVELS = 5;
const LABEL_R = 175;

const PRACTICE_STROKE = "#E8734A";
const PRACTICE_FILL = "rgba(232,115,74,0.12)";

function getAngle(i: number, n: number): number {
  return (Math.PI * 2 * i) / n - Math.PI / 2;
}

function getPoint(i: number, val: number, n: number, maxR: number = R): [number, number] {
  const a = getAngle(i, n);
  const r = maxR * (val / 100);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

// #3 / #6 : labelR paramétrable — desktop=175, drawer mobile=155
function getLabelPoint(i: number, n: number, labelR: number = LABEL_R): [number, number] {
  const a = getAngle(i, n);
  return [cx + labelR * Math.cos(a), cy + labelR * Math.sin(a)];
}

function toPolyPoints(values: number[], n: number, maxR: number = R): string {
  return values.map((val, i) => getPoint(i, val, n, maxR).join(",")).join(" ");
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// #1 : tooltip via createPortal + getBoundingClientRect → jamais clippé par overflow hidden parent
function ProjectBadge({ project }: { project: string }) {
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  return (
    <span
      ref={spanRef}
      className="relative shrink-0 cursor-default"
      onMouseEnter={() => {
        if (spanRef.current) {
          const rect = spanRef.current.getBoundingClientRect();
          setTooltipPos({ x: rect.left, y: rect.top });
        }
      }}
      onMouseLeave={() => setTooltipPos(null)}
    >
      <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground max-w-[110px] truncate block">
        {project}
      </span>
      {tooltipPos !== null &&
        createPortal(
          <span
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translateY(calc(-100% - 6px))",
              zIndex: 9999,
              pointerEvents: "none",
            }}
            className="px-2 py-1 rounded text-xs whitespace-nowrap border border-border bg-popover text-popover-foreground shadow-md"
          >
            {project}
          </span>,
          document.body
        )}
    </span>
  );
}

// key={selected} dans le parent force le remount au changement de section → reset expandedSkill
function DetailPanel({
  cat,
  onClose,
  isMobile = false,
}: {
  cat: ICategory;
  onClose: () => void;
  isMobile?: boolean;
}) {
  // #6 mobile : clic sur ligne pour afficher le nom complet
  const [expandedSkill, setExpandedSkill] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-sm">{cat.label}</p>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>

      {cat.skills.map((s, idx) => {
        const isExpanded = isMobile && expandedSkill === idx;
        return (
          <div
            key={idx}
            className={`flex gap-2 py-2 border-b border-border/50 last:border-0 ${
              isExpanded ? "flex-wrap items-start" : "flex-nowrap items-center"
            }`}
            onClick={
              isMobile ? () => setExpandedSkill(expandedSkill === idx ? null : idx) : undefined
            }
            style={isMobile ? { cursor: "pointer" } : undefined}
          >
            {/* #7 : truncate sur les noms en état collapsed (mobile et desktop) */}
            <span
              className={`text-sm text-foreground shrink-0 ${
                isExpanded ? "whitespace-normal w-full" : "min-w-[110px] max-w-[130px] truncate"
              }`}
            >
              {s.name}
            </span>

            {isExpanded ? (
              // Ligne expandée : barre + score + badge en pleine largeur
              <>
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div style={{ width: `${s.level}%`, height: "100%", background: PRACTICE_STROKE }} />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums w-7 text-right shrink-0">
                    {s.level}
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground w-full">
                  {s.project}
                </span>
              </>
            ) : (
              // Ligne compacte : barre + score + badge projet
              <>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[40px]">
                  <div style={{ width: `${s.level}%`, height: "100%", background: PRACTICE_STROKE }} />
                </div>
                <span className="text-xs text-muted-foreground w-7 text-right tabular-nums shrink-0">
                  {s.level}
                </span>
                {/* Desktop : tooltip via portal. Mobile : badge tronqué, clic pour expand (#7) */}
                {isMobile ? (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0 max-w-[90px] truncate">
                    {s.project}
                  </span>
                ) : (
                  <ProjectBadge project={s.project} />
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SkillsRadar() {
  const [selected, setSelected] = useState<number | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#aaa" : "#555";
  const dotFill = isDark ? "#111" : "#fff";
  const n = categories.length;
  const levels = categories.map((c) => c.level);

  // Masquer ScrollToTop quand radar actif
  useEffect(() => {
    const styleId = "radar-hide-scroll-btn";
    const isActive = selected !== null || mobileDrawerOpen;
    if (isActive) {
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent =
          'button[aria-label="Retour en haut"] { opacity: 0 !important; pointer-events: none !important; }';
        document.head.appendChild(style);
      }
    } else {
      document.getElementById(styleId)?.remove();
    }
    return () => document.getElementById(styleId)?.remove();
  }, [selected, mobileDrawerOpen]);

  // Fermeture desktop au clic extérieur
  useEffect(() => {
    if (selected === null || isMobile) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelected(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selected, isMobile]);

  function handleDesktopClick(idx: number): void {
    setSelected(selected === idx ? null : idx);
  }
  function handleMobileClick(idx: number): void {
    setSelected(idx);
    setMobileDrawerOpen(true);
  }
  function handleDrawerSectionClick(idx: number): void {
    setSelected(idx);
  }
  function closeMobileDrawer(): void {
    setMobileDrawerOpen(false);
    setSelected(null);
  }

  // #2 : zones cliquables élargies via rect et circle transparents
  // #3 : getLabelPoint(i, n, labelR) avec labelR paramétrable
  // #6 : maxR=120, labelR=155 dans le drawer → DevOps visible dans la zone 40%
  function renderRadar(
    onSectionClick: (idx: number) => void,
    maxR: number = R,
    labelR: number = LABEL_R
  ) {
    return (
      <svg
        key={theme}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", cursor: "default" }}
      >
        {Array.from({ length: LEVELS }, (_, l) => (
          <polygon
            key={l}
            points={toPolyPoints(Array(n).fill((l + 1) * 20), n, maxR)}
            fill="none"
            stroke={gridColor}
            strokeWidth={0.8}
          />
        ))}

        {categories.map((_, i) => {
          const [x2, y2] = getPoint(i, 100, n, maxR);
          return (
            <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={gridColor} strokeWidth={0.8} />
          );
        })}

        <polygon
          points={toPolyPoints(levels, n, maxR)}
          fill={PRACTICE_FILL}
          stroke={PRACTICE_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {categories.map((cat, i) => {
          const [lx, ly] = getLabelPoint(i, n, labelR);
          const cosA = Math.cos(getAngle(i, n));
          const anchor: "middle" | "start" | "end" =
            cosA > 0.1 ? "start" : cosA < -0.1 ? "end" : "middle";
          const [px, py] = getPoint(i, cat.level, n, maxR);

          // #2 : hit area rect autour du label (approx 7.5px par char + marges)
          const labelW = cat.label.length * 7.5 + 12;
          const rectX =
            anchor === "start"
              ? lx - 4
              : anchor === "end"
              ? lx - labelW + 4
              : lx - labelW / 2;

          return (
            <g key={i} onClick={() => onSectionClick(i)} style={{ cursor: "pointer" }}>
              {/* Hit area transparent sur le label */}
              <rect x={rectX} y={ly - 13} width={labelW} height={26} fill="transparent" />
              {/* Hit area transparent sur le point — #2 */}
              <circle cx={px} cy={py} r={20} fill="transparent" />

              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={13}
                fill={selected === i ? PRACTICE_STROKE : textColor}
                fontWeight={selected === i ? "600" : "500"}
              >
                {cat.label}
              </text>
              <circle
                cx={px}
                cy={py}
                r={selected === i ? 6 : 4}
                fill={selected === i ? PRACTICE_STROKE : dotFill}
                stroke={PRACTICE_STROKE}
                strokeWidth={2}
              />
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <div ref={containerRef} className="font-sans">
      {/* DESKTOP */}
      {!isMobile && (
        <>
          <motion.div layoutRoot className="flex items-center gap-6 min-h-[480px]">
            <motion.div
              layout
              style={{
                flexShrink: 0,
                width: selected !== null ? "45%" : "100%",
                maxWidth: W,
                aspectRatio: `${W}/${H}`,
                margin: selected !== null ? "0" : "0 auto",
              }}
            >
              {renderRadar(handleDesktopClick)}
            </motion.div>

            {/* #4 : mode="sync" → fermeture et expansion radar simultanées */}
            <AnimatePresence mode="sync">
              {selected !== null && (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ flex: 1, minWidth: 0, maxHeight: 480, overflowY: "auto" }}
                >
                  <DetailPanel
                    key={selected}
                    cat={categories[selected]}
                    onClose={() => setSelected(null)}
                    isMobile={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="text-sm text-muted-foreground/70 italic mt-3 text-center">
            Cliquer sur une section pour le détail
          </p>
        </>
      )}

      {/* MOBILE */}
      {isMobile && (
        <>
          {renderRadar(handleMobileClick)}

          <p className="text-sm text-muted-foreground/70 italic mt-2 mb-1 text-center">
            Cliquer sur une section pour le détail
          </p>

          <AnimatePresence>
            {mobileDrawerOpen && (
              <>
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 bg-black/50 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeMobileDrawer}
                />
                {/* #5 : fixed bottom-0 h-[90vh] — vérifier que nul parent n'a transform ou overflow:hidden */}
                <motion.div
                  key="drawer"
                  className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-card border-t border-border h-[90vh] flex flex-col"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 80) closeMobileDrawer();
                  }}
                >
                  <div className="flex-none pt-3 pb-1 flex justify-center">
                    <div className="w-10 h-1 bg-border rounded-full" />
                  </div>

                  {/* #6 : maxR=120, labelR=155 → polygone compact, DevOps visible dans 40% de hauteur */}
                  <div className="flex-none h-[40%] px-4">
                    {renderRadar(handleDrawerSectionClick, 120, 155)}
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 pb-6">
                    {selected !== null && (
                      <DetailPanel
                        key={selected}
                        cat={categories[selected]}
                        onClose={closeMobileDrawer}
                        isMobile={true}
                      />
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
