import { create } from "zustand";

export interface ICaseStudyTourStep {
  round: string;
  key: string;
  placement?: "above" | "fixed-top";
  text: string;
}

// Sequence validee sur le prototype vault (Projets/V1-Echanges/mockups/version-guided-tour.html,
// 16/08) : V1 -> V2 -> V3 -> V6, V4/V5 sautees (aucun commentaire de Mylene dessus, comme dans
// ROUND_GUIDE historique de CaseStudyRound.tsx). "sidenav" pointe la nav de versions avant de
// naviguer vers la V2, pour que le saut de version ne ressemble jamais a un bug.
export const CASE_STUDY_TOUR_STEPS: ICaseStudyTourStep[] = [
  { round: "v1", key: "proposals", text: "Propositions de versions pour votre site" },
  { round: "v1", key: "feedback", text: "Ajout de votre message de retour afin de toujours garder une trace de vos souhaits" },
  { round: "v1", key: "sidenav", placement: "fixed-top", text: "Les versions de ce projet sont listées ici. On va les suivre dans l'ordre : cliquez sur Suivant pour aller directement à la V2." },
  { round: "v2", key: "changes", text: "Sur la V2, ce qui a changé suite à votre précédent retour" },
  { round: "v3", key: "proposals", text: "Sur la V3, une même version peut proposer plusieurs pistes à comparer, ici 4 options de police : ça reste un seul aller-retour, pas un par option testée" },
  { round: "v6", key: "supporting", text: "Sur la V6, un aperçu complémentaire, pour un cas particulier (ici, si le quota Instagram est dépassé)" },
];

type ICaseStudyTourStatus = "idle" | "active" | "off" | "finished";

interface ICaseStudyTourState {
  status: ICaseStudyTourStatus;
  stepIndex: number;
  hasAutoStarted: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
  restart: () => void;
}

// Store global (pas de Context, cf regle projet) : la visite traverse plusieurs pages reelles
// (/cas-client/v1 -> v2 -> v3 -> v6), chaque navigation demonte et remonte CaseStudyRound. Un
// store Zustand survit a ces remontages (contrairement a un state local), sans avoir besoin de
// sessionStorage puisque la visite ne doit pas survivre a un rechargement complet de page.
export const useCaseStudyTourStore = create<ICaseStudyTourState>((set, get) => ({
  status: "idle",
  stepIndex: 0,
  hasAutoStarted: false,
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
}));
