import { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavClick() {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0A] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" onClick={handleNavClick} className="text-white font-semibold text-lg tracking-tight">
            Gilles Cobigo
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/projects" onClick={handleNavClick} className="text-white/70 hover:text-white text-sm transition-colors">
              Projets
            </Link>
            <Link to="/articles" onClick={handleNavClick} className="text-white/70 hover:text-white text-sm transition-colors">
              Articles
            </Link>
            <Link to="/contact" onClick={handleNavClick} className="text-white/70 hover:text-white text-sm transition-colors">
              Contact
            </Link>
            <button
              onClick={toggleTheme}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Basculer le thème"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-[#D85A30] text-[#D85A30] bg-transparent hover:bg-[#D85A30] hover:text-white transition-colors"
            >
              <Link to="/contact" onClick={handleNavClick}>Me contacter</Link>
            </Button>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-1" aria-label="Menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link to="/projects" className="text-white/80 hover:text-white" onClick={handleNavClick}>
            Projets
          </Link>
          <Link to="/articles" className="text-white/80 hover:text-white" onClick={handleNavClick}>
            Articles
          </Link>
          <Link to="/contact" className="text-white/80 hover:text-white" onClick={handleNavClick}>
            Contact
          </Link>
          <button onClick={toggleTheme} className="text-white/80 hover:text-white text-left">
            {theme === "dark" ? "Mode clair" : "Mode sombre"}
          </button>
        </div>
      )}
    </nav>
  );
}
