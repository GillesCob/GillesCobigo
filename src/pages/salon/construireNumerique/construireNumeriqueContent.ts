import { devProjects } from "@/data/devProjects";
import type { IVCardContact } from "../vcard";

// Contenu de la carte de la journée « Construire en numérique : l'IA passe du buzz au chantier »
// (Domolandes, 3 novembre 2026), repris du mockup
// Projets/Portfolio/mockups/carte-salon-construire-en-numerique.html.

export const NUMERIQUE_PATH = "/construire-en-numerique";
// Avec `www` : gillescobigo.com (sans www) répond 308 vers www.gillescobigo.com, un saut de plus
// après le scan du QR (vérifié par curl le 27/10).
export const NUMERIQUE_QR_URL = `https://www.gillescobigo.com${NUMERIQUE_PATH}`;
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
  note: "Développeur d'Ouvra, rencontré à Construire en numérique, Domolandes, 3 novembre 2026",
};

export const NUMERIQUE_TEL_HREF = `tel:${NUMERIQUE_CONTACT.tel}`;
export const NUMERIQUE_TEL_DISPLAY = "06 79 62 94 60";
export const NUMERIQUE_MAILTO =
  "mailto:contact@gillescobigo.com?subject=Ouvra%2C%20suite%20%C3%A0%20notre%20%C3%A9change%20%C3%A0%20Construire%20en%20num%C3%A9rique";
// CV affiché en page HTML (public/cv/), avec son bouton « Télécharger le PDF » (/cv-gilles-cobigo.pdf).
export const NUMERIQUE_CV_URL = "/cv/";

// URL Cal.com gardées telles que dans le mockup (apostrophe encodée en %27, ce que
// encodeURIComponent ne fait pas). Sujet décodé vérifié par construireNumeriqueContent.test.ts.
export const NUMERIQUE_BOOKING_URL =
  "https://cal.com/gillescobigo/echange?notes=Construire%20en%20num%C3%A9rique";

// Fiche contact statique servie par l'hébergeur (en-têtes dans vercel.json). Même contenu que
// buildVCard(NUMERIQUE_CONTACT), plus la photo (logo GC), vérifié par construireNumeriqueContent.test.ts.
export const NUMERIQUE_VCARD_URL = "/gilles-cobigo.vcf";

export interface INumeriqueApp {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  host: string;
  href: string;
  logo: string;
  // Variante du cadre du logo (mockup : `.app-mark.dark.pad` pour Ouvra, classe `cs-dark` en prod,
  // cf habitatExpo.css écart 1).
  markVariant?: "dark";
}

// URL d'Ouvra reprise de devProjects.tsx (TODO du mockup), repli sur la valeur du mockup si
// l'entrée disparaît.
const liveUrl = (id: string, fallback: string) =>
  devProjects.find((project) => project.id === id)?.links?.live ?? fallback;

export const NUMERIQUE_FEATURED_APP: INumeriqueApp = {
  id: "ouvra",
  name: "Ouvra",
  tagline: "Mon démonstrateur BIM",
  description:
    "Une maquette BIM dans le navigateur.\nVisionneuse 3D, collisions, discussions.\nTestez les fonctionnalités autour de la maquette et voyez ce que change l'IA quand une simple phrase remplace les menus.",
  host: "ouvra.gillescobigo.com",
  href: liveUrl("ouvra", "https://ouvra.gillescobigo.com/"),
  logo: "/images/app-ouvra.png",
  markVariant: "dark",
};
