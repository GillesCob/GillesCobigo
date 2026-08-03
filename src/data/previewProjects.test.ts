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
    expect(project.nextAction).toBeTruthy();
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
});
