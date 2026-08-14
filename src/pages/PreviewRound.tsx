import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PreviewVersionsNav from "@/components/preview/PreviewVersionsNav";
import PreviewCredit from "@/components/preview/PreviewCredit";
import { RoundContent } from "@/components/preview/RoundContent";
import GuideCallout from "@/components/preview/GuideCallout";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import NotFound from "@/pages/NotFound";

interface IFeedbackForm {
  message: string;
}

export default function PreviewRound() {
  const { secret, round } = useParams<{ project: string; secret: string; round: string }>();
  const project = secret ? previewProjects[secret] : undefined;
  const entry = project?.rounds.find((r) => r.round.toLowerCase() === round?.toLowerCase());
  const { theme, toggleTheme } = useThemeStore();
  usePreviewFavicon(project?.logo);
  usePreviewTitle(project && entry ? `${entry.round} · ${project.projectName}` : undefined);

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

  // Bulles d'aide affichees tant que le projet est en phase de decouverte (cf GuideCallout.tsx) :
  // coldIntro absent des donnees une fois contractualise, les bulles disparaissent avec, sans
  // toggle separe a gerer.
  const showGuide = Boolean(project.coldIntro);

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
    <div className="min-h-dvh bg-background flex flex-col relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* max-w-6xl : proportions fixes pour toutes les pages de version (memes que Projects.tsx,
          la page la plus large du portfolio, adaptee ici a la grille 2 colonnes de propositions). */}
      <div className="flex-1 px-6 md:px-12 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
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
            <RoundContent
              entry={entry}
              contactName={project.contactName}
              showGuide={showGuide}
              guideTexts={{ proposals: "Clique ici pour voir notre proposition de site" }}
            />

            {/* Tu/vous : "showGuide" (present uniquement quand project.coldIntro est defini, cf plus
                haut) sert aussi de flag de registre. Mylene (coldIntro absent) reste au tutoiement
                deja etabli avec elle. Un prospect a froid est vouvoye (sobre/pro, decision du 14/08). */}
            {/* La phrase "Merci de me faire ... retours via ce formulaire" a ete retiree cote
                prospect (showGuide) : h2 suffit deja a expliquer le bloc, la repeter en plus de la
                bulle faisait 3 fois "retours" d'affilee. Conservee cote Mylene (jamais retouchee). */}
            {showGuide && <GuideCallout>Ici, vous pourrez me faire vos retours</GuideCallout>}
            <div className="rounded-xl border border-border p-6 bg-card">
              <h2 className={showGuide ? "text-sm font-semibold mb-3" : "text-sm font-semibold mb-1.5"}>
                {showGuide ? "Vos" : "Tes"} retours concernant la {entry.round}
              </h2>
              {!showGuide && (
                <p className="text-sm text-muted-foreground mb-4">Merci de me faire tes retours via ce formulaire.</p>
              )}
              {submitted ? (
                <p className="text-sm text-muted-foreground" role="status">
                  Merci, c'est bien reçu.
                </p>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                  <label htmlFor="feedback-message" className="sr-only">
                    {showGuide ? "Votre retour sur cette version" : "Ton retour sur cette version"}
                  </label>
                  <textarea
                    {...messageField}
                    id="feedback-message"
                    ref={(el) => {
                      messageRef(el);
                      if (el) autoResize(el);
                    }}
                    onInput={(e) => autoResize(e.currentTarget)}
                    rows={10}
                    placeholder="Liste des éléments à ajouter/modifier/supprimer"
                    aria-invalid={errors.message ? true : undefined}
                    aria-describedby={errors.message ? "feedback-message-error" : undefined}
                    className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none overflow-hidden transition-colors"
                  />
                  {errors.message && (
                    <p id="feedback-message-error" className="text-destructive text-xs" role="alert">
                      {errors.message.message}
                    </p>
                  )}
                  {submitError && (
                    <p className="text-destructive text-xs" role="alert">
                      {submitError}
                    </p>
                  )}
                  <Button type="submit" disabled={isSubmitting} size="sm" className="self-start">
                    {isSubmitting ? "Envoi..." : "Envoyer"}
                  </Button>
                </form>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>

      <PreviewCredit />
    </div>
  );
}
