import { useState } from "react";
import { stackTechs, computeScore, getScoreMessage } from "@/data/stackData";

export default function StackMatcher() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedIds = [...selected];
  const score = computeScore(selectedIds);
  const scoreMessage = selected.size > 0 ? getScoreMessage(score) : null;
  const techNotes = stackTechs.filter((t) => selected.has(t.id) && t.note);

  return (
    <section className="py-16 px-4 border-b border-border">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">Ma stack, la tienne.</h2>
        <p className="text-muted-foreground mb-8">
          Coche les technos de ta stack - je calcule notre degré de compatibilité.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-6">
          {stackTechs.map((tech) => {
            const isSelected = selected.has(tech.id);
            return (
              <button
                key={tech.id}
                onClick={() => toggle(tech.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  isSelected
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                }`}
              >
                {tech.label}
              </button>
            );
          })}
        </div>

        {selected.size > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold tabular-nums">{score}%</span>
              <p className="text-muted-foreground">{scoreMessage}</p>
            </div>

            {techNotes.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {techNotes.map((tech) => (
                  <p key={tech.id} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{tech.label} -</span> {tech.note}
                  </p>
                ))}
              </div>
            )}

          </div>
        )}
      </div>
    </section>
  );
}
