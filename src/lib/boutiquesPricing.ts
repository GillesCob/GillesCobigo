// Tarifs pilote Boutiques (cadres le 14/08, cf Projets/Boutiques/workflow-cc.md) : source unique des
// montants et de l'envoi Formspree, partagee par PricingCard.tsx (page d'accueil d'un prospect) et par
// la page de prix partagee PreviewTarif.tsx. Le forfait de base reste a prix fixe (il nomme une offre),
// le montant a payer est le total calcule ci-dessous. Aucun paiement reel : V1 statique.
export const BASE_PRICE = 500;
export const DOMAIN_PRICE_YEAR = 20;
export const ADHOC_MODIF_PRICE = 40;
export const SUBSCRIPTION_PRICE_YEAR = 75;
export const SUBSCRIPTION_INCLUDED_MODIFS = 2;

// Meme endpoint Formspree que Contact.tsx (pas de compte dedie pour l'instant) : le payload precise la
// source pour ne pas confondre un lead Boutiques avec un contact generique du portfolio.
export const FORMSPREE_ENDPOINT = "https://formspree.io/f/mykarjar";

export const CONTACT_ERROR_MESSAGE = "Envoi échoué, réessayez ou écrivez-moi directement.";

export interface IPricingSelection {
  withSubscription: boolean;
  withDomain: boolean;
}

export interface IPricingTotal {
  total: number;
  /** Le nom de domaine n'est facture que seul : la Formule Sérénité l'inclut deja. */
  domainActive: boolean;
}

export function computePricing({ withSubscription, withDomain }: IPricingSelection): IPricingTotal {
  const domainActive = withDomain && !withSubscription;
  const total = BASE_PRICE + (withSubscription ? SUBSCRIPTION_PRICE_YEAR : 0) + (domainActive ? DOMAIN_PRICE_YEAR : 0);
  return { total, domainActive };
}

export interface IContactRequest extends IPricingSelection {
  projectName: string;
  /** Canal de rappel saisi, ou texte de repli ("Préfère être contacté par mail"). */
  contact: string;
}

/** Envoie la demande de rappel. Renvoie true si Formspree a accepte, false sinon (reponse non ok ou erreur reseau). */
export async function sendContactRequest(req: IContactRequest): Promise<boolean> {
  const { total, domainActive } = computePricing(req);
  const formule = `${req.withSubscription ? "avec" : "sans"} Formule Sérénité${domainActive ? ", avec nom de domaine" : ""}`;
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        source: "Boutiques - PricingCard",
        projet: req.projectName,
        formule: `${total}€ (${formule})`,
        contact: req.contact || "Non précisé",
        message: `${req.projectName} est intéressé(e) par son site, première facture à ${total}€ (${formule}). Rappel : ${
          req.contact || "canal non précisé"
        }.`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
