import { useParams, useSearchParams, Link } from "react-router-dom";
import { Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CaseStudyVersionsNav from "@/components/preview/CaseStudyVersionsNav";
import PreviewCredit from "@/components/preview/PreviewCredit";
import { RoundContent } from "@/components/preview/RoundContent";
import GuideCallout from "@/components/preview/GuideCallout";
import { previewProjects } from "@/data/previewProjects";
import { useThemeStore } from "@/store/themeStore";
import { usePreviewFavicon } from "@/hooks/usePreviewFavicon";
import { usePreviewTitle } from "@/hooks/usePreviewTitle";
import NotFound from "@/pages/NotFound";

// Page "cas client" publique (/cas-client/<round>) : reproduit a l'identique l'interface privee
// que Mylene a utilisee (/preview/dressing-mailys/EuMLnfc8Uk/<round>), donnees figees sur son
// projet (pas de lookup par secret), pour montrer a un prospect a froid l'interface reelle plutot
// qu'un resume. URL sans le nom de sa boutique (voulu, page ouverte dans un nouvel onglet depuis
// PreviewHome.tsx). Lien de retour personnalise vers /preview/<slug>/<secret> du prospect transmis
// en query param (?from=...) plutot que par une page dupliquee par prospect, cf CaseStudyVersionsNav.tsx
// pour la propagation sur tous les rounds. Cf Projets/Boutiques/workflow-cc.md.
const CASE_STUDY_SECRET = "EuMLnfc8Uk";

// Bulles d'aide reparties sur toute la progression V1 -> V6, jamais repetees pour un type de bloc
// deja explique sur un round precedent (cf discussion du 14/08) : V1 explique le mecanisme de base
// (propositions / retour client / manques / formulaire), V2 introduit "ce qui a change" et "mes
// precisions", V3 introduit le comparatif de polices, V6 introduit les apercus complementaires.
// V4 et V5 ne montrent rien de nouveau par rapport a un round deja vu, donc pas de bulle.
const ROUND_GUIDE: Record<
  string,
  {
    showFormBubble?: boolean;
    texts: {
      proposals?: string;
      proposalCallouts?: Record<string, string>;
      clientFeedback?: string;
      missingInfo?: string;
      changesApplied?: string;
      ownerNote?: string;
      supportingVisuals?: string;
    };
  }
> = {
  v1: {
    showFormBubble: true,
    texts: {
      proposals: "Propositions de versions pour votre site",
      clientFeedback: "Ajout de votre message de retour afin de toujours garder une trace de vos souhaits",
      missingInfo: "Les éléments dont j'ai besoin afin d'avancer et fiabiliser la prochaine version proposée",
    },
  },
  v2: {
    texts: {
      changesApplied: "Ce qui a changé suite à votre précédent retour",
      ownerNote: "Une précision de ma part, quand un point mérite d'être expliqué avant que vous ne validiez",
    },
  },
  v3: {
    texts: {
      // Bulle generique au-dessus de toute la grille (pas ciblee sur une seule carte) : visible
      // immediatement en arrivant sur la page depuis le lien "plusieurs variations possibles par
      // version" de PricingCard.tsx, plutot qu'enterree sur la 4e carte du groupe.
      proposals:
        "Une même version peut proposer plusieurs pistes à comparer, ici 4 options de police : ça reste un seul aller-retour, pas un par option testée",
    },
  },
  v6: {
    texts: {
      supportingVisuals: "Un aperçu complémentaire, pour un cas particulier (ici, si le quota Instagram est dépassé)",
    },
  },
};

export default function CaseStudyRound() {
  const { round } = useParams<{ round: string }>();
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const project = previewProjects[CASE_STUDY_SECRET];
  const entry = project.rounds.find((r) => r.round.toLowerCase() === round?.toLowerCase());
  const { theme, toggleTheme } = useThemeStore();
  usePreviewFavicon(project.logo);
  usePreviewTitle(entry ? `${entry.round} · ${project.projectName} (exemple)` : undefined);

  if (!entry) return <NotFound />;

  const guide = ROUND_GUIDE[entry.round.toLowerCase()];

  return (
    <div className="min-h-dvh bg-background flex flex-col relative">
      {/* Bandeau figé en haut, visible pendant tout le scroll (demande explicite du 15/08 : un
          encart qui ne reste que le temps de le croiser une fois se rate trop facilement). Le
          toggle theme, auparavant seul en absolute top-4 right-4, est integre a la meme barre
          fixed pour ne jamais se faire recouvrir par elle. Lien personnalise si ?from=<slug>/<secret>
          est present (transmis depuis PreviewHome.tsx), sinon repli generique (acces direct a la
          page sans ce contexte). */}
      <div className="fixed top-0 inset-x-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-3 flex items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <p className="text-sm text-foreground shrink-0">Envie de la même chose pour votre site ?</p>
            {from ? (
              <Button asChild size="sm" className="rounded-full shrink-0 w-fit">
                <Link to={`/preview/${from}#tarif`}>
                  Découvrez comment on le rend réel <ArrowRight size={14} />
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground shrink-0">
                Répondez au mail que vous avez reçu, ou appelez-moi.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer le thème"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 shrink-0"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* pt-36/sm:pt-24 : compense la hauteur du bandeau fixed ci-dessus, sinon il recouvre le debut
          du contenu ("V1" collé au bandeau, constate le 15/08). Le bandeau est plus haut sur mobile
          (texte + bouton empiles sur 2 lignes, flex-col ci-dessus) qu'en desktop (une seule ligne),
          d'ou l'ecart plus large en mobile. max-w-6xl : memes proportions que PreviewRound.tsx, page
          dont celle-ci est la copie. */}
      <div className="flex-1 px-6 md:px-12 pt-36 sm:pt-24 pb-10 md:pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <CaseStudyVersionsNav
              basePath="/cas-client"
              currentRound={entry.round}
              // Ordre inverse de project.rounds (V6 -> V1, le plus recent d'abord, utile sur la page
              // privee de Mylene) : ici V1 -> V6, pour qu'un prospect qui arrive lise la progression
              // dans l'ordre plutot que de tomber sur la version la plus aboutie en premier.
              rounds={[...project.rounds].reverse().map((r) => ({ round: r.round, date: r.date }))}
            />

            <div className="flex-1 min-w-0">
              <RoundContent
                entry={entry}
                contactName={project.contactName}
                showGuide={Boolean(guide)}
                guideTexts={guide?.texts}
              />

              {/* Formulaire volontairement inactif : simple demonstration du mecanisme de retour
                  pour un prospect, jamais un vrai envoi (posterait dans le Formspree de Mylene). */}
              {/* h2 seul suffit a expliquer le bloc (pas besoin d'une phrase en plus qui redirait la
                  meme chose) : la bulle, quand elle est presente, apporte l'info complementaire
                  (c'est ICI, precisement) plutot que de repeter "vos retours" une 3e fois. Uniquement
                  en V1 (guide.showFormBubble) : le mecanisme est deja explique une fois, pas la peine
                  de le repeter sur chaque round suivant. */}
              {guide?.showFormBubble && <GuideCallout>Ici, vous pourrez me faire vos retours</GuideCallout>}
              <div className="rounded-xl border border-border p-6 bg-card">
                <h2 className="text-sm font-semibold mb-3">Vos retours concernant la {entry.round}</h2>
                <textarea
                  disabled
                  rows={4}
                  placeholder="Listez ici les éléments à ajouter, modifier ou supprimer, à chaque nouvelle version proposée."
                  className="w-full rounded-lg border border-input bg-muted/30 px-3 py-3 text-sm text-muted-foreground resize-none cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled
                  className="mt-3 inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-primary/50 text-primary-foreground cursor-not-allowed"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PreviewCredit />
    </div>
  );
}
