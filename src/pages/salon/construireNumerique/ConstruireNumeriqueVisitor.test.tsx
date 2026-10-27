import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConstruireNumeriqueVisitor from "./ConstruireNumeriqueVisitor";

// jsdom n'a pas matchMedia, lu par useBackgroundParallax de la coque SalonScreen.
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.head.innerHTML = "";
});

const heading = (name: string) => screen.getByRole("heading", { level: 2, name });

describe("ConstruireNumeriqueVisitor", () => {
  it("range les blocs dans l'ordre Ouvra, coordonnées, puis le reste", () => {
    render(<ConstruireNumeriqueVisitor />);
    const ouvra = heading("Ouvra");
    const contact = heading("Mes coordonnées");
    const more = heading("Pour aller plus loin");
    expect(ouvra.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(contact.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("ouvre Ouvra dans un nouvel onglet depuis le bouton « Tester Ouvra »", () => {
    render(<ConstruireNumeriqueVisitor />);
    const link = screen.getByRole("link", { name: /Tester Ouvra/ });
    expect(link).toHaveAttribute("href", "https://ouvra.gillescobigo.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("présente Ouvra avec son logo, son accroche et sa description", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    expect(screen.getByText("Mon démonstrateur BIM")).toBeInTheDocument();
    expect(screen.getByText(/Visionneuse 3D et détection de collisions/)).toBeInTheDocument();
    expect(container.querySelector('.ouvra-card img[src="/images/app-ouvra.png"]')).not.toBeNull();
  });

  it("propose la fiche contact statique en téléchargement", () => {
    render(<ConstruireNumeriqueVisitor />);
    const link = screen.getByRole("link", { name: /Ajouter à mes contacts/ });
    expect(link).toHaveAttribute("href", "/gilles-cobigo.vcf");
    expect(link).toHaveAttribute("download", "gilles-cobigo.vcf");
  });

  it("passe le bouton en « Fiche contact prête » au clic, puis le remet à l'état initial après 4 s", () => {
    vi.useFakeTimers();
    render(<ConstruireNumeriqueVisitor />);
    const link = screen.getByRole("link", { name: /Ajouter à mes contacts/ });
    expect(link).not.toHaveAttribute("data-state");
    // jsdom ne sait pas naviguer : le téléchargement réel est hors de portée de ce test.
    link.addEventListener("click", (event) => event.preventDefault());

    fireEvent.click(link);
    expect(link).toHaveAttribute("data-state", "done");
    expect(link).toHaveTextContent("Fiche contact prête");
    expect(screen.getByText("Fiche contact gilles-cobigo.vcf téléchargée.")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(link).not.toHaveAttribute("data-state");
    expect(link).toHaveTextContent("Ajouter à mes contacts");
  });

  it("affiche en permanence le texte de repli avec le numéro", () => {
    render(<ConstruireNumeriqueVisitor />);
    expect(screen.getByText(/Si le fichier ne s'ouvre pas, copiez le numéro/)).toBeVisible();
    expect(screen.getByText("06 79 62 94 60", { selector: ".phone-number" })).toBeVisible();
  });

  it("copie le numéro dans le presse-papiers et le confirme", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    render(<ConstruireNumeriqueVisitor />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copier le numéro" }));
    });
    expect(writeText).toHaveBeenCalledWith("06 79 62 94 60");
    expect(screen.getByRole("status")).toHaveTextContent("Numéro copié.");
    expect(screen.getByRole("button", { name: "Copié" })).toBeInTheDocument();
  });

  it("indique comment copier à la main quand le presse-papiers est refusé ou absent", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("refusé"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const { unmount } = render(<ConstruireNumeriqueVisitor />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copier le numéro" }));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/Copie impossible/);
    unmount();

    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    render(<ConstruireNumeriqueVisitor />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copier le numéro" }));
    });
    expect(screen.getByRole("status")).toHaveTextContent(/Copie impossible/);
  });

  it("garde un statut de copie vide tant qu'on n'a pas copié", () => {
    render(<ConstruireNumeriqueVisitor />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("expose appel, mail et LinkedIn", () => {
    render(<ConstruireNumeriqueVisitor />);
    expect(screen.getByRole("link", { name: /M'appeler/ })).toHaveAttribute("href", "tel:+33679629460");
    expect(screen.getByRole("link", { name: /M'écrire/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:contact@gillescobigo\.com/),
    );
    expect(screen.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/gillescobigo",
    );
  });

  it("regroupe Cerithe, le CV, le rendez-vous et le portfolio sous « Pour aller plus loin »", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const more = heading("Pour aller plus loin").closest("section") as HTMLElement;
    expect(within(more).getByRole("link", { name: /Cerithe/ })).toHaveAttribute("href", "https://cerithe.gillescobigo.com");
    expect(within(more).getByRole("link", { name: /Mon CV/ })).toHaveAttribute("href", expect.stringMatching(/\.pdf$/));
    expect(within(more).getByRole("link", { name: /Prendre rendez-vous/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/cal\.com\/gillescobigo\/echange/),
    );
    expect(container.querySelector('footer a[href="https://gillescobigo.com"]')).not.toBeNull();
  });

  it("n'affiche plus le bloc IA, les offres ni la phrase non sourcée sur l'usage de l'IA", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/L'IA appliquée au BIM/);
    expect(text).not.toMatch(/Ce que je peux faire pour vous/);
    expect(text).not.toMatch(/au quotidien/);
    expect(text).not.toMatch(/règles de collision en français/i);
  });

  it("annonce « 10 ans dans le BTP dont 5 ans de BIM », jamais « 10 ans BIM »", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const text = container.textContent ?? "";
    expect(text).toContain("10 ans dans le BTP dont 5 ans de BIM");
    expect(text).not.toMatch(/10 ans (de |en )?BIM/);
  });

  it("ouvre en nouvel onglet, avec noopener, tout lien vers un autre site", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const external = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
    expect(external.length).toBeGreaterThanOrEqual(6);
    external.forEach((anchor) => {
      expect(anchor).toHaveAttribute("target", "_blank");
      expect(anchor.getAttribute("rel")).toContain("noopener");
    });
  });

  it("pose le logo GC comme icône d'onglet", () => {
    render(<ConstruireNumeriqueVisitor />);
    expect(document.head.querySelector('link[rel="icon"]')).toHaveAttribute("href", "/images/favicon.png");
  });
});
