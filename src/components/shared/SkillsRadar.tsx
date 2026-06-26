import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import SkillArticlesModal from "@/components/shared/SkillArticlesModal";

interface ISkill {
  name: string;
  level: number;
  project: string;
  tags?: string[];
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
      {
        name: "Express / Node.js",
        level: 75,
        project: "Cerithe (auth complète, CRUD, upload Supabase)",
        tags: ["node.js", "express", "backend"],
      },
      { name: "Auth JWT + argon2", level: 80, project: "Cerithe", tags: ["jwt", "sécurité", "authentification"] },
      { name: "Prisma + PostgreSQL", level: 78, project: "Cerithe", tags: ["prisma", "postgresql", "base de données"] },
      { name: "Zod (validation)", level: 72, project: "Cerithe", tags: ["architecture", "typescript"] },
      { name: "REST API design", level: 75, project: "Cerithe", tags: ["architecture", "backend"] },
    ],
  },
  {
    label: "Frontend",
    level: 70,
    skills: [
      { name: "React + TypeScript", level: 70, project: "Cerithe / Nexio", tags: ["react", "typescript", "frontend"] },
      { name: "TanStack Query", level: 68, project: "Cerithe / Nexio (dashboard, kanban)", tags: ["tanstack query"] },
      { name: "Zustand", level: 70, project: "ChouxFleurs / Nexio", tags: ["zustand"] },
      { name: "React Hook Form", level: 70, project: "Cerithe / Nexio", tags: ["react", "frontend"] },
      { name: "Tailwind + shadcn/ui", level: 68, project: "Nexio / Portfolio", tags: ["frontend"] },
    ],
  },
  {
    label: "Agentique",
    level: 71,
    skills: [
      {
        name: "Claude Code",
        level: 70,
        project: "Nexio (auth complète en 1 session)",
        tags: ["claude code", "ia agentique"],
      },
      { name: "CLAUDE.md + règles", level: 72, project: "Tous projets", tags: ["ia agentique"] },
      { name: "Plan mode + review", level: 68, project: "Nexio", tags: ["ia agentique"] },
      { name: "Prompting structuré", level: 74, project: "Portfolio / Nexio", tags: ["ia", "ia agentique"] },
    ],
  },
  {
    label: "DevOps",
    level: 49,
    skills: [
      { name: "Docker", level: 45, project: "VPS Hetzner", tags: ["devops", "déploiement"] },
      { name: "Nginx + Certbot", level: 50, project: "VPS Hetzner (en prod)", tags: ["devops", "déploiement"] },
      { name: "Linux / SSH", level: 52, project: "VPS Hetzner", tags: ["devops"] },
      { name: "PostgreSQL VPS", level: 48, project: "VPS Hetzner", tags: ["postgresql", "devops"] },
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
      { name: "Types de base", level: 80, project: "Cerithe", tags: ["typescript"] },
      { name: "Generics", level: 35, project: "en cours", tags: ["typescript"] },
      { name: "Déclaration de module", level: 70, project: "Cerithe", tags: ["typescript"] },
      { name: "Strict mode (exactOptionalPropertyTypes)", level: 65, project: "Cerithe", tags: ["typescript"] },
    ],
  },
];

const W = 580;
const H = 500;
const cx = 290;
const cy = 250;
const R = 150;
const LEVELS = 5;
const LABEL_R = 175;

const PRACTICE_STROKE = "#E8734A";
const PRACTICE_FILL = "rgba(232,115,74,0.12)";

function getAngle(i: number, n: number): number {
  return (Math.PI * 2 * i) / n - Math.PI / 2;
}

function getPoint(i: number, val: number, n: number): [number, number] {
  const a = getAngle(i, n);
  const r = R * (val / 100);
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function getLabelPoint(i: number, n: number): [number, number] {
  const a = getAngle(i, n);
  return [cx + LABEL_R * Math.cos(a), cy + LABEL_R * Math.sin(a)];
}

function toPolyPoints(values: number[], n: number): string {
  return values.map((val, i) => getPoint(i, val, n).join(",")).join(" ");
}

// Desktop : tooltip via portal, affiché uniquement si le badge est réellement tronqué
function ProjectBadge({ project }: { project: string }) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    function check() {
      if (spanRef.current) {
        setIsTruncated(spanRef.current.scrollWidth > spanRef.current.clientWidth);
      }
    }
    check();
    const ro = new ResizeObserver(check);
    if (spanRef.current) ro.observe(spanRef.current);
    return () => ro.disconnect();
  }, [project]);

  return (
    <>
      <span
        ref={spanRef}
        className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0 max-w-[100px] truncate"
        onMouseEnter={() => {
          if (isTruncated && spanRef.current) {
            const rect = spanRef.current.getBoundingClientRect();
            setTooltipPos({ x: rect.left, y: rect.top });
          }
        }}
        onMouseLeave={() => setTooltipPos(null)}
      >
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
              zIndex: 50,
              pointerEvents: "none",
            }}
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-border bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg"
          >
            {project}
          </span>,
          document.body,
        )}
    </>
  );
}

// Desktop : même mécanique que ProjectBadge, style du nom de compétence
function SkillNameLabel({ name }: { name: string }) {
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    function check() {
      if (spanRef.current) {
        setIsTruncated(spanRef.current.scrollWidth > spanRef.current.clientWidth);
      }
    }
    check();
    const ro = new ResizeObserver(check);
    if (spanRef.current) ro.observe(spanRef.current);
    return () => ro.disconnect();
  }, [name]);

  return (
    <>
      <span
        ref={spanRef}
        className="text-sm text-foreground shrink-0 min-w-[100px] max-w-[130px] truncate"
        onMouseEnter={() => {
          if (isTruncated && spanRef.current) {
            const rect = spanRef.current.getBoundingClientRect();
            setTooltipPos({ x: rect.left, y: rect.top });
          }
        }}
        onMouseLeave={() => setTooltipPos(null)}
      >
        {name}
      </span>
      {tooltipPos !== null &&
        createPortal(
          <span
            style={{
              position: "fixed",
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translateY(calc(-100% - 6px))",
              zIndex: 50,
              pointerEvents: "none",
            }}
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-border bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-lg"
          >
            {name}
          </span>,
          document.body,
        )}
    </>
  );
}

interface IDetailContentProps {
  cat: ICategory;
  isMobile?: boolean;
  onSkillClick: (skill: ISkill) => void;
}

function DetailContent({ cat, isMobile = false, onSkillClick }: IDetailContentProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const badgeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    setExpandedItem(null);
  }, [cat]);

  return (
    <div className="p-5">
      <p className="text-center text-xl font-bold mb-6">{cat.label}</p>
      {cat.skills.map((s, idx) => (
        <div key={idx} className="py-2 border-b border-border/50 last:border-0">
          <div className="flex flex-nowrap items-center gap-2">
            {isMobile ? (
              <span
                ref={(el) => {
                  nameRefs.current[idx] = el;
                }}
                className="text-sm text-foreground shrink-0 min-w-[100px] max-w-[130px] truncate"
                onClick={() => {
                  const el = nameRefs.current[idx];
                  if (el && el.scrollWidth > el.clientWidth) {
                    setExpandedItem(expandedItem === `skill-${idx}` ? null : `skill-${idx}`);
                  }
                }}
              >
                {s.name}
              </span>
            ) : (
              <SkillNameLabel name={s.name} />
            )}
            {s.tags?.length ? (
              <button
                onClick={() => onSkillClick(s)}
                className="shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Voir les articles liés"
                style={{ color: PRACTICE_STROKE }}
              >
                <BookOpen size={12} />
              </button>
            ) : null}
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[32px]">
              <div style={{ width: `${s.level}%`, height: "100%", background: PRACTICE_STROKE }} />
            </div>
            <span className="text-xs text-muted-foreground w-7 text-right tabular-nums shrink-0">{s.level}</span>
            {isMobile ? (
              <span
                ref={(el) => {
                  badgeRefs.current[idx] = el;
                }}
                className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground max-w-[100px] truncate"
                onClick={() => {
                  const el = badgeRefs.current[idx];
                  if (el && el.scrollWidth > el.clientWidth) {
                    setExpandedItem(expandedItem === `project-${idx}` ? null : `project-${idx}`);
                  }
                }}
              >
                {s.project}
              </span>
            ) : (
              <ProjectBadge project={s.project} />
            )}
          </div>
          {isMobile && expandedItem === `skill-${idx}` && (
            <p className="text-sm text-foreground mt-1.5 pl-1">{s.name}</p>
          )}
          {isMobile && expandedItem === `project-${idx}` && (
            <p className="text-xs text-muted-foreground/80 mt-1 pl-1">{s.project}</p>
          )}
        </div>
      ))}
    </div>
  );
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

interface ISkillsRadarProps {
  reopenSkill?: { skillName: string; tags: string[] } | null;
}

export default function SkillsRadar({ reopenSkill }: ISkillsRadarProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [modalSkill, setModalSkill] = useState<ISkill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { theme } = useThemeStore();

  useEffect(() => {
    if (!reopenSkill) return;
    const catIdx = categories.findIndex((cat) =>
      cat.skills.some((s) => s.name === reopenSkill.skillName || s.tags?.some((t) => reopenSkill.tags.includes(t))),
    );
    if (catIdx === -1) return;
    const skill = categories[catIdx].skills.find(
      (s) => s.name === reopenSkill.skillName || s.tags?.some((t) => reopenSkill.tags.includes(t)),
    );
    if (!skill?.tags?.length) return;
    setSelected(catIdx);
    if (isMobile) setMobileDrawerOpen(true);
    setModalSkill(skill);
  }, [reopenSkill, isMobile]);

  const isDark = useMemo(() => document.documentElement.classList.contains("dark"), [theme]);
  const gridColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#aaa" : "#555";
  const dotFill = isDark ? "#111" : "#fff";
  const n = categories.length;
  const levels = categories.map((c) => c.level);

  const isOpen = selected !== null;

  // Close desktop panel on click outside the radar container
  useEffect(() => {
    if (!isOpen || isMobile) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelected(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, isMobile]);

  function handleDesktopClick(idx: number): void {
    setSelected(selected === idx ? null : idx);
  }

  function handleMobileMainClick(idx: number): void {
    setSelected(idx);
    setMobileDrawerOpen(true);
  }

  function handleMobileDrawerClick(idx: number): void {
    setSelected(selected === idx ? null : idx);
  }

  function closeMobileDrawer(): void {
    setMobileDrawerOpen(false);
    setSelected(null);
  }

  function renderSvg(onSectionClick: (idx: number) => void) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        {Array.from({ length: LEVELS }, (_, l) => (
          <polygon
            key={l}
            points={toPolyPoints(Array(n).fill((l + 1) * 20), n)}
            fill="none"
            stroke={gridColor}
            strokeWidth={0.8}
          />
        ))}

        {categories.map((_, i) => {
          const [x2, y2] = getPoint(i, 100, n);
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={gridColor} strokeWidth={0.8} />;
        })}

        <polygon
          points={toPolyPoints(levels, n)}
          fill={PRACTICE_FILL}
          stroke={PRACTICE_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {categories.map((cat, i) => {
          const [lx, ly] = getLabelPoint(i, n);
          const cosA = Math.cos(getAngle(i, n));
          const anchor: "middle" | "start" | "end" = cosA > 0.1 ? "start" : cosA < -0.1 ? "end" : "middle";
          const [px, py] = getPoint(i, cat.level, n);

          const labelW = cat.label.length * 7.5 + 12;
          const rectX = anchor === "start" ? lx - 4 : anchor === "end" ? lx - labelW + 4 : lx - labelW / 2;

          return (
            <g key={i} onClick={() => onSectionClick(i)} style={{ cursor: "pointer" }}>
              <rect x={rectX} y={ly - 13} width={labelW} height={26} fill="transparent" />
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
    <div className="font-sans" ref={containerRef}>
      {/* DESKTOP */}
      {!isMobile && (
        <div className={selected === null ? "max-w-[600px] mx-auto" : ""} style={{ position: "relative" }}>
          {/* Radar - transitions from w-full to w-1/2 */}
          <div
            style={{
              width: isOpen ? "50%" : "100%",
              transition: "width 300ms ease-in-out",
            }}
          >
            {renderSvg(handleDesktopClick)}
          </div>

          {/* Right panel - absolute, appears when a section is selected */}
          {isOpen && (
            <div
              className="bg-card border border-border rounded-xl overflow-y-auto flex flex-col justify-center"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "50%",
                height: "100%",
                animation: "skillsRadarPanelIn 200ms ease-out 150ms both",
              }}
            >
              <DetailContent cat={categories[selected!]} isMobile={false} onSkillClick={setModalSkill} />
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes skillsRadarPanelIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      {/* MOBILE */}
      {isMobile && (
        <>
          {renderSvg(handleMobileMainClick)}

          {mobileDrawerOpen && <style>{`button[aria-label="Retour en haut"] { display: none !important; }`}</style>}

          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 40,
              opacity: mobileDrawerOpen ? 1 : 0,
              pointerEvents: mobileDrawerOpen ? "auto" : "none",
              transition: "opacity 300ms ease-in-out",
            }}
            onClick={closeMobileDrawer}
          />

          {/* Drawer */}
          <div
            className="bg-card border-t border-border rounded-t-2xl flex flex-col"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              height: "85vh",
              transform: mobileDrawerOpen ? "translateY(0)" : "translateY(100%)",
              transition: "transform 300ms ease-in-out",
            }}
          >
            {/* Header */}
            <div className="flex-none flex justify-end px-4 pt-3 pb-1">
              <button
                onClick={closeMobileDrawer}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content split in two equal halves */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top half - radar */}
              <div className="h-1/2 px-4">{renderSvg(handleMobileDrawerClick)}</div>

              {/* Bottom half - detail content */}
              <div className="h-1/2 px-4 pb-4">
                <div className="bg-card border border-border rounded-xl h-full overflow-y-auto">
                  {selected !== null ? (
                    <DetailContent cat={categories[selected]} isMobile={true} onSkillClick={setModalSkill} />
                  ) : (
                    <p className="text-sm text-muted-foreground/60 text-center pt-6">Sélectionner une section</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {modalSkill?.tags && (
        <SkillArticlesModal skillName={modalSkill.name} tags={modalSkill.tags} onClose={() => setModalSkill(null)} />
      )}
    </div>
  );
}
