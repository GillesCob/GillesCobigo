import { useState } from "react";
import { computePricing, type IPricingTotal } from "@/lib/boutiquesPricing";

export interface ITarifOptions extends IPricingTotal {
  withSubscription: boolean;
  withDomain: boolean;
  toggleDomain: (checked: boolean) => void;
  toggleSubscription: (checked: boolean) => void;
}

/** Options cochees de la page de prix : la Formule Sérénité et le nom de domaine se cochent indépendamment et se cumulent. */
export function useTarifOptions(): ITarifOptions {
  const [withSubscription, setWithSubscription] = useState(false);
  const [withDomain, setWithDomain] = useState(false);
  return {
    withSubscription,
    withDomain,
    ...computePricing({ withSubscription, withDomain }),
    toggleDomain: setWithDomain,
    toggleSubscription: setWithSubscription,
  };
}
