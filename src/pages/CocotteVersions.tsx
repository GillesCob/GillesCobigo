import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cocotteVersions, type ICrudStatus } from "@/data/cocotteVersions";

const topLevel = cocotteVersions.filter((v) => !v.parentVersion);

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
  const [selected, setSelected] = useState(cocotteVersions[0].version);
  const entry = cocotteVersions.find((v) => v.version === selected) ?? cocotteVersions[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 mt-11">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Retour aux projets
      </Link>

      <h1 className="text-3xl font-bold mb-3">CocotteEclair · Suivi des versions</h1>
      <p className="text-muted-foreground mb-10">
        Historique de développement, version par version : ce qui a été livré, ce qui reste en cours, et pourquoi.
        Java + Spring Boot côté backend, Angular côté frontend.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-48 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {topLevel.map((v) => {
              const patches = cocotteVersions.filter((p) => p.parentVersion === v.version);
              return (
                <div key={v.version} className="flex-shrink-0">
                  <button
                    onClick={() => setSelected(v.version)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-mono transition-colors ${
                      selected === v.version
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {v.version}
                  </button>
                  {patches.length > 0 && (
                    <div className="md:ml-3 md:border-l md:border-border md:pl-2 flex md:flex-col gap-1">
                      {patches.map((p) => (
                        <button
                          key={p.version}
                          onClick={() => setSelected(p.version)}
                          className={`text-left px-3 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                            selected === p.version
                              ? "bg-secondary text-secondary-foreground font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          }`}
                        >
                          {p.version}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 rounded-xl border border-border p-6 bg-card">
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

          {entry.screenshots && entry.screenshots.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {entry.screenshots.map((shot) => (
                <figure key={shot.src} className="rounded-lg border border-border overflow-hidden bg-muted/30">
                  <img src={shot.src} alt={shot.caption} className="w-full h-auto" loading="lazy" />
                  <figcaption className="text-xs text-muted-foreground px-3 py-2">{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
          )}

          {entry.githubTag && (
            <Button asChild variant="outline" size="sm">
              <a href={entry.githubTag} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} className="mr-1" /> Tag {entry.version} sur GitHub
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
