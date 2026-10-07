import { describe, expect, it } from "vitest";
import { devProjects } from "@/data/devProjects";
import { buildVCard } from "../vcard";
import {
  NUMERIQUE_AI_TOPICS,
  NUMERIQUE_APPS,
  NUMERIQUE_BOOKING_URL,
  NUMERIQUE_CONTACT,
  NUMERIQUE_FEATURED_APP,
  NUMERIQUE_MAILTO,
  NUMERIQUE_OFFERS,
  NUMERIQUE_QR_URL,
  NUMERIQUE_TEL_HREF,
} from "./construireNumeriqueContent";

const NOW = new Date("2026-10-07T08:00:00.000Z");

// Sujet pré-rempli lu par Cal.com : valeur décodée du paramètre `notes`.
const calNotes = (href: string) => new URL(href).searchParams.get("notes");

describe("construireNumeriqueContent", () => {
  it("produit la vCard du mockup carte-salon-construire-en-numerique.html", () => {
    expect(buildVCard(NUMERIQUE_CONTACT, NOW)).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Cobigo;Gilles;;;",
        "FN:Gilles Cobigo",
        "TITLE:Développeur\\, BIM Manager",
        "EMAIL;TYPE=INTERNET,PREF:contact@gillescobigo.com",
        "TEL;TYPE=CELL,VOICE:+33679629460",
        "URL:https://gillescobigo.com",
        "X-SOCIALPROFILE;type=linkedin:https://www.linkedin.com/in/gillescobigo",
        "NOTE:Rencontré à Construire en numérique\\, Domolandes\\, 3 novembre 2026",
        "REV:2026-10-07T08:00:00Z",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("pointe le QR vers la route /construire-en-numerique du portfolio", () => {
    expect(NUMERIQUE_QR_URL).toBe("https://gillescobigo.com/construire-en-numerique");
  });

  it("reprend le téléphone de la vCard pour le lien d'appel", () => {
    expect(NUMERIQUE_TEL_HREF).toBe(`tel:${NUMERIQUE_CONTACT.tel}`);
  });

  it("pré-remplit le sujet du mail avec la journée", () => {
    const mail = new URL(NUMERIQUE_MAILTO);
    expect(mail.protocol).toBe("mailto:");
    expect(mail.pathname).toBe(NUMERIQUE_CONTACT.email);
    expect(mail.searchParams.get("subject")).toBe("Construire en numérique Domolandes");
  });

  it("pré-remplit le sujet Cal.com de la prise de rendez-vous et de chaque offre", () => {
    expect(calNotes(NUMERIQUE_BOOKING_URL)).toBe("Construire en numérique");
    expect(NUMERIQUE_OFFERS.map((offer) => calNotes(offer.calHref))).toEqual([
      "Construire en numérique : L'IA dans vos process",
      "Construire en numérique : Des outils BIM sur mesure",
      "Construire en numérique : Former vos équipes",
    ]);
    NUMERIQUE_OFFERS.forEach((offer) =>
      expect(calNotes(offer.calHref)).toBe(`Construire en numérique : ${offer.title}`),
    );
  });

  it("n'envoie la prise de rendez-vous que vers l'agenda Cal.com de Gilles", () => {
    [NUMERIQUE_BOOKING_URL, ...NUMERIQUE_OFFERS.map((offer) => offer.calHref)].forEach((href) => {
      const url = new URL(href);
      expect(url.origin + url.pathname).toBe("https://cal.com/gillescobigo/echange");
    });
  });

  it("reprend l'URL d'Ouvra depuis devProjects.tsx", () => {
    const live = devProjects.find((project) => project.id === "ouvra")?.links?.live;
    expect(live).toMatch(/^https:\/\//);
    expect(NUMERIQUE_FEATURED_APP.href).toBe(live);
  });

  it("expose Cerithe seul en réalisation secondaire, en https absolu avec son logo", () => {
    expect(NUMERIQUE_APPS.map((app) => app.id)).toEqual(["cerithe"]);
    [NUMERIQUE_FEATURED_APP, ...NUMERIQUE_APPS].forEach((app) => {
      expect(app.href).toMatch(/^https:\/\/[^/]+\.[a-z]+(\/|$)/);
      expect(app.logo).toMatch(/^\/images\/app-[a-z-]+\.png$/);
    });
  });

  it("liste les trois sujets IA sans lien de prise de rendez-vous", () => {
    expect(NUMERIQUE_AI_TOPICS).toHaveLength(3);
    NUMERIQUE_AI_TOPICS.forEach((topic) => expect(topic).not.toHaveProperty("calHref"));
  });
});
