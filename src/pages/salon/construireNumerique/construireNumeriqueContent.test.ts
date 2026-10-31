import { describe, expect, it } from "vitest";
import { devProjects } from "@/data/devProjects";
// Fichiers de public/ et de la racine lus en texte (`?raw`, comme les QR de SalonStand.tsx) :
// le tsconfig n'inclut pas les types Node.
import vercelConfigRaw from "../../../../vercel.json?raw";
import vcfRaw from "../../../../public/gilles-cobigo.vcf?raw";
import { buildVCard } from "../vcard";
import {
  NUMERIQUE_BOOKING_URL,
  NUMERIQUE_CONTACT,
  NUMERIQUE_FEATURED_APP,
  NUMERIQUE_MAILTO,
  NUMERIQUE_QR_URL,
  NUMERIQUE_TEL_HREF,
  NUMERIQUE_VCARD_URL,
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
        "NOTE:Développeur d'Ouvra\\, rencontré à Construire en numérique\\, Domola",
        " ndes\\, 3 novembre 2026",
        "REV:2026-10-07T08:00:00Z",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("pointe le QR vers la route /construire-en-numerique, avec www pour éviter la redirection 308", () => {
    expect(NUMERIQUE_QR_URL).toBe(
      "https://www.gillescobigo.com/construire-en-numerique",
    );
  });

  it("reprend le téléphone de la vCard pour le lien d'appel", () => {
    expect(NUMERIQUE_TEL_HREF).toBe(`tel:${NUMERIQUE_CONTACT.tel}`);
  });

  it("pré-remplit le sujet du mail en présentant Gilles comme développeur d'Ouvra", () => {
    const mail = new URL(NUMERIQUE_MAILTO);
    expect(mail.protocol).toBe("mailto:");
    expect(mail.pathname).toBe(NUMERIQUE_CONTACT.email);
    expect(mail.searchParams.get("subject")).toBe(
      "Ouvra, suite à notre échange à Construire en numérique",
    );
  });

  it("pré-remplit le sujet Cal.com de la prise de rendez-vous", () => {
    expect(calNotes(NUMERIQUE_BOOKING_URL)).toBe("Construire en numérique");
  });

  it("n'envoie la prise de rendez-vous que vers l'agenda Cal.com de Gilles", () => {
    const url = new URL(NUMERIQUE_BOOKING_URL);
    expect(url.origin + url.pathname).toBe(
      "https://cal.com/gillescobigo/echange",
    );
  });

  it("reprend l'URL d'Ouvra depuis devProjects.tsx", () => {
    const live = devProjects.find((project) => project.id === "ouvra")?.links
      ?.live;
    expect(live).toMatch(/^https:\/\//);
    expect(NUMERIQUE_FEATURED_APP.href).toBe(live);
  });

  it("expose Ouvra en https absolu avec son logo", () => {
    expect(NUMERIQUE_FEATURED_APP.href).toMatch(
      /^https:\/\/[^/]+\.[a-z]+(\/|$)/,
    );
    expect(NUMERIQUE_FEATURED_APP.logo).toMatch(/^\/images\/app-[a-z-]+\.png$/);
  });

  it("description d'Ouvra en trois lignes : navigateur, fonctionnalités, invitation à tester, sans « sans installation »", () => {
    const lignes = NUMERIQUE_FEATURED_APP.description.split("\n");
    expect(lignes).toHaveLength(3);
    expect(lignes[0]).toBe("Une maquette BIM dans le navigateur.");
    expect(lignes[1]).toBe("Visionneuse 3D, collisions, discussions.");
    expect(lignes[2]).toMatch(/^Testez les fonctionnalités autour de la maquette/);
    expect(NUMERIQUE_FEATURED_APP.description).not.toMatch(/sans installation/i);
  });

  it("présente Ouvra comme un démonstrateur, sans promesse de nouveauté", () => {
    expect(NUMERIQUE_FEATURED_APP.tagline).toMatch(/démonstrateur/i);
    expect(
      `${NUMERIQUE_FEATURED_APP.tagline} ${NUMERIQUE_FEATURED_APP.description}`,
    ).not.toMatch(/nouveau|premier|jamais vu|révolution/i);
  });
});

// Fiche contact statique de public/ : mêmes champs que la vCard générée par buildVCard, plus la
// photo (logo GC). Dépliée (lignes de continuation recollées) avant comparaison.
describe("public/gilles-cobigo.vcf", () => {
  const raw = vcfRaw;
  const unfolded = raw.replace(/\r\n /g, "");
  const lines = unfolded.split("\r\n");

  it("est servie depuis la racine, sous le nom de fichier attendu", () => {
    expect(NUMERIQUE_VCARD_URL).toBe("/gilles-cobigo.vcf");
  });

  it("est une vCard 3.0 en CRLF, sans ORG", () => {
    expect(lines[0]).toBe("BEGIN:VCARD");
    expect(lines[1]).toBe("VERSION:3.0");
    expect(lines[lines.length - 2]).toBe("END:VCARD");
    expect(lines[lines.length - 1]).toBe("");
    expect(unfolded).not.toMatch(/^ORG[;:]/m);
  });

  it("reprend les champs de NUMERIQUE_CONTACT, à la photo et à la date de révision près", () => {
    const generated = buildVCard(NUMERIQUE_CONTACT, NOW)
      .replace(/\r\n /g, "")
      .split("\r\n");
    const stat = lines.filter(
      (line) => !line.startsWith("PHOTO") && !line.startsWith("REV:"),
    );
    const gen = generated.filter((line) => !line.startsWith("REV:"));
    expect(stat).toEqual(gen);
    expect(unfolded).toMatch(/^REV:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/m);
  });

  it("embarque une photo JPEG en base64 de 256 px au plus, sous 20 Ko", () => {
    const photo = lines.find((line) =>
      line.startsWith("PHOTO;ENCODING=b;TYPE=JPEG:"),
    );
    expect(photo).toBeDefined();
    const bytes = Uint8Array.from(atob(photo!.split(":")[1]), (char) =>
      char.charCodeAt(0),
    );
    expect(Array.from(bytes.subarray(0, 3))).toEqual([0xff, 0xd8, 0xff]);
    expect(bytes.length).toBeLessThan(20_000);
    // Dimensions lues dans l'en-tête SOF0/SOF2 du JPEG (hauteur puis largeur, 16 bits).
    const word = (at: number) => (bytes[at] << 8) | bytes[at + 1];
    let offset = 2;
    while (offset < bytes.length) {
      const marker = bytes[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        expect(word(offset + 5)).toBeLessThanOrEqual(256);
        expect(word(offset + 7)).toBeLessThanOrEqual(256);
        return;
      }
      offset += 2 + word(offset + 2);
    }
    throw new Error("En-tête JPEG sans SOF");
  });

  it("plie chaque ligne à 75 octets au plus", () => {
    raw
      .split("\r\n")
      .forEach((line) =>
        expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75),
      );
  });
});

describe("vercel.json", () => {
  const config = JSON.parse(vercelConfigRaw) as {
    headers: { source: string; headers: { key: string; value: string }[] }[];
  };

  it("sert la fiche contact en text/vcard, en pièce jointe", () => {
    const rule = config.headers.find(
      (entry) => entry.source === NUMERIQUE_VCARD_URL,
    );
    const value = (key: string) =>
      rule?.headers.find((header) => header.key === key)?.value;
    expect(value("Content-Type")).toBe("text/vcard; charset=utf-8");
    expect(value("Content-Disposition")).toBe(
      'attachment; filename="gilles-cobigo.vcf"',
    );
  });
});
