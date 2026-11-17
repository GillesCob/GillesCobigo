// Aperçu de partage de /construire-en-numerique (31/10) : le site est une SPA dont toutes les adresses renvoient index.html, donc un lien partagé
// montrait l'aperçu général du portfolio. Un second index.html, au chemin de la page, porte ses propres balises. Écrits avant le code.
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { APERCU_CONSTRUIRE_NUMERIQUE, appliquerApercu, apercusPreview } from "./apercuPartage";
import { previewProjects } from "../src/data/previewProjects";

const indexSource = readFileSync(path.resolve(__dirname, "../index.html"), "utf8");

describe("appliquerApercu", () => {
  const html = appliquerApercu(indexSource, APERCU_CONSTRUIRE_NUMERIQUE);
  const balise = (re: RegExp) => (html.match(re) ?? [])[1];

  it("titre demandé par Gilles, partout", () => {
    expect(APERCU_CONSTRUIRE_NUMERIQUE.titre).toBe("Gilles Cobigo, Développeur et BIM Manager");
    expect(balise(/property="og:title"\s+content="([^"]*)"/)).toBe(APERCU_CONSTRUIRE_NUMERIQUE.titre);
    expect(balise(/name="twitter:title"\s+content="([^"]*)"/)).toBe(APERCU_CONSTRUIRE_NUMERIQUE.titre);
    expect(balise(/<title>([^<]*)<\/title>/)).toBe(APERCU_CONSTRUIRE_NUMERIQUE.titre);
  });

  it("description, image et adresse propres à la page, en https absolu", () => {
    expect(balise(/property="og:description"\s+content="([^"]*)"/)).toBe(APERCU_CONSTRUIRE_NUMERIQUE.description);
    expect(balise(/name="twitter:description"\s+content="([^"]*)"/)).toBe(APERCU_CONSTRUIRE_NUMERIQUE.description);
    expect(balise(/name="description"\s+content="([^"]*)"/)).toBe(APERCU_CONSTRUIRE_NUMERIQUE.description);
    expect(balise(/property="og:image"\s+content="([^"]*)"/)).toBe("https://www.gillescobigo.com/images/og-construire-en-numerique.png");
    expect(balise(/name="twitter:image"\s+content="([^"]*)"/)).toBe("https://www.gillescobigo.com/images/og-construire-en-numerique.png");
    expect(balise(/property="og:url"\s+content="([^"]*)"/)).toBe("https://www.gillescobigo.com/construire-en-numerique");
  });

  it("plus aucune année de code, ni ancienne phrase d'accroche", () => {
    expect(html).not.toMatch(/4 ans de code|reconversion qui n'en est pas une|Développeur fullstack/);
  });

  it("description courte (lisible dans un aperçu WhatsApp) et sans tiret quadratin", () => {
    expect(APERCU_CONSTRUIRE_NUMERIQUE.description.length).toBeLessThanOrEqual(160);
    expect(APERCU_CONSTRUIRE_NUMERIQUE.description).toBe("Le BIM accessible pour tous");
    expect(html.includes(String.fromCharCode(0x2014))).toBe(false);
  });

  it("le reste de la page est inchangé (scripts, theme-color)", () => {
    expect(html).toContain('<meta name="theme-color" content="#0A0A0A" />');
    expect(html).toContain('<div id="root"></div>');
  });

  it("une balise introuvable fait échouer le build plutôt que de publier un mauvais aperçu", () => {
    expect(() => appliquerApercu("<html><head></head></html>", APERCU_CONSTRUIRE_NUMERIQUE)).toThrow(/introuvable/);
  });
});

// Aperçu général du portfolio (31/10) : plus d'année de code, et l'image existe vraiment à l'adresse annoncée (elle renvoyait la page d'accueil, donc aucune image en partage).
describe("aperçu général de index.html", () => {
  it("plus de « 4 ans de code » ni de reconversion dans les balises de partage", () => {
    expect(indexSource).not.toMatch(/4 ans de code/);
    expect(indexSource).not.toMatch(/property="og:description"\s+content="[^"]*reconversion/);
  });

  it("og:image et twitter:image pointent vers un fichier réel de public/", () => {
    const images = [...indexSource.matchAll(/(?:og|twitter):image"\s+content="([^"]*)"/g)].map((m) => m[1]);
    expect(images).toHaveLength(2);
    for (const url of images) {
      expect(url).toMatch(/^https:\/\/www\.gillescobigo\.com\/images\/[a-z-]+\.png$/);
      expect(existsSync(path.resolve(__dirname, "../public", new URL(url).pathname.slice(1)))).toBe(true);
    }
  });

  it("description générale, identique à celle de la page Construire en numérique", () => {
    expect(indexSource).toContain(APERCU_CONSTRUIRE_NUMERIQUE.description);
  });
});

// Aperçu de partage de la page d'échanges de Philippe André (17/11) : uniquement les projets qui renseignent shareTitle, shareDescription et shareImage.
describe("apercusPreview", () => {
  const apercus = apercusPreview();
  const base = "preview/cours-guitare-philippe-andre/3677b1ae2b81935e";

  it("exactement l'accueil et /v1 de Philippe, aucun autre chemin", () => {
    expect(apercus.map((a) => a.chemin)).toEqual([base, `${base}/v1`]);
  });

  it("les autres projets (Mylène, etc.) n'ont aucun aperçu propre", () => {
    expect(apercus.some((a) => a.chemin.includes("EuMLnfc8Uk"))).toBe(false);
    expect(apercusPreview({ x: { ...previewProjects.EuMLnfc8Uk } })).toEqual([]);
  });

  it("balises complètes, texte demandé, image absolue https en JPG", () => {
    const html = appliquerApercu(indexSource, apercus[0]);
    const b = (re: RegExp) => (html.match(re) ?? [])[1];
    expect(b(/<title>([^<]*)<\/title>/)).toBe("Cours de guitare de Philippe André");
    expect(b(/property="og:title"\s+content="([^"]*)"/)).toBe("Cours de guitare de Philippe André");
    expect(b(/property="og:description"\s+content="([^"]*)"/)).toBe("Deux propositions pour ton site, à découvrir et à commenter.");
    expect(b(/name="twitter:title"\s+content="([^"]*)"/)).toBe("Cours de guitare de Philippe André");
    expect(b(/name="twitter:description"\s+content="([^"]*)"/)).toBe("Deux propositions pour ton site, à découvrir et à commenter.");
    expect(b(/name="description"\s+content="([^"]*)"/)).toBe("Deux propositions pour ton site, à découvrir et à commenter.");
    expect(b(/property="og:type"\s+content="([^"]*)"/)).toBe("website");
    expect(b(/property="og:site_name"\s+content="([^"]*)"/)).toBe("Cours de guitare de Philippe André");
    expect(b(/property="og:url"\s+content="([^"]*)"/)).toBe(`https://www.gillescobigo.com/${base}`);
    const image = b(/property="og:image"\s+content="([^"]*)"/);
    expect(image).toMatch(/^https:\/\/www\.gillescobigo\.com\/.*\.jpg$/);
    expect(b(/name="twitter:image"\s+content="([^"]*)"/)).toBe(image);
    expect(existsSync(path.resolve(__dirname, "../public", new URL(image).pathname.slice(1)))).toBe(true);
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('src="/src/main.tsx"');
  });

  it("l'accueil de index.html reste sans og:site_name (aperçu général intact)", () => {
    expect(indexSource).not.toContain("og:site_name");
  });

  it("sans tiret quadratin, sans « petit », sans virgule avant et/ou", () => {
    const texte = `${apercus[0].titre} ${apercus[0].description}`;
    expect(texte.includes(String.fromCharCode(0x2014))).toBe(false);
    expect(texte).not.toMatch(/petit|, (et|ou) /i);
  });
});
