// @vitest-environment node
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/** Hook versionne du depot, execute par git dans un depot temporaire (aucun commit dans ce depot-ci). */
const DOSSIER_HOOKS = fileURLToPath(new URL("../../.githooks", import.meta.url));
const ENTREES = "src/data/previewProjects.ts";
const APERCU = "public/preview/boulangerie-du-port/0123456789abcdef";

let depot = "";

/** Environnement sans MOCKUP_DIFF_CHECKED (sauf si le test le pose) et sans configuration git globale. */
function env(supplement: Record<string, string> = {}): NodeJS.ProcessEnv {
  const e: NodeJS.ProcessEnv = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", ...supplement };
  if (supplement.MOCKUP_DIFF_CHECKED === undefined) delete e.MOCKUP_DIFF_CHECKED;
  return e;
}

function git(args: string[]): string {
  return execFileSync("git", args, { cwd: depot, env: env(), encoding: "utf8" });
}

function ecrire(chemin: string, contenu = "x\n"): void {
  const complet = join(depot, chemin);
  mkdirSync(dirname(complet), { recursive: true });
  writeFileSync(complet, contenu);
}

/** Indexe les chemins donnes puis tente le commit : 0 si accepte, 1 si le hook a bloque (message BLOQUE), sinon leve. */
function commit(chemins: string[], supplement: Record<string, string> = {}): number {
  git(["add", "-A", "--", ...chemins]);
  const r = spawnSync("git", ["commit", "-q", "-m", "essai"], { cwd: depot, env: env(supplement), encoding: "utf8" });
  if (r.status === 0) return 0;
  if (r.status === 1 && `${r.stdout}${r.stderr}`.includes("BLOQUE")) return 1;
  throw new Error(`commit en echec sans blocage du hook : ${r.stdout}${r.stderr}`);
}

beforeEach(() => {
  depot = mkdtempSync(join(tmpdir(), "hook-pre-commit-"));
  git(["init", "-q"]);
  git(["config", "user.name", "Essai"]);
  git(["config", "user.email", "essai@example.invalid"]);
  git(["config", "commit.gpgsign", "false"]);
  git(["config", "core.hooksPath", DOSSIER_HOOKS]);
  ecrire(ENTREES, "export const previewProjects = {\n};\n");
  ecrire("src/lib/utils.ts");
  ecrire("public/preview/cave-velours/fedcba9876543210/V1/P1/index.html");
  expect(commit([ENTREES, "src/lib/utils.ts", "public/preview"], { MOCKUP_DIFF_CHECKED: "1" })).toBe(0);
});

afterEach(() => {
  rmSync(depot, { recursive: true, force: true });
});

describe("hook pre-commit : apercus generes par la chaine de nuit Sites", () => {
  it("accepte sans la variable un commit d'apercus generes seuls et de leur entree", () => {
    ecrire(`${APERCU}/V1/P1/index.html`);
    ecrire(`${APERCU}/V1/P2/index.html`);
    ecrire(`${APERCU}/V1/logo.png`);
    ecrire(ENTREES, "export const previewProjects = {\n  a: 1,\n};\n");
    expect(commit([APERCU, ENTREES])).toBe(0);
  });

  it("refuse sans la variable un apercu genere accompagne d'un fichier de src/", () => {
    ecrire(`${APERCU}/V1/P1/index.html`);
    ecrire("src/lib/utils.ts", "y\n");
    expect(commit([APERCU, "src/lib/utils.ts"])).toBe(1);
  });

  it("refuse sans la variable un apercu genere accompagne d'un fichier du funnel", () => {
    ecrire(`${APERCU}/V1/P1/index.html`);
    ecrire("src/components/preview/PreviewEntree.tsx");
    expect(commit([APERCU, "src/components/preview/PreviewEntree.tsx"])).toBe(1);
  });

  it("accepte le melange avec la variable posee", () => {
    ecrire(`${APERCU}/V1/P1/index.html`);
    ecrire("src/lib/utils.ts", "y\n");
    expect(commit([APERCU, "src/lib/utils.ts"], { MOCKUP_DIFF_CHECKED: "1" })).toBe(0);
  });

  it("refuse un secret trop court", () => {
    const chemin = "public/preview/boulangerie-du-port/0123456789abcde/V1/P1/index.html";
    ecrire(chemin);
    expect(commit([chemin])).toBe(1);
  });

  it("refuse un secret qui n'est pas en hexadecimal minuscule", () => {
    const chemin = "public/preview/boulangerie-du-port/0123456789ABCDEF/V1/P1/index.html";
    ecrire(chemin);
    expect(commit([chemin])).toBe(1);
  });

  it("refuse un dossier hors slug (banque d'images, majuscules, fichier a la racine du slug)", () => {
    for (const chemin of [
      "public/preview/_stock/0123456789abcdef/photo.jpg",
      "public/preview/Boulangerie/0123456789abcdef/V1/P1/index.html",
      "public/preview/boulangerie-du-port/index.html",
    ]) {
      ecrire(chemin);
      expect(commit([chemin]), chemin).toBe(1);
      git(["reset", "-q"]);
    }
  });

  it("refuse la modification d'un apercu deja publie (versions envoyees gelees)", () => {
    const chemin = "public/preview/cave-velours/fedcba9876543210/V1/P1/index.html";
    ecrire(chemin, "modifie\n");
    expect(commit([chemin])).toBe(1);
  });

  it("refuse la suppression d'un apercu deja publie", () => {
    rmSync(join(depot, "public/preview/cave-velours"), { recursive: true });
    expect(commit(["public/preview"])).toBe(1);
  });

  it("refuse un lien symbolique ajoute sous un apercu genere", () => {
    ecrire(`${APERCU}/V1/P1/index.html`);
    symlinkSync("/etc/hosts", join(depot, APERCU, "V1", "lien"));
    expect(commit([APERCU])).toBe(1);
  });

  it("laisse passer un commit hors funnel sans la variable", () => {
    ecrire("src/lib/utils.ts", "z\n");
    expect(commit(["src/lib/utils.ts"])).toBe(0);
  });
});
