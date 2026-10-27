import { afterEach, describe, expect, it, vi } from "vitest";
// Page du CV servie en statique (« Mon parcours »), lue en texte comme le .vcf.
import cvHtml from "../../../../public/cv/index.html?raw";

// Largeur de la feuille A4 à 96 dpi : 210 mm = 793,7 px, arrondie par offsetWidth.
const PAGE_WIDTH_PX = 794;
const PHONE_WIDTHS = [360, 390, 430];

const inlineScript = (() => {
  const match = cvHtml.match(/<script>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Script du CV introuvable");
  return match[1];
})();

// jsdom ne fait aucune mise en page : on fournit la largeur de la feuille et celle de l'écran,
// puis on exécute le vrai script de la page.
function loadCvAt(viewportWidth: number) {
  document.documentElement.removeAttribute("style");
  document.documentElement.className = "";
  document.body.innerHTML = '<div id="cadre"><main class="page" id="page"></main></div>';
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
    this: HTMLElement,
  ) {
    return this.id === "page" ? PAGE_WIDTH_PX : 0;
  });
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(viewportWidth);
  new Function(inlineScript)();
  const scale = Number(document.documentElement.style.getPropertyValue("--echelle"));
  return { scale, renderedWidth: PAGE_WIDTH_PX * scale };
}

afterEach(() => vi.restoreAllMocks());

describe("public/cv/index.html sur téléphone", () => {
  it.each(PHONE_WIDTHS)(
    "réduit la feuille A4 pour tenir dans un écran de %i px, sans défilement horizontal",
    (width) => {
      const { scale, renderedWidth } = loadCvAt(width);
      expect(scale).toBeGreaterThan(0);
      expect(scale).toBeLessThan(1);
      expect(renderedWidth).toBeLessThanOrEqual(width);
    },
  );

  it.each(PHONE_WIDTHS)("laisse une marge de chaque côté à %i px", (width) => {
    const { renderedWidth } = loadCvAt(width);
    expect(width - renderedWidth).toBeGreaterThanOrEqual(16);
  });

  it("n'agrandit jamais la feuille sur un grand écran", () => {
    expect(loadCvAt(1280).scale).toBe(1);
  });

  it("recalcule l'échelle à la rotation de l'écran", () => {
    loadCvAt(390);
    vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(844);
    window.dispatchEvent(new Event("resize"));
    expect(Number(document.documentElement.style.getPropertyValue("--echelle"))).toBe(1);
  });
});

describe("public/cv/index.html, feuille de style", () => {
  it("centre le cadre qui porte la largeur réduite", () => {
    expect(cvHtml).toMatch(/\.cadre\s*\{[^}]*margin:\s*0 auto/);
    expect(cvHtml).toMatch(/\.cadre\s*\{[^}]*width:\s*calc\(210mm \* var\(--echelle, 1\)\)/);
  });

  it("applique l'échelle à la feuille depuis son coin haut gauche", () => {
    expect(cvHtml).toMatch(/\.page\s*\{[^}]*transform-origin:\s*top left/);
    expect(cvHtml).toMatch(/\.page\s*\{[^}]*transform:\s*scale\(var\(--echelle, 1\)\)/);
  });

  it("garde le A4 exact à l'impression", () => {
    const print = cvHtml.match(/@media print\s*\{([\s\S]*?)\n    \}/)?.[1] ?? "";
    expect(print).toMatch(/\.cadre\s*\{[^}]*width:\s*auto/);
    expect(print).toMatch(/\.page\s*\{[^}]*transform:\s*none/);
  });

  it("coupe tout débordement horizontal sur html et body", () => {
    expect(cvHtml).toMatch(/html,\s*body\s*\{[^}]*overflow-x:\s*hidden/);
  });
});
