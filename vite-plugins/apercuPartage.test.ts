// Aperçu de partage de /construire-en-numerique (31/10) : le site est une SPA dont toutes les adresses renvoient index.html, donc un lien partagé
// montrait l'aperçu général du portfolio. Un second index.html, au chemin de la page, porte ses propres balises. Écrits avant le code.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { APERCU_CONSTRUIRE_NUMERIQUE, appliquerApercu } from "./apercuPartage";

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
    expect(APERCU_CONSTRUIRE_NUMERIQUE.description).toBe("Développeur et BIM Manager. Des outils qui rendent la maquette accessible à tous les acteurs d'un projet.");
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
