import type { CSSProperties, ReactNode } from "react";
import SalonScreen from "../SalonScreen";
import { VCARD_FILENAME } from "../salonContent";
import { useDocumentIcon } from "../useDocumentIcon";
import { useVCardDownload } from "../useVCardDownload";
import {
  HABITAT_APPS,
  HABITAT_BOOKING_URL,
  HABITAT_CONTACT,
  HABITAT_CV_URL,
  HABITAT_MAILTO,
  HABITAT_OFFERS,
  HABITAT_ROLE,
  HABITAT_TEL_DISPLAY,
  HABITAT_TEL_HREF,
  type THabitatOfferIcon,
} from "./habitatExpoContent";
import "./habitatExpo.css";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

// Délai d'apparition de chaque élément `.reveal` (variable CSS --d du mockup).
const revealDelay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

// Icônes SVG inline reprises du mockup (tracés Lucide), pas lucide-react : même balisage, même
// rendu au pixel (même choix que SalonRecruiter.tsx).
const OFFER_ICONS: Record<THabitatOfferIcon, ReactNode> = {
  sparkle: <path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z" />,
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  monitor: (
    <>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </>
  ),
};

// Page ouverte après le scan du QR (mockup carte-salon-habitat.html, #visiteur).
export default function HabitatExpoVisitor() {
  useDocumentIcon("/images/favicon.png");
  const { isDone, statusMessage, download } = useVCardDownload(HABITAT_CONTACT, VCARD_FILENAME);

  return (
    <SalonScreen rootClassName="cs-habitat">
      <div className="page run" id="page">
        <header className="hero">
          <div className="hero-text">
            <p className="context">Rencontré au salon Habitat Expo · Mont-de-Marsan · oct. 2026</p>
            <h1 className="name reveal" style={revealDelay(0)}>
              Gilles Cobigo
            </h1>
            <p className="role reveal" style={revealDelay(140)}>
              {HABITAT_ROLE}
            </p>
            <p className="pitch">
              10 ans dans le bâtiment, dont BIM Manager sur Mareterra, l&apos;extension en mer de Monaco. Aujourd&apos;hui
              je conçois des outils numériques pour les pros du bâtiment et j&apos;accompagne les équipes qui veulent
              intégrer l&apos;IA à leur quotidien.
            </p>

            <div className="actions">
              <button
                type="button"
                className="cta"
                id="vcard"
                aria-describedby="vcard-status"
                data-state={isDone ? "done" : undefined}
                onClick={download}
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
                  <strong id="vcard-label">{isDone ? "Fiche contact prête" : "Ajouter à mes contacts"}</strong>
                  <small id="vcard-sub">
                    {isDone ? `Ouvrez ${VCARD_FILENAME} pour l'enregistrer` : "Mail, téléphone et LinkedIn en un geste"}
                  </small>
                </span>
              </button>
              <p className="sr-only" id="vcard-status" aria-live="polite">
                {statusMessage}
              </p>

              <div className="secondary">
                <a className="sec" href={HABITAT_TEL_HREF}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>
                    <strong>M&apos;appeler</strong>
                    <small>{HABITAT_TEL_DISPLAY}</small>
                  </span>
                </a>
                <a className="sec" href={HABITAT_MAILTO}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>
                    <strong>M&apos;écrire</strong>
                    <small>{HABITAT_CONTACT.email}</small>
                  </span>
                </a>
                <a className="sec" href={HABITAT_CONTACT.linkedin} {...EXTERNAL}>
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
                <a className="sec" href={HABITAT_CV_URL} download {...EXTERNAL}>
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
                <a className="sec wide" href={HABITAT_BOOKING_URL} {...EXTERNAL}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <path d="M16 2v4" />
                    <path d="M8 2v4" />
                    <path d="M3 10h18" />
                  </svg>
                  <span>
                    <strong>Prendre rendez-vous</strong>
                    <small>Choisir un créneau de 30 min</small>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <section className="block" aria-labelledby="offers-title">
          <h2 id="offers-title">Ce que je peux faire pour vous</h2>
          <ul className="offers">
            {HABITAT_OFFERS.map((offer) => (
              <li className="offer" key={offer.id}>
                <span className="offer-ico" aria-hidden="true">
                  <svg className="icon" viewBox="0 0 24 24">
                    {OFFER_ICONS[offer.icon]}
                  </svg>
                </span>
                <span>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  <a
                    className="offer-cta"
                    href={offer.calHref}
                    {...EXTERNAL}
                    aria-label={`En discuter : ${offer.title}`}
                  >
                    {"En discuter "}
                    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="block" aria-labelledby="apps-title">
          <h2 id="apps-title">Réalisations</h2>
          <ul className="apps">
            {HABITAT_APPS.map((app) => (
              <li key={app.id}>
                <a className="app" href={app.href} {...EXTERNAL}>
                  <span className={app.markVariant === "dark" ? "app-mark cs-dark pad" : "app-mark"} aria-hidden="true">
                    <img src={app.logo} alt="" />
                  </span>
                  <span>
                    <h3>
                      {app.name}
                      {app.tag && (
                        <>
                          {" "}
                          <span className="tag">{app.tag}</span>
                        </>
                      )}
                    </h3>
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
        </section>

        <footer className="made">
          <a className="brand" href={HABITAT_CONTACT.url} {...EXTERNAL} aria-label="gillescobigo.com, ouvre le portfolio">
            <img src="/images/logo-gc-black.png" alt="" width="38" height="38" />
            <span className="brand-name">Gilles Cobigo</span>
          </a>
          {/* Un seul nœud texte avant le lien, comme le mockup (même leçon que SalonRecruiter.tsx :
              scindé, le centrage de la ligne décalait les glyphes d'une fraction de pixel). */}
          <p className="sign">
            {`${HABITAT_ROLE} · `}
            <a href={HABITAT_CONTACT.url} {...EXTERNAL}>
              gillescobigo.com
            </a>
          </p>
        </footer>
      </div>
    </SalonScreen>
  );
}
