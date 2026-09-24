import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import ModeToggle from "./ModeToggle";

// jsdom ne calcule aucune mise en page (offsetWidth/offsetLeft toujours 0, pas de ResizeObserver
// natif) : on simule la géométrie des deux boutons et on déclenche nous-mêmes les callbacks
// ResizeObserver pour reproduire le scénario du bug.
type RoCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;
const observers: { cb: RoCallback; targets: Element[] }[] = [];

class FakeResizeObserver {
  private entry: { cb: RoCallback; targets: Element[] };
  constructor(cb: RoCallback) {
    this.entry = { cb, targets: [] };
    observers.push(this.entry);
  }
  observe(target: Element): void {
    this.entry.targets.push(target);
  }
  unobserve(): void {}
  disconnect(): void {
    this.entry.targets = [];
  }
}

function setGeometry(el: HTMLElement, width: number, left: number): void {
  Object.defineProperty(el, "offsetWidth", { configurable: true, value: width });
  Object.defineProperty(el, "offsetLeft", { configurable: true, value: left });
}

function fireResize(target: Element): void {
  observers
    .filter((o) => o.targets.includes(target))
    .forEach((o) => o.cb([], {} as ResizeObserver));
}

describe("ModeToggle", () => {
  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    MotionGlobalConfig.skipAnimations = true;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    MotionGlobalConfig.skipAnimations = false;
  });

  // Bug du 24/09 (iPhone, rechargement en mode Bâtiment) : la pastille était mesurée au montage,
  // avant le chargement du logo de la topbar. Le logo, une fois chargé, élargit le bloc marque, le
  // switch se resserre et "Mode Bâtiment" change de largeur/position, sans que la pastille suive
  // (seul un `resize` de fenêtre la re-mesurait).
  it("re-mesure la pastille quand le bouton actif change de taille sans resize de fenêtre", async () => {
    const { container } = render(<ModeToggle mode="btp" onChange={() => {}} />);
    const btp = screen.getByRole("button", { name: "Mode Bâtiment" });
    const thumb = container.querySelector(".mp-switch-thumb") as HTMLElement;

    // Géométrie finale après chargement du logo (bouton resserré, décalé à gauche).
    setGeometry(btp, 99, 86);
    act(() => fireResize(btp));

    await waitFor(() => {
      expect(thumb.style.width).toBe("99px");
      expect(thumb.style.transform).toContain("translateX(86px)");
    });
  });
});
