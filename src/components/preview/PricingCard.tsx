import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { trackFunnelBeacon } from "@/lib/funnelTracking";

// Tarifs pilote Boutiques (cadres le 14/08, cf Projets/Boutiques/workflow-cc.md) : chiffres a
// ajuster une fois les premiers clients reels convertis, pas figes dans le marbre. La case a
// cocher ne declenche aucun achat (V1 statique, pas de paiement en ligne) : elle sert uniquement a
// comparer visuellement les deux scenarios avant contact.
// Structure alignee a la lettre sur Projets/V1-Echanges/mockups/preview-prospect.html (variante
// A5, tranchee avec Gilles le 20/08) : le forfait de base reste a prix fixe (500€, ce nombre
// nomme une offre, il ne doit jamais varier avec les options), le montant reel a payer vit dans
// une ligne "Total de la prestation" separee, avec le detail chiffre des options cochees juste
// en dessous. Palier reduit a 30€ pour un abonne Serenite retire le 19/08 (Gilles) : ADHOC_MODIF_PRICE
// s'applique desormais a tout le monde, avec ou sans Formule Serenite.
const BASE_PRICE = 500;
const DOMAIN_PRICE_YEAR = 20;
const ADHOC_MODIF_PRICE = 40;
const SUBSCRIPTION_PRICE_YEAR = 75;
const SUBSCRIPTION_INCLUDED_MODIFS = 2;
// Meme endpoint Formspree que Contact.tsx (pas de compte dedie a creer pour l'instant, cf
// "ne pas construire d'outil par anticipation" dans workflow-cc.md) : le payload precise
// explicitement la source pour ne pas confondre un lead Boutiques chaud avec un contact generique
// du portfolio dans la meme boite mail.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mykarjar";

export default function PricingCard({
  projectName,
  slug,
}: {
  projectName: string;
  phone?: string;
  // Tracking funnel Boutiques Tier 1 (cf trackFunnelBeacon("modale-numero") du mockup
  // preview-prospect.html) : undefined pour un client deja engage (Mylene), le composant ne
  // trace jamais en dehors du funnel de prospection a froid.
  slug?: string;
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
  // Jamais pre-rempli avec le numero connu en base (demande explicite de Gilles, 14/08) : le
  // champ reste vide, le prospect indique lui-meme son numero. Corrige le 20/08 (regression
  // trouvee en prod, le numero scrape s'affichait malgre cette regle deja actee).
  const [contactValue, setContactValue] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Bulles info (nom de domaine + "5 allers-retours"), fermeture au clic en dehors. Reproduit à
  // la lettre Projets/V1-Echanges/mockups/preview-prospect.html, seule référence de cette page
  // (jamais mélangée à tarif-pilote-badge.html, un prototype exploratoire distinct et non retenu
  // ici).
  const [openPopover, setOpenPopover] = useState<"domain" | "allersRetours" | null>(null);

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
    if (slug) trackFunnelBeacon(slug, "modale-numero");
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
    <div className="rounded-2xl border border-border bg-card p-6 max-w-[420px] mx-auto text-left">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Forfait de base de création d'un site web</p>
      <p className="text-[34px] font-extrabold text-foreground mb-[18px]">{BASE_PRICE}€</p>

      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Comprend :</p>
      <ul className="text-sm text-foreground space-y-2 mb-5">
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
          <span className="min-w-0">Votre site</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
          <span className="min-w-0">
            5 allers-retours, pour progresser de la version 1 à la version 6 de votre site
            <button
              type="button"
              aria-label="Comment ça se passe concrètement ?"
              onClick={(e) => {
                e.stopPropagation();
                setOpenPopover((p) => (p === "allersRetours" ? null : "allersRetours"));
              }}
              className="inline-flex items-center justify-center h-[18px] w-[18px] rounded-full border border-muted-foreground text-muted-foreground text-[10px] ml-1.5 align-middle hover:text-foreground hover:border-foreground"
            >
              ⓘ
            </button>
            {openPopover === "allersRetours" && (
              <span
                onClick={(e) => e.stopPropagation()}
                className="block mt-2 rounded-lg bg-foreground/10 border border-border p-2.5 text-xs leading-relaxed text-muted-foreground font-normal"
              >
                Par écrit, vous listez les modifications que vous souhaitez apporter sur la version en cours :
                rédaction de contenu, insertion d'image, modification du design… Tout est personnalisable à la
                carte !
                <br />
                <br />
                Les corrections sont appliquées puis mises à jour dans la version suivante. La version 6 sera à
                votre image !
              </span>
            )}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground shrink-0 mt-1.5" />
          <span className="min-w-0">Mise en ligne</span>
        </li>
      </ul>

      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2 mt-1">Options</p>

      <div className="relative mb-2.5">
        <label
          className={`flex items-start gap-3 rounded-xl border border-border p-3 pr-8 transition-colors cursor-pointer hover:border-foreground/30 ${
            withSubscription ? "opacity-40" : ""
          }`}
        >
          {/* Case a cocher stylee maison (reproduit .opt-checkbox de preview-prospect.html) : la
              case native <input type="checkbox"> rend un style trop different du mockup (rendu
              natif variable selon navigateur/OS), input reel garde en sr-only pour l'accessibilite/
              le focus clavier, le carre visuel ci-dessous porte le rendu. Jamais disabled (corrige
              le 20/08, ecart trouve par Gilles en prod) : reproduit a la lettre preview-prospect.html
              (toggleOpt), qui ne desactive jamais reellement l'option domaine meme quand la Formule
              Serenite est cochee (juste dimmee visuellement, .disabled{opacity:.5}). Cliquer decoche
              symetriquement la Formule Serenite (meme logique que le sens inverse ci-dessous). */}
          <input
            type="checkbox"
            checked={withDomain}
            onChange={(e) => {
              setWithDomain(e.target.checked);
              if (e.target.checked) setWithSubscription(false);
            }}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`relative w-5 h-5 rounded-md border-2 shrink-0 mt-px transition-colors ${
              withDomain ? "bg-foreground border-foreground" : "border-border bg-transparent"
            }`}
          >
            {withDomain && <Check className="absolute inset-0 m-auto text-background" size={13} strokeWidth={3} />}
          </span>
          <span className="block text-sm text-foreground">
            <span className="font-semibold">
              Nom de domaine, {withSubscription ? "inclus dans la formule" : `+${DOMAIN_PRICE_YEAR}€`}
            </span>
            <span className="block text-xs text-muted-foreground mt-0.5">Valable 1 an.</span>
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
            Le nom de domaine correspond à l'adresse de votre site (ex. gillescobigo.com). Il ne peut pas être
            acheté, il est réservé pour une durée valable 1 an, renouvelable.
          </div>
        )}
      </div>

      {/* Grisee (opacity-40) quand le nom de domaine seul est coche, symetrique au grisage de
          l'option domaine ci-dessus (retour du 19/08 reproduit a la lettre depuis
          preview-prospect.html, `#optSerenite.classList.toggle("disabled", state.domain)`,
          ecart trouve le 20/08 par Gilles en meme temps que le champ disabled ci-dessus). */}
      <label
        className={`flex items-start gap-3 rounded-xl border border-border p-3 mb-2.5 cursor-pointer hover:border-foreground/30 transition-colors ${
          domainActive ? "opacity-40" : ""
        }`}
      >
        <input
          type="checkbox"
          checked={withSubscription}
          onChange={(e) => {
            setWithSubscription(e.target.checked);
            if (e.target.checked) setWithDomain(false);
          }}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`relative w-5 h-5 rounded-md border-2 shrink-0 mt-px transition-colors ${
            withSubscription ? "bg-foreground border-foreground" : "border-border bg-transparent"
          }`}
        >
          {withSubscription && <Check className="absolute inset-0 m-auto text-background" size={13} strokeWidth={3} />}
        </span>
        <span className="block text-sm text-foreground">
          <span className="font-semibold">Formule Sérénité, +{SUBSCRIPTION_PRICE_YEAR}€</span>
          <span className="block text-xs text-muted-foreground mt-0.5">
            Nom de domaine, + {SUBSCRIPTION_INCLUDED_MODIFS} allers-retours, retours sous 48h ouvrées.
          </span>
        </span>
      </label>

      {/* Ligne "Total de la prestation" (20/08, tranchee avec Gilles) : le prix du forfait
          ci-dessus reste fixe, le montant reel a payer (forfait + options cochees) vit ici. */}
      <div className="flex items-baseline justify-between mt-1.5 mb-6 pt-3.5 border-t border-border">
        <span className="text-[13px] font-semibold text-foreground">Total de la prestation</span>
        <span className="text-xl font-extrabold text-foreground">{total}€</span>
      </div>

      {/* Detail chiffre sous le Total : "Creation et mise en ligne du site" (toujours 500€) puis,
          si cochee, une seule ligne resumee et chiffree pour l'option active. La description
          complete de chaque option reste dans la card Options ci-dessus, jamais dupliquee ici
          (retour de Gilles, 20/08 : on doit savoir ce qu'on coche avant de cocher). */}
      <ul className="flex flex-col gap-1 -mt-2.5 mb-3.5">
        <li className="flex items-start gap-2 text-[12.5px] font-semibold text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
          <span className="min-w-0">Création et mise en ligne du site</span>
          <span className="ml-auto whitespace-nowrap">{BASE_PRICE}€</span>
        </li>
        {withSubscription && (
          <li className="flex items-start gap-2 text-[12.5px] font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
            <span className="min-w-0">Formule Sérénité</span>
            <span className="ml-auto whitespace-nowrap">{SUBSCRIPTION_PRICE_YEAR}€</span>
          </li>
        )}
        {!withSubscription && domainActive && (
          <li className="flex items-start gap-2 text-[12.5px] font-semibold text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
            <span className="min-w-0">Nom de domaine</span>
            <span className="ml-auto whitespace-nowrap">{DOMAIN_PRICE_YEAR}€</span>
          </li>
        )}
      </ul>

      <p className="text-xs text-muted-foreground mt-4 pt-3.5 border-t border-border">
        Au-delà de la V6 (V7, V8...) ou pour toute modification après la mise en ligne : {ADHOC_MODIF_PRICE}€ chacune.
      </p>

      <p className="text-[11px] text-muted-foreground mt-[10px]">
        Évolution plus importante (plusieurs pages, boutique en ligne...) : devis à part.
      </p>
      <p className="text-[11px] text-muted-foreground mt-[10px]">
        <Link to="/cgv-boutiques" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Voir les conditions générales complètes
        </Link>
      </p>

      <Button
        size="lg"
        className="w-full rounded-full font-semibold mt-[18px] bg-foreground text-background hover:bg-foreground/90"
        onClick={openDialog}
      >
        Ça m'intéresse, on en parle <ArrowRight size={16} />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Centrage vertical (et repositionnement au-dessus du clavier mobile) gere par
            DialogContent lui-meme (dialog.tsx, resynchronise sur window.visualViewport). */}
        <DialogContent className="max-w-sm text-center">
          {confirmed ? (
            <DialogHeader className="items-center">
              <CheckCircle2 className="text-emerald-500 mb-2" size={40} />
              <DialogTitle className="text-lg">C'est noté !</DialogTitle>
              <DialogDescription className="text-base text-foreground">
                Je reviens vers vous rapidement !
              </DialogDescription>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader className="items-center">
                <DialogTitle className="text-lg">Comment vous joindre ?</DialogTitle>
                <DialogDescription>Je vous recontacte au numéro indiqué.</DialogDescription>
              </DialogHeader>

              <div className="text-left">
                <input
                  type="text"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder="Indiquez votre numéro"
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
                className="w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
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
                Aucune sollicitation commerciale n'aura lieu après ce premier échange.
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
