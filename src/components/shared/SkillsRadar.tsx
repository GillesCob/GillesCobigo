import { useState } from "react";
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

export default function SkillsRadar() {
  const [selected, setSelected] = useState<number | null>(null);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const gridColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#aaa" : "#555";
  const dotFill = isDark ? "#111" : "#fff";
  const n = categories.length;
  const levels = categories.map((c) => c.level);

  function handleClick(idx: number): void {
    setSelected(selected === idx ? null : idx);
  }

  return (
    <div className="font-sans">
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
          return (
            <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={gridColor} strokeWidth={0.8} />
          );
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
          const anchor: "middle" | "start" | "end" =
            cosA > 0.1 ? "start" : cosA < -0.1 ? "end" : "middle";
          const [px, py] = getPoint(i, cat.level, n);

          const labelW = cat.label.length * 7.5 + 12;
          const rectX =
            anchor === "start" ? lx - 4 : anchor === "end" ? lx - labelW + 4 : lx - labelW / 2;

          return (
            <g key={i} onClick={() => handleClick(i)} style={{ cursor: "pointer" }}>
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

      <p className="text-sm text-muted-foreground/70 italic mt-3 text-center">
        Cliquer sur une section pour le détail
      </p>
    </div>
  );
}
