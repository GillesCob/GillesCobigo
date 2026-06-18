export interface IBTPProject {
  id: string
  name: string
  description: string
  imagePlaceholder: string
}

export const btpProjects: IBTPProject[] = [
  {
    id: 'mareterra',
    name: 'Mareterra Monaco',
    description:
      'Extension en mer de Monaco. BIM Manager sur plus de 100 maquettes numériques interconnectées. Coordination de la synthèse technique et résolution de conflits de données complexes. Projet à 2 milliards €.',
    imagePlaceholder: '/images/mareterra-placeholder.jpg',
  },
  {
    id: 'tpr2',
    name: 'TPR2 Marseille',
    description:
      "Rénovation de l'université de Luminy. Conventions BIM, contrôle des maquettes multi-lots, gestion de la synthèse technique avec Solibri et Navisworks.",
    imagePlaceholder: '/images/tpr2-placeholder.jpg',
  },
  {
    id: 'mrs3',
    name: 'MRS3',
    description:
      'Projet MRS3 Marseille. Coordination BIM et résolution de conflits entre lots sur un projet de grande envergure.',
    imagePlaceholder: '/images/mrs3-placeholder.jpg',
  },
]
