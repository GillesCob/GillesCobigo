import type { IProjectCard } from "@/components/projects/ProjectCard";

export type IDevProject = IProjectCard;

export const devProjects: IProjectCard[] = [
  {
    id: "cerithe",
    name: "Cerithe",
    description:
      "Carnet de santé numérique du bâtiment. Suivi des interventions, des équipements et de la conformité réglementaire sur le cycle de vie d'un bâtiment.",
    // Blurb court de la ligne /new (mockup #projets .work-row), distinct de `description`
    // (modale) : sans lui, la ligne utilise la description longue et déborde en hauteur par
    // rapport au mockup (rangée ~44px plus haute, trouvé au diff pixel).
    summary: "Carnet de santé numérique du bâtiment, suivi des interventions et de la conformité réglementaire.",
    stack: ["TypeScript", "Node.js", "Express", "Prisma", "PostgreSQL", "React"],
    status: "En production",
    image: "/images/cerithe-placeholder.png",
    links: { github: "https://github.com/GillesCob/Cerithe", live: `${import.meta.env.VITE_CERITHE_URL}` },
  },
  {
    id: "dressing-mailys",
    name: "Le Dressing de Maïlys",
    description:
      "Site vitrine sur mesure pour une boutique de dépôt-vente à Mont-de-Marsan, mon premier client. Il remplace l'ancien WordPress/WooCommerce et est en ligne depuis août 2026. Front hébergé sur mon VPS (Nginx, HTTPS) et petit serveur Node/Express dans Docker pour afficher les avis Google triés par date, ce qu'aucun widget du marché ne permettait.",
    summary: "Site vitrine d'une boutique de dépôt-vente, premier client réel, hébergé sur mon VPS.",
    stack: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "Docker", "Nginx"],
    status: "En production",
    image: "/images/dressing-mailys-logo.png",
    links: { live: "https://dressing-de-mailys.fr" },
  },
  {
    id: "ouvra",
    name: "Ouvra",
    description:
      "POC de coordination BIM : viewer IFC dans le navigateur, détection de conflits entre maquettes, échanges collaboratifs rattachés à la maquette. Pensé pour ouvrir l'accès au BIM à tous les acteurs d'un projet, pas seulement aux experts.",
    summary: "POC de coordination BIM, viewer IFC et détection de conflits entre maquettes dans le navigateur.",
    stack: ["JavaScript", "Vite", "xeokit", "web-ifc"],
    status: "En développement",
    image: "/images/ouvra-icon-placeholder.png",
    links: { github: "https://github.com/GillesCob/Ouvra", live: "https://ouvra.gillescobigo.com/" },
  },
  {
    id: "nexio",
    name: "Nexio",
    description:
      "App de suivi de recherche d'emploi avec IA intégrée. Analyse des offres, suivi des candidatures, suggestions personnalisées via Claude API.",
    summary: "Suivi de recherche d'emploi avec IA intégrée, analyse d'offres et suggestions via Claude API.",
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
    summary: "App agentique de gestion de liste de naissance, coordination automatique entre participants.",
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
    id: "cocotte-eclair",
    name: "CocotteEclair",
    description:
      "App de gestion de recettes et de repas. Ajout de recettes (ingrédients, étapes), visibilité privée/publique. Première V1 sur la stack Java/Spring Boot + Angular.",
    stack: ["Java", "Spring Boot", "PostgreSQL", "Angular", "TypeScript"],
    status: "En production",
    image: "/images/cocotte-placeholder.jpg",
    links: { github: "https://github.com/GillesCob/cocotte-eclair-java", live: "https://cocotteeclair.gillescobigo.com" },
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
