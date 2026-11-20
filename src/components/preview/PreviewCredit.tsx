import { Link } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import { LINKEDIN_ICON_PATH, LINKEDIN_URL } from "@/lib/linkedinIcon";

// Reproduit <footer> de Projets/V1-Echanges/mockups/preview-prospect.html a la lettre (20/08,
// reconstruction complete apres ecart signale par Gilles : le lien LinkedIn n'avait jamais ete
// porte ici, tailles/espacements approximatifs). Composant partage (PreviewHome, CaseStudyRound,
// PreviewRound) : ajout purement additif, ne change rien pour les autres appelants au-dela du
// lien LinkedIn en plus.
export default function PreviewCredit() {
  const { theme } = useThemeStore();
  const logo = theme === "dark" ? "/images/logo-gc-white.png" : "/images/logo-gc-black.png";

  return (
    <footer className="mt-8 mb-6 px-2 py-3 flex items-center justify-center flex-wrap gap-5 text-sm text-muted-foreground">
      <Link
        to="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 hover:text-foreground transition-colors"
      >
        <img src={logo} alt="" className="h-8 w-auto opacity-90" />
        Réalisé par <span className="underline">Gilles Cobigo</span>
      </Link>
      <a
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn de Gilles Cobigo"
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
          <path d={LINKEDIN_ICON_PATH} />
        </svg>
        LinkedIn
      </a>
    </footer>
  );
}
