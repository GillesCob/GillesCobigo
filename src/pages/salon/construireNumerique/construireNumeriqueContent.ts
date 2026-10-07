import { devProjects } from "@/data/devProjects";
import type { IVCardContact } from "../vcard";

// Contenu de la carte de la journée « Construire en numérique : l'IA passe du buzz au chantier »
// (Domolandes, 3 novembre 2026), repris du mockup
// Projets/Portfolio/mockups/carte-salon-construire-en-numerique.html.

export const NUMERIQUE_PATH = "/construire-en-numerique";
export const NUMERIQUE_QR_URL = `https://gillescobigo.com${NUMERIQUE_PATH}`;
export const NUMERIQUE_DISPLAY_URL = `gillescobigo.com${NUMERIQUE_PATH}`;
export const NUMERIQUE_ROLE = "Développeur, BIM Manager";

export const NUMERIQUE_CONTACT: IVCardContact = {
  first: "Gilles",
  last: "Cobigo",
  title: NUMERIQUE_ROLE,
  email: "contact@gillescobigo.com",
  tel: "+33679629460",
  url: "https://gillescobigo.com",
  linkedin: "https://www.linkedin.com/in/gillescobigo",
  note: "Rencontré à Construire en numérique, Domolandes, 3 novembre 2026",
};

export const NUMERIQUE_TEL_HREF = `tel:${NUMERIQUE_CONTACT.tel}`;
export const NUMERIQUE_TEL_DISPLAY = "06 79 62 94 60";
export const NUMERIQUE_MAILTO = "mailto:contact@gillescobigo.com?subject=Construire%20en%20num%C3%A9rique%20Domolandes";
export const NUMERIQUE_CV_URL = "https://gillescobigo.com/cv-gilles-cobigo.pdf";

// URL Cal.com gardées telles que dans le mockup (apostrophe encodée en %27, ce que
// encodeURIComponent ne fait pas). Sujet décodé vérifié par construireNumeriqueContent.test.ts.
export const NUMERIQUE_BOOKING_URL = "https://cal.com/gillescobigo/echange?notes=Construire%20en%20num%C3%A9rique";

export type TNumeriqueIcon = "sparkle" | "wrench" | "people" | "mic" | "shield";

export interface INumeriqueTopic {
  id: string;
  icon: TNumeriqueIcon;
  title: string;
  description: string;
}

export interface INumeriqueOffer extends INumeriqueTopic {
  calHref: string;
}

// Bloc « L'IA appliquée au BIM » : trois sujets, sans lien de prise de rendez-vous.
export const NUMERIQUE_AI_TOPICS: INumeriqueTopic[] = [
  {
    id: "regles-collision",
    icon: "sparkle",
    title: "Des règles de collision en français",
    description:
      "On écrit la règle comme on la dirait à un collègue, l'IA la traduit en paramètres de détection que le logiciel exécute.",
  },
  {
    id: "reunion-voix",
    icon: "mic",
    title: "Le compte rendu de réunion à la voix",
    description: "La réunion de synthèse est transcrite au fil de l'eau, le compte rendu est prêt à la fin.",
  },
  {
    id: "mots-seulement",
    icon: "shield",
    title: "Une IA qui ne voit que des mots",
    description: "Les données du projet restent dans l'outil : seule la phrase de la règle part vers l'IA.",
  },
];

export const NUMERIQUE_OFFERS: INumeriqueOffer[] = [
  {
    id: "ia",
    icon: "sparkle",
    title: "L'IA dans vos process",
    description:
      "Comptes rendus, quantitatifs, mails, recherche dans vos documents. Des usages concrets, adaptés à votre métier.",
    calHref:
      "https://cal.com/gillescobigo/echange?notes=Construire%20en%20num%C3%A9rique%20%3A%20L%27IA%20dans%20vos%20process",
  },
  {
    id: "outils",
    icon: "wrench",
    title: "Des outils BIM sur mesure",
    description:
      "Coordination de maquettes, détection de collisions, suivi et carnet d'entretien d'un bâtiment, dans le navigateur.",
    calHref:
      "https://cal.com/gillescobigo/echange?notes=Construire%20en%20num%C3%A9rique%20%3A%20Des%20outils%20BIM%20sur%20mesure",
  },
  {
    id: "formation",
    icon: "people",
    title: "Former vos équipes",
    description:
      "Une prise en main de l'IA par des cas d'usage de votre quotidien : bureau d'études, entreprise, maîtrise d'œuvre.",
    calHref:
      "https://cal.com/gillescobigo/echange?notes=Construire%20en%20num%C3%A9rique%20%3A%20Former%20vos%20%C3%A9quipes",
  },
];

export interface INumeriqueApp {
  id: string;
  name: string;
  description: string;
  host: string;
  href: string;
  logo: string;
  // Variante du cadre du logo (mockup : `.app-mark.dark.pad` pour Ouvra, classe `cs-dark` en prod,
  // cf habitatExpo.css écart 1).
  markVariant?: "dark";
}

// URL d'Ouvra reprise de devProjects.tsx (TODO du mockup), repli sur la valeur du mockup si
// l'entrée disparaît. Cerithe en dur : devProjects.tsx construit son URL depuis VITE_CERITHE_URL,
// absente du repo (même choix que habitatExpoContent.ts).
const liveUrl = (id: string, fallback: string) =>
  devProjects.find((project) => project.id === id)?.links?.live ?? fallback;

export const NUMERIQUE_FEATURED_APP: INumeriqueApp = {
  id: "ouvra",
  name: "Ouvra",
  description:
    "Une maquette BIM dans le navigateur, sans installation : visionneuse 3D et détection de collisions entre maquettes. Ouvrez-la, déplacez-vous dans le bâtiment, lancez la détection.",
  host: "ouvra.gillescobigo.com",
  href: liveUrl("ouvra", "https://ouvra.gillescobigo.com/"),
  logo: "/images/app-ouvra.png",
  markVariant: "dark",
};

export const NUMERIQUE_APPS: INumeriqueApp[] = [
  {
    id: "cerithe",
    name: "Cerithe",
    description:
      "Carnet de santé numérique du bâtiment. Interventions, équipements et conformité sur toute la vie d'un ouvrage.",
    host: "cerithe.gillescobigo.com",
    href: "https://cerithe.gillescobigo.com",
    logo: "/images/app-cerithe-crop.png",
  },
];
