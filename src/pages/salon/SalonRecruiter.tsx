import SalonScreen from "./SalonScreen";
import {
  SALON_APPS,
  SALON_ARTICLE_URL,
  SALON_CONTACT,
  SALON_CV_URL,
  SALON_MAILTO,
  SALON_STACK,
  SALON_VIDEO_URL,
  VCARD_FILENAME,
} from "./salonContent";
import { useVCardDownload } from "./useVCardDownload";

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

// Page ouverte après le scan du QR (mockup carte-salon.html, #recruteur). Icônes SVG inline
// reprises du mockup (tracés Lucide), pas lucide-react : même balisage, même rendu au pixel.
export default function SalonRecruiter() {
  const { isDone, statusMessage, download } = useVCardDownload(SALON_CONTACT, VCARD_FILENAME);

  return (
    <SalonScreen>
      <div className="page" id="page">
        <header className="hero">
          <div className="hero-text">
            <p className="context">Rencontré au Salon du numérique du Pays Basque · 24 sept.</p>
            <h1 className="name">Gilles Cobigo</h1>
            <p className="role">Développeur fullstack</p>
            <p className="pitch">
              TypeScript, Node et React, 3 apps en prod. Avant le code, 10 ans dans le bâtiment, dont BIM Manager sur
              l&apos;extension en mer de Monaco. Je cherche un poste de dev où le métier compte autant que le code.
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
                <a className="sec" href={SALON_VIDEO_URL} {...EXTERNAL}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <polygon points="6 3 20 12 6 21 6 3" />
                  </svg>
                  <span>
                    <strong>Vidéo</strong>
                    <small>Présentation en 30 s</small>
                  </span>
                </a>
                <a className="sec" href={SALON_CV_URL} download {...EXTERNAL}>
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
                <a className="sec" href={SALON_CONTACT.linkedin} {...EXTERNAL}>
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
                <a className="sec" href={SALON_MAILTO}>
                  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>
                    <strong>Me contacter</strong>
                    <small>{SALON_CONTACT.email}</small>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <section className="block" aria-labelledby="apps-title">
          <h2 id="apps-title">3 apps à tester</h2>
          <ul className="apps">
            {SALON_APPS.map((app) => (
              <li key={app.id}>
                <a className="app" href={app.href} {...EXTERNAL}>
                  <span className="app-mark" aria-hidden="true">
                    {app.mark}
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
          <p className="method">
            Construites avec Claude Code. Je spécifie, l&apos;agent code, je relis chaque diff et je teste avant la mise en
            prod.
          </p>
          <a className="method-link" href={SALON_ARTICLE_URL} {...EXTERNAL}>
            Comment je travaille avec l&apos;IA <span aria-hidden="true">→</span>
          </a>
        </section>

        <section className="block" aria-labelledby="stack-title">
          <h2 id="stack-title">Stack</h2>
          <dl className="stack-layers">
            {SALON_STACK.map(({ layer, items }) => (
              <div className="layer" key={layer}>
                <dt>{layer}</dt>
                <dd>
                  <ul className="stack">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="made">
          <a className="brand" href={SALON_CONTACT.url} {...EXTERNAL} aria-label="gillescobigo.com, ouvre le portfolio">
            <img src="/images/logo-gc-black.png" alt="" width="38" height="38" />
            <span className="brand-name">Gilles Cobigo</span>
          </a>
          {/* Un seul nœud texte avant le lien, comme le mockup : scindé en "·" + {" "}, le centrage
              de la ligne décalait les glyphes d'une fraction de pixel (15 px d'écart au diff). */}
          <p className="sign">
            {"Développeur fullstack · "}
            <a href={SALON_CONTACT.url} {...EXTERNAL}>
              gillescobigo.com
            </a>
          </p>
        </footer>
      </div>
    </SalonScreen>
  );
}
