import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PreviewVersionsNav from "./PreviewVersionsNav";

const rounds = [
  { round: "V1", date: "1 janvier 2026" },
  { round: "V2", date: "2 janvier 2026" },
];

describe("PreviewVersionsNav", () => {
  it("renders a link for every round pointing to the right URL", () => {
    render(
      <MemoryRouter>
        <PreviewVersionsNav slug="test-project" secret="test-secret" currentRound="V1" rounds={rounds} />
      </MemoryRouter>,
    );
    const v1Links = screen.getAllByRole("link", { name: "V1" });
    const v2Links = screen.getAllByRole("link", { name: "V2" });
    expect(v1Links.length).toBeGreaterThan(0);
    expect(v2Links.length).toBeGreaterThan(0);
    v1Links.forEach((link) => expect(link).toHaveAttribute("href", "/preview/test-project/test-secret/v1"));
    v2Links.forEach((link) => expect(link).toHaveAttribute("href", "/preview/test-project/test-secret/v2"));
  });

  it("marks the current round as active and not the others", () => {
    render(
      <MemoryRouter>
        <PreviewVersionsNav slug="test-project" secret="test-secret" currentRound="V2" rounds={rounds} />
      </MemoryRouter>,
    );
    const v2Links = screen.getAllByRole("link", { name: "V2" });
    const v1Links = screen.getAllByRole("link", { name: "V1" });
    expect(v2Links[0].className).toContain("font-semibold");
    expect(v1Links[0].className).not.toContain("font-semibold");
  });
});
