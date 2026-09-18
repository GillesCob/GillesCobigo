import type { IProjectCard } from "@/components/projects/ProjectCard";
import BIMTerm from "@/components/shared/BIMTerm";

export type IBTPProject = IProjectCard;

export const btpProjects: IProjectCard[] = [
  {
    id: "mareterra",
    name: "Mareterra - Monaco",
    description: (
      <>
        Extension en mer de Monaco. <BIMTerm>BIM</BIMTerm> Manager sur plus de 100 maquettes
        numériques interconnectées. Coordination de la synthèse technique et résolution de conflits
        de données complexes. Projet à 2 milliards €.
      </>
    ),
    // cf commentaire équivalent dans devProjects.tsx (IProjectCard.summary) : blurb court de la
    // ligne /new, verbatim mockup #chantiers .work-row.
    summary: "Extension en mer de la ville de Monaco.",
    image: "/images/mareterra-placeholder.jpg",
  },
  {
    id: "tpr2",
    name: "TPR2 - Marseille",
    description: (
      <>
        Rénovation d&apos;un bâtiment de l&apos;université de Luminy dans les calanques de
        Marseille. Conventions <BIMTerm>BIM</BIMTerm>, contrôle des maquettes multi-lots, gestion
        de la synthèse technique avec Solibri et Navisworks. Projet à 58 millions €.
      </>
    ),
    // Verbatim mockup ("Coordination BIM.") : blurb visiblement pas peaufiné côté maquette (identique
    // à celui de MRS3 ci-dessous), à reprendre si Gilles veut un résumé plus distinctif par chantier.
    summary: "Coordination BIM.",
    image: "/images/tpr2-placeholder.jpg",
  },
  {
    id: "mrs3",
    name: "MRS3 - Marseille",
    description: (
      <>
        Coordination <BIMTerm>BIM</BIMTerm> sur la reconversion d&apos;une ancienne base de
        sous-marins allemande de la Seconde Guerre mondiale en data center, sur le Grand Port de
        Marseille. Fédération des maquettes et résolution des conflits entre lots techniques dans un
        bâti existant contraint. Projet à 157 millions €.
      </>
    ),
    // Idem TPR2 : verbatim mockup, identique aux deux chantiers.
    summary: "Coordination BIM.",
    image: "/images/mrs3-placeholder.jpg",
  },
];
