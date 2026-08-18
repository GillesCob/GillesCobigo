import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import GuideCallout from "@/components/preview/GuideCallout";
import type { IPreviewProposal, IPreviewRound } from "@/data/previewProjects";

// Extrait de PreviewRound.tsx (contenu d'un round, sans le formulaire de feedback ni la nav de
// version) pour etre reutilise a la fois sur la vraie page privee (/preview/...) et sur la page
// cas client publique (CasClientBoutiques.tsx) : meme mise en page exacte des deux cotes, pas une
// reinterpretation. Cf demande de Gilles : montrer aux prospects l'interface reelle, pas un resume.

/** Regroupe les propositions consécutives partageant le même `group` (ex. "Pour comparer" vs "À choisir"), pour distinguer visuellement une proposition de référence des vrais choix à trancher. Sans `group`, tout reste dans un seul groupe sans en-tête (comportement inchangé pour les rounds existants). */
function groupProposals(proposals: IPreviewProposal[]) {
  const groups: { label: string | null; items: IPreviewProposal[] }[] = [];
  for (const p of proposals) {
    const label = p.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(p);
    } else {
      groups.push({ label, items: [p] });
    }
  }
  return groups;
}

function ProposalCard({ p }: { p: IPreviewProposal }) {
  return (
    <div className="rounded-xl border border-border p-4 bg-card">
      <p className="text-sm font-semibold mb-3">{p.label}</p>
      <a
        href={p.htmlPath}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-border overflow-hidden mb-3 bg-muted/30"
      >
        <img src={p.screenshot} alt={`Aperçu ${p.label}`} className="w-full h-auto" loading="lazy" />
      </a>
      <Button asChild variant="outline" size="sm">
        <a href={p.htmlPath} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} className="mr-1" /> Ouvrir dans un nouvel onglet
        </a>
      </Button>
    </div>
  );
}

export function ProposalsGrid({
  proposals,
  calloutsByLabel,
  tourKeyByGroupLabel,
}: {
  proposals: IPreviewProposal[];
  /** Bulle d'aide affichee au-dessus d'une carte precise (cle = label exact de la proposition), plutot qu'une bulle generique au-dessus de toute la grille. */
  calloutsByLabel?: Record<string, string>;
  /** Cible la visite guidee (CaseStudyTour.tsx) sur un groupe precis plutot que toute la grille
      (ex. V3, groupe "V3 : à choisir" seul, sans le groupe "Pour comparer (avant)" au-dessus :
      cible trop haute sinon pour un placement fiable, cf incident prod du 16/08). */
  tourKeyByGroupLabel?: Record<string, string>;
}) {
  const groups = groupProposals(proposals);
  // Comparaison pure (un seul item par groupe, ex. "avant" vs "après") : les groupes
  // partagent une seule ligne de grille au lieu d'empiler chaque groupe l'un sous l'autre,
  // pour que l'avant et l'après soient cote a cote sur laptop plutot que separes par un
  // groupe qui laisse la moitie de sa ligne vide. Un groupe avec plusieurs items (ex. un
  // choix entre 4 polices) garde son propre bloc avec son titre partage.
  const isPureComparison = groups.length > 1 && groups.every((g) => g.items.length === 1);

  if (isPureComparison) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.items[0].label}>
            {group.label && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {group.label}
              </p>
            )}
            {calloutsByLabel?.[group.items[0].label] && (
              <GuideCallout>{calloutsByLabel[group.items[0].label]}</GuideCallout>
            )}
            <ProposalCard p={group.items[0]} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {groups.map((group, i) => (
        <div
          key={group.label ?? `group-${i}`}
          className={i > 0 ? "mt-8" : undefined}
          data-tour-key={group.label ? tourKeyByGroupLabel?.[group.label] : undefined}
        >
          {group.label && (
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {group.label}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {group.items.map((p) => (
              <div key={p.label}>
                {calloutsByLabel?.[p.label] && <GuideCallout>{calloutsByLabel[p.label]}</GuideCallout>}
                <ProposalCard p={p} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function RoundContent({
  entry,
  contactName,
  showGuide,
  guideTexts,
}: {
  entry: IPreviewRound;
  contactName: string;
  /** Affiche les bulles d'aide (cf GuideCallout.tsx). Absent/false = page normale (client réel, ou round d'une page cas client autre que celui annoté). */
  showGuide?: boolean;
  /** Texte de chaque bulle, propre à la page qui utilise RoundContent (le libellé n'a pas le même sens sur la page privée d'un prospect que sur une page cas client). Bulle non affichée si sa clé est absente, même avec showGuide actif. */
  guideTexts?: {
    proposals?: string;
    /** Comme "proposals", mais cible une carte precise par son label exact plutot que toute la grille (ex. pointer sur "Comparatif rapide des 3 polices" seulement). */
    proposalCallouts?: Record<string, string>;
    clientFeedback?: string;
    missingInfo?: string;
    changesApplied?: string;
    ownerNote?: string;
    supportingVisuals?: string;
  };
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-10">
        <span className="font-mono text-lg font-semibold">{entry.round}</span>
        <span className="text-sm text-muted-foreground">{entry.date}</span>
      </div>

      {/* data-tour-key="proposals" : seule cible de la visite guidee sur la V1 (les 2 propositions
          de depart, cf CASE_STUDY_TOUR_STEPS), aucun autre round n'est plus visite par le tour. */}
      <div className="mb-10" data-tour-key={entry.round.toLowerCase() === "v1" ? "proposals" : undefined}>
        {showGuide && guideTexts?.proposals && <GuideCallout>{guideTexts.proposals}</GuideCallout>}
        <ProposalsGrid
          proposals={entry.proposals}
          calloutsByLabel={showGuide ? guideTexts?.proposalCallouts : undefined}
        />
      </div>

      {entry.changesApplied && entry.changesApplied.length > 0 && (
        <>
          {showGuide && guideTexts?.changesApplied && <GuideCallout>{guideTexts.changesApplied}</GuideCallout>}
          <div className="rounded-xl border border-border p-6 bg-card mb-8">
            <h2 className="text-sm font-semibold mb-3">Ce qui a été pris en compte suite au retour</h2>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              {entry.changesApplied.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {entry.ownerNote && (
        <>
          {showGuide && guideTexts?.ownerNote && <GuideCallout>{guideTexts.ownerNote}</GuideCallout>}
          <div className="rounded-xl border border-border p-6 bg-card mb-8">
            <h2 className="text-sm font-semibold mb-3">Précision de ma part</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{entry.ownerNote}</p>
          </div>
        </>
      )}

      {entry.supportingVisuals && entry.supportingVisuals.length > 0 && (
        <div className="mb-8" data-tour-key="supporting">
          {showGuide && guideTexts?.supportingVisuals && <GuideCallout>{guideTexts.supportingVisuals}</GuideCallout>}
          <ProposalsGrid proposals={entry.supportingVisuals} />
        </div>
      )}

      {entry.clientFeedback && (
        <>
          {showGuide && guideTexts?.clientFeedback && <GuideCallout>{guideTexts.clientFeedback}</GuideCallout>}
          <div className="rounded-xl bg-muted/40 border border-border p-6 mb-8">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Retour de {contactName}</p>
            <p className="text-sm whitespace-pre-line">{entry.clientFeedback}</p>
          </div>
        </>
      )}

      {entry.missingInfo.length > 0 && (
        <>
          {showGuide && guideTexts?.missingInfo && <GuideCallout>{guideTexts.missingInfo}</GuideCallout>}
          <div className="rounded-xl border border-border p-6 bg-card mb-8">
            <h2 className="text-sm font-semibold mb-3">Ce qu'il manque pour aller plus loin</h2>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              {entry.missingInfo.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
