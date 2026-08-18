import { create } from "zustand";

export interface ICaseStudyTourStep {
  round: string;
  /** Cible spotlight sur la page ([data-tour-key]). Absente = etape narree (V0, "vos retours",
      "la V2 avec vos retours") : aucun ecran reel a montrer, la bulle reste affichee seule, sans
      spotlight ni verrou de scroll, cf CaseStudyTour.tsx. */
  key?: string;
  text: string[];
}

// Structure V0 + 4 etapes (18/08, remplace les 6 etapes V1->V2->V3->V6 precedentes) : seules la V1
// et la V6 restent des ecrans reellement visites (les 2 propositions de depart, le resultat final
// mis en ligne), les etapes intermediaires ("vos retours", "je reviens avec une V2") sont racontees
// plutot que rejouees round par round, pour rester court (2 minutes) plutot que de visiter 6 ecrans.
// V0 n'est pas comptee dans les "4 etapes" (cf CaseStudyTour.tsx, le compteur commence a l'index 1).
// Mecanique de positionnement (bulle fixed-top, verrou de scroll) reprise le 17/08 de
// public/cerithe-v1-6-0/index.html, inchangee.
export const CASE_STUDY_TOUR_STEPS: ICaseStudyTourStep[] = [
  {
    round: "v1",
    text: [
      "Le site que vous avez vu n'était qu'une première ébauche.",
      "On l'affine ensemble jusqu'au résultat final, exactement comme je l'ai fait pour Mylène, gérante du Dressing de Maïlys.",
      "Suivez le guide, ça prend 2 minutes.",
    ],
  },
  {
    round: "v1",
    key: "proposals",
    text: ["Voici les 2 premières propositions envoyées à Mylène, son point de départ."],
  },
  {
    round: "v1",
    text: ["Mylène m'a dit ce qu'elle aimait, n'aimait pas, ce qu'elle voulait ajouter ou changer."],
  },
  {
    round: "v1",
    text: ["Je reviens avec une V2 qui prend en compte ses retours, parfois plusieurs pistes pour trancher ensemble."],
  },
  {
    round: "v6",
    key: "supporting",
    text: ["On répète ça jusqu'à la V6, mise en ligne : le résultat final, construit avec elle."],
  },
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
