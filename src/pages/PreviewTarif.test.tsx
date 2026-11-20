import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("@/data/previewProjects", () => ({
  previewProjects: {
    "0123456789abcdef": {
      slug: "atelier-fictif", projectName: 'Atelier <b>"Fictif"</b>', logo: "/logo.png", contactName: "C", currentRound: "V1",
      feedbackFormId: "f", rounds: [], coldIntro: "Bonjour",
      tarifTheme: {
        bg: "#f4ecdc", surface: "#fbf6ea", surface2: "#ebe0c9", border: "#d3c5a8", text: "#1a2a30", muted: "#4f5f63",
        accent: "#94500c", onAccent: "#fffaf0", ink: "#10262f", inkSub: "#b0bcc0",
        fontTitle: '"Fraunces", Georgia, serif', fontBody: '"DM Sans", system-ui, sans-serif',
        fontsUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap",
        tagline: "Cave à vin à Dax",
      },
    },
  },
}));

import PreviewTarif from "./PreviewTarif";
import PreviewRound from "./PreviewRound";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/preview/:project/:secret/tarif" element={<PreviewTarif />} />
        <Route path="/preview/:project/:secret/:round" element={<PreviewRound />} />
      </Routes>
    </MemoryRouter>,
  );
}

const OK = "/preview/atelier-fictif/0123456789abcdef/tarif";

describe("PreviewTarif", () => {
  const fetchMock = vi.fn();
  const beacon = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    beacon.mockReset().mockReturnValue(true);
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(navigator, "sendBeacon", { value: beacon, configurable: true });
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("404 pour un secret inconnu, un slug qui ne correspond pas, une propriete heritee", () => {
    for (const path of [
      "/preview/atelier-fictif/ffffffffffffffff/tarif",
      "/preview/autre/0123456789abcdef/tarif",
      "/preview/atelier-fictif/constructor/tarif",
    ]) {
      const { unmount } = renderAt(path);
      expect(screen.getByText("404")).toBeInTheDocument();
      unmount();
    }
  });

  it("affiche le nom comme texte (jamais du HTML), la ligne du prospect, le forfait et le lien de retour vers la page d'entree", () => {
    renderAt(OK);
    expect(screen.getByText('Atelier <b>"Fictif"</b>')).toBeInTheDocument();
    expect(document.querySelector(".brand-name b")).toBeNull();
    expect(screen.getByText("Cave à vin à Dax")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Le tarif" })).toBeInTheDocument();
    expect(screen.getByText("500€", { selector: ".prix" })).toBeInTheDocument();
    const retour = screen.getByRole("link", { name: /Retour à vos deux propositions/ });
    expect(retour).toHaveAttribute("href", "/preview/atelier-fictif/0123456789abcdef");
    expect(retour).not.toHaveAttribute("target");
  });

  it("pose la palette du prospect en variables CSS et charge sa feuille de polices, noindex en tete", () => {
    const { container, unmount } = renderAt(OK);
    const racine = container.querySelector<HTMLElement>(".pt");
    expect(racine?.style.getPropertyValue("--accent")).toBe("#94500c");
    expect(document.head.querySelector('link[rel="stylesheet"][href^="https://fonts.googleapis.com/"]')).not.toBeNull();
    expect(document.head.querySelector('meta[name="robots"][content="noindex"]')).not.toBeNull();
    unmount();
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
    expect(document.head.querySelector('link[href^="https://fonts.googleapis.com/"]')).toBeNull();
  });

  it("suit l'arrivee sur la page (page-finale)", () => {
    renderAt(OK);
    expect(beacon).toHaveBeenCalledTimes(1);
    expect(beacon.mock.calls[0]?.[0]).toBe("https://boutiques-api.gillescobigo.com/track");
  });

  it("total : Sérénité 575, domaine seul 520, les deux options s'excluent", async () => {
    const user = userEvent.setup();
    renderAt(OK);
    const total = () => document.querySelector(".total .m")?.textContent;
    expect(total()).toBe("500€");
    const domaine = screen.getByRole("checkbox", { name: /^Nom de domaine, \+20€/ });
    const serenite = screen.getByRole("checkbox", { name: /^Formule Sérénité, \+75€/ });
    await user.click(domaine);
    expect(total()).toBe("520€");
    await user.click(serenite);
    expect(total()).toBe("575€");
    expect(domaine).not.toBeChecked();
    await user.click(domaine);
    expect(total()).toBe("520€");
    expect(serenite).not.toBeChecked();
  });

  it("une seule bulle d'information ouverte, fermee par un clic ailleurs", async () => {
    const user = userEvent.setup();
    renderAt(OK);
    await user.click(screen.getByRole("button", { name: "Comment ça se passe concrètement ?" }));
    expect(screen.getByText(/Par écrit, vous listez/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Qu'est-ce qu'un nom de domaine ?" }));
    expect(screen.queryByText(/Par écrit, vous listez/)).toBeNull();
    expect(screen.getByText(/Le nom de domaine correspond/)).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByText(/Le nom de domaine correspond/)).toBeNull();
  });

  it("« Besoin de plus d'infos ? » se replie et se deplie ; « Les plus » reste ouvert", async () => {
    const user = userEvent.setup();
    renderAt(OK);
    const infos = screen.getByRole("button", { name: /Besoin de plus d'infos/ });
    expect(infos).toHaveAttribute("aria-expanded", "false");
    await user.click(infos);
    expect(infos).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Suivre le parcours de création/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Les plus" })).toBeDisabled();
  });

  it("modale : Confirmer inactif tant que le champ est vide, un seul envoi avec le total, puis confirmation", async () => {
    const user = userEvent.setup();
    renderAt(OK);
    await user.click(screen.getByRole("checkbox", { name: /^Formule Sérénité, \+75€/ }));
    await user.click(screen.getByRole("button", { name: /Ça m'intéresse/ }));
    expect(beacon).toHaveBeenCalledTimes(2);
    const confirmer = screen.getByRole("button", { name: "Confirmer", hidden: true });
    expect(confirmer).toBeDisabled();
    await user.type(screen.getByLabelText("Votre numéro de téléphone", { exact: true }), "06 00 00 00 00");
    await user.click(confirmer);
    await waitFor(() => expect(screen.getByText("C'est noté !")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, { body: string }])[1].body) as Record<string, string>;
    expect(body.formule).toBe("575€ (avec Formule Sérénité)");
    expect(body.projet).toBe('Atelier <b>"Fictif"</b>');
  });

  it("modale : échec réseau signalé dans une alerte, lien « par mail » utilisable sans champ", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    const user = userEvent.setup();
    renderAt(OK);
    await user.click(screen.getByRole("button", { name: /Ça m'intéresse/ }));
    await user.click(screen.getByRole("button", { name: /Je préfère qu'on échange par mail/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Envoi échoué");
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, { body: string }])[1].body) as Record<string, string>;
    expect(body.contact).toBe("Préfère être contacté par mail");
  });
});
