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

  it("dessine un trait par arête, dont deux en couleur d'accent", () => {
    const strokes = buildStrokes();
    const { container } = render(<WireframeBuilding />);
    expect(container.querySelectorAll("path.wire-line")).toHaveLength(
      strokes.length,
    );
    expect(container.querySelectorAll("path.wire-accent")).toHaveLength(2);
  });

  it("ne produit aucune coordonnée invalide", () => {
    expect(buildStrokes().every(({ d }) => !d.includes("NaN"))).toBe(true);
  });
});
