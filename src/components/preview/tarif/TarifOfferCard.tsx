import { useEffect, useState, type MouseEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import {
  ADHOC_MODIF_PRICE,
  BASE_PRICE,
  DOMAIN_PRICE_YEAR,
  SUBSCRIPTION_INCLUDED_MODIFS,
  SUBSCRIPTION_PRICE_YEAR,
} from "@/lib/boutiquesPricing";
import type { ITarifOptions } from "@/hooks/useTarifOptions";

type Popover = "allersRetours" | "domain" | null;

/** Carte du forfait : contenu, options, total et bouton « Ça m'intéresse » (maquette S-203, montants de lib/boutiquesPricing). */
export default function TarifOfferCard({ options, onInterested }: { options: ITarifOptions; onInterested: () => void }) {
  const { withSubscription, withDomain, total, toggleDomain, toggleSubscription } = options;
  // Un seul popover ouvert a la fois, fermeture au clic n'importe ou ailleurs.
  const [popover, setPopover] = useState<Popover>(null);

  useEffect(() => {
    if (popover === null) return;
    const close = () => setPopover(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [popover]);

  function togglePopover(name: Exclude<Popover, null>) {
    return (e: MouseEvent) => {
      e.stopPropagation();
      setPopover((p) => (p === name ? null : name));
    };
  }
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className="carte">
      <p className="lib">Forfait de base de création d'un site web</p>
      <p className="prix">{BASE_PRICE}€</p>

      <p className="lib">Comprend :</p>
      <ul className="compris">
        <li>
          <span className="puce" />
          <span className="txt">Votre site</span>
        </li>
        <li>
          <span className="puce" />
          <span className="txt">
            5 allers-retours, pour progresser de la version 1 à la version 6 de votre site
            <button
              type="button"
              className="info"
              aria-label="Comment ça se passe concrètement ?"
              aria-expanded={popover === "allersRetours"}
              onClick={togglePopover("allersRetours")}
            >
              ⓘ
            </button>
            {popover === "allersRetours" && (
              <span className="bulle" onClick={stop}>
                Par écrit, vous listez les modifications que vous souhaitez apporter sur la version en cours : rédaction de
                contenu, insertion d'image, modification du design… Tout est personnalisable à la carte !
                <br />
                <br />
                Les corrections sont appliquées puis mises à jour dans la version suivante. La version 6 sera à votre image !
              </span>
            )}
          </span>
        </li>
        <li>
          <span className="puce" />
          <span className="txt">Mise en ligne</span>
        </li>
      </ul>

      <p className="opt-titre">Options</p>

      <div className="opt-wrap">
        <label className="opt avec-i">
          <input type="checkbox" checked={withDomain} onChange={(e) => toggleDomain(e.target.checked)} />
          <span className="case" aria-hidden="true">
            <Check strokeWidth={3} />
          </span>
          <span className="corps-opt">
            <span className="t">Nom de domaine, +{DOMAIN_PRICE_YEAR}€</span>
            <span className="s">Valable 1 an.</span>
            {popover === "domain" && (
              <span className="bulle domaine" onClick={stop}>
                Le nom de domaine correspond à l'adresse de votre site (ex. gillescobigo.com). Il ne peut pas être acheté, il
                est réservé pour une durée valable 1 an, renouvelable.
              </span>
            )}
          </span>
        </label>
        <button
          type="button"
          className={`i-btn${popover === "domain" ? " actif" : ""}`}
          aria-label="Qu'est-ce qu'un nom de domaine ?"
          aria-expanded={popover === "domain"}
          onClick={togglePopover("domain")}
        >
          ⓘ
        </button>
      </div>

      <label className="opt" style={{ marginBottom: 10 }}>
        <input type="checkbox" checked={withSubscription} onChange={(e) => toggleSubscription(e.target.checked)} />
        <span className="case" aria-hidden="true">
          <Check strokeWidth={3} />
        </span>
        <span className="corps-opt">
          <span className="t">Formule Sérénité, +{SUBSCRIPTION_PRICE_YEAR}€</span>
          <span className="s">{SUBSCRIPTION_INCLUDED_MODIFS} allers-retours supplémentaires, retours sous 48h ouvrées.</span>
        </span>
      </label>

      <div className="total">
        <span className="l">Total de la prestation</span>
        <span className="m">{total}€</span>
      </div>

      <ul className="detail">
        <li>
          <span className="puce" />
          <span className="n">Création et mise en ligne du site</span>
          <span className="p">{BASE_PRICE}€</span>
        </li>
        {withSubscription && (
          <li>
            <span className="puce" />
            <span className="n">Formule Sérénité</span>
            <span className="p">{SUBSCRIPTION_PRICE_YEAR}€</span>
          </li>
        )}
        {withDomain && (
          <li>
            <span className="puce" />
            <span className="n">Nom de domaine</span>
            <span className="p">{DOMAIN_PRICE_YEAR}€</span>
          </li>
        )}
      </ul>

      <p className="note">
        Au-delà de la V6 (V7, V8, ...) ou pour toute modification après la mise en ligne : {ADHOC_MODIF_PRICE}€ chacune.
      </p>
      <p className="note-s">Évolution plus importante (plusieurs pages, vente en ligne...) : devis à part.</p>
      <p className="note-s">
        <a href="/cgv-boutiques" target="_blank" rel="noopener noreferrer">
          Voir les conditions générales complètes
        </a>
      </p>

      <button type="button" className="btn btn-cta" onClick={onInterested}>
        Ça m'intéresse, on en parle <ArrowRight />
      </button>
    </div>
  );
}
