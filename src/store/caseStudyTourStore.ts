import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ICaseStudyTourStep {
  round: string;
  /** Cible spotlight sur la page ([data-tour-key]). */
  key: string;
  text: string[];
}

// Structure 4 etapes (20/08, l'ancienne etape V0 bloquante retiree a la demande de Gilles, cf
// Projets/V1-Echanges/mockups/version-guided-tour.html) : seules la V1 et la V6 restent des ecrans
// reellement visites (les 2 propositions de depart, le resultat final mis en ligne), les etapes
// intermediaires ("vos retours", "je reviens avec une V2") sont racontees plutot que rejouees
// round par round, pour rester court (2 minutes) plutot que de visiter 6 ecrans. Toutes les etapes
// comptent desormais dans le compteur (cf CaseStudyTour.tsx, plus de cas particulier V0).
// Mecanique de positionnement (bulle fixed-top, verrou de scroll) reprise le 17/08 de
// public/cerithe-v1-6-0/index.html, inchangee. Contenu/cibles alignes a la lettre le 20/08 sur le
// prototype vault Projets/V1-Echanges/mockups/version-guided-tour.html (seule reference validee).
export const CASE_STUDY_TOUR_STEPS: ICaseStudyTourStep[] = [
  {
    round: "v1",
    key: "proposals",
    text: ["Voici les 2 propositions de site envoyées à Mylène."],
  },
  {
    round: "v1",
    key: "feedback",
    text: ["Mylène m'a dit ce qu'elle aimait, n'aimait pas, ce qu'elle voulait ajouter ou changer. Voici son retour fait par écrit."],
  },
  {
    round: "v2",
    key: "v2-proposals",
    text: [
      "Suite à son retour, je lui ai fourni une nouvelle proposition, la V2 de son site.",
      "Je lui présente plusieurs variantes afin qu'elle puisse sélectionner celle qui aura sa préférence.",
      "Toutes les modifications effectuées sont tracées dans les notes de mise à jour.",
    ],
  },
  {
    round: "v6",
    // "v6-proposals" cible uniquement le groupe "V6 : à valider" de la grille (resultat final),
    // jamais "supporting" (bloc "Aperçu du repli automatique" plus bas, hors sujet a cette etape) :
    // corrige le 18/08 apres retour de Gilles ("l'etape 4 ne pointe pas au bon endroit"), cf
    // version-guided-tour.html ou seul target: '[data-tour-id="v6-proposals"]' est utilise.
    key: "v6-proposals",
    text: ["Les échanges se réitèrent jusqu'à la V6, version finale du site qui, après approbation de Mylène, a été mise en ligne."],
  },
];

type ICaseStudyTourStatus = "idle" | "active" | "off" | "finished";

interface ICaseStudyTourState {
  status: ICaseStudyTourStatus;
  stepIndex: number;
  hasAutoStarted: boolean;
  // Toast "Disponible après la visite" (21/08, mockup resynchronisé le même jour) : etat UI
  // ephemere, jamais persiste (cf partialize plus bas), partage via le store pour etre declenche
  // depuis RoundContent.tsx (clic bloque sur un lien pendant le tour) et affiche/ferme depuis
  // CaseStudyTour.tsx (seul composant monte une fois par page, cf mecanique du mockup).
  blockToastVisible: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
  restart: () => void;
  showBlockToast: () => void;
  hideBlockToast: () => void;
}

// Store global (pas de Context, cf regle projet) : la visite traverse plusieurs pages reelles
// (/cas-client/v1 -> v2 -> v3 -> v6), chaque navigation demonte et remonte CaseStudyRound. Un
// store Zustand survit a ces remontages (contrairement a un state local).
// Persistance sessionStorage (21/08, demande explicite de Gilles : "fais en sorte que les
// rafraichissements des pages me fassent rester sur l'etape ou je suis", inversion assumee de la
// decision du 20/08 qui excluait volontairement toute persistance). sessionStorage seulement,
// jamais localStorage : la reprise doit survivre a un F5, jamais a une nouvelle visite un autre
// jour (un onglet ferme vide sessionStorage). partialize exclut blockToastVisible (etat UI
// ephemere, jamais pertinent apres un reload).
export const useCaseStudyTourStore = create<ICaseStudyTourState>()(
  persist(
    (set, get) => ({
      status: "idle",
      stepIndex: 0,
      hasAutoStarted: false,
      blockToastVisible: false,
      start: () => set({ status: "active", stepIndex: 0, hasAutoStarted: true }),
      next: () => {
        const { stepIndex } = get();
        if (stepIndex >= CASE_STUDY_TOUR_STEPS.length - 1) {
          set({ status: "finished" });
          return;
        }
        set({ stepIndex: stepIndex + 1 });
      },
      prev: () => {
        const { stepIndex } = get();
        if (stepIndex === 0) return;
        set({ stepIndex: stepIndex - 1 });
      },
      skip: () => set({ status: "off" }),
      finish: () => set({ status: "finished" }),
      restart: () => set({ status: "active", stepIndex: 0 }),
      showBlockToast: () => set({ blockToastVisible: true }),
      hideBlockToast: () => set({ blockToastVisible: false }),
    }),
    {
      name: "case-study-tour-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        status: state.status,
        stepIndex: state.stepIndex,
        hasAutoStarted: state.hasAutoStarted,
      }),
    }
  )
);
