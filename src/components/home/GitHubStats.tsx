import { GitBranch, Clock, Folder } from "lucide-react";
import { useGitHubStats } from "@/hooks/useGitHubStats";

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function GitHubStats() {
  const { data, isLoading, isError } = useGitHubStats();

  if (isError) return null;

  return (
    <section className="py-10 px-4 border-b border-border">
      <div className="max-w-4xl mx-auto">
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
