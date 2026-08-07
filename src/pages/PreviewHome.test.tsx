import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PreviewHome from "./PreviewHome";

vi.mock("@/data/previewProjects", () => ({
  previewProjects: {
    "test-secret": {
      slug: "test-project",
      projectName: "Projet Test",
      logo: "/logo.png",
      contactName: "Contact Test",
      currentRound: "V1",
      nextAction: "En attente de retour du client",
      feedbackFormId: "abc123",
      rounds: [
        {
          round: "V1",
          date: "1 janvier 2026",
          proposals: [{ label: "Proposition 1", screenshot: "/s1.png", htmlPath: "/m1.html" }],
          missingInfo: ["Info manquante"],
        },
        {
          round: "V2",
          date: "2 janvier 2026",
          proposals: [
            { label: "Proposition 1", screenshot: "/s1.png", htmlPath: "/m1.html" },
            { label: "Proposition 2", screenshot: "/s2.png", htmlPath: "/m2.html" },
          ],
          missingInfo: [],
        },
      ],
    },
    "empty-secret": {
      slug: "empty-project",
      projectName: "Projet Sans Version",
      logo: "/logo.png",
      contactName: "Contact Test",
      currentRound: "",
      nextAction: "",
      feedbackFormId: "abc123",
      rounds: [],
    },
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/preview/:project/:secret" element={<PreviewHome />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PreviewHome", () => {
  it("renders NotFound for an unknown secret", () => {
    renderAt("/preview/test-project/wrong-secret");
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders the project name, contact and status for a valid secret", () => {
    renderAt("/preview/test-project/test-secret");
    expect(screen.getByText("Projet Test")).toBeInTheDocument();
    expect(screen.getByText("Suivi du projet avec Contact Test")).toBeInTheDocument();
    expect(screen.getByText("En attente de retour du client")).toBeInTheDocument();
  });

  it("shows only the most recent round, with a link to its detail page", () => {
    renderAt("/preview/test-project/test-secret");
    expect(screen.getByText("1 proposition à consulter")).toBeInTheDocument();
    expect(screen.queryByText("2 propositions à consulter")).not.toBeInTheDocument();

    const v1Link = screen.getByText("1 proposition à consulter").closest("a");
    expect(v1Link).toHaveAttribute("href", "/preview/test-project/test-secret/v1");
  });

  it("shows an empty-state message when the project has no round yet", () => {
    renderAt("/preview/empty-project/empty-secret");
    expect(screen.getByText("Aucune version disponible pour l'instant.")).toBeInTheDocument();
  });
});
