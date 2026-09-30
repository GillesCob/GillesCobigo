import { describe, expect, it } from "vitest";
import { devProjects } from "@/data/devProjects";
import { buildVCard } from "../vcard";
import {
  HABITAT_APPS,
  HABITAT_BOOKING_URL,
  HABITAT_CONTACT,
  HABITAT_MAILTO,
  HABITAT_OFFERS,
  HABITAT_QR_URL,
  HABITAT_TEL_HREF,
} from "./habitatExpoContent";

const NOW = new Date("2026-10-02T08:00:00.000Z");

// Sujet pré-rempli lu par Cal.com : valeur décodée du paramètre `notes`.
const calNotes = (href: string) => new URL(href).searchParams.get("notes");

describe("habitatExpoContent", () => {
  it("produit exactement la vCard du mockup carte-salon-habitat.html", () => {
    // Chaîne obtenue en exécutant buildVCard(CONTACT) du mockup avec la même date de révision.
    expect(buildVCard(HABITAT_CONTACT, NOW)).toBe(
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
        "NOTE:Rencontré au salon Habitat Expo\\, Mont-de-Marsan\\, octobre 2026",
        "REV:2026-10-02T08:00:00Z",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("pointe le QR vers la route /habitat-expo du portfolio", () => {
    expect(HABITAT_QR_URL).toBe("https://gillescobigo.com/habitat-expo");
  });

  it("reprend le téléphone de la vCard pour le lien d'appel", () => {
    expect(HABITAT_TEL_HREF).toBe(`tel:${HABITAT_CONTACT.tel}`);
  });

  it("pré-remplit le sujet du mail avec le salon", () => {
    const mail = new URL(HABITAT_MAILTO);
    expect(mail.protocol).toBe("mailto:");
    expect(mail.pathname).toBe(HABITAT_CONTACT.email);
    expect(mail.searchParams.get("subject")).toBe("Salon Habitat Expo Mont-de-Marsan");
  });

  it("pré-remplit le sujet Cal.com de la prise de rendez-vous et de chaque offre", () => {
    expect(calNotes(HABITAT_BOOKING_URL)).toBe("Salon Habitat Expo");
    expect(HABITAT_OFFERS.map((offer) => calNotes(offer.calHref))).toEqual([
      "Salon Habitat Expo : L'IA dans vos process",
      "Salon Habitat Expo : Des outils métier sur mesure",
      "Salon Habitat Expo : Votre site internet",
    ]);
    // Le sujet de chaque offre reprend son titre affiché, jamais un texte qui en diverge.
    HABITAT_OFFERS.forEach((offer) => expect(calNotes(offer.calHref)).toBe(`Salon Habitat Expo : ${offer.title}`));
  });

  it("n'envoie la prise de rendez-vous que vers l'agenda Cal.com de Gilles", () => {
    [HABITAT_BOOKING_URL, ...HABITAT_OFFERS.map((offer) => offer.calHref)].forEach((href) => {
      const url = new URL(href);
      expect(url.origin + url.pathname).toBe("https://cal.com/gillescobigo/echange");
    });
  });

  it("reprend les URL du Dressing et d'Ouvra depuis devProjects.tsx", () => {
    ["dressing-mailys", "ouvra"].forEach((id) => {
      const live = devProjects.find((project) => project.id === id)?.links?.live;
      expect(live).toMatch(/^https:\/\//);
      expect(HABITAT_APPS.find((app) => app.id === id)?.href).toBe(live);
    });
  });

  it("n'expose que des réalisations en https absolu, chacune avec son logo", () => {
    expect(HABITAT_APPS.map((app) => app.id)).toEqual(["dressing-mailys", "ouvra", "cerithe"]);
    HABITAT_APPS.forEach((app) => {
      expect(app.href).toMatch(/^https:\/\/[^/]+\.[a-z]+(\/|$)/);
      expect(app.logo).toMatch(/^\/images\/app-[a-z-]+\.png$/);
    });
  });
});
