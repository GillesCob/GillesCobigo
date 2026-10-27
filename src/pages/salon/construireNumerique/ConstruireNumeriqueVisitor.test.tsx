import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConstruireNumeriqueVisitor from "./ConstruireNumeriqueVisitor";

// jsdom n'a pas matchMedia, lu par useBackgroundParallax de la coque SalonScreen.
beforeEach(() => {
  window.matchMedia = vi
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.head.innerHTML = "";
});

const heading = (name: string) =>
  screen.getByRole("heading", { level: 2, name });

describe("ConstruireNumeriqueVisitor", () => {
  it("range les blocs dans l'ordre Ouvra, coordonnées, puis le reste", () => {
    render(<ConstruireNumeriqueVisitor />);
    const ouvra = heading("Ouvra");
    const contact = heading("Mes coordonnées");
    const more = heading("Pour aller plus loin");
    expect(
      ouvra.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      contact.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
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
    expect(
      screen.getByText(/Visionneuse 3D, collisions, discussions/),
    ).toBeInTheDocument();
    expect(
      container.querySelector('.ouvra-card img[src="/images/app-ouvra.png"]'),
    ).not.toBeNull();
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
    expect(
      screen.getByText("Fiche contact gilles-cobigo.vcf téléchargée."),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(link).not.toHaveAttribute("data-state");
    expect(link).toHaveTextContent("Ajouter à mes contacts");
  });

  it("expose appel, mail et LinkedIn", () => {
    render(<ConstruireNumeriqueVisitor />);
    expect(screen.getByRole("link", { name: /M'appeler/ })).toHaveAttribute(
      "href",
      "tel:+33679629460",
    );
    expect(screen.getByRole("link", { name: /M'écrire/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:contact@gillescobigo\.com/),
    );
    expect(screen.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/gillescobigo",
    );
  });

  it("regroupe le CV, le rendez-vous et le portfolio sous « Pour aller plus loin », sans Cerithe", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const more = heading("Pour aller plus loin").closest(
      "section",
    ) as HTMLElement;
    expect(within(more).queryByRole("link", { name: /Cerithe/ })).toBeNull();
    const cv = within(more).getByRole("link", { name: /Mon CV/ });
    expect(cv).toHaveAttribute("href", "/cv-gilles-cobigo.pdf");
    expect(cv).toHaveAttribute("download");
    expect(
      within(more).getByRole("link", { name: /Prendre rendez-vous/ }),
    ).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/cal\.com\/gillescobigo\/echange/),
    );
    expect(
      container.querySelector('footer a[href="https://gillescobigo.com"]'),
    ).not.toBeNull();
  });

  it("n'affiche plus le bloc IA, les offres ni la phrase non sourcée sur l'usage de l'IA", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/L'IA appliquée au BIM/);
    expect(text).not.toMatch(/Ce que je peux faire pour vous/);
    expect(text).not.toMatch(/au quotidien/);
    expect(text).not.toMatch(/règles de collision en français/i);
  });

  it("n'annonce jamais « 10 ans BIM »", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/10 ans (de |en )?BIM/);
  });

  it("ouvre en nouvel onglet, avec noopener, tout lien vers un autre site", () => {
    const { container } = render(<ConstruireNumeriqueVisitor />);
    const external = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'),
    );
    expect(external.length).toBeGreaterThanOrEqual(5);
    external.forEach((anchor) => {
      expect(anchor).toHaveAttribute("target", "_blank");
      expect(anchor.getAttribute("rel")).toContain("noopener");
    });
  });

  it("pose le logo GC comme icône d'onglet", () => {
    render(<ConstruireNumeriqueVisitor />);
    expect(document.head.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      "/images/favicon.png",
    );
  });
});
