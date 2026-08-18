import { create } from "zustand";

export interface ICaseStudyTourStep {
  round: string;
  /** Cible spotlight sur la page ([data-tour-key]). Absente = etape narree (V0, "vos retours",
      "la V2 avec vos retours") : aucun ecran reel a montrer, la bulle reste affichee seule, sans
      spotlight ni verrou de scroll, cf CaseStudyTour.tsx. */
  key?: string;
  /** V0 uniquement : scroll totalement bloque (page grisee en plein ecran) plutot que juste
      ramene en douceur en haut de page, cf CaseStudyTour.tsx et le prototype vault
      Projets/V1-Echanges/mockups/version-guided-tour.html. */
  blockScroll?: boolean;
  text: string[];
}

// Structure V0 + 4 etapes (18/08, remplace les 6 etapes V1->V2->V3->V6 precedentes) : seules la V1
// et la V6 restent des ecrans reellement visites (les 2 propositions de depart, le resultat final
// mis en ligne), les etapes intermediaires ("vos retours", "je reviens avec une V2") sont racontees
// plutot que rejouees round par round, pour rester court (2 minutes) plutot que de visiter 6 ecrans.
// V0 n'est pas comptee dans les "4 etapes" (cf CaseStudyTour.tsx, le compteur commence a l'index 1).
// Mecanique de positionnement (bulle fixed-top, verrou de scroll) reprise le 17/08 de
// public/cerithe-v1-6-0/index.html, inchangee. Contenu/cibles alignes a la lettre le 18/08 sur le
// prototype vault Projets/V1-Echanges/mockups/version-guided-tour.html (seule reference validee).
export const CASE_STUDY_TOUR_STEPS: ICaseStudyTourStep[] = [
  {
    round: "v1",
    blockScroll: true,
    text: [
      "Les sites que je vous ai proposés sont un point de départ, pas un résultat figé.",
      "À partir de là, on avance ensemble vers votre site personnalisé, exactement comme je l'ai fait pour Mylène, gérante du Dressing de Maïlys.",
      "Suivez le guide pour découvrir comment on va travailler ensemble jusqu'à la version finale de votre site.",
    ],
  },
  {
    round: "v1",
    key: "proposals",
    text: [
      "Ce que vous allez voir, c'est exactement le chemin que nous allons suivre ensemble.",
      "On est sur la V1 avec les 2 premières propositions envoyées à Mylène. C'est son point de départ.",
    ],
  },
  {
    round: "v1",
    key: "feedback",
    text: ["Mylène m'a dit ce qu'elle aimait, n'aimait pas, ce qu'elle voulait ajouter ou changer. Voici son message réel."],
  },
  {
    round: "v2",
    key: "v2-proposals",
    text: [
      "Je lui ai fourni une nouvelle proposition suite à son retour, la V2 de son site.",
      "Je reviens avec plusieurs pistes à chaque fois pour trancher ensemble ainsi qu'avec le détail de ce qui a été pris en compte et des précisions sur les rendus fournis.",
    ],
  },
  {
    round: "v6",
    key: "supporting",
    text: ["On répète ça jusqu'à la V6 et la version finale qui sera mise en ligne."],
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
