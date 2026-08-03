import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PreviewRound from "./PreviewRound";

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
          proposals: [
            { label: "Proposition A", screenshot: "/s1.png", htmlPath: "/m1.html" },
            { label: "Proposition B", screenshot: "/s2.png", htmlPath: "/m2.html" },
          ],
          missingInfo: ["Le SIRET du client", "Validation du texte"],
        },
      ],
    },
    "empty-secret": {
      slug: "empty-project",
      projectName: "Projet Sans Manque",
      logo: "/logo.png",
      contactName: "Contact Test",
      currentRound: "V1",
      nextAction: "",
      feedbackFormId: "abc123",
      rounds: [
        {
          round: "V1",
          date: "1 janvier 2026",
          proposals: [{ label: "Proposition A", screenshot: "/s1.png", htmlPath: "/m1.html" }],
          missingInfo: [],
        },
      ],
    },
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/preview/:project/:secret/:round" element={<PreviewRound />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PreviewRound", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders NotFound for an unknown secret", () => {
    renderAt("/preview/test-project/wrong-secret/v1");
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders NotFound for an unknown round on a valid project", () => {
    renderAt("/preview/test-project/test-secret/v99");
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders every proposal with its open-in-new-tab link", () => {
    renderAt("/preview/test-project/test-secret/v1");
    expect(screen.getByText("Proposition A")).toBeInTheDocument();
    expect(screen.getByText("Proposition B")).toBeInTheDocument();
    const links = screen.getAllByRole("link", { name: /Ouvrir dans un nouvel onglet/i });
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "/m1.html");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("renders the missing info items in client-friendly language", () => {
    renderAt("/preview/test-project/test-secret/v1");
    expect(screen.getByText("Le SIRET du client")).toBeInTheDocument();
    expect(screen.getByText("Validation du texte")).toBeInTheDocument();
  });

  it("does not render the missing info card when there is nothing missing", () => {
    renderAt("/preview/empty-project/empty-secret/v1");
    expect(screen.queryByText("Ce qu'il me manque pour aller plus loin")).not.toBeInTheDocument();
  });

  it("shows a validation error when submitting an empty feedback message", async () => {
    const user = userEvent.setup();
    renderAt("/preview/test-project/test-secret/v1");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Champ obligatoire");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits the feedback and shows a confirmation on success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: true });
    const user = userEvent.setup();
    renderAt("/preview/test-project/test-secret/v1");

    await user.type(screen.getByPlaceholderText("Liste des éléments à ajouter/modifier/supprimer"), "Change le titre");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => expect(screen.getByText("Merci, c'est bien reçu.")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      "https://formspree.io/f/abc123",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
    expect(body).toMatchObject({
      message: "Change le titre",
      projet: "Projet Test",
      contact: "Contact Test",
      version: "V1",
    });
  });

  it("shows an error message when the feedback submission fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ ok: false });
    const user = userEvent.setup();
    renderAt("/preview/test-project/test-secret/v1");

    await user.type(screen.getByPlaceholderText("Liste des éléments à ajouter/modifier/supprimer"), "Change le titre");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(await screen.findByText(/Envoi échoué/)).toBeInTheDocument();
  });
});
