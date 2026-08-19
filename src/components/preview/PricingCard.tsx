import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Tarifs pilote Boutiques (cadres le 14/08, cf Projets/Boutiques/workflow-cc.md) : chiffres a
// ajuster une fois les premiers clients reels convertis, pas figes dans le marbre. La case a
// cocher ne declenche aucun achat (V1 statique, pas de paiement en ligne) : elle sert uniquement a
// comparer visuellement les deux scenarios avant contact.
// Volontairement condense (retex du 14/08 : premiere version jugee trop dense) : chaque idee tient
// en 1 ligne courte, le detail (variations possibles par version, devis sur mesure) part vers
// l'exemple concret plutot que d'etre explique en toutes lettres ici.
const BASE_PRICE = 500;
const DOMAIN_PRICE_YEAR = 20;
const ADHOC_MODIF_PRICE = 40;
const SUBSCRIPTION_PRICE_YEAR = 75;
const SUBSCRIPTION_MODIF_PRICE = 30;
const SUBSCRIPTION_INCLUDED_MODIFS = 2;
// Meme endpoint Formspree que Contact.tsx (pas de compte dedie a creer pour l'instant, cf
// "ne pas construire d'outil par anticipation" dans workflow-cc.md) : le payload precise
// explicitement la source pour ne pas confondre un lead Boutiques chaud avec un contact generique
// du portfolio dans la meme boite mail.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mykarjar";

export default function PricingCard({
  projectName,
  phone,
}: {
  projectName: string;
  phone?: string;
}) {
  const [withSubscription, setWithSubscription] = useState(false);
  // Non pertinente une fois l'abonnement coche (nom de domaine deja inclus dedans) : decochee
  // automatiquement au moment ou l'abonnement est coche, cf onChange ci-dessous.
  const [withDomain, setWithDomain] = useState(false);
  const domainActive = withDomain && !withSubscription;
  const total = BASE_PRICE + (withSubscription ? SUBSCRIPTION_PRICE_YEAR : 0) + (domainActive ? DOMAIN_PRICE_YEAR : 0);
  // Le clic sur "Ça m'intéresse" ouvre la modale mais n'envoie rien : on confirme d'abord le canal
  // de rappel dedans, un seul envoi Formspree au clic sur "Confirmer" (retex du 14/08 : 2 envois
  // separes, un a l'interet et un a la correction du numero, faisait doublon cote Gilles).
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactValue, setContactValue] = useState(phone ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Bulle info nom de domaine, fermeture au clic en dehors. Reproduit à la lettre
  // Projets/V1-Echanges/mockups/preview-prospect.html, seule référence de cette page (jamais
  // mélangée à tarif-pilote-badge.html, un prototype exploratoire distinct et non retenu ici).
  const [openPopover, setOpenPopover] = useState<"domain" | null>(null);

  useEffect(() => {
    if (!openPopover) return;
    function onDocClick() {
      setOpenPopover(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openPopover]);

  function openDialog() {
    setDialogOpen(true);
  }

  // overrideContact : utilise par le lien "Je préfère qu'on échange par mail" (cf mockup
  // preview-prospect.html), qui soumet sans attendre que l'utilisateur retape quoi que ce soit
  // dans le champ. setState etant asynchrone, passer la valeur directement evite de lire
  // contactValue perime dans la meme frappe.
  async function handleConfirm(overrideContact?: string) {
    const contact = overrideContact ?? contactValue;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          source: "Boutiques - PricingCard",
          projet: projectName,
          formule: `${total}€ (${withSubscription ? "avec" : "sans"} Formule Sérénité${
            domainActive ? ", avec nom de domaine" : ""
          })`,
          contact: contact || "Non précisé",
          message: `${projectName} est intéressé(e) par son site, première facture à ${total}€ (${
            withSubscription ? "avec" : "sans"
          } Formule Sérénité${domainActive ? ", avec nom de domaine" : ""}). Rappel : ${
            contact || "canal non précisé"
          }.`,
        }),
      });
      if (res.ok) {
        setConfirmed(true);
      } else {
        setSubmitError("Envoi échoué, réessayez ou écrivez-moi directement.");
      }
    } catch {
      setSubmitError("Envoi échoué, réessayez ou écrivez-moi directement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 max-w-md mx-auto text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Pour démarrer</p>
      <p className="text-3xl font-bold text-foreground mb-4">{total}€</p>

      <ul className="text-sm text-foreground space-y-2 mb-4">
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
          <span className="min-w-0">Votre site</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
          <span className="min-w-0">5 allers-retours (V1 à V6) pour affiner votre site avec vous</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
          <span className="min-w-0">Mise en ligne</span>
        </li>
        {withSubscription && (
          <>
            <li className="flex items-start gap-2 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span className="min-w-0">Nom de domaine</span>
            </li>
            <li className="flex items-start gap-2 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span className="min-w-0">{SUBSCRIPTION_INCLUDED_MODIFS} modifications valables 12 mois</span>
            </li>
            <li className="flex items-start gap-2 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
              <span className="min-w-0">Retours sous 48h ouvrées</span>
            </li>
          </>
        )}
        {domainActive && (
          <li className="flex items-start gap-2 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
            <span className="min-w-0">Nom de domaine</span>
          </li>
        )}
      </ul>

      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 mt-1">Options</p>

      <div className="relative mb-2">
        <label
          className={`flex items-start gap-3 rounded-xl border border-border p-3 pr-8 transition-colors ${
            withSubscription ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-foreground/30"
          }`}
        >
          <input
            type="checkbox"
            checked={withDomain}
            disabled={withSubscription}
            onChange={(e) => setWithDomain(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-input accent-foreground"
          />
          <span className="block text-sm text-foreground">
            <span className="font-medium">Nom de domaine, {withSubscription ? "inclus" : `+${DOMAIN_PRICE_YEAR}€`}</span>
            <span className="text-muted-foreground">
              {" "}
              : couvre la 1ère année.
            </span>
          </span>
        </label>
        {/* Bouton "i" hors du <label> (frere, pas descendant) : un clic dessus ne doit jamais
            cocher/decocher l'option, meme principe que preview-prospect.html (retour 17/08). */}
        <button
          type="button"
          aria-label="Qu'est-ce qu'un nom de domaine ?"
          onClick={(e) => {
            e.stopPropagation();
            setOpenPopover((p) => (p === "domain" ? null : "domain"));
          }}
          className={`absolute top-2.5 right-2.5 inline-flex items-center justify-center h-5 w-5 rounded-full border text-[11px] transition-colors ${
            openPopover === "domain"
              ? "border-foreground text-foreground"
              : "border-muted-foreground text-muted-foreground hover:text-foreground hover:border-foreground"
          }`}
        >
          ⓘ
        </button>
        {openPopover === "domain" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 rounded-lg bg-foreground/[0.06] border border-border p-2.5 text-xs leading-relaxed text-muted-foreground"
          >
            Le nom de domaine, c'est l'adresse de votre site (ex. gillescobigo.com). Il ne s'achète jamais une fois
            pour toutes : le paiement se renouvelle chaque année pour qu'il continue à rediriger vers votre site.
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-border p-3 mb-2 cursor-pointer hover:border-foreground/30 transition-colors">
        <input
          type="checkbox"
          checked={withSubscription}
          onChange={(e) => {
            setWithSubscription(e.target.checked);
            if (e.target.checked) setWithDomain(false);
          }}
          className="mt-0.5 h-4 w-4 rounded border-input accent-foreground"
        />
        <span className="block text-sm text-foreground">
          <span className="font-medium">Formule Sérénité, +{SUBSCRIPTION_PRICE_YEAR}€</span>
          <span className="text-muted-foreground">
            {" "}
            : inclut "Nom de domaine" ci-dessus, + {SUBSCRIPTION_INCLUDED_MODIFS} modifications, retours sous 48h
            ouvrées et tarif réduit sur les suivantes (valables 12 mois).
          </span>
        </span>
      </label>

      <p className="text-xs text-muted-foreground mb-2 mt-3.5 pt-3.5 border-t border-border">
        Au-delà de la V6 (V7, V8...) ou pour toute modification après mise en ligne :{" "}
        {withSubscription ? SUBSCRIPTION_MODIF_PRICE : ADHOC_MODIF_PRICE}€.
      </p>

      <p className="text-xs text-muted-foreground mt-4 mb-2">
        Évolution plus importante (plusieurs pages, boutique en ligne...) : devis à part.
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        Vous n'avez rien à gérer techniquement, je m'occupe de tout : le site vous appartient entièrement, export
        du code fourni dès la mise en ligne, aucun verrouillage.
      </p>
      <p className="text-xs text-muted-foreground mb-5">
        <Link to="/cgv-boutiques" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Voir les conditions générales complètes
        </Link>
      </p>

      <Button size="lg" className="w-full rounded-full" onClick={openDialog}>
        Ça m'intéresse, on en parle <ArrowRight size={16} />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Centrage vertical (et repositionnement au-dessus du clavier mobile) gere par
            DialogContent lui-meme (dialog.tsx, resynchronise sur window.visualViewport). */}
        <DialogContent className="max-w-sm text-center">
          {confirmed ? (
            <DialogHeader className="items-center">
              <CheckCircle2 className="text-emerald-500 mb-2" size={40} />
              <DialogTitle className="text-xl">C'est noté !</DialogTitle>
              <DialogDescription className="text-base text-foreground">
                Je reviens vers vous rapidement !
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader className="items-center">
                <DialogTitle className="text-xl">Comment vous joindre ?</DialogTitle>
                <DialogDescription>Je vous recontacte au numéro indiqué.</DialogDescription>
              </DialogHeader>

              <div className="text-left">
                <input
                  type="text"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="Votre numéro de téléphone"
                  // text-base (16px) et non text-sm (14px) : sous 16px, Safari iOS zoome automatiquement
                  // la page au focus du champ, zoom qui persiste ensuite meme la modale fermee (scroll
                  // horizontal constate le 15/08). 16px est le seuil qui desactive ce comportement.
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Desactive tant que le champ est vide (19/08, item 23) : ne bloque jamais le lien
                  "echanger par mail" ci-dessous, qui exprime deja a lui seul une preference de
                  contact sans avoir besoin du champ rempli. */}
              <Button
                className="w-full rounded-full"
                onClick={() => handleConfirm()}
                disabled={submitting || contactValue.trim() === ""}
              >
                {submitting ? "Envoi..." : "Confirmer"}
              </Button>
              <button
                type="button"
                onClick={() => handleConfirm("Préfère être contacté par mail")}
                className="block w-full text-center text-xs text-muted-foreground underline mt-3"
              >
                Je préfère qu'on échange par mail →
              </button>
              <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                Aucune sollicitation commerciale, seulement pour donner suite à votre demande.
              </p>
              {submitError && (
                <p className="text-xs text-destructive text-center mt-2" role="alert">
                  {submitError}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
