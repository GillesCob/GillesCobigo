export interface IStackTech {
  id: string;
  label: string;
  score: number;
  note?: string;
}

export const stackTechs: IStackTech[] = [
  { id: "react", label: "React", score: 100 },
  { id: "vuejs", label: "Vue.js", score: 80, note: "J'ai construit Labelr en Vue.js en un weekend pour un entretien." },
  { id: "angular", label: "Angular", score: 60 },
  { id: "nodejs", label: "Node.js", score: 100 },
  { id: "express", label: "Express", score: 100 },
  { id: "nestjs", label: "NestJS", score: 85 },
  {
    id: "aspnet",
    label: "ASP.NET Core",
    score: 70,
    note: "Beaucoup de similitudes avec NestJS - injection de dépendances, architecture en couches, même philosophie.",
  },
  { id: "typescript", label: "TypeScript", score: 100 },
  { id: "javascript", label: "JavaScript", score: 100 },
  { id: "postgresql", label: "PostgreSQL", score: 100 },
  { id: "mysql", label: "MySQL", score: 80 },
  {
    id: "mongodb",
    label: "MongoDB",
    score: 40,
    note: "J'ai utilisé MongoDB sur ChouxFleurs - je connais le concept mais je préfère le SQL.",
  },
  { id: "prisma", label: "Prisma", score: 100 },
  {
    id: "ef",
    label: "Entity Framework",
    score: 85,
    note: "Même concept d'ORM que Prisma - migrations, relations, change tracking.",
  },
  { id: "docker", label: "Docker", score: 100 },
  { id: "nginx", label: "Nginx", score: 100 },
  {
    id: "python",
    label: "Python",
    score: 30,
    note: "J'ai utilisé Python/Flask sur la V1 de ChouxFleurs - pas ma stack principale mais je connais les bases.",
  },
];

export function computeScore(selectedIds: string[]): number {
  if (selectedIds.length === 0) return 0;
  const total = selectedIds.reduce((sum, id) => {
    const tech = stackTechs.find((t) => t.id === id);
    return sum + (tech?.score ?? 0);
  }, 0);
  return Math.round(total / selectedIds.length);
}

export function getScoreMessage(score: number): string {
  if (score >= 80) return "Stack très proche, on peut travailler ensemble directement.";
  if (score >= 60) return "Stack compatible, quelques jours d'adaptation max.";
  if (score >= 40) return "Stack différente mais les concepts sont les mêmes.";
  return "Stack éloignée, mais j'apprends vite.";
}
