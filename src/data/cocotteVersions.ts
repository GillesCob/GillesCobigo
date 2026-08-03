export interface ICrudStatus {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface ICocotteVersion {
  version: string;
  date: string;
  tag: "Nouvelle fonctionnalité" | "Correctif";
  status: "shipped" | "in-progress";
  description: string;
  crud?: ICrudStatus;
  impact: string[];
  githubTag?: string;
}

export const cocotteVersions: ICocotteVersion[] = [
  {
    version: "v1.1.0",
    date: "3 août 2026",
    tag: "Nouvelle fonctionnalité",
    status: "in-progress",
    description:
      "Refonte de l'écran détail recette par modales. Titre, description et visibilité sont directement cliquables et s'éditent via une modale dédiée à chaque champ. Les ingrédients passent en cartes (nom + quantité sur une seule ligne), les étapes restent en liste : un seul point d'entrée visible par ligne (modifier), la suppression se fait depuis la modale de modification avec confirmation, jamais un bouton de suppression à côté du bouton modifier pour limiter le risque de clic malheureux.",
    crud: { create: true, read: true, update: true, delete: true },
    impact: [
      "CRUD complet sur les ingrédients et les étapes (ajout, modification en place, suppression), pas seulement ajout/suppression.",
      "Titre, description et visibilité de la recette enfin modifiables depuis l'écran (l'endpoint backend existait déjà, jamais câblé côté interface avant cette version).",
    ],
    githubTag: "https://github.com/GillesCob/cocotte-eclair-java/releases/tag/v1.1.0",
  },
  {
    version: "v1.0.0",
    date: "1 août 2026",
    tag: "Nouvelle fonctionnalité",
    status: "shipped",
    description:
      "Première V1 fonctionnelle : création de recette, liste, détail avec ajout et suppression d'ingrédients et d'étapes un par un. Ouvre la partie métier du produit au-dessus du socle générique (authentification, navigation).",
    crud: { create: true, read: true, update: false, delete: true },
    impact: [
      "CRUD complet côté API sur les recettes (ownership vérifié sur chaque opération d'écriture).",
      "Ingrédients et étapes gérés comme des sous-ressources dédiées.",
    ],
    githubTag: "https://github.com/GillesCob/cocotte-eclair-java/releases/tag/v1.0.0",
  },
  {
    version: "V0",
    date: "31 juillet 2026",
    tag: "Nouvelle fonctionnalité",
    status: "shipped",
    description:
      "Socle générique : authentification (JWT, refresh token révocable, rate limiting), landing publique, navigation partagée, accessibilité (contraste, focus clavier, lecteurs d'écran). Base commune avant la première fonctionnalité métier.",
    impact: [
      "Auth complète (register/login/refresh/logout/mot de passe oublié) avec refresh token stocké haché et révocable côté serveur.",
      "Landing, navbar, footer et formulaires partagés sur tous les écrans.",
    ],
  },
];
