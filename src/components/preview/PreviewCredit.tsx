import { Link } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";

export default function PreviewCredit() {
  const { theme } = useThemeStore();
  const logo = theme === "dark" ? "/images/logo-gc-white.png" : "/images/logo-gc-black.png";

  return (
    <Link
      to="/"
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <img src={logo} alt="" className="h-5 w-auto opacity-80" />
      Réalisé par Gilles Cobigo
    </Link>
  );
}
