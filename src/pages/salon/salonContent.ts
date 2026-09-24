import { devProjects } from "@/data/devProjects";
import type { IVCardContact } from "./vcard";

// Contenu de la carte salon, repris du mockup Projets/Portfolio/mockups/carte-salon.html.

export const SALON_PATH = "/salon-pays-basque";
export const SALON_QR_URL = `https://gillescobigo.com${SALON_PATH}`;

export const SALON_CONTACT: IVCardContact = {
  first: "Gilles",
  last: "Cobigo",
  title: "Développeur fullstack",
  email: "contact@gillescobigo.com",
  tel: "+33679629460",
  url: "https://gillescobigo.com",
  linkedin: "https://www.linkedin.com/in/gillescobigo",
  note: "Rencontré au Salon du numérique du Pays Basque, 24/09/2026",
};

export const VCARD_FILENAME = "gilles-cobigo.vcf";

// Token L8reOUF7 = "Flux 1b - RH entreprise" (src/data/videoLinks.ts), la plus généraliste pour
// un recruteur de salon. Présence dans videoLinks.ts vérifiée par salonContent.test.ts.
export const SALON_VIDEO_TOKEN = "L8reOUF7";
export const SALON_VIDEO_URL = `https://gillescobigo.com/v/${SALON_VIDEO_TOKEN}`;
export const SALON_CV_URL = "https://gillescobigo.com/cv-gilles-cobigo.pdf";
export const SALON_MAILTO = "mailto:contact@gillescobigo.com?subject=Salon%20du%20num%C3%A9rique%20du%20Pays%20Basque";
export const SALON_ARTICLE_URL = "https://gillescobigo.com/articles/2026-09/260923";

export interface ISalonApp {
  id: string;
  mark: string;
  name: string;
  tag?: string;
  description: string;
  host: string;
  href: string;
}

// Ouvra : URL reprise de devProjects.tsx. Cerithe et Nexio : devProjects.tsx construit leur URL
// depuis VITE_CERITHE_URL / VITE_NEXIO_URL, absentes du repo (aucun .env), le lien vaudrait
// "undefined" sur tout build qui ne les définit pas. Valeurs prod du mockup gardées en dur ici,
// suffixe /login?demo=1 de Nexio identique à devProjects.tsx. Repli sur la valeur du mockup si
// Ouvra disparaît de devProjects.tsx (cas couvert par salonContent.test.ts).
const ouvraUrl = devProjects.find((project) => project.id === "ouvra")?.links?.live ?? "https://ouvra.gillescobigo.com/";

export const SALON_APPS: ISalonApp[] = [
  {
    id: "cerithe",
    mark: "Ce",
    name: "Cerithe",
    description: "Carnet de santé numérique du bâtiment. Interventions, équipements et conformité sur toute la vie d'un ouvrage.",
    host: "cerithe.gillescobigo.com",
    href: "https://cerithe.gillescobigo.com",
  },
  {
    id: "ouvra",
    mark: "Ou",
    name: "Ouvra",
    tag: "Mobile",
    description: "Coordination BIM dans le navigateur. Viewer IFC et détection de collisions entre maquettes.",
    host: "ouvra.gillescobigo.com",
    href: ouvraUrl,
  },
  {
    id: "nexio",
    mark: "Nx",
    name: "Nexio",
    tag: "Démo",
    description: "Le CRM qui pilote ma recherche d'emploi. Le lien ouvre directement le mode démo.",
    host: "nexio.gillescobigo.com",
    href: "https://nexio.gillescobigo.com/login?demo=1",
  },
];

export const SALON_STACK: { layer: string; items: string[] }[] = [
  { layer: "Front", items: ["React", "TypeScript", "Tailwind CSS"] },
  { layer: "Back", items: ["Node.js", "Express", "NestJS", "Prisma", "PostgreSQL"] },
  { layer: "Infra", items: ["Docker", "Nginx", "VPS Linux"] },
];
