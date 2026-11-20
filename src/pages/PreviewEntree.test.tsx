import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/data/previewProjects", () => ({
  previewProjects: {
    "0123456789abcdef": {
      slug: "atelier-fictif", projectName: 'Atelier <b>"Fictif"</b>', logo: "/preview/atelier-fictif/0123456789abcdef/V1/logo.png", contactName: "C",
      currentRound: "V1", feedbackFormId: "f", rounds: [], coldIntro: "Bonjour",
      tarifTheme: {
        bg: "#f4ecdc", surface: "#fbf6ea", surface2: "#ebe0c9", border: "#d3c5a8", text: "#1a2a30", muted: "#4f5f63",
        accent: "#94500c", onAccent: "#fffaf0", ink: "#10262f", inkSub: "#b0bcc0",
        fontTitle: '"Fraunces", Georgia, serif', fontBody: '"DM Sans", system-ui, sans-serif',
        fontsUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
        tagline: "Cave à vin à Dax",
      },
    },
    "aaaaaaaaaaaaaaaa": {
      slug: "sans-identite", projectName: "Sans identité", logo: "/images/logo-gc-white.png", contactName: "C",
      currentRound: "V1", feedbackFormId: "f", rounds: [], coldIntro: "Bonjour",
    },
  },
}));

import PreviewHome from "./PreviewHome";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/preview/:project/:secret" element={<PreviewHome />} />
      </Routes>
    </MemoryRouter>,
  );
}

const OK = "/preview/atelier-fictif/0123456789abcdef";

describe("PreviewEntree (racine /preview/<slug>/<secret>)", () => {
  it("affiche la page d'entree partagee : nom en texte, ligne de metier, deux propositions, logo du prospect", () => {
    renderAt(OK);
    expect(screen.getByText('Atelier <b>"Fictif"</b>')).toBeInTheDocument();
    expect(document.querySelector(".brand-name b")).toBeNull();
    expect(screen.getByText("Cave à vin à Dax")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Deux points de départ pour votre site" })).toBeInTheDocument();
    expect(document.querySelector(".brand-mark")).toHaveAttribute("src", "/preview/atelier-fictif/0123456789abcdef/V1/logo.png");
    for (const n of [1, 2]) {
      const url = `/preview/atelier-fictif/0123456789abcdef/V1/P${n}/`;
      const lien = screen.getByRole("link", { name: `Ouvrir la proposition ${n}` });
      expect(lien).toHaveAttribute("href", url);
      expect(lien).toHaveAttribute("target", "_blank");
      expect(document.querySelector(`iframe[src="${url}"]`)).not.toBeNull();
    }
  });

  it("le bouton « Voir le tarif » mene a la page de prix partagee dans le meme onglet", () => {
    renderAt(OK);
    const tarif = screen.getByRole("link", { name: "Voir le tarif" });
    expect(tarif).toHaveAttribute("href", "/preview/atelier-fictif/0123456789abcdef/tarif");
    expect(tarif).not.toHaveAttribute("target");
  });

  it("porte la palette du prospect en variables CSS, le pied de page officiel et un noindex", () => {
    renderAt(OK);
    const racine = document.querySelector<HTMLElement>(".pe");
    expect(racine?.style.getPropertyValue("--accent")).toBe("#94500c");
    expect(screen.getByRole("link", { name: "LinkedIn de Gilles Cobigo" })).toBeInTheDocument();
    expect(document.querySelector('.credit img[src="/images/logo-gc-black.png"]')).not.toBeNull();
    expect(document.head.querySelector('meta[name="robots"][content="noindex"]')).not.toBeNull();
  });

  it("garde la page historique pour une entree sans identite de page partagee", () => {
    renderAt("/preview/sans-identite/aaaaaaaaaaaaaaaa");
    expect(document.querySelector(".pe")).toBeNull();
  });

  it("garde la page historique quand le slug ne correspond pas a l'entree partagee", () => {
    renderAt("/preview/autre/0123456789abcdef");
    expect(document.querySelector(".pe")).toBeNull();
  });
});
