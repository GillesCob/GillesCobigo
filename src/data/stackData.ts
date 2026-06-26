export interface IStackTech {
  id: string;
  label: string;
  score: number;
  note?: string;
}

export const stackTechs: IStackTech[] = [
  { id: "react", label: "React", score: 100 },
  {
    id: "vuejs",
    label: "Vue.js",
    score: 65,
    note: "Pris en main sur Labelr en un weekend pour un entretien. Patterns proches de React, transition rapide.",
  },
  { id: "angular", label: "Angular", score: 60 },
  { id: "nodejs", label: "Node.js", score: 100 },
  { id: "express", label: "Express", score: 100 },
  { id: "nestjs", label: "NestJS", score: 85 },
  {
    id: "aspnet",
    label: "ASP.NET Core",
    score: 70,
    note: "Beaucoup de similitudes avec NestJS : injection de dépendances, architecture en couches, même philosophie.",
  },
  { id: "typescript", label: "TypeScript", score: 100 },
  { id: "javascript", label: "JavaScript", score: 100 },
  { id: "postgresql", label: "PostgreSQL", score: 100 },
  { id: "mysql", label: "MySQL", score: 80 },
  {
    id: "mongodb",
    label: "MongoDB",
    score: 40,
    note: "Utilisé sur la V1 de ChouxFleurs. Je préfère le relationnel pour les modèles métier complexes, mais je sais quand le NoSQL fait sens.",
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
    note: "Utilisé sur la V1 de ChouxFleurs en Flask. Pas ma stack principale, mais je peux m'y remettre rapidement si besoin.",
  },
  {
    id: "java",
    label: "Java",
    score: 25,
    note: "Pas pratiqué en projet, mais TypeScript et ASP.NET Core m'ont familiarisé avec les langages typés stricts et les architectures de type Spring. Transition envisageable.",
  },

  { id: "tailwind", label: "Tailwind CSS", score: 100 },
  { id: "shadcn", label: "shadcn/ui", score: 100 },
  {
    id: "github-actions",
    label: "GitHub Actions",
    score: 70,
    note: "Pipelines CI basiques en place sur mes projets. À approfondir sur les workflows complexes.",
  },
  {
    id: "aws",
    label: "AWS",
    score: 30,
    note: "Notions générales du cloud. Mon infra perso tourne sur VPS Hetzner que j'administre moi-même, ce qui me donne une bonne base pour basculer sur AWS.",
  },
  {
    id: "supabase",
    label: "Supabase",
    score: 90,
    note: "Utilisé en prod sur ChouxFleurs2 et en dev sur Cerithe et Nexio. Pour la prod long terme, je migre vers du PostgreSQL self-hosted sur mon VPS.",
  },
];

interface IStackCombo {
  match: string[];
  message: string;
}

export const stackCombos: IStackCombo[] = [
  {
    match: ["react", "nodejs", "typescript"],
    message: "C'est exactement ma stack principale. On peut commencer demain.",
  },
  {
    match: ["vuejs", "aspnet"],
    message:
      "C'est la stack que j'ai prise en main sur Labelr en un weekend pour un entretien. Patterns familiers, transition rapide.",
  },
  {
    match: ["angular", "java"],
    message:
      "Stack éloignée de la mienne, mais Angular et Java ont des cousins directs côté React et NestJS. La bascule est une question de semaines, pas de mois.",
  },
  {
    match: ["nextjs", "typescript"],
    message:
      "Next.js sur ma stack TypeScript habituelle. Adaptation immédiate, juste à intégrer les spécificités du routing serveur.",
  },
  {
    match: ["aspnet", "angular"],
    message:
      "Stack ESN classique. ASP.NET Core proche de NestJS que je maîtrise, Angular cousin direct de React. Quelques semaines pour être autonome.",
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

export function getScoreMessage(selectedIds: string[], score: number): string {
  const combo = stackCombos.find((c) => c.match.every((id) => selectedIds.includes(id)));
  if (combo) return combo.message;

  if (score >= 80) return "Stack très proche, on peut travailler ensemble directement.";
  if (score >= 60) return "Stack compatible, quelques jours d'adaptation max.";
  if (score >= 40) return "Stack différente mais les concepts sont les mêmes.";
  return "Stack éloignée, mais j'apprends vite.";
}
