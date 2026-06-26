import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0A] text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="flex-1">
            <p className="text-white font-semibold text-base mb-1">Gilles Cobigo</p>
            <p className="text-sm">Développeur fullstack, ex-BIM Manager</p>
          </div>

          <div className="flex-1">
            <p className="text-white text-sm font-medium mb-4">Liens</p>
            <div className="flex flex-col gap-3">
              <a
                href="https://github.com/GillesCob"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Github size={14} /> github.com/GillesCob
              </a>
              <a
                href="https://www.linkedin.com/in/gillescobigo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Linkedin size={14} /> linkedin.com/in/gillescobigo
              </a>
              <a
                href="mailto:contact@gillescobigo.com"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail size={14} /> contact@gillescobigo.com
              </a>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-white text-sm font-medium mb-4">Ce site</p>
            <p className="text-sm leading-relaxed">
              Construit en React + Vite. Hébergé sur Vercel.{" "}
              <a
                href="https://github.com/GillesCob/GillesCobigo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
              >
                <div>Code sur GitHub.</div>
              </a>
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6  text-xs text-white/30 text-center">© {new Date().getFullYear()} Gilles Cobigo</div>
      </div>
    </footer>
  );
}
