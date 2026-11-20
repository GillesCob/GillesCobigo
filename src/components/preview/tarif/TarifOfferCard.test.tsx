import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TarifOfferCard from "./TarifOfferCard";
import { computePricing } from "@/lib/boutiquesPricing";
import type { ITarifOptions } from "@/hooks/useTarifOptions";

function renderWith(withSubscription: boolean, withDomain: boolean): string[] {
  const options: ITarifOptions = {
    withSubscription,
    withDomain,
    ...computePricing({ withSubscription, withDomain }),
    toggleDomain: () => {},
    toggleSubscription: () => {},
  };
  const { container } = render(<TarifOfferCard options={options} onInterested={() => {}} />);
  return Array.from(container.querySelectorAll(".detail .n")).map((el) => el.textContent ?? "");
}

describe("TarifOfferCard, détail du total", () => {
  it("place le nom de domaine au-dessus de la Formule Sérénité quand les deux sont cochées", () => {
    expect(renderWith(true, true)).toEqual(["Création et mise en ligne du site", "Nom de domaine", "Formule Sérénité"]);
  });

  it("garde une seule ligne d'option quand une seule est cochée", () => {
    expect(renderWith(true, false)).toEqual(["Création et mise en ligne du site", "Formule Sérénité"]);
    expect(renderWith(false, true)).toEqual(["Création et mise en ligne du site", "Nom de domaine"]);
  });
});
