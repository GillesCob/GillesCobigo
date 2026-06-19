export interface IDevProject {
  id: string;
  name: string;
  description: string;
  stack: string[];
  status: string;
  image?: string;
  links: {
    github?: string;
    live?: string;
  };
}

export const devProjects: IDevProject[] = [
  {
    id: "cerithe",
    name: "Cerithe",
    description:
      "Carnet de santé numérique du bâtiment. Suivi des interventions, des équipements et de la conformité réglementaire sur le cycle de vie d'un bâtiment.",
    stack: ["TypeScript", "Node.js", "Express", "Prisma", "PostgreSQL", "React"],
    status: "MVP juillet 2026",
    image: "/images/cerithe-placeholder.png",
    links: {},
  },
  {
    id: "nexio",
    name: "Nexio",
    description:
      "App de suivi de recherche d'emploi avec IA intégrée. Analyse des offres, suivi des candidatures, suggestions personnalisées via Claude API.",
    stack: ["TypeScript", "Node.js", "Express", "Prisma", "React", "Claude API"],
    status: "En développement",
    links: {},
  },
  {
    id: "chouxfleurs",
    name: "ChouxFleurs",
    description:
      "App agentique de gestion de liste de naissance. Coordination automatique entre participants, suggestions intelligentes, expérience fluide sur mobile.",
    stack: ["NestJS", "React", "Supabase", "TypeScript"],
    status: "En production",
    image: "/images/chouxfleurs-placeholder.png",
    links: {},
  },
  {
    id: "vps-hetzner",
    name: "VPS Hetzner",
    description:
      "VPS Hetzner Ubuntu 24.04. Docker, Nginx reverse proxy, Certbot SSL avec renouvellement automatique. Sous-domaines dédiés par projet. Infrastructure personnelle, indépendance totale des outils SaaS.",
    stack: ["Docker", "Nginx", "Ubuntu", "Certbot"],
    status: "En production",
    links: {},
  },
];
