import { devProjects } from "@/data/devProjects";
import type { IVCardContact } from "../vcard";

// Contenu de la carte du salon Habitat Expo (Mont-de-Marsan, 2 au 4 octobre 2026), repris du
// mockup Projets/Portfolio/mockups/carte-salon-habitat.html.

export const HABITAT_PATH = "/habitat-expo";
export const HABITAT_QR_URL = `https://gillescobigo.com${HABITAT_PATH}`;
export const HABITAT_DISPLAY_URL = `gillescobigo.com${HABITAT_PATH}`;
export const HABITAT_ROLE = "Développeur, BIM Manager";

export const HABITAT_CONTACT: IVCardContact = {
  first: "Gilles",
  last: "Cobigo",
  title: HABITAT_ROLE,
  email: "contact@gillescobigo.com",
  tel: "+33679629460",
  url: "https://gillescobigo.com",
  linkedin: "https://www.linkedin.com/in/gillescobigo",
  note: "Rencontré au salon Habitat Expo, Mont-de-Marsan, octobre 2026",
};

export const HABITAT_TEL_HREF = `tel:${HABITAT_CONTACT.tel}`;
export const HABITAT_TEL_DISPLAY = "06 79 62 94 60";
export const HABITAT_MAILTO = "mailto:contact@gillescobigo.com?subject=Salon%20Habitat%20Expo%20Mont-de-Marsan";
export const HABITAT_CV_URL = "https://gillescobigo.com/cv-gilles-cobigo.pdf";

// URL Cal.com gardées telles que dans le mockup (apostrophe encodée en %27, ce que
// encodeURIComponent ne fait pas). Sujet décodé vérifié par habitatExpoContent.test.ts.
export const HABITAT_BOOKING_URL = "https://cal.com/gillescobigo/echange?notes=Salon%20Habitat%20Expo";

export type THabitatOfferIcon = "sparkle" | "wrench" | "monitor";

export interface IHabitatOffer {
  id: string;
  icon: THabitatOfferIcon;
  title: string;
  description: string;
  calHref: string;
}

export const HABITAT_OFFERS: IHabitatOffer[] = [
  {
    id: "ia",
    icon: "sparkle",
    title: "L'IA dans vos process",
    description:
      "Devis, comptes rendus de chantier, mails, recherche dans vos documents. Des usages concrets adaptés à votre métier et la formation de votre équipe.",
    calHref: "https://cal.com/gillescobigo/echange?notes=Salon%20Habitat%20Expo%20%3A%20L%27IA%20dans%20vos%20process",
  },
  {
    id: "outils",
    icon: "wrench",
    title: "Des outils métier sur mesure",
    description: "Suivi de chantier, maquettes BIM consultables dans le navigateur, carnet d'entretien d'un bâtiment.",
    calHref:
      "https://cal.com/gillescobigo/echange?notes=Salon%20Habitat%20Expo%20%3A%20Des%20outils%20m%C3%A9tier%20sur%20mesure",
  },
  {
    id: "site",
    icon: "monitor",
    title: "Votre site internet",
    description: "Un site vitrine clair et rapide, pensé pour que vos clients vous trouvent.",
    calHref: "https://cal.com/gillescobigo/echange?notes=Salon%20Habitat%20Expo%20%3A%20Votre%20site%20internet",
  },
];

export interface IHabitatApp {
  id: string;
  name: string;
  description: string;
  host: string;
  href: string;
  logo: string;
  // Variante du cadre du logo (mockup : `.app-mark.dark.pad` pour Ouvra, logo clair sur fond sombre,
  // classe `cs-dark` en prod, cf habitatExpo.css écart 1).
  markVariant?: "dark";
}

// URL du Dressing et d'Ouvra reprises de devProjects.tsx (TODO du mockup), repli sur la valeur du
// mockup si l'entrée disparaît (cas couvert par habitatExpoContent.test.ts). Cerithe en dur :
// devProjects.tsx construit son URL depuis VITE_CERITHE_URL, absente du repo (même choix que
// salonContent.ts). Textes repris du mockup, plus courts que ceux de devProjects.tsx.
const liveUrl = (id: string, fallback: string) =>
  devProjects.find((project) => project.id === id)?.links?.live ?? fallback;

export const HABITAT_APPS: IHabitatApp[] = [
  {
    id: "dressing-mailys",
    name: "Le Dressing de Maïlys",
    description: "Site vitrine sur mesure d'une boutique de dépôt-vente à Mont-de-Marsan.",
    host: "dressing-de-mailys.fr",
    href: liveUrl("dressing-mailys", "https://dressing-de-mailys.fr"),
    logo: "/images/app-dressing.png",
  },
  {
    id: "ouvra",
    name: "Ouvra",
    description: "Coordination BIM dans le navigateur. Viewer IFC et détection de collisions entre maquettes.",
    host: "ouvra.gillescobigo.com",
    href: liveUrl("ouvra", "https://ouvra.gillescobigo.com/"),
    logo: "/images/app-ouvra.png",
    markVariant: "dark",
  },
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
