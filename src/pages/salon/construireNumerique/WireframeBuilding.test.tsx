import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WireframeBuilding, { buildStrokes } from "./WireframeBuilding";

describe("WireframeBuilding", () => {
  it("est un décor caché des lecteurs d'écran", () => {
    const { container } = render(<WireframeBuilding />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("dessine un trait par arête, sans élément d'accent ni cercle", () => {
    const strokes = buildStrokes();
    const { container } = render(<WireframeBuilding />);
    expect(container.querySelectorAll("path.wire-line")).toHaveLength(
      strokes.length,
    );
    expect(container.querySelector(".wire-accent, .wire-ring")).toBeNull();
    expect(
      container.querySelectorAll("path.wire-glass").length,
    ).toBeGreaterThan(30);
  });

  it("ne produit aucune coordonnée invalide", () => {
    expect(buildStrokes().every(({ d }) => !d.includes("NaN"))).toBe(true);
  });
});
