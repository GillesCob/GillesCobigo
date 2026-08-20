import { Link } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";

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
        href="https://www.linkedin.com/in/gillescobigo"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn de Gilles Cobigo"
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
          <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3ZM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66Z" />
        </svg>
        LinkedIn
      </a>
    </footer>
  );
}
