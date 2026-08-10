export interface IPreviewProposal {
  label: string;
  screenshot: string;
  htmlPath: string;
  /** Regroupement visuel optionnel (ex. "Pour comparer" vs "À choisir"), pour distinguer une proposition de référence des vrais choix à trancher. Proposals du même round doivent être groupées consécutivement dans le tableau pour un rendu correct. */
  group?: string;
}

export interface IPreviewRound {
  round: string;
  date: string;
  proposals: IPreviewProposal[];
  missingInfo: string[];
  /** Retour du client collé tel quel une fois reçu (ex. copié depuis un mail). */
  clientFeedback?: string;
  /** Modifications prises en compte suite au retour du client sur le round précédent. */
  changesApplied?: string[];
  /** Commentaire de Gilles sur ce round (limites connues, points encore en travaux). */
  ownerNote?: string;
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
    currentRound: "V3",
    nextAction: "J'attends ton choix de police pour les titres parmi les 3 propositions (le reste des retouches est prêt)",
    feedbackFormId: "xgoggnej",
    rounds: [
      {
        round: "V3",
        date: "10 août 2026",
        proposals: [
          { label: "V2", screenshot: `${BASE}/screenshots/v3-optionD.png`, htmlPath: `${BASE}/mockup-v3-optionD.html`, group: "Pour comparer (avant)" },
          { label: "V3 · titres Fredoka", screenshot: `${BASE}/screenshots/v4-fredoka.png`, htmlPath: `${BASE}/mockup-v4-fredoka.html`, group: "V3 : à choisir" },
          { label: "V3 · titres Caveat", screenshot: `${BASE}/screenshots/v4-caveat.png`, htmlPath: `${BASE}/mockup-v4-caveat.html`, group: "V3 : à choisir" },
          { label: "V3 · titres Baloo 2", screenshot: `${BASE}/screenshots/v4-baloo.png`, htmlPath: `${BASE}/mockup-v4-baloo.html`, group: "V3 : à choisir" },
          { label: "Comparatif rapide des 3 polices", screenshot: `${BASE}/screenshots/v4-comparatif-titres.png`, htmlPath: `${BASE}/mockup-v4-comparatif-titres.html`, group: "V3 : à choisir" },
        ],
        changesApplied: [
          "Accroche \"Le neuf n'est plus à la mode\" retirée, remplacée par \"Dépôt-vente et friperie\" / \"Mont-de-Marsan\" sur deux lignes, en plus gros",
          "Calque vert transparent remplacé par un calque blanc (même dégradé, couleur seule changée), lisibilité des titres rattrapée par une ombre portée plutôt qu'un changement de couleur",
          "Photo du hero rétrécie et décentrée vers la droite, uniquement sur mobile (le laptop garde le cadrage d'origine)",
          "Mention \"en seconde main\" ajoutée dans le texte du concept",
          "Police des titres de section : 3 pistes proposées (Fredoka, Caveat, Baloo 2), voir la page comparatif pour trancher d'un coup d'oeil",
        ],
        missingInfo: [
          "Pouvoir se connecter à ton compte Instagram professionnel, pour afficher automatiquement tes derniers posts sur le site",
          "Le lien vers ta fiche Google (ou l'accès), pour afficher tes vrais avis clients sur le site",
          "Ton numéro de SIRET et le nom exact de ta société, obligatoires pour les mentions légales du site",
          "Ton choix de police pour les titres parmi les 3 proposées (Fredoka / Caveat / Baloo 2)",
        ],
      },
      {
        round: "V2",
        date: "7 août 2026",
        proposals: [
          { label: "Option A", screenshot: `${BASE}/screenshots/v2-optionA.png`, htmlPath: `${BASE}/mockup-v2-optionA.html` },
          { label: "Option B", screenshot: `${BASE}/screenshots/v2-optionB.png`, htmlPath: `${BASE}/mockup-v2-optionB.html` },
          { label: "Option C", screenshot: `${BASE}/screenshots/v3-optionA.png`, htmlPath: `${BASE}/mockup-v3-optionA.html` },
          { label: "Option D", screenshot: `${BASE}/screenshots/v3-optionB.png`, htmlPath: `${BASE}/mockup-v3-optionB.html` },
          { label: "Option E", screenshot: `${BASE}/screenshots/v3-optionC.png`, htmlPath: `${BASE}/mockup-v3-optionC.html` },
          { label: "Option F", screenshot: `${BASE}/screenshots/v3-optionD.png`, htmlPath: `${BASE}/mockup-v3-optionD.html` },
        ],
        changesApplied: [
          "Palette remplacée par tes vraies couleurs de marque, les couleurs trop vives retirées",
          "Mention \"Dépôt-vente & friperie\" retirée au-dessus du logo",
          "Section \"Dans la boutique\" : les 2 photos de la seconde version, la photo avec les lunettes, et ta nouvelle photo du portant de jeans, réduites et affichées en quinconce",
          "Légende \"Vêtements, chaussures et accessoires de mode\" ajoutée sous le titre de la section",
          "Conditions de dépôt-vente reformulées : \"Dépôt uniquement sur rendez-vous, pris en boutique\"",
          "6 options construites pour le hero, toutes avec effet de parallaxe au scroll. A : photo décentrée (mannequin/panneau à droite, texte à gauche), sans voile de couleur. B : pareil que A, avec un voile vert transparent sur la photo. C : la même photo en grand sur toute la largeur, cadrée plus haut (le panneau en bois n'est pas visible). D : pareil que C, avec le voile vert. E : pareil que C (photo en grand), mais cadrée différemment pour que le panneau \"Le Dressing de Maïlys\" reste visible. F : pareil que E, avec le voile vert.",
        ],
        missingInfo: [
          "Pouvoir se connecter à ton compte Instagram professionnel, pour afficher automatiquement tes derniers posts sur le site",
          "Le lien vers ta fiche Google (ou l'accès), pour afficher tes vrais avis clients sur le site",
          "Ton numéro de SIRET et le nom exact de ta société, obligatoires pour les mentions légales du site",
          "Ton choix entre les 6 options (A à F) pour le hero",
        ],
        ownerNote:
          "Un truc pas encore réglé sur les options A et C/E (celles sans voile vert) : le flou du fond derrière le mannequin (net devant, boutique floutée derrière), je n'ai pas encore un rendu assez propre à mon goût, donc pour l'instant la photo est affichée nette sur ces options. Et l'effet de parallaxe au scroll (la photo qui bouge plus lentement que le reste) : vu les proportions de l'image, il ne dure pas sur toute la longueur du scroll, il s'arrête avant la fin.",
        clientFeedback:
          "Coucou Gilles,\n\nMerci pour ton retour! J'aime bien la derniere version \"F\". \nPourrais-tu retirer le \"le neuf n'est plus à la mode\", mettre \"dépôt-vente et friperie\" sur une seule ligne en plus gros et \"Mont-de-Marsan\" sur une ligne juste en dessous en plus gros aussi stp? \n\nJ'aimerais également que le calque vert transparent soit blanc plutôt et il faudrait rétrécir la photo et la décentrer un peu plus vers la droite afin que le mannequin ne soit pas le seul truc que l'on voit sur l'écrandu téléphone. \n\nAprès le \"99 ans\", j'aimerais inclure la mention \"en seconde main\" (\"de 0 à 99 ans, en seconde main, en incluant\"). \n\nEt pour finir, serait possible d émettre une police d'écriture un peu plus fun pour les titres de chaque partie?\n\nMerci 😉",
      },
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
        clientFeedback:
          "Coucou Gilles,\n\nMerci pour les propositions de site !\n\nJ'aime beaucoup la première. Les animations sont tops, et le déroulé des infos me convient parfaitement.\n\nLes couleurs sont trop vives cependant, donc je t'envoie en pièce jointe la palette de couleur que j'utilise en com et sur l'ancien site.\n\nEn première photo, j'aimerais tester qqch comme sur la deuxième pièce jointe que je t'envoie : la photo décentrée avec le mannequin et le panneau en bois sur la droite, avec le texte sur la gauche. Si possible, j'aimerais que le mannequin, son support et le panneau bois soient en clair et le fond en flouté. J'aimerais aussi voir une 2eme option de cette même photo décentrée mais en fond transparent vert comme tu as mis actuellement. J'aimerais enlever la mention \"dépôt-vente et friperie\" qui au dessus du logo.\n\nDans la section \"dans la boutique\", je voudrais les deux photos que tu as mis dans la section correspondante de la seconde version du site, en plus de la photo avec les lunettes ainsi que la photo que je t'envoie en 3eme pièce jointe. Merci de mettre les photos légèrement plus petites et en quinconce si possible. Pourrais-tu y ajouter les mots \"vêtements, chaussures et accessoires de mode\" stp?\n\nConcernant la section sur les \"conditions de dépôt-vente\", merci de remplacer \"Dépôt uniquement sur rendez-vous, pris en début de mois (en boutique, par mail ou réseaux sociaux)\" par \"Dépôt uniquement sur rendez-vous, pris en boutique\".\n\nLe reste est parfait ;)\n\nMerci encore pour tout Gilles! Ça envoie du lourd ^^",
      },
    ],
  },
  // Entree de demo, donnees factices (nom generique + logo de Gilles), sert a visualiser
  // le template "V1-Echanges" sans exposer de vraie donnee client. Cf Projets/V1-Echanges/suivi.html.
  "demo-template": {
    slug: "demo",
    projectName: "Client Démo",
    logo: "/images/logo-gc-white.png",
    contactName: "Client",
    currentRound: "V1",
    nextAction: "En attente des retours du client sur la V1",
    feedbackFormId: "xgoggnej",
    rounds: [
      {
        round: "V1",
        date: "3 août 2026",
        proposals: [
          { label: "Exemple proposition A", screenshot: `${BASE}/screenshots/v1.png`, htmlPath: `${BASE}/mockup-v1.html` },
          { label: "Exemple proposition B", screenshot: `${BASE}/screenshots/v2.png`, htmlPath: `${BASE}/mockup-v2.html` },
        ],
        missingInfo: ["Exemple d'information encore nécessaire de la part du client"],
      },
    ],
  },
};
