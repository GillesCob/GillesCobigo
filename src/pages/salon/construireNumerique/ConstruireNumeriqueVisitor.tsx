import type { CSSProperties } from "react";
import SalonScreen from "../SalonScreen";
import { VCARD_FILENAME } from "../salonContent";
import { useDocumentIcon } from "../useDocumentIcon";
import {
  NUMERIQUE_APPS,
  NUMERIQUE_BOOKING_URL,
  NUMERIQUE_CONTACT,
  NUMERIQUE_CV_URL,
  NUMERIQUE_FEATURED_APP,
  NUMERIQUE_MAILTO,
  NUMERIQUE_ROLE,
  NUMERIQUE_TEL_DISPLAY,
  NUMERIQUE_TEL_HREF,
  NUMERIQUE_VCARD_URL,
} from "./construireNumeriqueContent";
import { useCopyText } from "./useCopyText";
import { useTransientFlag } from "./useTransientFlag";
// Même habillage que la carte Habitat Expo (le mockup de la journée n'ajoute aucune règle CSS) :
// feuille et modificateur `cs-habitat` réutilisés tels quels, pas dupliqués.
import "../habitatExpo/habitatExpo.css";
import "./construireNumerique.css";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

// Durée de l'état « fiche prête » du bouton, même valeur que useVCardDownload.
const VCARD_DONE_MS = 4000;

// Délai d'apparition de chaque élément `.reveal` (variable CSS --d du mockup).
const revealDelay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const COPY_MESSAGES = {
  idle: "",
  copied: "Numéro copié.",
  failed: "Copie impossible. Appuyez longuement sur le numéro pour le copier.",
} as const;

// Page ouverte après le scan du QR, aussi carte de visite : Ouvra d'abord, coordonnées ensuite,
// le reste en dessous (mockup carte-salon-construire-en-numerique.html, #visiteur, réordonné le
// 27/10 sur décision de Gilles).
export default function ConstruireNumeriqueVisitor() {
  useDocumentIcon("/images/favicon.png");
  const [isVCardDone, markVCardDone] = useTransientFlag(VCARD_DONE_MS);
  const { status: copyStatus, copy: copyPhone } = useCopyText(NUMERIQUE_TEL_DISPLAY);

  return (
    <SalonScreen rootClassName="cs-habitat cs-numerique">
      <div className="page run" id="page">
        <header className="hero">
          <div className="hero-text">
            <p className="context">
              <span className="context-text">
                <span>Rencontré à « Construire en numérique »</span>
                <strong className="context-date">Mardi 3 novembre 2026 · Domolandes</strong>
              </span>
            </p>
            <h1 className="name reveal" style={revealDelay(0)}>
              Gilles Cobigo
            </h1>
            <p className="role reveal" style={revealDelay(140)}>
              {NUMERIQUE_ROLE}
            </p>
            <p className="pitch">
              10 ans dans le BTP dont 5 ans de BIM, BIM Manager sur Mareterra, l&apos;extension en mer de Monaco.
            </p>
          </div>
        </header>

        <div className="duo">
          <section className="block" aria-labelledby="ouvra-title">
            <div className="actions">
              <div className="ouvra-card">
                <span className="app-mark cs-dark pad" aria-hidden="true">
                  <img src={NUMERIQUE_FEATURED_APP.logo} alt="" />
                </span>
                <span>
                  <h2 id="ouvra-title">{NUMERIQUE_FEATURED_APP.name}</h2>
                  <p className="ouvra-tagline">{NUMERIQUE_FEATURED_APP.tagline}</p>
                </span>
                <p className="ouvra-desc">{NUMERIQUE_FEATURED_APP.description}</p>
              </div>
              <a className="cta" id="ouvra-cta" href={NUMERIQUE_FEATURED_APP.href} {...EXTERNAL}>
                <span className="cta-ico" aria-hidden="true">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </span>
                <span className="cta-txt">
                  <strong>Tester Ouvra</strong>
                  <small>{NUMERIQUE_FEATURED_APP.host}</small>
                </span>
              </a>
            </div>
          </section>

          <section className="block" aria-labelledby="contact-title">
            <h2 id="contact-title">Mes coordonnées</h2>
            <div className="actions">
              <a
                className="cta"
                id="vcard"
                href={NUMERIQUE_VCARD_URL}
                download={VCARD_FILENAME}
                aria-describedby="vcard-status"
                data-state={isVCardDone ? "done" : undefined}
                onClick={markVCardDone}
              >
                <span className="cta-ico" aria-hidden="true">
                  <svg className="icon ico-add" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6" />
                    <path d="M22 11h-6" />
                  </svg>
                  <svg className="icon ico-done" viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="cta-txt">
                  <strong id="vcard-label">{isVCardDone ? "Fiche contact prête" : "Ajouter à mes contacts"}</strong>
                  <small id="vcard-sub">
                    {isVCardDone
                      ? `Ouvrez ${VCARD_FILENAME} pour l'enregistrer`
                      : "Mail, téléphone et LinkedIn en un geste"}
                  </small>
                </span>
              </a>
              <p className="sr-only" id="vcard-status" aria-live="polite">
                {isVCardDone ? `Fiche contact ${VCARD_FILENAME} téléchargée.` : ""}
              </p>

              <p className="vcard-fallback" id="vcard-fallback">
                Si le fichier ne s&apos;ouvre pas, copiez le numéro{" "}
                <strong className="phone-number" id="phone-number">
                  {NUMERIQUE_TEL_DISPLAY}
                </strong>
                <button type="button" className="copy-btn" id="copy-phone" onClick={copyPhone}>
                  {copyStatus === "copied" ? "Copié" : "Copier le numéro"}
                </button>
              </p>
              <p className="copy-status" id="copy-status" role="status" data-status={copyStatus}>
                {COPY_MESSAGES[copyStatus]}
              </p>

              <div className="secondary">
                <a className="sec" href={NUMERIQUE_TEL_HREF}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>
                    <strong>M&apos;appeler</strong>
                    <small>{NUMERIQUE_TEL_DISPLAY}</small>
                  </span>
                </a>
                <a className="sec" href={NUMERIQUE_MAILTO}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>
                    <strong>M&apos;écrire</strong>
                    <small>{NUMERIQUE_CONTACT.email}</small>
                  </span>
                </a>
                <a className="sec wide" href={NUMERIQUE_CONTACT.linkedin} {...EXTERNAL}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>
                    <strong>LinkedIn</strong>
                    <small>/in/gillescobigo</small>
                  </span>
                </a>
              </div>
            </div>
          </section>
        </div>

        <section className="block" aria-labelledby="more-title">
          <h2 id="more-title">Pour aller plus loin</h2>
          <ul className="apps">
            {NUMERIQUE_APPS.map((app) => (
              <li key={app.id}>
                <a className="app" href={app.href} {...EXTERNAL}>
                  <span className={app.markVariant === "dark" ? "app-mark cs-dark pad" : "app-mark"} aria-hidden="true">
                    <img src={app.logo} alt="" />
                  </span>
                  <span>
                    <h3>{app.name}</h3>
                    <p>{app.description}</p>
                    <code>{app.host}</code>
                  </span>
                  <span className="go" aria-hidden="true">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M7 7h10v10" />
                      <path d="M7 17 17 7" />
                    </svg>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="secondary more-links">
            <a className="sec" href={NUMERIQUE_CV_URL} download {...EXTERNAL}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <path d="M12 15V3" />
              </svg>
              <span>
                <strong>Mon CV</strong>
                <small>Télécharger le PDF</small>
              </span>
            </a>
            <a className="sec" href={NUMERIQUE_BOOKING_URL} {...EXTERNAL}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
              <span>
                <strong>Prendre rendez-vous</strong>
                <small>Choisir un créneau</small>
              </span>
            </a>
          </div>
        </section>

        <footer className="made">
          <a className="brand" href={NUMERIQUE_CONTACT.url} {...EXTERNAL} aria-label="gillescobigo.com, ouvre le portfolio">
            <img src="/images/logo-gc-black.png" alt="" width="38" height="38" />
            <span className="brand-name">Gilles Cobigo</span>
          </a>
          {/* Un seul nœud texte avant le lien, comme le mockup (même leçon que SalonRecruiter.tsx :
              scindé, le centrage de la ligne décalait les glyphes d'une fraction de pixel). */}
          <p className="sign">
            {`${NUMERIQUE_ROLE} · `}
            <a href={NUMERIQUE_CONTACT.url} {...EXTERNAL}>
              gillescobigo.com
            </a>
          </p>
        </footer>
      </div>
    </SalonScreen>
  );
}
