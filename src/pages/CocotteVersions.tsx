import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cocotteVersions, type ICrudStatus } from "@/data/cocotteVersions";

function CrudIndicator({ crud }: { crud: ICrudStatus }) {
  const letters: { key: keyof ICrudStatus; label: string; title: string }[] = [
    { key: "create", label: "C", title: "Create" },
    { key: "read", label: "R", title: "Read" },
    { key: "update", label: "U", title: "Update" },
    { key: "delete", label: "D", title: "Delete" },
  ];

  return (
    <div className="flex gap-1" aria-label="Statut CRUD">
      {letters.map(({ key, label, title }) => (
        <span
          key={key}
          title={title}
          className={`flex h-5 w-5 items-center justify-center rounded text-[11px] font-semibold ${
            crud[key]
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export default function CocotteVersions() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 mt-11">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Retour aux projets
      </Link>

      <h1 className="text-3xl font-bold mb-3">CocotteEclair · Suivi des versions</h1>
      <p className="text-muted-foreground mb-12">
        Historique de développement, version par version : ce qui a été livré, ce qui reste en cours, et pourquoi.
        Java + Spring Boot côté backend, Angular côté frontend.
      </p>

      <div className="space-y-8">
        {cocotteVersions.map((entry) => (
          <div key={entry.version} className="rounded-xl border border-border p-6 bg-card">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-mono text-sm font-semibold">{entry.version}</span>
              <span className="text-xs text-muted-foreground">{entry.date}</span>
              <Badge variant="secondary" className="text-xs">
                {entry.tag}
              </Badge>
              <Badge
                className={`text-xs ${
                  entry.status === "shipped"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15"
                }`}
              >
                {entry.status === "shipped" ? "Livré" : "En cours"}
              </Badge>
              {entry.crud && <CrudIndicator crud={entry.crud} />}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{entry.description}</p>

            {entry.impact.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 list-disc list-inside">
                {entry.impact.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            {entry.githubTag && (
              <Button asChild variant="outline" size="sm">
                <a href={entry.githubTag} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} className="mr-1" /> Tag {entry.version} sur GitHub
                </a>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
