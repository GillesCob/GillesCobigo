import { GitBranch, Clock, Folder } from "lucide-react";
import { useGitHubStats } from "@/hooks/useGitHubStats";
import { cn } from "@/lib/utils";

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

interface IGitHubStatsProps {
  // Home (/) et /new partagent ce composant mais pas la même largeur de mise en page : 4xl (896px)
  // reste la valeur historique de Home (cohérente avec la section voisine qui l'utilise aussi),
  // 640px est la valeur exacte du mockup /new (.github-stats-inner).
  maxWidthClassName?: string;
  // Idem pour l'espacement au-dessus de la section : par défaut celui de Home, /new en passe un
  // plus grand pour se détacher davantage de la section Projets juste au-dessus.
  sectionClassName?: string;
}

export default function GitHubStats({ maxWidthClassName = "max-w-4xl", sectionClassName }: IGitHubStatsProps) {
  const { data, isLoading, isError } = useGitHubStats();

  if (isError) return null;

  return (
    <section className={cn("py-10 px-4 border-b border-border", sectionClassName)}>
      <div className={cn(maxWidthClassName, "mx-auto")}>
        <p className="text-muted-foreground text-xs uppercase tracking-widest mb-6 text-center font-mono">
          GitHub en direct
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full max-w-[180px] rounded-lg bg-muted animate-pulse" />
            ))
          ) : (
            <>
              <div className="flex items-center gap-3">
                <GitBranch size={18} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold tabular-nums">{data?.publicRepos}</p>
                  <p className="text-xs text-muted-foreground">repos publics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-2xl font-bold">{formatRelativeDate(data?.lastCommitDate ?? null)}</p>
                  <p className="text-xs text-muted-foreground">dernier commit</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2 md:col-span-1">
                <Folder size={18} className="text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-2xl font-bold truncate">{data?.lastRepo ?? "N/A"}</p>
                  <p className="text-xs text-muted-foreground">repo actif</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
