import { Link, useParams } from "react-router-dom";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import PreviewCredit from "@/components/preview/PreviewCredit";
import NotFound from "@/pages/NotFound";

export default function PreviewHome() {
  const { secret } = useParams<{ project: string; secret: string }>();
  const project = secret ? previewProjects[secret] : undefined;
  const { theme, toggleTheme } = useThemeStore();

  if (!project) return <NotFound />;

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-6 py-16 relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-2xl text-center">
        <img src={project.logo} alt="" className="h-56 md:h-80 w-auto mx-auto mb-8 drop-shadow-lg" />
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{project.projectName}</h1>
        <p className="text-muted-foreground text-lg mb-1">Suivi du projet avec {project.contactName}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Version en cours de discussion : <span className="font-mono font-semibold">{project.currentRound}</span>
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-14">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-sm text-foreground">{project.nextAction}</span>
        </div>

        <div className="flex flex-col gap-3 text-left">
          {project.rounds.map((r) => (
            <Link
              key={r.round}
              to={`/preview/${project.slug}/${secret}/${r.round.toLowerCase()}`}
              className="group flex items-center justify-between rounded-xl border border-border bg-card px-6 py-5 hover:border-foreground/30 hover:shadow-sm transition-all"
            >
              <div>
                <span className="font-mono text-base font-semibold">{r.round}</span>
                <span className="text-sm text-muted-foreground ml-3">{r.date}</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {r.proposals.length} proposition{r.proposals.length > 1 ? "s" : ""} à consulter
                </p>
              </div>
              <ArrowRight size={20} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-foreground transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      <PreviewCredit />
    </div>
  );
}
