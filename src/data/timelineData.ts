export interface ITimelineItem {
  id: string
  year: string
  title: string
  subtitle: string
  detail: string
}

export const timelineItems: ITimelineItem[] = [
  {
    id: 'ep-2011',
    year: '2011',
    title: 'Les débuts dans le bâtiment',
    subtitle: 'Analyste thermique - EP',
    detail:
      "Premiers pas dans la donnée technique. Avant le BIM, avant le code - comprendre comment les bâtiments fonctionnent de l'intérieur. La rigueur commence ici.",
  },
  {
    id: 'bouygues-tp-2016',
    year: '2016',
    title: 'BIM Coordinateur',
    subtitle: 'Bouygues Travaux Publics - Paris',
    detail:
      "Premiers projets complexes, découverte du BIM. La donnée technique prend forme dans des maquettes numériques. Je commence à voir les limites des outils existants.",
  },
  {
    id: 'bouygues-be-2018',
    year: '2018',
    title: 'BIM Manager confirmé',
    subtitle: 'Bouygues Batiment Sud-Est - Marseille',
    detail:
      "Projets MRS3, TPR2. Coordination multi-lots, synthèse technique, gestion des conflits de données entre corps de métier. Marseille devient la base.",
  },
  {
    id: 'mareterra-2020',
    year: '2020',
    title: 'Mareterra Monaco',
    subtitle: 'Bouygues Construction',
    detail:
      "Extension en mer de Monaco. 2 milliards €, 100+ maquettes numériques interconnectées. Le projet le plus complexe de ma carrière BTP - coordination technique à une échelle que peu de BIM Managers ont connue.",
  },
  {
    id: 'declic-2022',
    year: '2022',
    title: 'Le déclic entrepreneurial',
    subtitle: 'Lancement de Cerithe',
    detail:
      "J'ai lancé Cerithe pour répondre à un vrai problème terrain. Confronté à la défaillance d'un prestataire dev, j'ai pris la décision de coder moi-même. Ce n'était pas prévu. C'était la meilleure décision.",
  },
  {
    id: 'autodidacte-2023',
    year: '2023',
    title: "L'apprentissage autodidacte",
    subtitle: 'ChouxFleurs - premiers projets',
    detail:
      "Python/Flask, puis Node.js, React, TypeScript. ChouxFleurs comme terrain d'expérimentation. Je découvre que le code, c'est ma voie - pas un détour.",
  },
  {
    id: 'formation-2024',
    year: '2024',
    title: 'La formation',
    subtitle: 'Alt/CDA - Baticoop',
    detail:
      "Structuration des compétences dev en alternance. Baticoop comme projet fil rouge. La théorie rejoint enfin la pratique.",
  },
  {
    id: 'maintenant-2025',
    year: '2025',
    title: 'Nexio, Cerithe, ce portfolio',
    subtitle: 'Projets agentiques - Claude Code',
    detail:
      "Projets agentiques avec Claude Code, stack TypeScript/Node.js/React consolidée. Ce portfolio comme premier livrable public. Je cherche le premier poste ou la première mission qui utilise vraiment ce que je sais faire.",
  },
]
