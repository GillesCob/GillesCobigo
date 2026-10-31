// Phrase d'introduction du mode Dev (31/10, choix de Gilles) : elle dit ce qu'il construit en dev, sans les années dans le bâtiment (portées par le mode Bâtiment).
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const source = readFileSync(path.resolve(__dirname, "NewHome.tsx"), "utf8").replace(/\s+/g, " ");

describe("introduction du mode Dev", () => {
  it("décrit les applications web et la stack, sans limiter au bâtiment", () => {
    expect(source).toContain("Je construis des applications web de bout en bout : TypeScript, Node.js, React, Prisma.");
    expect(source).toContain("Des outils pour le bâtiment comme pour mon propre usage, toujours partis d'un vrai besoin.");
    expect(source).toContain("Venu du bâtiment, une reconversion qui n'en est pas une.");
  });

  it("n'a plus les 10 ans dans le bâtiment ni Monaco côté Dev (le mode Bâtiment les garde)", () => {
    expect(source).not.toContain("10 ans dans le bâtiment avant ça");
    expect(source).toContain("10 ans dans le bâtiment chez Bouygues Construction");
  });
});
