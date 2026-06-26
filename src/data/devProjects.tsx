import type { IProjectCard } from "@/components/projects/ProjectCard";

export type IDevProject = IProjectCard;

export const devProjects: IProjectCard[] = [
  {
    id: "cerithe",
    name: "Cerithe",
    description:
      "Carnet de santé numérique du bâtiment. Suivi des interventions, des équipements et de la conformité réglementaire sur le cycle de vie d'un bâtiment.",
    stack: ["TypeScript", "Node.js", "Express", "Prisma", "PostgreSQL", "React"],
    status: "MVP le 17 juillet 2026",
    image: "/images/cerithe-placeholder.png",
    links: { github: "https://github.com/GillesCob/Cerithe", live: `${import.meta.env.VITE_CERITHE_URL}` },
  },
  {
    id: "nexio",
    name: "Nexio",
    description:
      "App de suivi de recherche d'emploi avec IA intégrée. Analyse des offres, suivi des candidatures, suggestions personnalisées via Claude API.",
    stack: ["TypeScript", "Node.js", "Express", "Prisma", "React", "Claude API"],
    status: "En développement",
    image: "/images/nexio-placeholder.png",
    links: {
      github: "https://github.com/GillesCob/Nexio",
      demo: `${import.meta.env.VITE_NEXIO_URL}/login?demo=1`,
    },
  },
  {
    id: "chouxfleurs",
    name: "ChouxFleurs",
    description:
      "App agentique de gestion de liste de naissance. Coordination automatique entre participants, suggestions intelligentes, expérience fluide sur mobile.",
    stack: ["NestJS", "React", "Supabase", "TypeScript"],
    status: "En production",
    image: "/images/chouxfleurs-placeholder.png",
    links: {
      github: "https://github.com/GillesCob/ChouxFleurs2",
      live: "https://chouxfleurs2.gillescobigo.com/register",
    },
  },
  {
    id: "labelr",
    name: "Labelr",
    description: (
      <>
        App de gestion de fiches produit conçue en un weekend pour préparer un entretien. Stack ASP.NET Core 8 et Vue.js
        3, l'occasion de comparer concrètement les différences avec ma stack habituelle Node.js / React.
      </>
    ),
    stack: ["ASP.NET Core 8", "Vue.js 3", "C#", "TypeScript"],
    status: "Démo locale",
    image: "/images/labelr-placeholder.png",

    links: { github: "https://github.com/GillesCob/Labelr" },
  },
  {
    id: "vps-hetzner",
    name: "VPS Hetzner",
    description:
      "VPS Hetzner Ubuntu 24.04. Docker, Nginx reverse proxy, Certbot SSL avec renouvellement automatique. Sous-domaines dédiés par projet. Infrastructure personnelle, indépendance totale des outils SaaS.",
    stack: ["Docker", "Nginx", "Ubuntu", "Certbot"],
    status: "En production",
    image: "/images/hetzner-placeholder.png",

    links: {},
  },
];
