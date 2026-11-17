import { describe, it, expect } from "vitest";
import { previewProjects } from "./previewProjects";

describe("previewProjects", () => {
  const entries = Object.entries(previewProjects);

  it("has at least one project", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("project %s has all required fields non-empty", (_secret, project) => {
    expect(project.slug).toBeTruthy();
    expect(project.projectName).toBeTruthy();
    expect(project.logo).toBeTruthy();
    expect(project.contactName).toBeTruthy();
    expect(project.currentRound).toBeTruthy();
    // nextAction est optionnel (pas de pastille), mais jamais une chaîne vide
    expect(project.nextAction ?? "ok").toBeTruthy();
    expect(project.feedbackFormId).toBeTruthy();
    expect(project.rounds.length).toBeGreaterThan(0);
  });

  it.each(entries)("project %s currentRound matches an existing round", (_secret, project) => {
    const roundLabels = project.rounds.map((r) => r.round);
    expect(roundLabels).toContain(project.currentRound);
  });

  it.each(entries)("project %s every round has at least one proposal", (_secret, project) => {
    project.rounds.forEach((round) => {
      expect(round.proposals.length).toBeGreaterThan(0);
      round.proposals.forEach((p) => {
        expect(p.label).toBeTruthy();
        expect(p.screenshot).toBeTruthy();
        expect(p.htmlPath).toBeTruthy();
      });
    });
  });

  it.each(entries)("project %s round labels are unique", (_secret, project) => {
    const labels = project.rounds.map((r) => r.round.toLowerCase());
    expect(new Set(labels).size).toBe(labels.length);
  });

  it.each(entries)("project %s optional defaultTheme and roundInfo are valid when present", (_secret, project) => {
    expect(["dark", "light", undefined]).toContain(project.defaultTheme);
    project.rounds.forEach((round) => {
      expect(round.roundInfo ?? "ok").toBeTruthy();
    });
  });

  it("only Philippe André defaults to dark", () => {
    const dark = entries.filter(([, p]) => p.defaultTheme === "dark").map(([, p]) => p.slug);
    expect(dark).toEqual(["cours-guitare-philippe-andre"]);
  });
});
