import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, ExternalLink, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PreviewVersionsNav from "@/components/preview/PreviewVersionsNav";
import PreviewCredit from "@/components/preview/PreviewCredit";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import NotFound from "@/pages/NotFound";

interface IFeedbackForm {
  message: string;
}

export default function PreviewRound() {
  const { secret, round } = useParams<{ project: string; secret: string; round: string }>();
  const project = secret ? previewProjects[secret] : undefined;
  const entry = project?.rounds.find((r) => r.round.toLowerCase() === round?.toLowerCase());
  const { theme, toggleTheme } = useThemeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IFeedbackForm>();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { ref: messageRef, ...messageField } = register("message", { required: "Champ obligatoire" });

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  if (!project || !entry) return <NotFound />;

  async function onSubmit(data: IFeedbackForm) {
    setSubmitError(null);
    const res = await fetch(`https://formspree.io/f/${project!.feedbackFormId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...data,
        projet: project!.projectName,
        contact: project!.contactName,
        version: entry!.round,
      }),
    });
    if (res.ok) {
      setSubmitted(true);
      reset();
    } else {
      setSubmitError("Envoi échoué. Réponds-moi directement par mail ou message.");
    }
  }

  return (
    <div className="min-h-dvh bg-background px-6 md:px-12 py-10 md:py-16 relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full">
        <Link
          to={`/preview/${project.slug}/${secret}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Retour à {project.projectName}
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <PreviewVersionsNav
            slug={project.slug}
            secret={secret!}
            currentRound={entry.round}
            rounds={project.rounds.map((r) => ({ round: r.round, date: r.date }))}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-10">
              <span className="font-mono text-lg font-semibold">{entry.round}</span>
              <span className="text-sm text-muted-foreground">{entry.date}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {entry.proposals.map((p) => (
                <div key={p.label} className="rounded-xl border border-border p-4 bg-card">
                  <p className="text-sm font-semibold mb-3">{p.label}</p>
                  <div className="rounded-lg border border-border overflow-hidden mb-3 bg-muted/30">
                    <img src={p.screenshot} alt={`Aperçu ${p.label}`} className="w-full h-auto" loading="lazy" />
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href={p.htmlPath} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} className="mr-1" /> Ouvrir dans un nouvel onglet
                    </a>
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border p-6 bg-card mb-8">
              <h2 className="text-sm font-semibold mb-3">Ce qu'il me manque pour aller plus loin</h2>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                {entry.missingInfo.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            {entry.clientFeedback && (
              <div className="rounded-xl bg-muted/40 border border-border p-6 mb-8">
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Retour de {project.contactName}</p>
                <p className="text-sm whitespace-pre-line">{entry.clientFeedback}</p>
              </div>
            )}

            <div className="rounded-xl border border-border p-6 bg-card">
              <h2 className="text-sm font-semibold mb-1.5">Tes retours concernant la {entry.round}</h2>
              <p className="text-sm text-muted-foreground mb-4">Merci de me faire tes retours via ce formulaire.</p>
              {submitted ? (
                <p className="text-sm text-muted-foreground">Merci, c'est bien reçu.</p>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                  <textarea
                    {...messageField}
                    ref={(el) => {
                      messageRef(el);
                      if (el) autoResize(el);
                    }}
                    onInput={(e) => autoResize(e.currentTarget)}
                    rows={10}
                    placeholder="Liste des éléments à ajouter/modifier/supprimer"
                    className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-hidden transition-colors"
                  />
                  {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
                  {submitError && <p className="text-destructive text-xs">{submitError}</p>}
                  <Button type="submit" disabled={isSubmitting} size="sm" className="self-start">
                    {isSubmitting ? "Envoi..." : "Envoyer"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <PreviewCredit />
    </div>
  );
}
