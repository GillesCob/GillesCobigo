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
  /** Aperçus visuels illustrant les points d'ownerNote (ex. rendu du repli automatique) : affichés après ownerNote, jamais mélangés à l'avant/après principal de `proposals`. */
  supportingVisuals?: IPreviewProposal[];
}

export interface IPreviewProject {
  /** Segment d'URL lisible (ex. "dressing-mailys"), affiché mais pas utilisé pour la recherche : la clé de ce Record (le secret) fait foi. */
  slug: string;
  projectName: string;
  logo: string;
  /** Cap la taille d'affichage du logo (px) quand le fichier source est en trop basse resolution
      pour la taille par defaut de PreviewHome.tsx (h-56/h-80) : evite l'agrandissement pixelise. */
  logoMaxWidth?: number;
  contactName: string;
  currentRound: string;
  nextAction: string;
  feedbackFormId: string;
  /** Message d'orientation pour un premier contact à froid (prospect qui n'a jamais échangé avec Gilles) : qui envoie ce lien, pourquoi, avec un lien vers un exemple de résultat déjà livré. Absent pour un client déjà engagé (ex. Mylène), affiché uniquement si présent. */
  coldIntro?: string;
  /** Numéro de téléphone trouvé en prospection (fiche Google), affiché dans la card tarifs pour confirmer le canal de rappel. Absent pour un client déjà engagé (le numéro se cale en direct avec lui). */
  phone?: string;
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
    currentRound: "V6",
    nextAction: "Rien à faire de ton côté pour l'instant, merci pour ta réponse ! Le site part en ligne dans les prochains jours.",
    feedbackFormId: "xgoggnej",
    rounds: [
      {
        round: "V6",
        date: "11 août 2026",
        proposals: [
          { label: "V5", screenshot: `${BASE}/screenshots/v7.webp`, htmlPath: `${BASE}/mockup-v7.html`, group: "Pour comparer (avant)" },
          { label: "V6 · avis Google et Instagram réels", screenshot: `${BASE}/screenshots/v8.webp`, htmlPath: `${BASE}/mockup-v8.html`, group: "V6 : à valider" },
        ],
        changesApplied: [
          "Avis Google branchés en vrai (les 5 plus récents envoyés par Google, mis à jour automatiquement toutes les heures), avec un bouton \"Voir tous les avis\" qui renvoie vers ta fiche Google Maps",
          "Posts Instagram branchés en vrai eux aussi (plus figés comme sur la V5), mis à jour automatiquement",
        ],
        missingInfo: [],
        clientFeedback:
          "Coucou Gilles,\nje valide les 2 propositions pour les avis Google et pour le widget Insta gratuit. Pour les photos fixes, tu peux garder celles que tu as déjà.\nMerci pour tout!!",
        ownerNote:
          "Deux limites à connaître avant de valider :\n\n- Google ne nous donne jamais plus de 5 avis (c'est une limite fixe de leur API, impossible à contourner), et parmi ces 5 un avis sans commentaire écrit (juste une note en étoiles) n'est pas affiché : ça peut arriver que tu voies moins de 5 avis à l'écran selon le moment, ce n'est pas un bug (aperçus avec 4, 3, 2 et 1 avis ci-dessous, pour te donner une idée du rendu dans chaque cas).\n\n- Le widget Instagram est sur un plan gratuit : un badge \"Free Instagram Feed Widget\" reste visible sous les posts, et l'affichage est limité à 200 vues par mois. Au-delà, la section Instagram bascule automatiquement sur 3 photos fixes (qui ne se mettent pas à jour toutes seules, contrairement au reste) et un lien direct vers ton compte (aperçu ci-dessous, \"Si le quota Instagram gratuit est dépassé\") le temps que ça se réinitialise le mois suivant. Passer sur le plan payant (4$/mois, environ 3,70€) retire le badge et cette limite, à toi de voir si ça vaut le coup pour toi.",
        supportingVisuals: [
          { label: "Si le quota Instagram gratuit est dépassé", screenshot: `${BASE}/screenshots/v8-instagram-repli.webp`, htmlPath: `${BASE}/mockup-v8-instagram-repli.html`, group: "Aperçu du repli automatique" },
          { label: "4 avis avec commentaire", screenshot: `${BASE}/screenshots/v8-avis-4.webp`, htmlPath: `${BASE}/mockup-v8-avis-4.html`, group: "Aperçu selon le nombre d'avis avec commentaire" },
          { label: "3 avis avec commentaire", screenshot: `${BASE}/screenshots/v8-avis-3.webp`, htmlPath: `${BASE}/mockup-v8-avis-3.html`, group: "Aperçu selon le nombre d'avis avec commentaire" },
          { label: "2 avis avec commentaire", screenshot: `${BASE}/screenshots/v8-avis-2.webp`, htmlPath: `${BASE}/mockup-v8-avis-2.html`, group: "Aperçu selon le nombre d'avis avec commentaire" },
          { label: "1 avis avec commentaire", screenshot: `${BASE}/screenshots/v8-avis-1.webp`, htmlPath: `${BASE}/mockup-v8-avis-1.html`, group: "Aperçu selon le nombre d'avis avec commentaire" },
        ],
      },
      {
        round: "V5",
        date: "10 août 2026",
        proposals: [
          { label: "V4", screenshot: `${BASE}/screenshots/v5.webp`, htmlPath: `${BASE}/mockup-v5.html`, group: "Pour comparer (avant)" },
          { label: "V5 · logo agrandi + aperçu Instagram", screenshot: `${BASE}/screenshots/v7.webp`, htmlPath: `${BASE}/mockup-v7.html`, group: "V5 : à valider" },
        ],
        changesApplied: [
          "Logo agrandi dans le hero, une première fois puis une deuxième sur ton retour",
          "Tes 3 derniers posts Instagram affichés en aperçu dans la section \"Suivez-nous\" (en dur pour l'instant, en attendant de connecter le widget pour une vraie mise à jour automatique)",
          "Mentions légales mises à jour avec ton SIRET et le nom exact de ta société",
          "Ton compte Instagram (dressing_de_mailys, déjà public) me suffit pour la suite, plus besoin de rien de ton côté sur ce point",
        ],
        missingInfo: [],
        clientFeedback:
          "Oups! Je n'avais pas vu!\nJ'en profite pour t'envoyer le SIRET : 93819650800015. Le nom complète c'est LE DRESSING DE MAILYS\nOn peut agrandir un tout petit plus le logo encore stp?\nSi je passe en pro sur Instagram,  je n'ai plus accès aux musiques libres de droit malheureusement 😪\nAux musiques non libres, pardon",
      },
      {
        round: "V4",
        date: "10 août 2026",
        proposals: [
          { label: "V3", screenshot: `${BASE}/screenshots/v4-fredoka.webp`, htmlPath: `${BASE}/mockup-v4-fredoka.html`, group: "Pour comparer (avant)" },
          { label: "V4 · titres Fredoka", screenshot: `${BASE}/screenshots/v5.webp`, htmlPath: `${BASE}/mockup-v5.html`, group: "V4 : à choisir" },
          { label: "V4 · titres Grandstander", screenshot: `${BASE}/screenshots/v6-grandstander.webp`, htmlPath: `${BASE}/mockup-v6-grandstander.html`, group: "V4 : à choisir" },
          { label: "V4 · titres M PLUS Rounded 1c", screenshot: `${BASE}/screenshots/v6-mplusrounded.webp`, htmlPath: `${BASE}/mockup-v6-mplusrounded.html`, group: "V4 : à choisir" },
          { label: "Comparatif rapide (2 nouvelles polices vs Fredoka)", screenshot: `${BASE}/screenshots/v6-comparatif-titres.webp`, htmlPath: `${BASE}/mockup-v6-comparatif-titres.html`, group: "V4 : à choisir" },
        ],
        changesApplied: [
          "Calque blanc remplacé par un calque vert transparent sur l'ensemble de la photo (dégradé vertical uniforme, comme la toute première version), couleur de marque réelle",
          "\"Mont-de-Marsan\" agrandi pour occuper une largeur proche de \"Dépôt-vente et friperie\"",
          "Les 2 photos de droite de la section \"Dans la boutique\" entrent maintenant depuis la droite",
          "Bouton \"retour en haut de page\" ajouté (flottant, visible après le hero)",
          "Police des titres : 2 nouvelles pistes proposées en plus de Fredoka (Grandstander, M PLUS Rounded 1c), voir la page comparatif pour trancher d'un coup d'oeil",
        ],
        missingInfo: [
          "Pouvoir se connecter à ton compte Instagram professionnel, pour afficher automatiquement tes derniers posts sur le site",
          "Le lien vers ta fiche Google (ou l'accès), pour afficher tes vrais avis clients sur le site",
          "Ton numéro de SIRET et le nom exact de ta société, obligatoires pour les mentions légales du site",
          "Ton avis sur les 2 nouvelles pistes de police, ou si Fredoka reste ton choix final",
        ],
        clientFeedback:
          "Parfait! Jim demande si on peut agrandir un peu le logo?\nLes avis se mettent automatiquement ?\nOups! Je n'avais pas vu!\nJ'en profite pour t'envoyer le SIRET : 93819650800015. Le nom complète c'est LE DRESSING DE MAILYS\nJe veux bien les 3 derniers pots insta si tu peux. Si trop compliquer, le lien vers insta suffira ;)\nJe valide Fredoka en police",
      },
      {
        round: "V3",
        date: "10 août 2026",
        proposals: [
          { label: "V2", screenshot: `${BASE}/screenshots/v3-optionD.webp`, htmlPath: `${BASE}/mockup-v3-optionD.html`, group: "Pour comparer (avant)" },
          { label: "V3 · titres Fredoka", screenshot: `${BASE}/screenshots/v4-fredoka.webp`, htmlPath: `${BASE}/mockup-v4-fredoka.html`, group: "V3 : à choisir" },
          { label: "V3 · titres Caveat", screenshot: `${BASE}/screenshots/v4-caveat.webp`, htmlPath: `${BASE}/mockup-v4-caveat.html`, group: "V3 : à choisir" },
          { label: "V3 · titres Baloo 2", screenshot: `${BASE}/screenshots/v4-baloo.webp`, htmlPath: `${BASE}/mockup-v4-baloo.html`, group: "V3 : à choisir" },
          { label: "Comparatif rapide des 3 polices", screenshot: `${BASE}/screenshots/v4-comparatif-titres.webp`, htmlPath: `${BASE}/mockup-v4-comparatif-titres.html`, group: "V3 : à choisir" },
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
        clientFeedback:
          "Merci! Le transparent blanc rend moins bien que ce que je pensais, je suis désolée 😖😖 tu pourrais tester en mettant un calque transparent vert sur l'ensemble de la photo comme tu avais fait au tout début stp?\n\nEst-ce que tu peux mettre \"Mont-de-Marsan\" de la même 'longueur' que \"dépôt-vente et friperie\", en agrandissant la taille du texte stp?\n\nJ'aime bien le côté 'gras' et 'arrondi' de la première écriture Fredoka. Tu en aurais d'autres sur le même style?\n\nPour la section 'dans la boutique', est-ce que tu pourrais faire apparaître les deux photos de droite par la droite ?",
      },
      {
        round: "V2",
        date: "7 août 2026",
        proposals: [
          { label: "Option A", screenshot: `${BASE}/screenshots/v2-optionA.webp`, htmlPath: `${BASE}/mockup-v2-optionA.html` },
          { label: "Option B", screenshot: `${BASE}/screenshots/v2-optionB.webp`, htmlPath: `${BASE}/mockup-v2-optionB.html` },
          { label: "Option C", screenshot: `${BASE}/screenshots/v3-optionA.webp`, htmlPath: `${BASE}/mockup-v3-optionA.html` },
          { label: "Option D", screenshot: `${BASE}/screenshots/v3-optionB.webp`, htmlPath: `${BASE}/mockup-v3-optionB.html` },
          { label: "Option E", screenshot: `${BASE}/screenshots/v3-optionC.webp`, htmlPath: `${BASE}/mockup-v3-optionC.html` },
          { label: "Option F", screenshot: `${BASE}/screenshots/v3-optionD.webp`, htmlPath: `${BASE}/mockup-v3-optionD.html` },
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
          { label: "Proposition 1", screenshot: `${BASE}/screenshots/v1.webp`, htmlPath: `${BASE}/mockup-v1.html` },
          { label: "Proposition 2", screenshot: `${BASE}/screenshots/v2.webp`, htmlPath: `${BASE}/mockup-v2.html` },
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
  // Prospects reels, prospection a froid Mont-de-Marsan (cf Projets/Boutiques/ dans le vault,
  // suivi.html + Prospects/Mont-de-Marsan/<nom>/). htmlPath pointant vers leur propre
  // mockup-v1.html statique. Pas encore signes :
  // aucune page /preview/<slug>/<secret>/<round> pour eux, uniquement cette page d'accueil.
  Ru4wE22dUd: {
    slug: "cave-velours",
    projectName: "Cave Velours",
    logo: "/preview/cave-velours/logo.jpg",
    contactName: "L'équipe Cave Velours",
    phone: "06 62 27 85 73",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "15 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/cave-velours/logo.jpg", htmlPath: "/preview/cave-velours/Ru4wE22dUd/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  "7m2qIY6Hzo": {
    slug: "la-malle-dadour",
    projectName: "La Malle d'Adour",
    logo: "/preview/la-malle-dadour/logo.webp",
    contactName: "L'équipe La Malle d'Adour",
    phone: "06 70 22 42 86",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "21 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/la-malle-dadour/logo.webp", htmlPath: "/preview/la-malle-dadour/7m2qIY6Hzo/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  Xx3dVKxK4O: {
    slug: "lintemporel",
    projectName: "L'Intemporel Concept Store",
    logo: "/preview/lintemporel/logo.jpg",
    // Source 150x150px : au-dela, l'agrandissement pixelise (retour de Gilles le 16/08).
    logoMaxWidth: 150,
    contactName: "Coralie Generosi",
    phone: "06 10 86 13 08",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "15 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/lintemporel/logo.jpg", htmlPath: "/preview/lintemporel/Xx3dVKxK4O/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  WnbclCyz2v: {
    slug: "fripouilles",
    projectName: "Les Frip'ouilles",
    logo: "/preview/fripouilles/logo.jpg",
    // Source 150x150px : au-dela, l'agrandissement pixelise (retour de Gilles le 16/08).
    logoMaxWidth: 150,
    contactName: "Camille Giraudel",
    phone: "07 81 87 34 35",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "15 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/fripouilles/logo.jpg", htmlPath: "/preview/fripouilles/WnbclCyz2v/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  PKpURvgnT5: {
    slug: "trois-petits-muscaris",
    projectName: "Trois Petits Muscaris",
    logo: "/preview/trois-petits-muscaris/logo.jpg",
    contactName: "Claire Faure",
    phone: "06 37 77 62 43",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "15 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/trois-petits-muscaris/logo.jpg", htmlPath: "/preview/trois-petits-muscaris/PKpURvgnT5/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  H2g7uNKQu4: {
    slug: "creation-saint-roch",
    projectName: "Création Saint Roch",
    logo: "/preview/creation-saint-roch/logo.gif",
    // Source 140x140px : au-dela, l'agrandissement pixelise nettement (retour de Gilles le 16/08).
    logoMaxWidth: 140,
    contactName: "L'équipe Création Saint Roch",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "15 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/creation-saint-roch/logo.gif", htmlPath: "/preview/creation-saint-roch/H2g7uNKQu4/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  QIV4Yvs1ah: {
    slug: "maison-creme",
    projectName: "Maison Crème",
    logo: "/preview/maison-creme/logo.jpg",
    contactName: "Mélissa Noto",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "23 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/maison-creme/logo.jpg", htmlPath: "/preview/maison-creme/QIV4Yvs1ah/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  "05oAVszekn": {
    slug: "eve-boutique",
    projectName: "Eve Boutique",
    logo: "/preview/eve-boutique/logo.jpg",
    contactName: "L'équipe Eve Boutique",
    phone: "05 58 75 16 26",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre commerce.",
    rounds: [
      {
        round: "V1",
        date: "24 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/eve-boutique/logo.jpg", htmlPath: "/preview/eve-boutique/05oAVszekn/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  "2NgflU4AAy": {
    slug: "peppone",
    projectName: "Miss Peppone / Peppone Homme",
    logo: "/preview/peppone/logo.png",
    contactName: "L'équipe Miss Peppone / Peppone Homme",
    phone: "06 63 14 37 17",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre activité.",
    rounds: [
      {
        round: "V1",
        date: "24 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/peppone/logo.png", htmlPath: "/preview/peppone/2NgflU4AAy/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  "9nkEtXFdsH": {
    slug: "lassalle-et-fils",
    projectName: "Lassalle et Fils",
    logo: "/preview/lassalle-et-fils/logo.png",
    contactName: "L'équipe Lassalle et Fils",
    phone: "05 58 46 68 68",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre activité.",
    rounds: [
      {
        round: "V1",
        date: "24 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/lassalle-et-fils/logo.png", htmlPath: "/preview/lassalle-et-fils/9nkEtXFdsH/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  eDMLOhBID9: {
    slug: "maisonnave",
    projectName: "Maisonnave (Les 3 Pinceaux)",
    logo: "/preview/maisonnave/logo.jpg",
    contactName: "L'équipe Les 3 Pinceaux",
    phone: "05 58 46 57 58",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre activité.",
    rounds: [
      {
        round: "V1",
        date: "24 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/maisonnave/logo.jpg", htmlPath: "/preview/maisonnave/eDMLOhBID9/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
      },
    ],
  },
  UxNjRu0VN8: {
    slug: "egc-services",
    projectName: "EGC Services",
    logo: "/preview/egc-services/logo.png",
    contactName: "L'équipe EGC Services",
    phone: "06 36 37 64 05",
    currentRound: "V1",
    nextAction: "Premier contact, en attente de retour",
    feedbackFormId: "xgoggnej",
    coldIntro:
      "Merci d'être venu jusqu'ici ! Découvrez sans plus attendre ma proposition de site pour votre activité.",
    rounds: [
      {
        round: "V1",
        date: "24 août 2026",
        proposals: [
          { label: "Votre site, premier jet", screenshot: "/preview/egc-services/logo.png", htmlPath: "/preview/egc-services/UxNjRu0VN8/V1/P1" },
        ],
        missingInfo: ["Votre avis sur cette première version, ou tout élément à corriger"],
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
          { label: "Exemple proposition A", screenshot: `${BASE}/screenshots/v1.webp`, htmlPath: `${BASE}/mockup-v1.html` },
          { label: "Exemple proposition B", screenshot: `${BASE}/screenshots/v2.webp`, htmlPath: `${BASE}/mockup-v2.html` },
        ],
        missingInfo: ["Exemple d'information encore nécessaire de la part du client"],
      },
    ],
  },
};
