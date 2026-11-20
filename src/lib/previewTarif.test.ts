import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/previewProjects", () => {
  const theme = {
    bg: "#f4ecdc", surface: "#fbf6ea", surface2: "#ebe0c9", border: "#d3c5a8", text: "#1a2a30", muted: "#4f5f63",
    accent: "#94500c", onAccent: "#fffaf0", ink: "#10262f", inkSub: "#b0bcc0",
    fontTitle: '"Fraunces", Georgia, serif', fontBody: '"DM Sans", system-ui, sans-serif',
    fontsUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
    tagline: "Cours de guitare à Rezé",
  };
  const base = { logo: "/l.png", contactName: "C", currentRound: "V1", feedbackFormId: "f", rounds: [] };
  return {
    previewProjects: {
      "0123456789abcdef": { ...base, slug: "atelier-fictif", projectName: "Atelier Fictif", coldIntro: "Bonjour", tarifTheme: theme },
      "1111111111111111": { ...base, slug: "ancien-prospect", projectName: "Ancien", coldIntro: "Bonjour" },
      "2222222222222222": { ...base, slug: "client-engage", projectName: "Client", tarifTheme: theme },
    },
  };
});

import { DEFAULT_TARIF_THEME, findTarifProspect, resolveTarifTheme } from "./previewTarif";
import type { IPreviewTarifTheme } from "@/data/previewProjects";

const SAFE: IPreviewTarifTheme = {
  ...DEFAULT_TARIF_THEME,
  accent: "#94500c",
  tagline: "Cours de guitare à Rezé",
};

describe("findTarifProspect", () => {
  it("renvoie le prospect quand le slug et le secret correspondent", () => {
    expect(findTarifProspect("atelier-fictif", "0123456789abcdef")?.projectName).toBe("Atelier Fictif");
  });

  it("refuse un slug qui n'est pas celui de l'entree, un secret inconnu, des parametres absents", () => {
    expect(findTarifProspect("autre-slug", "0123456789abcdef")).toBeUndefined();
    expect(findTarifProspect("atelier-fictif", "ffffffffffffffff")).toBeUndefined();
    expect(findTarifProspect(undefined, "0123456789abcdef")).toBeUndefined();
    expect(findTarifProspect("atelier-fictif", undefined)).toBeUndefined();
    expect(findTarifProspect("", "")).toBeUndefined();
  });

  it("refuse les proprietes heritees de l'objet (constructor, __proto__, toString)", () => {
    for (const secret of ["constructor", "__proto__", "toString", "hasOwnProperty"]) {
      expect(findTarifProspect("atelier-fictif", secret)).toBeUndefined();
    }
  });

  it("refuse un prospect sans identite de page de prix (deja publie) et un client engage (sans premier contact)", () => {
    expect(findTarifProspect("ancien-prospect", "1111111111111111")).toBeUndefined();
    expect(findTarifProspect("client-engage", "2222222222222222")).toBeUndefined();
  });
});

describe("resolveTarifTheme", () => {
  it("pose les douze variables CSS, la feuille de polices et la ligne du prospect", () => {
    const r = resolveTarifTheme(SAFE);
    expect(Object.keys(r.cssVars).sort()).toEqual(
      ["--accent", "--bg", "--border", "--font-body", "--font-title", "--ink", "--ink-sub", "--muted", "--on-accent", "--surface", "--surface-2", "--text"],
    );
    expect(r.cssVars["--accent"]).toBe("#94500c");
    expect(r.fontsUrl).toContain("fonts.googleapis.com");
    expect(r.tagline).toBe("Cours de guitare à Rezé");
  });

  it("theme absent : palette par defaut", () => {
    const r = resolveTarifTheme(undefined);
    expect(r.cssVars["--bg"]).toBe(DEFAULT_TARIF_THEME.bg);
    expect(r.tagline).toBeNull();
  });

  it.each([
    ["couleur non hexadecimale", { ...SAFE, accent: "red; background:url(//x)" }],
    ["couleur hex courte", { ...SAFE, bg: "#fff" }],
    ["injection dans une couleur", { ...SAFE, ink: "#112233}</style><script>alert(1)</script>" }],
    ["police avec point-virgule", { ...SAFE, fontTitle: "Arial; color:red" }],
    ["police avec parenthese", { ...SAFE, fontBody: "url(javascript:1)" }],
    ["feuille de polices hors Google Fonts", { ...SAFE, fontsUrl: "https://evil.example/x.css" }],
    ["feuille de polices en http", { ...SAFE, fontsUrl: "http://fonts.googleapis.com/css2?family=A" }],
    ["feuille de polices avec guillemet", { ...SAFE, fontsUrl: 'https://fonts.googleapis.com/css2?family=A"onload=1' }],
    ["ligne trop longue", { ...SAFE, tagline: "x".repeat(121) }],
  ])("valeur invalide (%s) : toute la palette par defaut, aucune valeur partielle", (_nom, theme) => {
    const r = resolveTarifTheme(theme);
    expect(r.cssVars["--accent"]).toBe(DEFAULT_TARIF_THEME.accent);
    expect(r.cssVars["--bg"]).toBe(DEFAULT_TARIF_THEME.bg);
    expect(r.fontsUrl).toBe(DEFAULT_TARIF_THEME.fontsUrl);
    expect(r.tagline).toBeNull();
  });

  it("ligne vide ou blanche : ignoree", () => {
    expect(resolveTarifTheme({ ...SAFE, tagline: "   " }).tagline).toBeNull();
  });

  it("sans feuille de polices : polices systeme, aucun lien", () => {
    const { fontsUrl: _omit, ...sansPolices } = SAFE;
    expect(resolveTarifTheme(sansPolices).fontsUrl).toBeNull();
  });
});
