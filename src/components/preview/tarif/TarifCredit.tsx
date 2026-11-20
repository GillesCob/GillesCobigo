import { LINKEDIN_URL, LINKEDIN_ICON_PATH } from "@/lib/linkedinIcon";

/** Pied de page officiel de la page de prix (meme contenu que PreviewCredit.tsx, couleurs de la maquette S-203). */
export default function TarifCredit() {
  return (
    <footer className="credit">
      <a className="credit-gc" href="/" target="_blank" rel="noopener noreferrer">
        <img src="/images/logo-gc-black.png" alt="" />
        Réalisé par <span>Gilles Cobigo</span>
      </a>
      <a className="credit-li" href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Gilles Cobigo">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={LINKEDIN_ICON_PATH} />
        </svg>
        LinkedIn
      </a>
    </footer>
  );
}
