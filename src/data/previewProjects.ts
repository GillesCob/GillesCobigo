export interface IPreviewProposal {
  label: string;
  screenshot: string;
  htmlPath: string;
}

export interface IPreviewRound {
  round: string;
  date: string;
  proposals: IPreviewProposal[];
  missingInfo: string[];
  /** Retour du client collé tel quel une fois reçu (ex. copié depuis un mail). */
  clientFeedback?: string;
}

export interface IPreviewProject {
  /** Segment d'URL lisible (ex. "dressing-mailys"), affiché mais pas utilisé pour la recherche : la clé de ce Record (le secret) fait foi. */
  slug: string;
  projectName: string;
  logo: string;
  contactName: string;
  currentRound: string;
  nextAction: string;
  feedbackFormId: string;
  rounds: IPreviewRound[];
}

const BASE = "/preview/dressing-de-mailys";

// Clé = secret imprévisible (comme dans videoLinks) : l'URL complète est /preview/<slug>/<secret>,
// le slug est juste lisible pour Mylène, la sécurité vient uniquement du secret.
export const previewProjects: Record<string, IPreviewProject> = {
  EuMLnfc8Uk: {
    slug: "dressing-mailys",
    projectName: "Le Dressing de Maïlys",
    logo: `${BASE}/logo.png`,
    contactName: "Mylène",
    currentRound: "V1",
    nextAction: "J'attends ton retour sur la V1",
    feedbackFormId: "xgoggnej",
    rounds: [
      {
        round: "V1",
        date: "3 août 2026",
        proposals: [
          { label: "Proposition 1", screenshot: `${BASE}/screenshots/v1.png`, htmlPath: `${BASE}/mockup-v1.html` },
          { label: "Proposition 2", screenshot: `${BASE}/screenshots/v2.png`, htmlPath: `${BASE}/mockup-v2.html` },
        ],
        missingInfo: [
          "Pouvoir se connecter à ton compte Instagram professionnel, pour afficher automatiquement tes derniers posts sur le site",
          "Le lien vers ta fiche Google (ou l'accès), pour afficher tes vrais avis clients sur le site",
          "Confirmer si le texte d'accroche actuel (\"Le neuf n'est plus à la mode\") te convient ou si tu préfères autre chose",
          "Ton numéro de SIRET et le nom exact de ta société, obligatoires pour les mentions légales du site",
          "Ton choix entre la proposition 1 et la proposition 2 (ou un mélange des deux)",
        ],
      },
    ],
  },
};
