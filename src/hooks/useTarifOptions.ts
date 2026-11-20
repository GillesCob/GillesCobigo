import { useState } from "react";
import { computePricing, type IPricingTotal } from "@/lib/boutiquesPricing";

export interface ITarifOptions extends IPricingTotal {
  withSubscription: boolean;
  withDomain: boolean;
  toggleDomain: (checked: boolean) => void;
  toggleSubscription: (checked: boolean) => void;
}

/** Options cochees de la page de prix : la Formule Sérénité et le nom de domaine seul s'excluent (la formule inclut le domaine). */
export function useTarifOptions(): ITarifOptions {
  const [withSubscription, setWithSubscription] = useState(false);
  const [withDomain, setWithDomain] = useState(false);
  return {
    withSubscription,
    withDomain,
    ...computePricing({ withSubscription, withDomain }),
    toggleDomain: (checked) => {
      setWithDomain(checked);
      if (checked) setWithSubscription(false);
    },
    toggleSubscription: (checked) => {
      setWithSubscription(checked);
      if (checked) setWithDomain(false);
    },
  };
}
